<p align="center">
  <h1 align="center">🏛️ Arcana — Unified HR Management Platform</h1>
  <p align="center">
    A modular, full-lifecycle Human Resource Management System built with modern web technologies.
    <br />
    <strong>Built by the Arcana Team</strong>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS%2011-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-LangChain%20+%20RAG-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/UI-MUI%20+%20Tailwind-007FFF?style=for-the-badge&logo=mui&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Subsystems](#-subsystems)
  - [Employee Profile Module](#1-employee-profile-module)
  - [Organization Structure Module](#2-organization-structure-module)
  - [Performance Management Module](#3-performance-management-module)
  - [Time Management Module](#4-time-management-module)
  - [Leaves Management Module](#5-leaves-management-module)
  - [Recruitment, Onboarding & Offboarding](#6-recruitment-onboarding--offboarding)
  - [Payroll Subsystem](#7-payroll-subsystem)
  - [AI Chatbot (Arcana Assistant)](#8-ai-chatbot--arcana-assistant)
- [Authentication & Authorization](#-authentication--authorization)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Future Work](#-future-work)

---

## 🌟 Executive Summary

**Arcana** is a unified, modular HR platform that covers the full employee lifecycle and everyday HR operations in one place. At its core is a shared employee and organizational model: every module — Employee Profile, Organizational Structure, Recruitment, Onboarding, Offboarding, Time Management, Leaves, Payroll, and Performance Management — reads from and updates the **same source of truth**, so HR teams don't have to reconcile multiple systems.

The user interface is simple and consistent across modules (dashboards, lists, detail pages, and action-driven modals) so HR staff and managers learn one pattern and can complete tasks quickly and confidently.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | Server-side rendering, routing, UI |
| **UI Library** | MUI (Material UI), Tailwind CSS 4, Radix UI | Component library, styling, primitives |
| **Charts** | Recharts, MUI X-Charts | Data visualization & analytics |
| **Backend** | NestJS 11, TypeScript | REST API, business logic, guards |
| **Database** | MongoDB Atlas + Mongoose 8 | Document storage, vector search |
| **Authentication** | JWT + httpOnly Cookies | Secure, cookie-based auth |
| **AI / LLM** | LangChain, Groq (Llama 3.1), Xenova Transformers | Chatbot, tool calling |
| **RAG** | MongoDB Atlas Vector Search, all-MiniLM-L6-v2 | Semantic policy search |
| **Email** | Resend | Transactional emails & notifications |
| **API Docs** | Swagger (NestJS Swagger) | Auto-generated API documentation |
| **Testing** | Jest, Supertest | Unit & E2E testing |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Dashboard │ │Employee  │ │Payroll   │ │Leaves    │ │Performance│ │
│  │& Org     │ │Profile   │ │Config/   │ │Mgmt      │ │Appraisals│ │
│  │Structure │ │& Settings│ │Exec/Track│ │          │ │& Disputes│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       └─────────────┴────────────┴────────────┴────────────┘       │
│                              │ fetch + credentials: 'include'       │
│                              │ (httpOnly cookies auto-sent)         │
└──────────────────────────────┼──────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       BACKEND (NestJS 11)                            │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────┐ ┌──────────────┐  │
│  │Auth Guard│ │Authorization │ │Role-Based     │ │Cookie Parser │  │
│  │(JWT)     │ │Guard (Roles) │ │Access Control │ │              │  │
│  └────┬─────┘ └──────┬───────┘ └───────┬───────┘ └──────┬───────┘  │
│       └──────────────┴─────────────────┴────────────────┘          │
│                              │                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      MODULE CONTROLLERS                        │ │
│  │  Employee │ Org Structure │ Payroll │ Performance │ Leaves ... │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────▼───────────────────────────────────┐ │
│  │                       SERVICE LAYER                            │ │
│  │  Business logic, validation, approval workflows, calculations │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────▼───────────────────────────────────┐ │
│  │                     REPOSITORY LAYER                           │ │
│  │  Mongoose models, schemas, database operations                │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────▼───────────────────────────────────┐ │
│  │  🤖 AI CHATBOT MODULE                                         │ │
│  │  LangChain Agent │ RAG Service │ Embedding │ Tool Executor    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │   MongoDB Atlas     │
                    │  • Collections      │
                    │  • Vector Search    │
                    │  • Indexes          │
                    └─────────────────────┘
```

---

## 📦 Subsystems

### 1. Employee Profile Module

> **Central repository for all employee-related information.**

The Employee Profile Management Module serves as the foundation upon which other HR subsystems — Payroll, Performance, Time Management, and Organizational Structure — rely. It maintains accurate, secure, and up-to-date employee master data.

**Key Features:**
- 🔍 Self-service profile viewing (personal details, employment info, department assignments, performance history)
- ✏️ Non-critical field updates (contact details, profile pictures) with full audit trails
- 📝 Formal correction requests for governed fields with approval workflows
- 👥 Manager insight — department managers see non-sensitive team summaries based on reporting lines
- 🔄 HR/Admin processing — review and approve change requests, sync downstream modules (Payroll, Time Management, Org Structure)

**Workflow Phases:**

| Phase | Description |
|-------|-------------|
| **I — Self-Service** | Employees view profiles, update non-critical fields, submit correction requests |
| **II — Manager Insight** | Department managers view team summaries with privacy restrictions |
| **III — HR/Admin Processing** | HR reviews/approves change requests, applies edits, syncs downstream modules |

---

### 2. Organization Structure Module

> **Defines how the company is organized.**

Allows the System Administrator to create departments and positions, update them when changes happen, and deactivate positions that are no longer needed while keeping their history. Changes automatically update dependent modules (Payroll, Recruitment, Employee Profiles).

**Key Features:**
- 🏢 Department and position creation with hierarchical linking
- 🔄 Real-time structural maintenance (renaming, reassigning, updating attributes)
- 📊 Interactive organizational chart with role-based views
- 🗃️ Historical preservation — deactivated positions are delimited, not deleted
- 🔗 Automatic synchronization with dependent modules

**Workflow Phases:**

| Phase | Description |
|-------|-------------|
| **1 — Structure Definition** | System Admin creates departments/positions with attributes, reporting lines, pay grades |
| **2 — Structural Maintenance** | Direct updates applied immediately across the system |
| **3 — Deactivation & Sync** | Obsolete positions delimited to preserve history while keeping active chart current |

---

### 3. Performance Management Module

> **Manages the complete employee appraisal (evaluation) cycle.**

Designed to help HR teams, department managers, and employees participate in fair and consistent performance evaluations that follow standardized rules and processes.

**Key Features:**
- 📋 Standardized appraisal templates with configurable rating scales and criteria
- 📅 Appraisal cycle management (annual, probationary, custom periods)
- ⭐ Multi-criteria evaluation with qualitative comments and development recommendations
- 📊 Centralized HR dashboard for monitoring progress
- ⚖️ Dispute resolution workflow with defined appeal periods
- 📁 Automatic archiving for historical analytics

**Workflow Phases:**

| Phase | Description |
|-------|-------------|
| **1 — Planning & Setup** | HR defines templates, criteria, rating scales; sets up appraisal cycles |
| **2 — Evaluation & Review** | Managers evaluate employees using approved templates; HR monitors progress |
| **3 — Feedback & Acknowledgment** | Employees review published results; records saved to profile |
| **4 — Dispute & Resolution** | Employees raise objections within a defined period; HR reviews and resolves |
| **5 — Closure & Archiving** | Finalized data archived for reporting and trend analysis |

---

### 4. Time Management Module

> **Automates scheduling, attendance tracking, and policy enforcement.**

Ensures accurate time data capture, compliance with working policies, and seamless integration with payroll and leave systems.

**Key Features:**
- ⏰ Shift configuration (normal, split, overnight, rotational)
- 📍 Clock-in/clock-out attendance recording with validation
- 📏 Lateness detection with configurable grace periods and penalties
- ⏱️ Overtime, short time, and weekend work policy management
- 🔔 Automated alerts for missed punches and shift expiry
- 📆 Holiday calendars and weekly rest day definitions
- 🔄 Real-time payroll integration

**Workflow Phases:**

| Phase | Description |
|-------|-------------|
| **1 — Shift Setup** | HR/Admin defines shift types, assigns to employees, configures scheduling rules |
| **2 — Attendance Recording** | Employees clock in/out; system validates against schedules |
| **3 — Policy Enforcement** | Overtime/lateness rules applied automatically; exceptions flagged |
| **4 — Exception Handling** | Corrections and overtime requests routed through approval workflow |
| **5 — Payroll Closure** | Validated data synced with payroll; pending approvals escalated |

---

### 5. Leaves Management Module

> **Simplifies and automates the full leave lifecycle.**

Covers policy configuration, request management, and balance tracking with seamless payroll integration.

**Key Features:**
- 📜 Configurable leave types (Annual, Sick, Maternity, Unpaid, Mission, Marriage, etc.)
- 📊 Entitlement rules based on tenure, grade, or contract type
- 📱 Self-service portal for leave requests, modifications, and cancellations
- ✅ Multi-level approval chain (Direct Manager → HR Manager)
- 💰 Real-time balance tracking (Accrued, Taken, Remaining, Pending, Carry-over)
- 🔗 Automatic sync with Time Management and Payroll modules

**Workflow Phases:**

| Phase | Description |
|-------|-------------|
| **1 — Policy Configuration** | HR Admin defines leave types, entitlement rules, accrual rates, holidays |
| **2 — Request Management** | Employees submit/modify/cancel requests with supporting documents |
| **3 — Monitoring & Integration** | Real-time balance tracking; automatic payroll sync for deductions/encashment |

---

### 6. Recruitment, Onboarding & Offboarding

> **Manages the entire employee lifecycle from hiring to exit.**

Ensures that hiring, onboarding, and exit processes are efficient, auditable, and integrated across HR, IT, and payroll systems.

**Key Features:**
- 📝 Job design and posting with multi-channel distribution
- 👤 Candidate application, tracking, evaluation, and communication
- 📧 Automated offer generation and acceptance workflows
- 🎯 Onboarding task checklists with automated notifications
- 🔐 Access provisioning and resource assignment
- 🚪 Structured offboarding with clearance workflows and access revocation
- 💵 Final settlement processing

**Workflow Phases:**

| Phase | Description |
|-------|-------------|
| **1 — Recruitment** | Job posting → candidate application → evaluation → offer → acceptance |
| **2 — Onboarding** | Checklist creation → documentation → access provisioning → payroll setup |
| **3 — Offboarding** | Exit initiation → clearance → access revocation → final settlement |

---

### 7. Payroll Subsystem

> **Comprehensive payroll management across configuration, execution, and tracking.**

The payroll system is divided into three interconnected sub-modules:

#### 7.1 Payroll Configuration & Setup

Manages the foundational payroll settings with a maker-checker approval workflow.

- 💰 **Pay Grades** — Base salary tiers with automatic gross salary calculation (base + approved allowances)
- 🎁 **Allowances** — Configurable employee allowances
- 📊 **Tax Rules** — Tax bracket and deduction rules
- 🏥 **Insurance Brackets** — Insurance contribution tiers
- 📜 **Payroll Policies** — Misconduct, deduction, benefit, and leave policies
- 💼 **Pay Types** — Payment method configurations
- 🎉 **Signing Bonuses** — New hire bonus structures
- 🚪 **Termination Benefits** — Exit compensation rules
- ⚙️ **Company-Wide Settings** — Global payroll configuration
- 💾 **Backup & Restore** — Scheduled configuration backups

**Role-Based Access:**

| Role | Permissions |
|------|------------|
| Payroll Specialist | Create, Update, View |
| Payroll Manager | Approve, Reject, Delete, View |
| Legal & Policy Admin | Create, Update Tax Rules |
| HR Manager | Approve, Reject Insurance Brackets |
| System Admin | Full control over Company Settings |

#### 7.2 Payroll Execution

Handles the actual payroll processing cycle:
- 🔄 Payroll run creation and management
- 📊 Draft payslip generation and review
- ⚠️ Exception handling and resolution
- ✅ Manager approval workflows
- 📄 Final payslip generation

#### 7.3 Payroll Tracking

Employee and manager self-service tracking:
- 📋 Payslip viewing and salary history
- 💵 Claims submission and tracking
- ⚖️ Dispute filing and resolution
- 🏥 Insurance deduction tracking
- 📊 Tax deduction history
- 📈 Specialist and finance reporting

---

### 8. AI Chatbot — Arcana Assistant

> **An intelligent, context-aware HR assistant powered by LangChain and RAG.**

The system includes a built-in AI chatbot named **Arcana** that uses modern AI techniques to assist employees with HR-related queries.

#### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ARCANA CHATBOT                         │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ LangChain│    │  Groq LLM    │    │  Conversation │  │
│  │  Agent   │───▶│ (Llama 3.1)  │    │   History     │  │
│  └────┬─────┘    └──────────────┘    └───────────────┘  │
│       │                                                  │
│  ┌────▼─────────────────────────────────────────────┐   │
│  │              TOOL EXECUTOR SERVICE                │   │
│  │                                                   │   │
│  │  🔍 searchPolicies    — RAG semantic search       │   │
│  │  👤 getProfile        — Employee profile lookup   │   │
│  │  👥 findAllEmployees  — Employee count            │   │
│  │  🏢 getOpenDepartments — Organization data        │   │
│  │  💼 getOpenPositions  — Position listings         │   │
│  │  🔔 findByRecipientId — Notifications             │   │
│  │  📜 findAllPayrollPolicies — Policy listings      │   │
│  │  📊 getPayrollPoliciesByType — Filtered policies  │   │
│  │  💰 findAllAllowances — Allowance configs         │   │
│  │  📋 findAllTaxRules   — Tax rule configs          │   │
│  │  💎 findAllPayGrades  — Pay grade configs         │   │
│  │  ⏳ getPendingApprovals — Approval counts         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              RAG SERVICE                          │   │
│  │                                                   │   │
│  │  📚 MongoDB Atlas Vector Search                   │   │
│  │  🧠 all-MiniLM-L6-v2 embeddings (384-dim)        │   │
│  │  🔄 Auto-indexes policies on startup              │   │
│  │  🔍 Fallback to keyword search if needed          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### Key Capabilities

| Feature | Description |
|---------|-------------|
| **LangChain Tool Calling** | LLM autonomously decides which tools to call based on user questions |
| **RAG Semantic Search** | Policies are embedded and searched via MongoDB Atlas Vector Search for natural-language queries |
| **Local Embeddings** | Uses `all-MiniLM-L6-v2` via `@xenova/transformers` — runs entirely locally, no external API needed |
| **Conversation Memory** | Maintains conversation history per user with configurable message trimming |
| **Context-Aware** | Knows the current user's ID, name, and roles; personalizes responses accordingly |
| **Graceful Fallbacks** | Falls back to keyword search when vector search is unavailable; handles LLM errors gracefully |

#### AI Technologies Used

- **LangChain** (`langchain`, `@langchain/core`, `@langchain/groq`) — Agent framework for LLM orchestration and tool calling
- **Groq** (`groq-sdk`) — High-speed LLM inference (Llama 3.1 8B Instant)
- **Xenova Transformers** (`@xenova/transformers`) — Local embedding generation with `all-MiniLM-L6-v2`
- **MongoDB Atlas Vector Search** — Native vector similarity search for semantic policy retrieval
- **Zod** — Schema validation for tool input definitions

---

## 🔐 Authentication & Authorization

The system uses a **cookie-based authentication** strategy with **role-based access control (RBAC)**.

### Cookie Strategy

| Cookie | httpOnly | Purpose |
|--------|----------|---------|
| `access_token` | ✅ Yes | JWT token — secure, not accessible by JavaScript |
| `employeeid` | ❌ No | For UI to identify the current user |
| `user_roles` | ❌ No | For UI to render role-based features |

### System Roles

| Role | Description |
|------|-------------|
| `System Admin` | Full system control, company settings, backups |
| `HR Manager` | Employee management, approvals, org structure oversight |
| `Payroll Manager` | Payroll approvals, rejections, deletions |
| `Payroll Specialist` | Payroll configuration creation and updates |
| `Legal & Policy Admin` | Tax rule management |
| `Department Manager` | Team oversight, performance evaluations |
| `Employee` | Self-service access |
| `Job Candidate` | Recruitment portal access |

---

## 📁 Project Structure

```
Arcana/
├── backend/                        # NestJS Backend
│   └── src/
│       ├── chatbot/                # 🤖 AI Chatbot Module
│       │   ├── config/             #    Prompt configuration
│       │   ├── models/             #    Conversation schema
│       │   └── services/           #    RAG, embeddings, tools, conversation
│       ├── common/                 # Shared guards, decorators, pipes
│       │   └── guards/             #    AuthGuard, AuthorizationGuard
│       ├── employee-profile/       # 👤 Employee Profile & Auth
│       ├── employee-subsystem/     # 👥 Employee Management
│       ├── leaves/                 # 🌴 Leave Management
│       ├── notification/           # 🔔 Notification System
│       ├── organization-structure/ # 🏢 Org Structure
│       ├── payroll-configuration/  # ⚙️ Payroll Config & Setup
│       ├── payroll-execution/      # 💰 Payroll Execution
│       ├── payroll-tracking/       # 📊 Payroll Tracking
│       ├── performance/            # ⭐ Performance Management
│       ├── recruitment/            # 📋 Recruitment & Onboarding
│       ├── time-management/        # ⏰ Time Management
│       └── seeds/                  # 🌱 Database Seeders
│
├── frontend/                       # Next.js Frontend
│   └── src/
│       ├── app/employee/
│       │   ├── login/              # Login page
│       │   └── (protected)/        # Authenticated routes
│       │       ├── dashboard/      # Main dashboard & org hierarchy
│       │       ├── manage-employees/  # Employee management
│       │       ├── manage-organization/ # Org chart management
│       │       ├── payroll/        # Payroll subsystem
│       │       │   ├── config_setup/  # Configuration pages
│       │       │   ├── execution/     # Payroll runs
│       │       │   └── tracking/      # Self-service tracking
│       │       ├── performance/    # Performance appraisals
│       │       ├── leaves/         # Leave management
│       │       ├── recruitment_sub/# Recruitment module
│       │       ├── time-mangemeant/# Time management
│       │       └── settings/       # User settings
│       ├── common/                 # Shared utilities & components
│       ├── context/                # React context (Auth)
│       ├── hooks/                  # Custom hooks (useAuth)
│       └── lib/                    # Auth utilities
│
├── docs/                           # 📚 Documentation
└── seeds_reports/                  # 📊 Seed data & reports
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB Atlas** account (for vector search) or local MongoDB
- **Groq API Key** (for AI chatbot — [get one free](https://console.groq.com))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Arcana

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1 — Start the backend
cd backend
npm run start:dev

# Terminal 2 — Start the frontend
cd frontend
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:50000
- **Swagger Docs:** http://localhost:50000/api

### Database Seeding

```bash
# Seed the database with sample data
cd backend
npm run seed:all
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT
JWT_SECRET=your-jwt-secret

# Server
PORT=50000

# AI Chatbot
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:50000
```

---

## 🔮 Future Work

### Applicant Tracking System (ATS) for Recruitment

A future enhancement is planned to design and implement a full **Applicant Tracking System (ATS)** to extend the recruitment module with advanced capabilities:

- **AI-Powered CV Analysis** — Automated resume parsing and candidate scoring using NLP
- **Intelligent Candidate Matching** — Match candidate profiles against job requirements using vector similarity
- **Interview Scheduling** — Automated interview coordination with calendar integration
- **Pipeline Analytics** — Visual recruitment funnel with conversion metrics
- **Candidate Portal** — Self-service portal for candidates to track application status
- **Assessment Integration** — Built-in or third-party skills assessment tools
- **Offer Management** — Digital offer letters with e-signature workflows
- **Diversity & Compliance Reporting** — EEO compliance tracking and diversity metrics

> 📄 See [`docs/ATS.md`](docs/ATS.md) for the detailed ATS implementation plan.

---

<p align="center">
  <strong>Built with ❤️ by the Arcana Team</strong>
</p>
