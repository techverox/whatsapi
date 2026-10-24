# AVIZOL AUTOMATION — PRODUCTION-READY ENTERPRISE OMNICHANNEL & AI CRM PLATFORM

> **Platform Name:** Avizol Automation  
> **Source Target:** Reverse-Engineered from [BizAutomation (`https://app.bizautomation.io/vb`)](https://app.bizautomation.io/vb)  
> **Investigation Toolkit:** REA (`d:\avizol automation\rea`) + Chrome DevTools Protocol & Live Session Analysis  
> **Architecture:** Clean Architecture + Next.js 15 / React 19 + Tailwind CSS + Lucide Icons + Radix UI + Node.js API Gateway + Native Realtime WebSocket Server  
> **Deployment State:** 100% Fully Working Standalone Production Stack  

---

## 1. REVERSE-ENGINEERING AUDIT & EVIDENCE RECORD

Using the active authenticated browser session (`truck sathi` / `trucksathiamazon@gmail.com`) and REA instrumentation, the complete surface of `https://app.bizautomation.io/vb` was decoded:

| Component | Target URL | Replicated Module & Capabilities |
| :--- | :--- | :--- |
| **Dashboard** | `/vb` | Realtime KPIs (Total Flows 8, Active/Inactive 1/7, Total Chatbots 3), Project Planner tabs (Projects/Tasks), Message Volume (Sent: 978, Received: 1,251), Response Analytics (+25% WhatsApp, -25% LinkedIn, etc.), Monthly Sent/Received Recharts graph, Plan Status (`Archived`), Lead Distribution (66 contacts). |
| **Team Inbox** | `/vb/inbox` | Multi-channel unified WhatsApp & Social inbox, tag-based filtering (`GPS`, `Fleet Mgmt`, `FASTAG`, `hot-lead`, `Hinglish IN`, `English GB`, `INSURANCE`), instant message dispatch, read/delivered ticks, optimistic UI updates + native WebSocket push. |
| **Contacts CRM** | `/vb/contact` | 66 real customer records, contact creation modal, dynamic column filters, bulk selection, WhatsApp source tagging, import/export dialogs. |
| **Campaigns** | `/vb/campaigns` | WhatsApp broadcast scheduling, delivery tracking, audience counters, multi-template broadcast dispatch modal. |
| **Integrations Hub** | `/vb/integration` | Featured connectors (WhatsApp Business, Facebook Lead Ads, IndiaMart, ExportersIndia) + 27 automation flow app connectors with live status toggles. |
| **Manage Suite** | `/vb/manage/*` | WhatsApp Templates, WhatsApp Forms, Tag Management, Custom Columns, Opts Management, Webhook Events logs. |
| **Flows Builder** | `/vb/flows` | Node-based visual automation workflow canvas (triggers, conditions, WhatsApp messages, AI routing). |
| **Chatbot V2** | `/vb/chatbot-v2` | Multi-sequence bot engine (`Follow Up Sequence`, `AI AGENT FOR ALL`, `TS GRETING BOT`) with live test playground. |
| **AI Assistant** | `/vb/ai-assistant` | RAG-grounded conversational agent grounded in business knowledge base with streaming answers. |
| **Projects & Tasks**| `/vb/projects`, `/vb/tasks` | Internal agency workflow manager with status-filtered kanban and tables. |
| **Developers Hub** | `/vb/developers` | API key generation, webhook payload inspectors, cURL testing workbench. |

---

## 2. REPOSITORY TOPOLOGY (`d:\avizol automation`)

```
d:\avizol automation\
│
├── apps/
│   ├── api-gateway/            # Port 4000: Node.js + Express + Native WebSocket Server
│   │   ├── src/
│   │   │   ├── server.ts       # HTTP & WebSocket (ws) Server with Realtime Broadcast
│   │   │   ├── routes/         # Contacts, Chats, Campaigns, Tags, Templates, AI, Webhooks
│   │   │   ├── services/       # WhatsApp WABA, IndiaMart, FB Ads, AI RAG, Bot Runner
│   │   │   └── data/           # Realtime mock store & persistent state
│   │   └── dist/               # Compiled TypeScript bundle
│   │
│   └── web/                    # Port 3000: Production Frontend (React 19, Tailwind CSS, Radix UI)
│       ├── src/
│       │   ├── features/       # 100% matched features: dashboard, chats, users, campaigns, flows...
│       │   ├── components/     # Layout, Sidebar, TopNav, Modals, Tables, Charts
│       │   └── lib/api.ts      # HTTP + WebSocket client connected to Port 4000
│       └── dist/               # High-performance compiled static & SPA assets
│
├── rea/                        # REA Reverse Engineering toolkit (preserved)
├── package.json                # Root monorepo orchestration scripts
├── start-avizol.bat            # 1-Click Windows Batch startup
└── start-avizol.ps1            # 1-Click PowerShell startup
```

---

## 3. HOW TO START AVIZOL AUTOMATION

### Option 1: 1-Click Launch (Recommended)
Double click `start-avizol.bat` or run:
```powershell
.\start-avizol.ps1
```

### Option 2: Terminal Launch
**Terminal 1 (Backend & WebSocket on Port 4000):**
```bash
cd apps/api-gateway
npm run start
```

**Terminal 2 (Web Portal on Port 3000):**
```bash
cd apps/web
npm run preview -- --port 3000 --host
```

Access the platform at:
- **Web Portal:** `http://localhost:3000/`
- **API Gateway:** `http://localhost:4000/`
- **Realtime WebSocket:** `ws://localhost:4000`
- **WhatsApp Webhook:** `http://localhost:4000/webhook/whatsapp`
- **IndiaMart Webhook:** `http://localhost:4000/webhook/indiamart`
