import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../services/api";

const API_BASE = API_BASE_URL;
const DEFAULT_DISTRICT = "Patna";

const CATEGORIES = [
  "Water Supply",
  "Roads",
  "Healthcare",
  "Education",
  "Electricity",
];

/*
 * All values sent to FastAPI must be between 0 and 100.
 *
 * These are normalized governance factors.
 */
const CATEGORY_CONFIG = {
  "Water Supply": {
    infrastructureGap: 18,
    urgency: 18,
    vulnerability: 45,
  },

  Roads: {
    infrastructureGap: 32,
    urgency: 22,
    vulnerability: 45,
  },

  Healthcare: {
    infrastructureGap: 24,
    urgency: 24,
    vulnerability: 45,
  },

  Electricity: {
    infrastructureGap: 9,
    urgency: 9,
    vulnerability: 45,
  },

  Education: {
    infrastructureGap: 20.75,
    urgency: 21,
    vulnerability: 45,
  },
};

/*
 * Normalized district population factor.
 *
 * IMPORTANT:
 * Do NOT send 5838465 to the API.
 * FastAPI expects 0-100.
 */
const POPULATION_AFFECTED_SCORE = 96.66;

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(
    min,
    Math.min(max, safeNumber(value, 0))
  );
}

function getPriorityLevel(score) {
  const value = safeNumber(score);

  if (value >= 70) {
    return "Critical";
  }

  if (value >= 45) {
    return "Medium";
  }

  return "Low";
}

function calculateLocalScore({
  citizenDemand,
  populationAffected,
  infrastructureGap,
  urgency,
  vulnerability,
}) {
  /*
   * Local fallback calculation.
   *
   * This is used only if FastAPI is unavailable.
   */
  const score =
    citizenDemand * 0.35 +
    populationAffected * 0.15 +
    infrastructureGap * 0.20 +
    urgency * 0.15 +
    vulnerability * 0.15;

  return Number(score.toFixed(2));
}

function getCategoryRequestCount(
  requests,
  district,
  category
) {
  return requests.filter((request) => {
    const requestDistrict = String(
      request?.district ?? ""
    )
      .trim()
      .toLowerCase();

    const requestCategory = String(
      request?.category ?? ""
    )
      .trim()
      .toLowerCase();

    return (
      requestDistrict ===
        String(district)
          .trim()
          .toLowerCase() &&
      requestCategory ===
        String(category)
          .trim()
          .toLowerCase()
    );
  }).length;
}

async function calculateCategoryPriority(
  category,
  requestCount
) {
  /*
   * Convert number of citizen requests
   * into a normalized 0-100 demand score.
   *
   * Example:
   * 11 requests = 55
   */
  const citizenDemand = clamp(
    safeNumber(requestCount) * 5
  );

  const config =
    CATEGORY_CONFIG[category] || {
      infrastructureGap: 20,
      urgency: 18,
      vulnerability: 45,
    };

  const infrastructureGap = clamp(
    config.infrastructureGap
  );

  const urgency = clamp(
    config.urgency
  );

  const vulnerability = clamp(
    config.vulnerability
  );

  const populationAffected = clamp(
    POPULATION_AFFECTED_SCORE
  );

  /*
   * EXACT request body expected by FastAPI.
   */
  const body = {
    citizen_demand: citizenDemand,
    population_affected: populationAffected,
    infrastructure_gap: infrastructureGap,
    urgency: urgency,
    vulnerability: vulnerability,
  };

  

  /*
   * Call FastAPI.
   */
  try {
    const response = await fetch(
      `${API_BASE}/priority/calculate`,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      }
    );

    /*
     * FastAPI returned an error.
     */
    if (!response.ok) {
      const errorText =
        await response.text();

      console.warn(
        `Priority API returned ${response.status} for ${category}:`,
        errorText
      );

      /*
       * Use local fallback.
       */
      const fallbackScore =
        calculateLocalScore(body);

      return {
        category,
        requests: requestCount,
        priorityScore: fallbackScore,
        priorityLevel:
          getPriorityLevel(
            fallbackScore
          ),
        infrastructureGap,
        vulnerability,
        urgency,
      };
    }

    /*
     * FastAPI returned success.
     */
    const data =
      await response.json();

    const apiScore = safeNumber(
      data?.priority_score,
      calculateLocalScore(body)
    );

    return {
      category,

      requests: requestCount,

      priorityScore: Number(
        apiScore.toFixed(2)
      ),

      priorityLevel:
        data?.priority_level ||
        getPriorityLevel(apiScore),

      infrastructureGap,

      vulnerability,

      urgency,
    };
  } catch (error) {
    /*
     * Backend is offline or connection failed.
     */
    console.warn(
      `Priority API connection failed for ${category}:`,
      error
    );

    const fallbackScore =
      calculateLocalScore(body);

    return {
      category,

      requests: requestCount,

      priorityScore: fallbackScore,

      priorityLevel:
        getPriorityLevel(
          fallbackScore
        ),

      infrastructureGap,

      vulnerability,

      urgency,
    };
  }
}

