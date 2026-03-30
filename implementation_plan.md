# Step 1 — Foundation: XENI AI Business OS

Build the foundational infrastructure layer for XENI — a multi-tenant AI SaaS platform with 6 AI agents, dual payment gateways, and bilingual support.

## Proposed Changes

### Repository Structure

#### [NEW] Folder tree

```
c:\Users\Rizwan\Xeni-Agent\
├── docker-compose.yml
├── .env.example
├── README.md
├── frontend/                    # Next.js 14 (Step 3)
│   └── .env.example
├── gateway/                     # Go Fiber API (Step 2)
│   └── .env.example
├── workers/                     # Python AI workers (Step 4)
│   └── .env.example
├── infra/
│   ├── postgres/
│   │   └── init.sql             # Full schema DDL
│   ├── mongo/
│   │   └── init.js              # DB + collection init
│   ├── rabbitmq/
│   │   ├── rabbitmq.conf
│   │   └── definitions.json     # Exchange/queue topology
│   ├── nginx/
│   │   └── nginx.conf           # Reverse proxy config
│   ├── prometheus/
│   │   └── prometheus.yml       # Scrape targets
│   └── grafana/
│       └── provisioning/
│           └── datasources/
│               └── datasource.yml
└── scripts/
    └── wait-for-it.sh           # Health-check helper
```

---

### Infrastructure — Docker Compose

#### [NEW] [docker-compose.yml](file:///c:/Users/Rizwan/Xeni-Agent/docker-compose.yml)

All 13+ services with health checks, dependency ordering, named volumes, and shared `ai_os_net` bridge network:

| Service | Image | Port(s) | Notes |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | Init via `/docker-entrypoint-initdb.d/` |
| `mongodb` | `mongo:7` | 27017 | Auth enabled, init script |
| `redis` | `redis:7-alpine` | 6379 | Password protected |
| `rabbitmq` | `rabbitmq:3.13-management-alpine` | 5672, 15672 | Pre-loaded definitions |
| `nginx` | `nginx:alpine` | 80, 443 | Reverse proxy to gateway + frontend |
| `prometheus` | `prom/prometheus:latest` | 9090 | Scrapes gateway + workers |
| `grafana` | `grafana/grafana:latest` | 3001 | Auto-provisioned datasource |
| `gateway` | build `./gateway` | 8080 | Go API (placeholder for Step 2) |
| `frontend` | build `./frontend` | 3000 | Next.js (placeholder for Step 3) |
| `worker-seo` | build `./workers` | 8001 | Python worker (placeholder for Step 4) |
| `worker-lead-gen` | build `./workers` | 8002 | " |
| `worker-social-media` | build `./workers` | 8003 | " |
| `worker-content` | build `./workers` | 8004 | " |
| `worker-email` | build `./workers` | 8005 | " |
| `worker-analytics` | build `./workers` | 8006 | " |

Application services (gateway, frontend, workers) will have `profiles: ["app"]` so that in Step 1 we only bring up infrastructure.

---

### Database — PostgreSQL

#### [NEW] [init.sql](file:///c:/Users/Rizwan/Xeni-Agent/infra/postgres/init.sql)

Full DDL for all tables per spec §7.1:
- `users` — with `country_code`, `preferred_language`, auth fields, 2FA, Google OAuth
- `refresh_tokens` — SHA-256 hashed tokens with device/IP tracking
- `otp_codes` — bcrypt-hashed OTPs for email/password/2FA
- `plans` — tiered plans with JSONB features, BDT pricing
- `subscriptions` — with Stripe fields (`stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`)
- `payments` — dual gateway (`sslcommerz`/`stripe`), `stripe_payment_intent_id`
- `agent_tasks` — task lifecycle tracking with `mongo_doc_id`
- `audit_logs` — JSONB metadata for all auditable actions
- Enum types for roles, statuses, agent types, gateways, etc.
- Indexes on frequently queried columns
- Seed data: 4 subscription plans (Free, Basic, Pro, Enterprise)

---

### Database — MongoDB

#### [NEW] [init.js](file:///c:/Users/Rizwan/Xeni-Agent/infra/mongo/init.js)

- Create `ai_outputs` database
- Create `agent_results` collection with schema validation
- Create indexes on `task_id`, `user_id`, `agent_type`, `created_at`

---

### Message Broker — RabbitMQ

#### [NEW] [definitions.json](file:///c:/Users/Rizwan/Xeni-Agent/infra/rabbitmq/definitions.json)

Per spec §8.3:
- Vhost: `ai_os_vhost`
- Exchanges: `ai_os.tasks` (direct), `ai_os.results` (direct), `ai_os.dlx` (direct)
- 6 task queues with DLX config + TTL
- 1 results queue: `task_results`
- 6 DLQ queues
- Bindings for all routing keys

#### [NEW] [rabbitmq.conf](file:///c:/Users/Rizwan/Xeni-Agent/infra/rabbitmq/rabbitmq.conf)

Load definitions on startup, set default vhost.

---

### Reverse Proxy — Nginx

#### [NEW] [nginx.conf](file:///c:/Users/Rizwan/Xeni-Agent/infra/nginx/nginx.conf)

- Route `/api/*` → Go gateway (:8080)
- Route `/ws` → Go gateway (WebSocket upgrade)
- Route `/*` → Next.js frontend (:3000)
- Rate limiting zone
- Gzip compression
- Security headers (X-Frame-Options, HSTS, etc.)
- Proxy header forwarding

---

### Monitoring — Prometheus & Grafana

#### [NEW] [prometheus.yml](file:///c:/Users/Rizwan/Xeni-Agent/infra/prometheus/prometheus.yml)

Scrape targets: gateway (:8080/metrics), all 6 workers (:8001-8006/metrics)

#### [NEW] [datasource.yml](file:///c:/Users/Rizwan/Xeni-Agent/infra/grafana/provisioning/datasources/datasource.yml)

Auto-provision Prometheus as default Grafana datasource.

---

### Environment Variables

#### [NEW] [.env.example](file:///c:/Users/Rizwan/Xeni-Agent/.env.example) (root — infra services)
#### [NEW] [frontend/.env.example](file:///c:/Users/Rizwan/Xeni-Agent/frontend/.env.example)
#### [NEW] [gateway/.env.example](file:///c:/Users/Rizwan/Xeni-Agent/gateway/.env.example)
#### [NEW] [workers/.env.example](file:///c:/Users/Rizwan/Xeni-Agent/workers/.env.example)

All per spec §9.

---

### Documentation

#### [NEW] [README.md](file:///c:/Users/Rizwan/Xeni-Agent/README.md)

- Project overview & architecture diagram (ASCII)
- Service map with ports
- Quick-start instructions (`docker compose up`)
- Folder structure reference
- Environment setup guide

---

## Verification Plan

### Automated Tests
1. **Docker Compose validation**: Run `docker compose config` to ensure the compose file parses correctly
2. **SQL syntax check**: Run `docker compose up postgres` and verify the init script executes without errors by checking container logs

### Manual Verification
- Run `docker compose up -d postgres redis mongodb rabbitmq` and confirm all 4 infrastructure services start healthy
- Check RabbitMQ management UI at `http://localhost:15672` — verify exchanges, queues, and bindings exist
- Connect to PostgreSQL and verify all tables + seed data exist
- Confirm Prometheus UI at `http://localhost:9090` loads (targets will be down until app services are built)
