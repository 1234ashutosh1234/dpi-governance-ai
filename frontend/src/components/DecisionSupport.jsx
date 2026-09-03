import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../services/api";

const API_BASE = API_BASE_URL;

const DISTRICTS = [
  "Patna",
  "Katihar",
  "Gaya",
  "Muzaffarpur",
  "Bhagalpur",
];

const CATEGORIES = [
  "Water Supply",
  "Roads",
  "Healthcare",
  "Electricity",
  "Education",
];

const DISTRICT_POPULATIONS = {
  Patna: 5838465,
  Katihar: 3071702,
  Gaya: 4391418,
  Muzaffarpur: 4801062,
  Bhagalpur: 3038114,
};

const DEFAULT_PROJECTS = {
  "Water Supply": {
    project: "Drinking Water Infrastructure Improvement",

    actions: [
      "Repair damaged water pipelines",
      "Expand reliable drinking-water coverage",
      "Prioritize areas with repeated citizen complaints",
      "Monitor local water-supply availability",
    ],

    reason:
      "The issue should be included in the medium-term development planning cycle.",

    investment: 850,
    infrastructureGap: 18,
    vulnerability: 45,
    urgency: 18,
    infrastructureAccess: 82,
    populationDensity: 1823,
  },

  Roads: {
    project: "Road Infrastructure Rehabilitation",

    actions: [
      "Repair damaged roads and potholes",
      "Prioritize high-demand road segments",
      "Improve rural road connectivity",
      "Monitor road quality after intervention",
    ],

    reason:
      "Road infrastructure should be included in the medium-term development planning cycle.",

    investment: 850,
    infrastructureGap: 32,
    vulnerability: 45,
    urgency: 22,
    infrastructureAccess: 68,
    populationDensity: 1823,
  },

  Healthcare: {
    project: "Primary Healthcare Infrastructure Improvement",

    actions: [
      "Improve availability of healthcare staff",
      "Strengthen local health centres",
      "Prioritize underserved communities",
      "Monitor essential healthcare availability",
    ],

    reason:
      "Healthcare access should be strengthened through targeted development planning.",

    investment: 700,
    infrastructureGap: 24,
    vulnerability: 45,
    urgency: 24,
    infrastructureAccess: 76,
    populationDensity: 1823,
  },

  Electricity: {
    project: "Rural Electricity Reliability Improvement",

    actions: [
      "Repair unreliable electricity infrastructure",
      "Prioritize areas with repeated complaints",
      "Improve power reliability",
      "Monitor electricity service availability",
    ],

    reason:
      "Electricity reliability should be addressed through targeted infrastructure improvements.",

    investment: 650,
    infrastructureGap: 9,
    vulnerability: 45,
    urgency: 9,
    infrastructureAccess: 91,
    populationDensity: 1823,
  },

  Education: {
    project: "Government School Infrastructure Improvement",

    actions: [
      "Repair damaged school buildings",
      "Improve essential school infrastructure",
      "Prioritize schools with repeated complaints",
      "Monitor school infrastructure conditions",
    ],

    reason:
      "Education infrastructure should be included in the medium-term development planning cycle.",

    investment: 750,
    infrastructureGap: 20.75,
    vulnerability: 45,
    urgency: 21,
    infrastructureAccess: 79.25,
    populationDensity: 1823,
  },
};

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return number;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(
    max,
    Math.max(
      min,
      safeNumber(value)
    )
  );
}

function formatNumber(value, decimals = 0) {
  return safeNumber(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
  );
}

function formatPercent(value) {
  return `${safeNumber(value).toFixed(2)}%`;
}

function getPriorityLevel(score) {
  const value = safeNumber(score);

  if (value >= 70) {
    return "Critical";
  }

  if (value >= 50) {
    return "Medium";
  }

  return "Low";
}

function getActionLevel(level) {
  if (level === "Critical") {
    return "Immediate Priority";
  }

  if (level === "Medium") {
    return "Medium Priority";
  }

  return "Low Priority";
}