function PriorityProjects({
  district: districtProp,
  selectedDistrict,
  district = selectedDistrict || districtProp || DEFAULT_DISTRICT,
  onSelectProject,
}) {
  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
 * Load projects when district changes.
 *
 * The cleanup flag prevents an older API request
 * from overwriting newer results.
 */
useEffect(() => {
  let cancelled = false;

  async function loadCurrentProjects() {
    const result = await loadProjects();

    if (cancelled) {
      return;
    }

    if (Array.isArray(result)) {
      setProjects(result);
    }
  }

  loadCurrentProjects();

  return () => {
    cancelled = true;
  };
}, [district]);

  /*
   * Main project loader.
   */
  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      /*
       * Get all citizen requests.
       */
      const response = await fetch(
        `${API_BASE}/requests/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Requests API failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      const allRequests =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.requests)
          ? data.requests
          : [];

      /*
       * Count requests for every category.
       */
      const categoryCounts =
        CATEGORIES.map((category) => ({
          category,

          requests:
            getCategoryRequestCount(
              allRequests,
              district,
              category
            ),
        }));

      /*
       * Calculate every category.
       */
      const calculatedProjects =
        await Promise.all(
          categoryCounts.map(
            async (item) => {
              return await calculateCategoryPriority(
                item.category,
                item.requests
              );
            }
          )
        );

      /*
       * Sort highest score first.
       */
      calculatedProjects.sort(
        (a, b) =>
          safeNumber(
            b.priorityScore
          ) -
          safeNumber(
            a.priorityScore
          )
      );

      setProjects(
        calculatedProjects
      );


    } catch (err) {
      console.error(
        "Priority Projects error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load priority projects."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * View AI button.
   */
  function handleViewAI(project) {
    if (
      typeof onSelectProject ===
      "function"
    ) {
      onSelectProject({
        category:
          project.category,

        district,

        project,
      });
    }
  }

  /*
   * Loading screen.
   */
  if (loading) {
    return (
      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2
              style={styles.panelTitle}
            >
              Government Priority Projects
            </h2>

            <p
              style={styles.panelSubtitle}
            >
              AI-ranked development
              priorities for {district}
            </p>
          </div>

          <span
            style={styles.aiBadge}
          >
            AI RANKING
          </span>
        </div>

        <div
          style={styles.loading}
        >
          AI is calculating priority
          projects...
        </div>
      </section>
    );
  }

  /*
   * Error screen.
   */
  if (error) {
    return (
      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2
              style={styles.panelTitle}
            >
              Government Priority Projects
            </h2>

            <p
              style={styles.panelSubtitle}
            >
              AI-ranked development
              priorities for {district}
            </p>
          </div>
        </div>

        <div style={styles.error}>
          ⚠️ {error}
        </div>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={loadProjects}
        >
          🔄 Retry
        </button>
      </section>
    );
  }

  /*
   * Highest priority project.
   */
  const highestPriority =
    projects.length > 0
      ? projects[0]
      : null;

  /*
   * Main render.
   */
  return (
    <section style={styles.panel}>
      {/* HEADER */}

      <div style={styles.panelHeader}>
        <div>
          <div style={{ color: "#38bdf8", fontSize: "10px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>
            PRIORITY MATRIX
          </div>

          <h2 style={styles.panelTitle}>
            Government Priority Projects
          </h2>

          <p style={styles.panelSubtitle}>
            AI-ranked development priorities for {district}
          </p>
        </div>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={loadProjects}
        >
          🔄 Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div style={styles.summaryGrid}>
        {/* TOTAL */}

        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>
            📊
          </span>

          <div>
            <small style={{ color: "#38bdf8", fontSize: "10px", fontWeight: "800", letterSpacing: "0.8px", display: "block" }}>
              AI RANKING
            </small>

            <strong style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "800" }}>
              {projects.length}
            </strong>

            <span style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>
              Total Problems
            </span>
          </div>
        </div>

        {/* HIGHEST PRIORITY */}

        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>
            🎯
          </span>

          <div>
            <small style={{ color: "#38bdf8", fontSize: "10px", fontWeight: "800", letterSpacing: "0.8px", display: "block" }}>
              HIGHEST PRIORITY
            </small>

            <strong style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "800" }}>
              {highestPriority
                ?.category ||
                "N/A"}
            </strong>

            <span style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>
              Highest priority problem
            </span>
          </div>
        </div>

        {/* HIGHEST SCORE */}

        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>
            🧠
          </span>

          <div>
            <small style={{ color: "#38bdf8", fontSize: "10px", fontWeight: "800", letterSpacing: "0.8px", display: "block" }}>
              HIGHEST SCORE
            </small>

            <strong style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "800" }}>
              {highestPriority
                ? safeNumber(
                    highestPriority.priorityScore
                  ).toFixed(2)
                : "0.00"}
            </strong>

            <span style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>
              AI priority score
            </span>
          </div>
        </div>

        {/* DISTRICT */}

        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>
            📍
          </span>

          <div>
            <small style={{ color: "#38bdf8", fontSize: "10px", fontWeight: "800", letterSpacing: "0.8px", display: "block" }}>
              DISTRICT
            </small>

            <strong style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "800" }}>
              {district}
            </strong>

            <span style={{ color: "#94a3b8", fontSize: "11px", display: "block" }}>
              Current district
            </span>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "36px", textAlign: "center" }}>Rank</th>
              <th style={{ ...styles.th, minWidth: "130px" }}>Project</th>
              <th style={{ ...styles.th, width: "75px" }}>Category</th>
              <th style={{ ...styles.th, width: "75px" }}>Score</th>
              <th style={{ ...styles.th, width: "65px" }}>Priority</th>
              <th style={{ ...styles.th, width: "75px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project, index) => {
              const score = safeNumber(project.priorityScore);
              const level = project.priorityLevel || getPriorityLevel(score);

              const projectTitles = {
                "Water Supply": "Drinking Water Infrastructure Improvement",
                "Roads": "Road Infrastructure Rehabilitation",
                "Healthcare": "Primary Healthcare Infrastructure Improvement",
                "Education": "Education Infrastructure Enhancement",
                "Electricity": "Rural Electricity Access Improvement",
              };

              const categoryColors = {
                "Water Supply": { bg: "rgba(37, 99, 235, 0.15)", color: "#60a5fa", border: "rgba(37, 99, 235, 0.3)" },
                "Roads": { bg: "rgba(59, 130, 246, 0.15)", color: "#93c5fd", border: "rgba(59, 130, 246, 0.3)" },
                "Healthcare": { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "rgba(34, 197, 94, 0.3)" },
                "Electricity": { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
                "Education": { bg: "rgba(139, 92, 246, 0.15)", color: "#c084fc", border: "rgba(139, 92, 246, 0.3)" },
              };

              const catStyle = categoryColors[project.category] || { bg: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "rgba(255,255,255,0.1)" };
              const projectTitle = projectTitles[project.category] || `${project.category} Project`;

              return (
                <tr
                  key={project.category}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    background: index % 2 === 0 ? "rgba(13, 20, 48, 0.6)" : "rgba(8, 11, 31, 0.6)",
                    transition: "background 0.15s ease",
                  }}
                >
                  {/* RANK */}
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "22px",
                      height: "22px",
                      borderRadius: "5px",
                      fontWeight: "800",
                      fontSize: "10px",
                      background: index === 0 ? "rgba(245, 158, 11, 0.25)" : index === 1 ? "rgba(148, 163, 184, 0.2)" : index === 2 ? "rgba(217, 119, 6, 0.2)" : "rgba(56, 189, 248, 0.1)",
                      color: index === 0 ? "#fbbf24" : index === 1 ? "#e2e8f0" : index === 2 ? "#f97316" : "#38bdf8",
                      border: `1px solid ${index === 0 ? "rgba(245, 158, 11, 0.5)" : index === 1 ? "rgba(148, 163, 184, 0.4)" : index === 2 ? "rgba(217, 119, 6, 0.4)" : "rgba(56, 189, 248, 0.25)"}`
                    }}>
                      #{index + 1}
                    </span>
                  </td>

                  {/* PROJECT NAME */}
                  <td style={styles.td}>
                    <div>
                      <strong style={{ fontSize: "11px", fontWeight: "750", color: "#f8fafc", display: "block", lineHeight: "1.25" }}>
                        {projectTitle}
                      </strong>
                      <div style={{ fontSize: "9px", color: "#64748b", marginTop: "1px" }}>
                        District Infrastructure • {district}
                      </div>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td style={styles.td}>
                    <span style={{
                      background: catStyle.bg,
                      color: catStyle.color,
                      border: `1px solid ${catStyle.border}`,
                      padding: "2px 5px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "750",
                      display: "inline-block",
                      whiteSpace: "nowrap"
                    }}>
                      {project.category}
                    </span>
                  </td>

                  {/* SCORE + MICRO BAR */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <strong style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "800", minWidth: "30px" }}>
                        {score.toFixed(2)}
                      </strong>
                      <div style={{ width: "24px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ width: `${Math.min(100, Math.max(0, score))}%`, height: "100%", background: "linear-gradient(90deg, #2563eb, #38bdf8)", borderRadius: "2px" }} />
                      </div>
                    </div>
                  </td>

                  {/* LEVEL */}
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.levelBadge,
                        ...(level === "Critical"
                          ? styles.critical
                          : level === "Medium"
                          ? styles.medium
                          : styles.low),
                      }}
                    >
                      {String(level).toUpperCase()}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td style={{ ...styles.td, whiteSpace: "nowrap", textAlign: "center" }}>
                    <button
                      type="button"
                      style={styles.aiButton}
                      onClick={() => handleViewAI(project)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(56, 189, 248, 0.25)";
                        e.currentTarget.style.borderColor = "#38bdf8";
                        e.currentTarget.style.boxShadow = "0 0 12px rgba(56, 189, 248, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#111936";
                        e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.3)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
                      }}
                    >
                      View AI →
                    </button>
                  </td>
                </tr>
              );
            })}

            {projects.length === 0 && (
              <tr>
                <td colSpan="6" style={styles.emptyTable}>
                  No priority projects found for {district}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTNOTE */}
      <div style={styles.note}>
        <div style={{ fontWeight: "750", color: "#38bdf8", marginBottom: "4px" }}>
          🤖 AI Priority Infrastructure Pipeline Ranking
        </div>
        <span style={{ color: "#f8fafc" }}>
          AI ranking is calculated from citizen demand, infrastructure gap, vulnerability, and urgency factors.
        </span>
        <br />
        <span style={styles.noteSmall}>
          Target District: {district}, Bihar • API governance metrics normalized 0–100 for FastAPI scoring engine.
        </span>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = {
  panel: {
    margin: "0",
    padding: "24px 26px",
    background: "#0d1430",
    backgroundImage: "linear-gradient(135deg, rgba(13, 20, 48, 0.95) 0%, rgba(8, 11, 31, 0.95) 100%)",
    border: "1px solid rgba(96, 165, 250, 0.18)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
    width: "100%",
    boxSizing: "border-box",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 800,
    color: "#f8fafc",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  aiBadge: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "rgba(56, 189, 248, 0.15)",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    whiteSpace: "nowrap",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "20px",
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    background: "#111936",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  },

  summaryIcon: {
    fontSize: "18px",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#38bdf8",
    fontWeight: "600",
  },

  error: {
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    marginBottom: "16px",
    fontSize: "13px",
    fontWeight: "600",
  },

  refreshButton: {
    border: "1px solid rgba(96, 165, 250, 0.3)",
    background: "#111936",
    color: "#38bdf8",
    borderRadius: "20px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease",
  },

  tableWrapper: {
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    border: "1px solid rgba(96, 165, 250, 0.18)",
    borderRadius: "14px",
    background: "#0d1430",
    width: "100%",
    boxSizing: "border-box",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
    minWidth: "100%",
  },

  th: {
    textAlign: "left",
    padding: "8px 4px",
    background: "#080b1f",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "1px solid rgba(96, 165, 250, 0.2)",
  },

  td: {
    padding: "8px 4px",
    verticalAlign: "middle",
  },

  districtText: {
    marginTop: "2px",
    color: "#94a3b8",
    fontSize: "9px",
  },

  levelBadge: {
    display: "inline-block",
    padding: "2px 5px",
    borderRadius: "4px",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.2px",
  },

  critical: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.4)",
  },

  medium: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(245, 158, 11, 0.4)",
  },

  low: {
    background: "rgba(6, 182, 212, 0.15)",
    color: "#22d3ee",
    border: "1px solid rgba(6, 182, 212, 0.4)",
  },

  aiButton: {
    border: "1px solid rgba(96, 165, 250, 0.3)",
    background: "#111936",
    color: "#38bdf8",
    borderRadius: "6px",
    padding: "4px 7px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "10px",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease",
    position: "relative",
    zIndex: 2,
    pointerEvents: "auto",
    outline: "none",
  },

  emptyTable: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#94a3b8",
    fontWeight: "600",
  },

  note: {
    marginTop: "18px",
    padding: "14px 18px",
    background: "#080b1f",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    borderLeft: "4px solid #38bdf8",
    borderRadius: "12px",
    color: "#f8fafc",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  noteSmall: {
    color: "#94a3b8",
    fontSize: "11px",
  },
};

export default PriorityProjects;