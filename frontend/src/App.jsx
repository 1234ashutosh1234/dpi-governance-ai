import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CitizenPortal from "./pages/CitizenPortal";

function App() {
  return (
    <BrowserRouter>
      {/* =========================
          TOP COMMAND NAVBAR
      ========================= */}
      <nav style={{
        background: "rgba(8, 11, 31, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(96, 165, 250, 0.18)",
        padding: "12px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)"
      }}>
        {/* BRAND LOGO */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#f8fafc",
          fontWeight: "800",
          fontSize: "18px",
          letterSpacing: "-0.3px"
        }}>
          <span style={{ fontSize: "22px" }}>🏛️</span>
          <span>DPI Governance AI</span>
        </div>

        {/* NAVIGATION PILL BUTTONS */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#0d1430",
          padding: "4px",
          borderRadius: "30px",
          border: "1px solid rgba(96, 165, 250, 0.15)"
        }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              textDecoration: "none",
              transition: "all 0.2s ease",
              background: isActive ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "transparent",
              color: isActive ? "#ffffff" : "#94a3b8",
              boxShadow: isActive ? "0 2px 10px rgba(37, 99, 235, 0.4)" : "none"
            })}
          >
            Government Dashboard
          </NavLink>

          <NavLink
            to="/citizen"
            style={({ isActive }) => ({
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              textDecoration: "none",
              transition: "all 0.2s ease",
              background: isActive ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "transparent",
              color: isActive ? "#ffffff" : "#94a3b8",
              boxShadow: isActive ? "0 2px 10px rgba(37, 99, 235, 0.4)" : "none"
            })}
          >
            Citizen Portal
          </NavLink>
        </div>

        {/* RIGHT SYSTEM ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#94a3b8",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "14px"
          }}>
            🔔
          </button>

          <div style={{
            background: "linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span>👤</span>
            <span>AI Admin</span>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/citizen" element={<CitizenPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;