function normalizePopulation(population) {
  const raw = safeNumber(population);

  if (raw <= 0) {
    return 0;
  }

  /*
   * FastAPI accepts 0-100.
   *
   * Never send 5,838,465 directly.
   */
  const normalized =
    (Math.log10(raw + 1) /
      Math.log10(10000000)) *
    100;

  return Number(
    clamp(normalized).toFixed(2)
  );
}

function calculateFallbackScore(body) {
  const demand = clamp(
    body?.citizen_demand
  );

  const population = clamp(
    body?.population_affected
  );

  const gap = clamp(
    body?.infrastructure_gap
  );

  const urgency = clamp(
    body?.urgency
  );

  const vulnerability = clamp(
    body?.vulnerability
  );

  /*
   * Local fallback calculation.
   */
  const score =
    demand * 0.25 +
    population * 0.15 +
    gap * 0.20 +
    urgency * 0.20 +
    vulnerability * 0.20;

  return Number(
    score.toFixed(2)
  );
}

function getDefaultData(category) {
  return (
    DEFAULT_PROJECTS[category] || {
      project:
        `${category} Infrastructure Improvement`,

      actions: [
        `Improve ${category.toLowerCase()} infrastructure`,
        "Prioritize high-demand areas",
        "Address repeated citizen complaints",
        "Monitor service availability",
      ],

      reason:
        "The issue should be considered in the medium-term development planning cycle.",

      investment: 700,
      infrastructureGap: 20,
      vulnerability: 45,
      urgency: 20,
      infrastructureAccess: 80,
      populationDensity: 1823,
    }
  );
}

function getLevelStyle(level) {
  if (level === "Critical") {
    return {
      background: "rgba(239, 68, 68, 0.15)",
      color: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.4)",
    };
  }

  if (level === "Medium") {
    return {
      background: "rgba(245, 158, 11, 0.15)",
      color: "#fbbf24",
      border: "1px solid rgba(245, 158, 11, 0.4)",
    };
  }

  return {
    background: "rgba(6, 182, 212, 0.15)",
    color: "#22d3ee",
    border: "1px solid rgba(6, 182, 212, 0.4)",
  };
}

