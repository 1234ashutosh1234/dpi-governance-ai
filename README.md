# 🏛️ DPI Governance AI

<p align="center">
  <strong>AI-Powered Digital Public Infrastructure Decision Support Platform</strong>
</p>

<p align="center">
  <a href="https://dpi-governance-ai-1.onrender.com">🌐 Live Demo</a> •
  <a href="https://dpi-governance-ai.onrender.com">⚙️ API</a> •
  <a href="https://dpi-governance-ai.onrender.com/health">❤️ Health</a> •
  <a href="https://github.com/1234ashutosh1234/dpi-governance-ai">💻 Source</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Scikit-Learn"/>
  <img src="https://img.shields.io/badge/GIS-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet"/>
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render"/>
</p>

> **DPI Governance AI turns citizen infrastructure grievances into decision-ready intelligence using NLP classification, district analytics, GIS hotspot detection, multi-factor priority scoring, and contextual policy recommendations.**

---

## ⭐ Why a Recruiter Should Care

This project demonstrates more than a dashboard or CRUD application.

It connects:

**raw citizen input → machine learning → geospatial intelligence → prioritization algorithms → decision support → production web application**

### Engineering signals this project demonstrates

| Area | What it demonstrates |
|---|---|
| **Full-Stack Engineering** | React 19 + Vite frontend with FastAPI REST backend |
| **AI / ML** | TF-IDF + Naive Bayes classification and confidence scoring |
| **GIS** | GeoPandas, Shapely, PyProj, Leaflet / React-Leaflet |
| **Algorithms** | Multi-factor governance priority engine |
| **Backend** | Modular FastAPI routing, Pydantic validation, SQLAlchemy |
| **Data** | District aggregation, category analytics, spatial demand analysis |
| **Product Thinking** | Government command center + citizen-facing workflow |
| **DevOps** | Separate production frontend/backend deployment on Render |
| **API Design** | Centralized frontend API client and REST endpoint structure |
| **Scalability Thinking** | Clear path toward PostGIS, workers, RBAC, observability, and model monitoring |

---

# 🚀 Live Demo

### 🌐 Production Frontend
**https://dpi-governance-ai-1.onrender.com**

### ⚙️ Production Backend
**https://dpi-governance-ai.onrender.com**

### ❤️ Backend Health
**https://dpi-governance-ai.onrender.com/health**

Expected production response:

```json
{
  "status": "healthy"
}
```

### 💻 GitHub Repository
**https://github.com/1234ashutosh1234/dpi-governance-ai**

> **Render free-tier note:** the service can sleep after inactivity, so the first request after idle time may take longer.

---

# 📸 Product Preview

## Government Command Center

![DPI Governance AI — Live Government Dashboard](docs/screenshots/live-dashboard.png)

The live UI includes:

- Government Dashboard
- Citizen Portal
- District selection
- Sector filters
- Analytics
- AI Insights
- GIS Hotspots
- Priority Projects
- Reports
- Settings
- AI Governance Engine status

---

# 🎯 The Problem

Public infrastructure complaints are often fragmented across channels and difficult to convert into actionable policy decisions.

A governance team needs to answer questions such as:

- Which issue is creating the greatest demand?
- Which district or area is becoming a hotspot?
- Which population is most affected?
- Which infrastructure gap is most urgent?
- Which project should receive priority?
- What intervention is likely to have the greatest impact?

DPI Governance AI turns those questions into a structured software workflow.

---

# 🧠 The Solution

```text
Citizen Voice / Text
        │
        ▼
┌─────────────────────┐
│ Request Ingestion   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ NLP Classification  │
│ TF-IDF + Naive Bayes│
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ District Analytics  │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ GIS Hotspot Analysis│
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Priority Engine     │
│ Demand              │
│ Population Impact   │
│ Infrastructure Gap  │
│ Urgency             │
│ Vulnerability       │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Project Ranking     │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ AI Decision Support │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Recommendations     │
└─────────────────────┘
```

---

# 🔥 Core Product Capabilities

## 1. Citizen Request Intelligence

Infrastructure complaints can be collected and classified against sectors such as:

- 💧 Water Supply
- 🛣️ Roads
- 🏥 Healthcare
- ⚡ Electricity
- 🎓 Education

The platform is designed to convert unstructured request data into structured governance signals.

---

## 2. NLP Classification

The ML pipeline uses:

```text
Raw request
     ↓
Text preprocessing
     ↓
TF-IDF representation
     ↓
Naive Bayes classifier
     ↓
Infrastructure category
     ↓
Confidence score
```

This gives the system a reproducible, interpretable baseline rather than treating classification as a black box.

---

## 3. GIS Hotspot Intelligence

The project combines spatial technologies including:

- GeoPandas
- Shapely
- PyProj
- Leaflet
- React-Leaflet

The result is a geographic view of where infrastructure demand is concentrating.

