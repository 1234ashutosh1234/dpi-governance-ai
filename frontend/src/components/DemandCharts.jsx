import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function DemandCharts({ analytics }) {
  const categoryData =
    analytics?.category_breakdown?.map((item) => ({
      category: item.category,
      requests: Number(item.requests) || 0,
      percentage: Number(item.percentage) || 0,
    })) || [];

  const priorityData = [
    {
      problem: "Water Supply",
      score: 53.52,
    },
    {
      problem: "Roads",
      score: 44.82,
    },
    {
      problem: "Healthcare",
      score: 36.22,
    },
    {
      problem: "Education",
      score: 34.76,
    },
    {
      problem: "Electricity",
      score: 29.47,
    },
  ];

  const pieColors = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#9333ea",
    "#dc2626",
  ];

  return (
    <section style={styles.wrapper}>

      {/* ==========================================
          CATEGORY DISTRIBUTION
      ========================================== */}

      <div style={styles.card}>

        <div style={styles.header}>

          <div>
            <h2 style={styles.title}>
              Citizen Demand Distribution
            </h2>

            <p style={styles.subtitle}>
              Category-wise citizen development requests
            </p>
          </div>

          <span style={styles.badge}>
            AI ANALYTICS
          </span>

        </div>


        {categoryData.length > 0 ? (

          <div style={styles.chartContainer}>

            <ResponsiveContainer
              width="100%"
              height={330}
            >

              <PieChart>

                <Pie
                  data={categoryData}
                  dataKey="requests"
                  nameKey="category"
                  cx="50%"
                  cy="48%"
                  outerRadius={105}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ percentage }) =>
                    `${percentage.toFixed(1)}%`
                  }
                >

                  {categoryData.map(
                    (entry, index) => (

                      <Cell
                        key={`cell-${entry.category || index}`}
                        fill={
                          pieColors[
                            index %
                            pieColors.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <div style={styles.empty}>
            No analytics data available.
          </div>

        )}

      </div>


      {/* ==========================================
          PRIORITY SCORES
      ========================================== */}

      <div style={styles.card}>

        <div style={styles.header}>

          <div>
            <h2 style={styles.title}>
              AI Priority Ranking
            </h2>

            <p style={styles.subtitle}>
              AI-generated infrastructure priority scores
            </p>
          </div>

          <span style={styles.badge}>
            AI ENGINE
          </span>

        </div>


        <div style={styles.chartContainer}>

          <ResponsiveContainer
            width="100%"
            height={330}
          >

            <BarChart
              data={priorityData}
              layout="vertical"
              margin={{
                top: 10,
                right: 25,
                left: 20,
                bottom: 10,
              }}
            >

              <XAxis
                type="number"
                domain={[0, 100]}
              />

              <YAxis
                type="category"
                dataKey="problem"
                width={100}
                tick={{
                  fontSize: 11,
                }}
              />

              <Tooltip
                formatter={(value) =>
                  [
                    `${Number(value).toFixed(2)}`,
                    "Priority Score",
                  ]
                }
              />

              <Bar
                dataKey="score"
                radius={[
                  0,
                  7,
                  7,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </section>
  );
}


const styles = {

  wrapper: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "28px",
    margin: "28px 0",
  },

  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px 30px",
    border: "1px solid #cbd5e1",
    borderTop: "3px solid #2563eb",
    boxShadow:
      "0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
    color: "#0f172a",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  badge: {
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.8px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    whiteSpace: "nowrap",
  },

  chartContainer: {
    width: "100%",
    height: "330px",
    marginTop: "10px",
  },

  empty: {
    height: "330px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "14px",
  },

};


export default DemandCharts;