export default function DecisionSupport({
  district: districtProp,
  selectedDistrict,
  category: categoryProp,
  selectedCategory,
}) {
  const initialDistrict = districtProp || selectedDistrict || "Patna";
  const initialCategory = categoryProp || selectedCategory || "Water Supply";

  const [district, setDistrict] =
    useState(initialDistrict);

  const [category, setCategory] =
    useState(initialCategory);
  const [requests, setRequests] =
    useState([]);

  const [loadingRequests, setLoadingRequests] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * IMPORTANT:
   *
   * This is the state that was missing
   * in your previous version.
   */
  const [priority, setPriority] =
    useState(null);

  const [population, setPopulation] =
    useState(5838465);

  const [infrastructureGap, setInfrastructureGap] =
    useState(18);

  const [vulnerability, setVulnerability] =
    useState(45);

  const [urgency, setUrgency] =
    useState(18);

  const defaults = useMemo(
    () =>
      getDefaultData(category),
    [category]
  );

  /*
   * ==========================================
   * GET ALL REQUESTS
   * ==========================================
   */
  async function getAllRequests() {
    try {
      const response = await fetch(
        `${API_BASE}/requests/`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Requests API returned ${response.status}`
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        return data;
      }

      if (
        Array.isArray(
          data?.requests
        )
      ) {
        return data.requests;
      }

      return [];
    } catch (err) {
      console.error(
        "All requests error:",
        err
      );

      return [];
    }
  }

  /*
   * ==========================================
   * GET DISTRICT REQUESTS
   * ==========================================
   *
   * We intentionally use /requests/
   * and filter locally.
   *
   * This avoids the previous issue where
   * /requests/district/patna returned 0.
   */
  async function getDistrictRequests() {
    setLoadingRequests(true);

    try {
      const allRequests =
        await getAllRequests();

      const selectedDistrict =
        String(district)
          .trim()
          .toLowerCase();

      const filtered =
        allRequests.filter(
          (item) => {
            const itemDistrict =
              String(
                item?.district || ""
              )
                .trim()
                .toLowerCase();

            return (
              itemDistrict ===
              selectedDistrict
            );
          }
        );

    
      setRequests(filtered);

      return filtered;
    } catch (err) {
      console.error(
        "District request error:",
        err
      );

      setRequests([]);

      return [];
    } finally {
      setLoadingRequests(false);
    }
  }

    /*
   * ==========================================
   * RUN AI ANALYSIS
   * ==========================================
   */

    async function getRecommendation() {
  try {
    const url =
      `${API_BASE}/recommendations/district/` +
      `${encodeURIComponent(district)}/category/` +
      `${encodeURIComponent(category)}`;

    

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(
        "Recommendation API returned:",
        response.status
      );

      return null;
    }

    const data = await response.json();

   
    return data;

  } catch (error) {
    console.warn(
      "Recommendation API unavailable:",
      error
    );

    return null;
  }
}

  async function runAnalysis() {
    setLoading(true);
    setError("");

    try {
      /*
       * Get latest requests.
       */
      const latestRequests =
        await getDistrictRequests();

      /*
       * Count selected category.
       *
       * Example:
       * Patna + Water Supply = 11
       */
      const categoryCount =
        latestRequests.filter(
          (item) =>
            String(
              item?.category || ""
            )
              .trim()
              .toLowerCase() ===
            String(category)
              .trim()
              .toLowerCase()
        ).length;

      /*
       * ======================================
       * AI INPUT VALUES
       * ======================================
       */

      const citizenDemand =
        clamp(
          (categoryCount / 20) *
            100
        );

      const populationValue =
        DISTRICT_POPULATIONS[
          district
        ] || 1000000;

      const populationScore =
        normalizePopulation(
          populationValue
        );

      const defaultData =
        getDefaultData(
          category
        );

      const currentGap =
        safeNumber(
          defaultData.infrastructureGap,
          20
        );

      const currentUrgency =
        safeNumber(
          defaultData.urgency,
          20
        );

      const currentVulnerability =
        safeNumber(
          defaultData.vulnerability,
          45
        );

      /*
       * ======================================
       * FASTAPI BODY
       * ======================================
       *
       * IMPORTANT:
       * Every value is 0-100.
       */
      const body = {
        citizen_demand:
          Number(
            citizenDemand.toFixed(2)
          ),

        population_affected:
          Number(
            populationScore.toFixed(2)
          ),

        infrastructure_gap:
          Number(
            clamp(
              currentGap
            ).toFixed(2)
          ),

        urgency:
          Number(
            clamp(
              currentUrgency
            ).toFixed(2)
          ),

        vulnerability:
          Number(
            clamp(
              currentVulnerability
            ).toFixed(2)
          ),
      };
     

      /*
       * ======================================
       * PRIORITY API
       * ======================================
       */

      let priorityData =
        null;

      try {
        const priorityResponse =
          await fetch(
            `${API_BASE}/priority/calculate`,
            {
              method: "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  body
                ),
            }
          );

        if (!priorityResponse.ok) {
          const errorText =
            await priorityResponse.text();

          console.warn(
            "Priority API error:",
            priorityResponse.status,
            errorText
          );

          /*
           * Use fallback.
           */
          const fallbackScore =
            calculateFallbackScore(
              body
            );

          priorityData = {
            priority_score:
              fallbackScore,

            priority_level:
              getPriorityLevel(
                fallbackScore
              ),
          };
        } else {
          priorityData =
            await priorityResponse.json();

         
        }
      } catch (priorityError) {
        console.warn(
          "Priority API unavailable:",
          priorityError
        );

        /*
         * Backend unavailable:
         * use local calculation.
         */
        const fallbackScore =
          calculateFallbackScore(
            body
          );

        priorityData = {
          priority_score:
            fallbackScore,

          priority_level:
            getPriorityLevel(
              fallbackScore
            ),
        };
      }

      /*
       * ======================================
       * RECOMMENDATION
       * ======================================
       */

      const recommendation =
        await getRecommendation();

      const fallback =
        getDefaultData(
          category
        );

      /*
       * ======================================
       * FINAL VALUES
       * ======================================
       */

      const score =
        safeNumber(
          priorityData?.priority_score,
          calculateFallbackScore(
            body
          )
        );

      const level =
        priorityData?.priority_level ||
        getPriorityLevel(
          score
        );

      const project = fallback.project;
      const actions =
        Array.isArray(
          recommendation?.recommended_actions
        )
          ? recommendation.recommended_actions
          : fallback.actions;

      const reason =
        recommendation?.reason ||
        fallback.reason;

      const investment =
        safeNumber(
          recommendation?.supporting_data
            ?.investment ??
            recommendation?.investment ??
            fallback.investment,
          fallback.investment
        );

      /*
       * ======================================
       * SAVE FINAL RESULT
       * ======================================
       */

      const finalPriority = {
        district,

        category,

        citizen_requests:
          categoryCount,

        population:
          populationValue,

        population_density:
          safeNumber(
            recommendation?.population_density,
            fallback.populationDensity
          ),

        infrastructure_gap:
          safeNumber(
            recommendation?.supporting_data
              ?.infrastructure_gap ??
              recommendation?.infrastructure_gap ??
              currentGap,
            currentGap
          ),

        infrastructure_access:
          100 -
          safeNumber(
            recommendation?.supporting_data
              ?.infrastructure_gap ??
              recommendation?.infrastructure_gap ??
              currentGap,
            currentGap
          ),

        vulnerability:
          safeNumber(
            recommendation?.supporting_data
              ?.vulnerability ??
              recommendation?.vulnerability ??
              currentVulnerability,
            currentVulnerability
          ),

        urgency:
          safeNumber(
            recommendation?.urgency ??
              currentUrgency,
            currentUrgency
          ),

        investment,

        priority_score:
          score,

        priority_level:
          level,

        recommended_project:
          project,

        recommended_actions:
          actions,

        action_level:
          recommendation?.action_level ||
          getActionLevel(level),

        reason,

        apiInput: body,
      };

      /*
       * THIS is the correct setter.
       */
      setPriority(
        finalPriority
      );

      
    } catch (err) {
      console.error(
        "Decision Support error:",
        err
      );

      setError(
        err?.message ||
          "Unable to complete AI analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
 * ==========================================
 * LOAD DATA WHEN DISTRICT CHANGES
 * ==========================================
 *
 * IMPORTANT:
 * Do NOT automatically call runAnalysis()
 * when requests change.
 *
 * runAnalysis() itself refreshes requests.
 * Automatically calling it from [requests]
 * creates a repeated API/render loop.
 */
useEffect(() => {
  getDistrictRequests();
}, [district]);

useEffect(() => {
  const nextDistrict =
    String(districtProp || selectedDistrict || "Patna").trim();

  const nextCategory =
    String(categoryProp || selectedCategory || "Water Supply").trim();

  if (nextDistrict !== district) {
    setDistrict(nextDistrict);
  }

  if (nextCategory !== category) {
    setCategory(nextCategory);
    setPriority(null);
    setError("");
  }
}, [districtProp, selectedDistrict, categoryProp, selectedCategory]);

  /*
   * ==========================================
   * CHANGE HANDLERS
   * ==========================================
   */

  function handleDistrictChange(
    event
  ) {
    const value =
      event.target.value;

    setDistrict(value);

    setPriority(null);

    setError("");

    const defaultData =
      getDefaultData(
        category
      );

    setPopulation(
      DISTRICT_POPULATIONS[
        value
      ] || 1000000
    );

    setInfrastructureGap(
      defaultData.infrastructureGap
    );

    setVulnerability(
      defaultData.vulnerability
    );

    setUrgency(
      defaultData.urgency
    );
  }

  function handleCategoryChange(
    event
  ) {
    const value =
      event.target.value;

    setCategory(value);

    setPriority(null);

    setError("");

    const defaultData =
      getDefaultData(value);

    setInfrastructureGap(
      defaultData.infrastructureGap
    );

    setVulnerability(
      defaultData.vulnerability
    );

    setUrgency(
      defaultData.urgency
    );
  }

    /*
   * ==========================================
   * DISPLAY VALUES
   * ==========================================
   */

  const fallback = getDefaultData(category);

  /*
   * Use the latest AI result when available.
   * Otherwise show safe default values.
   */
  const display = priority || {
    district: district,
    category: category,

    priority_score: 0,
    priority_level: "—",

    citizen_requests: requests.filter(
      (item) =>
        String(item?.category || "")
          .trim()
          .toLowerCase() ===
        String(category || "")
          .trim()
          .toLowerCase()
    ).length,

    population: population,

    infrastructure_gap: infrastructureGap,

    infrastructure_access:
      100 - Number(infrastructureGap || 0),

    vulnerability: vulnerability,

    urgency: urgency,

    population_density:
      fallback.populationDensity,

    investment:
      fallback.investment,

    recommended_project:
      fallback.project,

    recommended_actions:
      fallback.actions,

    action_level: "—",

    reason:
      fallback.reason,

    apiInput: null,
  };

  return (
    <section id="decision-support-section" style={styles.section}>

      {/* =====================================
          HEADER
      ====================================== */}

      <div style={styles.header}>

        <div>

          <div style={styles.eyebrow}>
            DECISION ENGINE
          </div>

          <h2 style={styles.title}>
            AI Decision Support
          </h2>

          <p style={styles.subtitle}>
            Context-aware infrastructure prioritization and policy recommendations
          </p>

        </div>

        <div style={styles.liveBadge}>
          ● DECISION ENGINE
        </div>

      </div>

      {/* =====================================
          CONTROLS
      ====================================== */}

      <div style={styles.controlsCard}>

        <div style={styles.control}>

          <label style={styles.label}>
            District
          </label>

          <select
            value={district}
            onChange={
              handleDistrictChange
            }
            style={styles.select}
          >
            {DISTRICTS.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

        </div>

        <div style={styles.control}>

          <label style={styles.label}>
            Development Problem
          </label>

          <select
            value={category}
            onChange={
              handleCategoryChange
            }
            style={styles.select}
          >
            {CATEGORIES.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

        </div>

        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          style={{
            ...styles.runButton,

            opacity:
              loading
                ? 0.65
                : 1,
          }}
        >
          {loading
            ? "Running AI..."
            : "Run AI Analysis"}
        </button>

      </div>

      {/* =====================================
          ERROR
      ====================================== */}

      {error && (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}

      {/* =====================================
          LOADING
      ====================================== */}

      {loadingRequests && (
        <div style={styles.loadingText}>
          Updating live citizen requests...
        </div>
      )}

      {/* =====================================
          SCORE CARDS
      ====================================== */}

      <div style={styles.scoreGrid}>

        <div style={styles.scoreCard}>

          <div style={styles.smallLabel}>
            PRIORITY SCORE
          </div>

          <div style={styles.score}>
            {formatNumber(
              display.priority_score,
              2
            )}
          </div>

          <div
            style={{
              ...styles.levelBadge,
              ...getLevelStyle(
                display.priority_level
              ),
            }}
          >
            {display.priority_level}
          </div>

        </div>

        <StatBox
          label="Citizen Requests"
          value={formatNumber(
            display.citizen_requests
          )}
        />

        <StatBox
          label="Population"
          value={formatNumber(
            display.population
          )}
        />

        <StatBox
          label="Infrastructure Gap"
          value={formatPercent(
            display.infrastructure_gap
          )}
        />

      </div>

      {/* =====================================
          RECOMMENDED PROJECT
      ====================================== */}

      <div style={styles.projectCard}>

        <div style={styles.projectHeader}>

          <div>

            <div
              style={
                styles.projectEyebrow
              }
            >
              RECOMMENDED PROJECT
            </div>

            <h3
              style={
                styles.projectTitle
              }
            >
              {
                display.recommended_project
              }
            </h3>

          </div>

          <div
            style={{
              ...styles.largeLevel,
              ...getLevelStyle(
                display.priority_level
              ),
            }}
          >
            {display.priority_level}
          </div>

        </div>

        {/* PROJECT INFORMATION */}

        <div style={styles.projectGrid}>

          <InfoItem
            label="District"
            value={
              display.district
            }
          />

          <InfoItem
            label="Problem"
            value={
              display.category
            }
          />

          <InfoItem
            label="Investment"
            value={`₹${formatNumber(
              display.investment
            )}`}
          />

          <InfoItem
            label="Action Level"
            value={
              display.action_level
            }
          />

        </div>

        {/* METRICS */}

        <div style={styles.metricsGrid}>

          <StatBox
            label="Vulnerability"
            value={formatNumber(
              display.vulnerability,
              2
            )}
          />

          <StatBox
            label="Urgency"
            value={formatNumber(
              display.urgency,
              2
            )}
          />

          <StatBox
            label="Infrastructure Access"
            value={formatNumber(
              display.infrastructure_access,
              2
            )}
          />

          <StatBox
            label="Population Density"
            value={formatNumber(
              display.population_density,
              0
            )}
          />

          <StatBox
            label="Live Requests"
            value={formatNumber(
              display.citizen_requests
            )}
          />

        </div>

        {/* =================================
            ACTIONS
        ================================== */}

        <div
          style={
            styles.actionsSection
          }
        >

          <h4
            style={
              styles.actionsTitle
            }
          >
            AI RECOMMENDED ACTIONS
          </h4>

          <div>

            {Array.isArray(
              display.recommended_actions
            ) &&
              display.recommended_actions.map(
                (
                  action,
                  index
                ) => (
                  <div
                    key={`${action}-${index}`}
                    style={
                      styles.actionRow
                    }
                  >
                    <span
                      style={
                        styles.check
                      }
                    >
                      ✓
                    </span>

                    <span>
                      {action}
                    </span>
                  </div>
                )
              )}

          </div>

        </div>

        {/* =================================
            POLICY REASONING
        ================================== */}

        <div
          style={
            styles.reasoning
          }
        >

          <div
            style={
              styles.reasoningTitle
            }
          >
            🤖 AI Policy Reasoning
          </div>

          <p
            style={
              styles.reasonText
            }
          >
            {display.reason}
          </p>

        </div>

      </div>

      {/* =====================================
          DEBUG / AI INPUTS
      ====================================== */}

     {display.apiInput && (
  <details style={styles.debug}>
    <summary style={styles.debugSummary}>
      AI calculation inputs
    </summary>

    <div style={{ marginTop: "12px", color: "#94a3b8", fontSize: "12px" }}>
      <div>
        Citizen Demand:{" "}
        <strong style={{ color: "#f8fafc" }}>
          {formatNumber(
            display.apiInput.citizen_demand,
            2
          )}
        </strong>
      </div>

      <div>
        Population Affected:{" "}
        <strong style={{ color: "#f8fafc" }}>
          {formatNumber(
            display.apiInput.population_affected,
            2
          )}
        </strong>
      </div>

      <div>
        Infrastructure Gap:{" "}
        <strong style={{ color: "#f8fafc" }}>
          {formatNumber(
            display.apiInput.infrastructure_gap,
            2
          )}
        </strong>
      </div>

      <div>
        Urgency:{" "}
        <strong style={{ color: "#f8fafc" }}>
          {formatNumber(
            display.apiInput.urgency,
            2
          )}
        </strong>
      </div>

      <div>
        Vulnerability:{" "}
        <strong style={{ color: "#f8fafc" }}>
          {formatNumber(
            display.apiInput.vulnerability,
            2
          )}
        </strong>
      </div>
    </div>
  </details>
)}

      <div
        style={
          styles.footerNote
        }
      >
        AI analysis uses normalized 0–100 priority factors for the FastAPI priority engine.
      </div>

    </section>
  );
}

function StatBox({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.statBox
      }
    >
      <div
        style={
          styles.statLabel
        }
      >
        {label}
      </div>

      <div
        style={
          styles.statValue
        }
      >
        {value}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.infoItem
      }
    >
      <div
        style={
          styles.infoLabel
        }
      >
        {label}
      </div>

      <div
        style={
          styles.infoValue
        }
      >
        {value}
      </div>
    </div>
  );
}


const styles = {
  section: {
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "22px",
  },

  eyebrow: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
    marginBottom: "4px",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "22px",
    fontWeight: 800,
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },

  liveBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    background: "rgba(6, 182, 212, 0.15)",
    color: "#22d3ee",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },

  controlsCard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    padding: "16px 18px",
    marginBottom: "22px",
    background: "#080b1f",
    border: "1px solid rgba(96, 165, 250, 0.2)",
    borderRadius: "14px",
    alignItems: "end",
  },

  control: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  select: {
    width: "100%",
    minHeight: "42px",
    padding: "8px 12px",
    border: "1px solid rgba(96, 165, 250, 0.25)",
    borderRadius: "8px",
    background: "#0d1430",
    color: "#f8fafc",
    fontSize: "13px",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },

  runButton: {
    minHeight: "42px",
    padding: "0 22px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.5px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(6, 182, 212, 0.4)",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  errorBox: {
    marginBottom: "18px",
    padding: "14px 16px",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: "10px",
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    fontSize: "13px",
    fontWeight: "600",
  },

  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },

  scoreCard: {
    padding: "14px 14px",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    borderRadius: "12px",
    background: "#111936",
    color: "#ffffff",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },

  smallLabel: {
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.6px",
    textTransform: "uppercase",
  },

  score: {
    marginTop: "4px",
    color: "#f8fafc",
    fontSize: "24px",
    fontWeight: 900,
    lineHeight: 1.1,
  },

  levelBadge: {
    display: "inline-block",
    marginTop: "6px",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.3px",
  },

  statBox: {
    padding: "14px 14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    background: "#111936",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  statValue: {
    marginTop: "4px",
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 800,
  },

  projectCard: {
    padding: "20px 22px",
    background: "#080b1f",
    border: "1px solid rgba(96, 165, 250, 0.2)",
    borderRadius: "14px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },

  projectHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },

  projectEyebrow: {
    color: "#38bdf8",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  projectTitle: {
    margin: "4px 0 0",
    color: "#f8fafc",
    fontSize: "18px",
    fontWeight: 800,
    lineHeight: 1.3,
    whiteSpace: "normal",
    wordBreak: "break-word",
  },

  largeLevel: {
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },

  infoItem: {
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#111936",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  infoValue: {
    marginTop: "3px",
    color: "#f8fafc",
    fontSize: "12px",
    fontWeight: 700,
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
    marginBottom: "18px",
  },

  actionsSection: {
    paddingTop: "18px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },

  actionsTitle: {
    margin: "0 0 12px",
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "6px 0",
    color: "#f8fafc",
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: 1.5,
  },

  check: {
    color: "#4ade80",
    fontWeight: 900,
    fontSize: "14px",
  },

  reasoning: {
    marginTop: "18px",
    padding: "16px 18px",
    borderRadius: "12px",
    background: "#080b1f",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    borderLeft: "4px solid #38bdf8",
  },

  reasoningTitle: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },

  reasonText: {
    margin: "6px 0 0",
    color: "#f8fafc",
    fontSize: "13px",
    lineHeight: 1.55,
    fontWeight: "500",
  },

  debug: {
    marginTop: "16px",
    padding: "12px 16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    background: "#080b1f",
  },

  debugSummary: {
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  pre: {
    marginTop: "10px",
    overflowX: "auto",
    color: "#94a3b8",
    fontSize: "11px",
  },

  loadingText: {
    marginTop: "10px",
    marginBottom: "10px",
    color: "#38bdf8",
    fontSize: "12px",
    fontWeight: "600",
  },

  footerNote: {
    marginTop: "14px",
    color: "#94a3b8",
    fontSize: "11px",
  },
};