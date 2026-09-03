import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL } from "../services/api";

const API_BASE = API_BASE_URL;
const DEFAULT_DISTRICT = "Patna";

// Fix Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function HotspotMap() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHotspots() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/hotspots/district/${encodeURIComponent(
            DEFAULT_DISTRICT
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Hotspots API returned ${response.status}`
          );
        }

        const data = await response.json();

        const clusters = Array.isArray(data?.clusters)
          ? data.clusters
          : [];

        const mappedHotspots = clusters.map(
          (cluster, index) => ({
            id:
              Number.isFinite(
                Number(cluster.cluster_id)
              )
                ? Number(cluster.cluster_id) + 1
                : index + 1,

            category:
              cluster.dominant_problem ||
              "Infrastructure",

            requests:
              Number(cluster.request_count) || 0,

            confidence:
              Number(
                cluster.average_ai_confidence || 0
              ) * 100,

            score:
              Number(cluster.hotspot_score) || 0,

            latitude:
              Number(
                cluster.center?.latitude
              ),

            longitude:
              Number(
                cluster.center?.longitude
              ),

            level:
              cluster.severity || "Low",

            breakdown:
              Object.entries(
                cluster.category_breakdown || {}
              )
                .map(
                  ([category, count]) =>
                    `${category}: ${count}`
                )
                .join(" • "),
          })
        );

       
        setHotspots(mappedHotspots);
      } catch (err) {
        console.error(
          "Hotspot loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load geographic hotspots."
        );

        setHotspots([]);
      } finally {
        setLoading(false);
      }
    }

    loadHotspots();
  }, []);

  const totalClustersCount = hotspots.length;
  const criticalCount = hotspots.filter((h) => h.level === "Critical").length;
  const highCount = hotspots.filter((h) => h.level === "High").length;
  const avgConfidence =
    hotspots.length > 0
      ? (
          hotspots.reduce((sum, h) => sum + (h.confidence || 0), 0) /
          hotspots.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="hotspot-map-section">

      {/* SECTION HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.2px" }}>
            Geographic Hotspot Map
          </h2>

          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>
            AI-detected spatial demand clusters & geographic density analysis
          </p>
        </div>

        <span style={{
          background: "rgba(6, 182, 212, 0.15)",
          color: "#22d3ee",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          fontWeight: "800",
          fontSize: "10px",
          padding: "5px 10px",
          borderRadius: "20px",
          letterSpacing: "0.8px"
        }}>
          GIS AI CLUSTERING
        </span>
      </div>

      {/* GIS METRICS BAR */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        margin: "16px 0",
        padding: "12px 18px",
        background: "#080b1f",
        border: "1px solid rgba(96, 165, 250, 0.2)",
        borderRadius: "12px",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <span style={{ color: "#94a3b8", fontWeight: "600" }}>Total Clusters:</span>
          <strong style={{ color: "#f8fafc", fontWeight: "800" }}>{totalClustersCount}</strong>
        </div>

        <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.1)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <span style={{ color: "#94a3b8", fontWeight: "600" }}>Critical Severity:</span>
          <span style={{
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: "800",
            fontSize: "11px"
          }}>
            {criticalCount}
          </span>
        </div>

        <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.1)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <span style={{ color: "#94a3b8", fontWeight: "600" }}>High Priority:</span>
          <span style={{
            background: "rgba(245, 158, 11, 0.15)",
            color: "#fbbf24",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: "800",
            fontSize: "11px"
          }}>
            {highCount}
          </span>
        </div>

        <div style={{ width: "1px", height: "16px", background: "rgba(255, 255, 255, 0.1)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <span style={{ color: "#94a3b8", fontWeight: "600" }}>Avg AI Confidence:</span>
          <strong style={{ color: "#38bdf8", fontWeight: "800" }}>{avgConfidence}%</strong>
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="hotspot-map-card dark-leaflet-map" style={{ border: "1px solid rgba(96, 165, 250, 0.25)", borderRadius: "16px", overflow: "hidden", position: "relative" }}>

        {loading && (
          <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontWeight: "600", background: "#080b1f" }}>
            Loading geographic GIS hotspots...
          </div>
        )}

        {error && (
          <div style={{ padding: "24px", textAlign: "center", color: "#f87171", fontWeight: "600", background: "#080b1f" }}>
            {error}
          </div>
        )}

        <MapContainer
          center={[25.5948, 85.1379]}
          zoom={10}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "260px",
            background: "#050816"
          }}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hotspots.map((hotspot) => {
            const color =
              hotspot.level === "Critical"
                ? "#ef4444"
                : hotspot.level === "High"
                ? "#f59e0b"
                : "#06b6d4";

            return (
              <React.Fragment key={hotspot.id}>

                <Circle
                  center={[
                    hotspot.latitude,
                    hotspot.longitude,
                  ]}
                  radius={
                    hotspot.level === "Critical"
                      ? 3200
                      : hotspot.level === "High"
                      ? 2200
                      : 1500
                  }
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                />

                <Marker
                  position={[
                    hotspot.latitude,
                    hotspot.longitude,
                  ]}
                >

                  <Popup>

                    <div style={{ padding: "4px", fontFamily: "Inter, sans-serif", minWidth: "220px", background: "#0d1430", color: "#f8fafc" }}>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8" }}>
                          CLUSTER #{hotspot.id}
                        </span>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: hotspot.level === "Critical" ? "rgba(239, 68, 68, 0.2)" : hotspot.level === "High" ? "rgba(245, 158, 11, 0.2)" : "rgba(6, 182, 212, 0.2)",
                          color: hotspot.level === "Critical" ? "#f87171" : hotspot.level === "High" ? "#fbbf24" : "#22d3ee",
                          border: `1px solid ${hotspot.level === "Critical" ? "rgba(239, 68, 68, 0.4)" : hotspot.level === "High" ? "rgba(245, 158, 11, 0.4)" : "rgba(6, 182, 212, 0.4)"}`
                        }}>
                          {hotspot.level}
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                        {hotspot.category}
                      </h4>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", background: "#080b1f", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>Requests</span>
                          <strong style={{ color: "#f8fafc", fontSize: "13px" }}>{hotspot.requests}</strong>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>Hotspot Score</span>
                          <strong style={{ color: "#f8fafc", fontSize: "13px" }}>{hotspot.score.toFixed(2)}</strong>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>AI Confidence</span>
                          <strong style={{ color: "#38bdf8", fontSize: "13px" }}>{hotspot.confidence.toFixed(1)}%</strong>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: "10px", display: "block" }}>Coordinates</span>
                          <strong style={{ color: "#f8fafc", fontSize: "10px" }}>{hotspot.latitude.toFixed(3)}, {hotspot.longitude.toFixed(3)}</strong>
                        </div>
                      </div>

                      {hotspot.breakdown && (
                        <div style={{ marginTop: "8px", fontSize: "11px", color: "#94a3b8", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "6px" }}>
                          <strong>Breakdown:</strong> {hotspot.breakdown}
                        </div>
                      )}

                    </div>

                  </Popup>

                </Marker>

              </React.Fragment>
            );
          })}

        </MapContainer>

      </div>

      {/* MAP LEGEND */}
      <div className="hotspot-map-legend" style={{
        marginTop: "16px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        fontSize: "12px",
        color: "#94a3b8",
        fontWeight: "600",
        background: "#080b1f",
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}></span>
          Critical Severity Hotspot (Score &gt; 70)
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px #f59e0b" }}></span>
          High Priority Hotspot (Score 50-70)
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 10px #06b6d4" }}></span>
          Standard Cluster (&lt; 50)
        </div>

      </div>

      {/* CLUSTERS CARDS GRID */}
      {hotspots.length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <h3 style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            DETECTED SPATIAL CLUSTERS ({hotspots.length})
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {hotspots.map((h) => (
              <div key={`card-${h.id}`} style={{
                background: "#111936",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderLeft: `4px solid ${h.level === "Critical" ? "#ef4444" : h.level === "High" ? "#f59e0b" : "#06b6d4"}`,
                borderRadius: "12px",
                padding: "16px 18px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#94a3b8" }}>
                    CLUSTER #{h.id}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: h.level === "Critical" ? "rgba(239, 68, 68, 0.15)" : h.level === "High" ? "rgba(245, 158, 11, 0.15)" : "rgba(6, 182, 212, 0.15)",
                    color: h.level === "Critical" ? "#f87171" : h.level === "High" ? "#fbbf24" : "#22d3ee",
                    border: `1px solid ${h.level === "Critical" ? "rgba(239, 68, 68, 0.3)" : h.level === "High" ? "rgba(245, 158, 11, 0.3)" : "rgba(6, 182, 212, 0.3)"}`
                  }}>
                    {h.level}
                  </span>
                </div>

                <div style={{ fontWeight: "800", fontSize: "15px", color: "#f8fafc", marginBottom: "10px" }}>
                  {h.category}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                  <span>Requests: <strong style={{ color: "#f8fafc" }}>{h.requests}</strong></span>
                  <span>Hotspot Score: <strong style={{ color: "#f8fafc" }}>{h.score.toFixed(2)}</strong></span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#94a3b8" }}>
                  <span>AI Confidence: <strong style={{ color: "#38bdf8" }}>{h.confidence.toFixed(1)}%</strong></span>
                  <span style={{ fontSize: "11px", background: "#080b1f", color: "#94a3b8", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    📍 {h.latitude.toFixed(3)}, {h.longitude.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}

export default HotspotMap;