---

## 4. Multi-Factor Priority Engine

Instead of prioritizing by complaint count alone, the platform combines multiple governance signals:

| Factor | Meaning |
|---|---|
| **Citizen Demand** | How much demand exists |
| **Population Impact** | How many people may be affected |
| **Infrastructure Gap** | How severe the service deficit is |
| **Urgency** | How time-sensitive the problem is |
| **Vulnerability** | Potential socio-economic impact |

The normalized score is then mapped into:

```text
Critical  ≥ 70
Medium    ≥ 45
Low       < 45
```

This creates a more decision-oriented ranking model than a simple frequency dashboard.

---

## 5. AI Decision Support

Decision-makers can explore policy scenarios by adjusting district/sector parameters and inspecting the resulting impact.

The goal is not just:

> “What happened?”

but:

> “What should we prioritize next?”

---

## 6. Contextual Policy Recommendations

The recommendation layer can surface:

- recommended actions
- estimated investment
- implementation steps
- sector-specific justification

This turns analytics into an operational decision-support workflow.

---

# 🏗️ Technical Architecture

```text
                     ┌─────────────────────────────┐
                     │       Citizen / Admin       │
                     │        Web Interface        │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │       React 19 / Vite       │
                     │ Dashboard · Citizen Portal  │
                     │ Analytics · GIS · Projects  │
                     └──────────────┬──────────────┘
                                    │ REST
                                    ▼
                     ┌─────────────────────────────┐
                     │         FastAPI API         │
                     │ Requests · Analytics        │
                     │ Hotspots · Priority         │
                     │ Recommendations · Location │
                     └───────┬─────────┬───────────┘
                             │         │
               ┌─────────────┘         └─────────────┐
               ▼                                     ▼
      ┌──────────────────┐                   ┌─────────────────┐
      │    ML / NLP      │                   │   GIS Engine    │
      │ TF-IDF           │                   │ GeoPandas       │
      │ Naive Bayes      │                   │ Shapely         │
      │ Confidence       │                   │ PyProj          │
      └────────┬─────────┘                   └────────┬────────┘
               │                                      │
               └────────────────┬─────────────────────┘
                                ▼
                     ┌─────────────────────────────┐
                     │   Priority / Decision      │
                     │   Support Engine           │
                     └──────────────┬──────────────┘
                                    ▼
                     ┌─────────────────────────────┐
                     │ SQLAlchemy / SQLite         │
                     │ Application Data            │
                     └─────────────────────────────┘
```

---

# 🧰 Technology Stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Recharts
- Leaflet
- React-Leaflet
- JavaScript
- CSS / design tokens

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic v2
- SQLAlchemy
- SQLite

### ML / NLP
- Scikit-Learn
- TF-IDF
- Naive Bayes
- NLTK

### GIS / Spatial
- GeoPandas
- Shapely
- PyProj
- Leaflet
- React-Leaflet

### Voice Architecture
- Faster Whisper-based local transcription
- FFmpeg audio normalization

### Deployment
- Render Static Site
- Render Python Web Service
- GitHub

---

# 🔌 REST API

| Endpoint | Method | Purpose |
|---|---:|---|
| `/requests/` | GET | Retrieve / filter citizen requests |
| `/analytics/district/{district}` | GET | District intelligence |
| `/hotspots/district/{district}` | GET | Geographic hotspot data |
| `/priority/calculate` | POST | Calculate priority score |
| `/recommendations/district/{district}/category/{category}` | GET | Policy recommendations |
| `/voice/transcribe` | POST | Voice transcription |
| `/location/reverse` | POST | Reverse geocoding |
| `/health` | GET | Production health check |

---

# 📂 Repository Structure

```text
dpi-governance-ai/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── db/
│   │   ├── models/
│   │   └── services/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── ml/
├── data/
├── docs/
│   └── screenshots/
│       └── live-dashboard.png
│
├── _archive/
├── .gitignore
└── README.md
```

---

# 💻 Local Development

## Requirements

- Node.js 18+
- Python 3.12+
- FFmpeg for local voice processing

## Clone

```bash
git clone https://github.com/1234ashutosh1234/dpi-governance-ai.git
cd dpi-governance-ai
```

## Backend

```bash
python -m venv venv
```

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### Install

```bash
pip install -r backend/requirements.txt
```

### Run

```bash
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🌐 Production Deployment

```text
                 PRODUCTION

┌─────────────────────────────────────┐
│ Render Static Site                  │
│ dpi-governance-ai-1.onrender.com   │
└──────────────────┬──────────────────┘
                   │
                   │ VITE_API_BASE_URL
                   ▼
┌─────────────────────────────────────┐
│ Render Web Service                  │
│ dpi-governance-ai.onrender.com     │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
      ML/NLP      GIS      Priority
        │          │          │
        └──────────┼──────────┘
                   ▼
             Recommendations
