# MarineIQ

A sailor training and logbook web application built on Azure.

**Live:** https://white-ocean-0b1cc9e0f.7.azurestaticapps.net  
**Repo:** https://github.com/bilbreyde/marineiq  
**Wiki:** https://github.com/bilbreyde/marineiq/wiki

---

## What It Does

MarineIQ helps sailors log trips, track maintenance, manage parts, study COLREGS, and get advice from Captain Cole — an AI sailing companion powered by Claude.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, hosted on Azure Static Web Apps |
| Backend | Azure Functions (Node.js 22) |
| Database | Azure Cosmos DB |
| AI | Anthropic Claude (Captain Cole) |
| Secrets | Azure Key Vault |
| CI/CD | GitHub Actions → Azure Static Web Apps |

## Pages

| Page | Description |
|------|-------------|
| Dashboard | Vessel stats, quick actions, maintenance alerts |
| Logbook | Trip logging with hours, miles, certification tracking |
| Maintenance | Engine hour tracking, due date alerts |
| Parts | Parts library with photo uploads and CSV import/export |
| Quiz | COLREGS quiz with Captain Cole feedback |
| Chat | Captain Cole AI chat with vessel-aware context |
| Profile | Vessel profile setup and editing |

## Getting Started

```bash
npm install
npm run dev
```

Requires a `.env` file with `VITE_API_KEY` set to the Function App host key.

## Documentation

See the [Wiki](https://github.com/bilbreyde/marineiq/wiki) for full technical documentation including architecture, API reference, auth system, deployment, and design decisions.
