# CNDC OSI Model Mapping

This note explains what the project has achieved from a CNDC point of view using the OSI model as a reference.

## 1. Current CNDC Achievement

The project demonstrates communication through a complete application workflow:

1. A sensor-style sender publishes soil readings to ThingSpeak.
2. The admin browser sends a protected request to the FastAPI backend.
3. The backend reads data from ThingSpeak over HTTP.
4. The backend validates and stores the data in PostgreSQL.
5. Farmer, verifier, and admin dashboards read live data through REST APIs.
6. The verifier sends an approval or rejection request back to the backend.
7. The final workflow state is stored and reflected in the UI.

This proves that the system is not only a local UI. It uses client-server communication, external cloud integration, structured request-response messages, and protected role-based access.

## 2. OSI Model Mapping

| OSI layer | Project mapping | Evidence in the app |
| --- | --- | --- |
| Layer 7: Application | FastAPI REST APIs, ThingSpeak API, React client, Swagger docs, PostgreSQL service access | `/api/auth/login`, `/api/admin/sync-thingspeak`, `/api/admin/trigger-carbon-calculation`, `/api/verifier/approve/{id}`, `/docs` |
| Layer 6: Presentation | JSON serialization, ThingSpeak field payloads, UTF-8 text responses, token-bearing request data | API responses are JSON; ThingSpeak uses `field1` to `field6`; admin panel displays payload and response examples. |
| Layer 5: Session | Login state, JWT bearer token continuity, backend database sessions | User logs in once, then role-based API calls continue using the token; backend opens database sessions per request. |
| Layer 4: Transport | TCP transport for HTTP/HTTPS and PostgreSQL connections | Browser-to-backend, backend-to-ThingSpeak, and backend-to-database communication are carried over reliable transport connections. |
| Layer 3: Network | IP-based routing between browser, FastAPI server, ThingSpeak, and PostgreSQL host | Local frontend reaches backend at `localhost:8000`; backend reaches ThingSpeak through the Internet; database is reached by host and port. |
| Layer 2: Data Link | Wi-Fi/Ethernet link-layer delivery on the local machine/network | The project relies on standard LAN/Wi-Fi/Ethernet delivery; this layer is used by the network stack but not custom-coded. |
| Layer 1: Physical | Laptop, network adapter, router, cables/wireless medium, server infrastructure | The physical medium carries all network traffic but remains outside application code. |

## 3. Application Layer Details

The strongest CNDC proof is at the application layer because the project exposes real endpoints and role-specific communication.

Important endpoints:

- `POST /api/auth/login`
- `GET /api/farmer/dashboard`
- `POST /api/admin/sync-thingspeak`
- `POST /api/admin/trigger-carbon-calculation`
- `GET /api/verifier/pending-verifications`
- `GET /api/verifier/sequestration/{id}`
- `POST /api/verifier/approve/{id}`
- `POST /api/verifier/reject/{id}`
- `GET /health`
- `GET /docs`

The app also displays CNDC evidence in the final implementation evidence panel: source, destination, protocol, method, endpoint, payload, response payload, stored tables, security, and outcome.

## 4. Presentation Layer Details

The project uses structured data representations:

- ThingSpeak payload fields:
  - `field1 = Nitrogen`
  - `field2 = Phosphorus`
  - `field3 = Potassium`
  - `field4 = Moisture`
  - `field5 = Organic_Carbon`
  - `field6 = depth_cm`
- FastAPI request and response bodies are JSON.
- JWT bearer tokens are sent in HTTP headers.
- Swagger docs expose the API contract in a machine-readable and human-readable form.

This layer matters because the sender, backend, and frontend must agree on the data format before communication can be useful.

## 5. Session And Security Continuity

The user logs in through:

```text
POST /api/auth/login
```

After login, the frontend stores and sends a JWT bearer token with protected requests. This gives the project a session-like continuity:

- admin can import ThingSpeak data and trigger calculation
- verifier can approve or reject sequestration records
- farmer can read dashboard data
- unauthorized roles cannot perform protected actions

This supports CNDC because communication is not anonymous or uncontrolled; it is tied to authenticated roles.

## 6. Transport And Network Path

A typical live workflow path is:

```text
ThingSpeak sender -> ThingSpeak cloud -> FastAPI backend -> PostgreSQL -> React dashboard -> verifier approval -> PostgreSQL
```

Transport and network responsibilities:

- TCP provides reliable end-to-end delivery for HTTP/HTTPS traffic.
- IP routing moves packets between the browser, backend, ThingSpeak, and database host.
- HTTPS protects web/API communication where used.
- PostgreSQL communication happens through the configured database host and port.

## 7. CNDC Security Controls Already Achieved

The project includes:

- ThingSpeak channel authorization for incoming sensor-style data
- JWT bearer authentication for protected application APIs
- role-based authorization for farmer, verifier, admin, and sensor accounts
- visible `/health` endpoint for service availability proof
- visible `/docs` endpoint for API contract proof
- auditable request outcomes stored in PostgreSQL
- duplicate measurement protection through relational constraints

## 8. Viva-Ready Summary

The CNDC part can be explained through the OSI model. At the application layer, the project uses ThingSpeak APIs, FastAPI REST endpoints, and React dashboards. At the presentation layer, it exchanges JSON and structured ThingSpeak field payloads. At the session/security level, it uses login and JWT bearer tokens for role-based continuity. At transport and network layers, the system depends on TCP/IP communication between the browser, backend, ThingSpeak, and PostgreSQL. Lower layers such as data link and physical are handled by the standard network stack, but they still support the overall communication path.