```

---

# 🔐 Security & Repository Hygiene

The project uses environment-driven production configuration and explicit CORS.

Never commit:

```text
.env
*.db
venv/
.venv/
dist/
API keys
private tokens
production credentials
```

The production backend is configured to allow the deployed frontend origin.

---

# ✅ Production Verification

The deployment has been verified at the system level:

```text
Frontend deployment       ✓ LIVE
Backend deployment        ✓ LIVE
Health endpoint           ✓ HEALTHY
Frontend → Backend        ✓ CONNECTED
Production API base URL   ✓ CONFIGURED
Production CORS           ✓ CONFIGURED
```

The current live health endpoint returns:

```json
{"status":"healthy"}
```

---

# ⚠️ Production Note: Voice Processing

The repository contains a local Whisper-based voice pipeline.

The voice implementation loads a Whisper model at application startup and invokes FFmpeg for audio conversion. Because that workload exceeds the memory budget of the current free Render instance, the heavy voice router is intentionally disabled in the current production deployment.

### Why this is a good engineering trade-off

The core product remains live:

```text
Dashboard
Analytics
GIS
Priority Engine
Decision Support
Recommendations
```

while the heavy voice workload can be moved to a larger instance or a dedicated worker later.

---

# 🚀 Future Roadmap

### Data & Infrastructure
- PostgreSQL + PostGIS
- managed cloud storage
- async job processing
- background workers

### AI / ML
- stronger classification models
- model monitoring
- automated retraining
- LLM-assisted policy reasoning

### Voice
- dedicated Whisper worker
- GPU inference
- asynchronous audio processing

### Security
- OAuth2 / JWT
- RBAC
- audit logs
- admin controls

### Reporting
- PDF governance reports
- Excel exports
- scheduled departmental summaries

### Observability
- metrics
- tracing
- structured logs
- production alerting

---

# 🎬 Recruiter Demo — 3 to 5 Minutes

### Recommended walkthrough

**1. Open the Live Demo**

https://dpi-governance-ai-1.onrender.com

**2. Show the Government Command Center**

Explain that the platform transforms infrastructure complaints into operational intelligence.

**3. Pick a district**

Show how district context changes the analytics view.

**4. Demonstrate sector filters**

Use:

```text
Water Supply
Roads
Healthcare
Electricity
Education
```

**5. Open Analytics**

Explain demand distribution and district-level intelligence.

**6. Open GIS Hotspots**

Explain how geographic demand clusters can guide intervention planning.

**7. Open Priority Projects**

Explain the five-factor scoring model.

**8. Open AI Decision Support**

Show how the platform moves from descriptive analytics toward intervention planning.

**9. Open `/health`**

Show the backend is production-live.

**10. Open GitHub**

Explain the architecture and engineering decisions.

---

# 💬 Strong Interview Explanation

> **“I built DPI Governance AI as a full-stack decision-support platform for public infrastructure planning. The system takes citizen grievances, classifies them with NLP, aggregates them by district, analyzes geographic hotspots, calculates multi-factor priority scores, ranks intervention projects, and provides contextual recommendations. I deployed the React frontend and FastAPI backend separately on Render and configured the production API connection and CORS.”**

---

# 🏆 What This Project Demonstrates

### Software Engineering
- modular architecture
- API design
- frontend/backend integration
- data modeling
- environment-based configuration

### AI / ML
- TF-IDF
- Naive Bayes
- confidence scoring
- voice-processing architecture

### GIS
- spatial analysis
- geocoding
- hotspot visualization
- district intelligence

### Algorithms
- normalized multi-factor scoring
- ranking
- decision-support logic

### Product Engineering
- government command center
- citizen workflow
- operational analytics
- actionable recommendations

### DevOps
- production deployment
- frontend/backend separation
- Render
- environment variables
- live health checks

---

# 🔗 Important Links

| Resource | URL |
|---|---|
| 🌐 Live Demo | https://dpi-governance-ai-1.onrender.com |
| ⚙️ Backend API | https://dpi-governance-ai.onrender.com |
| ❤️ Health Check | https://dpi-governance-ai.onrender.com/health |
| 💻 GitHub | https://github.com/1234ashutosh1234/dpi-governance-ai |

---

# 👨‍💻 Author

**Ashutosh Raj**  
AI & Software Engineer

GitHub:  
https://github.com/1234ashutosh1234

---

# ⭐ Portfolio Summary

DPI Governance AI is built around one engineering idea:

```text
Turn unstructured public problems
            ↓
into structured intelligence
            ↓
then into ranked decisions
            ↓
then into actionable recommendations.
```

That combination of **Full-Stack + AI/ML + GIS + Algorithms + Production Deployment** makes the project especially relevant for software engineering, AI engineering, data engineering, GIS, GovTech, and AI product roles.
