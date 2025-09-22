# Shuddhi Release Cloud™ - Frontend Prototype (V0)

A production-style React + TypeScript prototype demonstrating how a pharmaceutical plant would use Shuddhi to accelerate batch release, ensure compliance, and handle audits/recalls.

## 🎯 Overview

This is a **frontend-only prototype** with no backend dependencies. All data is mocked and stored in localStorage. The application demonstrates:

- **85% reduction in batch release time** (from 21 → 3 days)
- **Schedule M 2023 compliance** tracking
- **H2 QR code generation** and GS1 serialization
- **Review-by-exception eBR** workflow
- **AI-powered deviation hints**
- **Targeted recall management** with India heatmap
- **Part 11-style e-signatures**
- **Role-based access control**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) and use the demo credentials:
- **Email:** qa.mahesh@shuddhi.com
- **Password:** demo123

## 🏗️ Tech Stack

- **Framework:** Next.js 14 + React 18 + TypeScript
- **UI:** TailwindCSS + shadcn/ui components
- **Icons:** Lucide React
- **Charts:** Recharts (LineChart, BarChart)
- **QR Codes:** qrcode library
- **State:** Zustand + localStorage persistence
- **Animations:** Framer Motion (subtle)
- **Notifications:** Sonner

## 📱 Features by Screen

### 🏠 Dashboard
- KPI cards (Batches in QA, Ready to Release, Open Deviations, Training Expiring)
- Release lead time trend chart (21 → 3 days improvement)
- Yield vs expected performance
- Recent activity feed

### 📦 Batch Management
- Batch list with filtering (status, market, date range)
- **eBR Review-by-Exception** with OOT/OOS highlighting
- Bulk approve with Part 11 e-signature modal
- Exception-to-deviation workflow
- Release packet generation (mock PDF)

### 🛡️ Compliance
- **Schedule M 2023** compliance tracking (85% complete)
- **H2 QR Generator** with real QR code preview
- **GS1 Serialization** with SSCC/SGTIN generation
- CSV export functionality

### ⚠️ Deviation Management
- Kanban board (Open → Investigation → CAPA → Closed)
- **AI-powered investigation hints**
- Drag-drop status updates
- CAPA workflow with e-signature closure

### 📊 CPV (Continued Process Verification)
- Parameter trend charts with spec bands
- Process capability metrics (Cpk)
- Zoom and export functionality

### 🏢 Vendor & CoA Intelligence
- Vendor approval status
- **CoA parameter analysis** with out-of-spec flagging
- Material quarantine workflow
- CSV upload simulation

### 🧪 Stability & Environmental Monitoring
- Study planner with timeline view
- Trend charts (assay, dissolution over time)
- **Chamber calibration alerts** (overdue flagging)
- Environmental monitoring dashboard

### 👥 Training & Competency
- **Training matrix** (users × skills)
- Expired training blocking (demo toggle)
- Competency status tracking
- Training enforcement in eBR signing

### 🔍 Audit Assistant
- Global search across all entities
- Prebuilt audit queries
- **One-click release packet** assembly
- Complete audit trail with timestamps

### 🚨 Recall & Field Intelligence
- **QR scan simulator** with authenticity verification
- **India heatmap** showing counterfeit hotspots
- **Targeted recall wizard** (only 20k units vs 2 lakh)
- Field intelligence signals

### ⚙️ Settings
- Plant profile management
- User roles and permissions
- Feature toggles (CSV exports, training blocking)
- System information

## 👤 Role-Based Demo

Switch roles after login to see different permissions:

- **Operator:** Can enter eBR data, cannot approve
- **QA:** Can review by exception, raise deviations, sign steps
- **Regulatory:** Can generate QR/serialization, manage compliance
- **MD:** Can final-approve release packets, view all data
- **Auditor:** Read-only access with search and export

## 🎨 Design System

- **Colors:** Blue/teal accents on white/neutral base
- **Radius:** `rounded-2xl` for cards, `rounded-lg` for components
- **Shadows:** `shadow-md` on cards, `shadow-lg` on modals
- **Typography:** Semibold headings, clean body text
- **Icons:** Lucide React (consistent 4x4 sizing)

## 📊 Mock Data

Realistic pharmaceutical data including:
- 5 products (Ibuprofen, Paracetamol, Cough Syrup, etc.)
- 5 batches with different statuses
- eBR steps with OOT/OOS exceptions
- Deviations with AI hints
- Vendor CoAs with spec failures
- Training records with expiry dates
- Audit trail with timestamps
- Recall signals from UP/MH states

## 🔧 Key Components

- `AppShell`: Main layout with sidebar navigation
- `BatchDetail`: eBR review with exception handling
- `CompliancePage`: QR generation and serialization
- `DeviationKanban`: Drag-drop deviation management
- `RecallHeatmap`: India map with incident visualization
- `TrainingMatrix`: User × skill competency grid

## 🚀 Deployment

The app is designed for static deployment (Netlify/Vercel):

```bash
npm run build
# Deploy the 'out' folder to your static host
```

No server-side rendering or API routes required.

## 🎯 Demo Script (for MD)

1. **Dashboard:** "We cut release from 21 → 3 days; see KPIs"
2. **Batches → Detail:** Show exceptions and sign with e-signature
3. **Compliance:** Generate H2 QR + export serialization CSV
4. **Deviations:** Show AI hints and close with CAPA
5. **CPV:** Show trends within spec bands
6. **Vendors/CoA:** Show impurity flag and quarantine
7. **Audit Assistant:** One-click release packet
8. **Recall:** Scan simulator → UP heatmap → targeted recall (only 10% affected)

## 🔒 Security & Compliance

- Part 11-style e-signatures with re-authentication
- Complete audit trail with user attribution
- Role-based access control
- Training enforcement (blocks expired users)
- Data integrity with localStorage persistence

## 📝 License

This is a prototype demonstration. All pharmaceutical data is fictional.

---

**Built for:** Managing Director, QA Head, Production Head, Regulatory Affairs  
**Goal:** Demonstrate 85% batch release acceleration with full compliance