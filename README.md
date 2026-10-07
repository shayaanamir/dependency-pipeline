# Automated Dependency Update and Compatibility Testing Pipeline

![CI](https://github.com/shayaanamir/dependency-update-pipeline/actions/workflows/ci.yml/badge.svg)

A DevOps pipeline that automatically detects outdated dependencies, opens update pull requests, and validates every update through build, test, compatibility, security and Docker checks. Only updates that pass all quality gates can be merged into `main`.

The sample application is a small **Book Manager**: an Express REST API with a React front end.

## Why this exists

Outdated dependencies cause compatibility problems, security vulnerabilities, unexpected failures and extra maintenance work. This project automates dependency maintenance while making sure updates cannot break or weaken the application.

## Pipeline

```text
Dependabot  ->  Dependency PR  ->  GitHub Actions
                                        |
                          Install + Build + Unit/Integration Tests
                                        |
                          Compatibility Matrix (Node 22 | Node 24)
                                        |
                              Smoke test (live API calls)
                                        |
                        Security scan (npm audit, server + client)
                                        |
                                  Docker build
                                        |
                                  Quality gate
                                 /            \
                              PASS            FAIL
                               |                |
                          Allow merge      Block merge
```

## Tech stack

| Component | Technology |
|---|---|
| Backend | Node.js, Express |
| Frontend | React, Vite |
| Testing | Jest, Supertest |
| Dependency updates | Dependabot (npm) |
| CI/CD | GitHub Actions |
| Compatibility | Actions matrix (Node 22, Node 24) |
| Security scanning | npm audit |
| Containerization | Docker |

## Repository structure

```text
.
├── .github/
│   ├── dependabot.yml        # weekly npm + docker update checks
│   └── workflows/ci.yml      # the full pipeline
├── server/                   # Express API
│   ├── src/                  # app.js, index.js
│   ├── test/                 # Jest + Supertest tests
│   └── Dockerfile
└── client/                   # React app (Vite)
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | List all books |
| GET | `/books/:id` | Get one book (404 if missing) |
| POST | `/books` | Create a book (400 if title/author missing) |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

Books are stored in memory, so data resets when the server restarts.

## Run locally

Requires Node.js 22 or newer.

```bash
# Terminal 1: API on port 5000
cd server
npm install
npm start

# Terminal 2: React app on http://localhost:5173
cd client
npm install
npm run dev
```

## Run the tests

```bash
cd server
npm test
```

## Run with Docker

```bash
cd server
docker build -t dependency-pipeline .
docker run -p 5000:5000 dependency-pipeline
```

Then open http://localhost:5000/books.

## How the pipeline works

1. **Dependabot** checks `/server` and `/client` weekly and opens a pull request for each outdated dependency.
2. **GitHub Actions** runs on every push and pull request:
   - `test`: installs dependencies, runs unit and integration tests, starts the server and checks live API responses, then builds the client. This runs on Node 22 and Node 24.
   - `security`: runs `npm audit --audit-level=high` on both the server and the client.
   - `docker build`: builds the image, only if `test` and `security` passed.
   - `quality-gate`: a single pass/fail check that requires all of the above.
3. **Branch protection** on `main` requires a pull request and a passing `quality-gate`, so failing or vulnerable updates cannot be merged.

## Demonstration scenarios

| Scenario | Change | Result |
|---|---|---|
| A: Successful update | Dependabot bumps a dev dependency | All checks pass, merge allowed |
| B: Breaking change | A behaviour change makes the 404 tests fail | Tests fail on both Node versions, merge blocked |
| C: Vulnerable dependency | Old `lodash` with known high-severity advisories | Tests pass, security scan fails, merge blocked |

## Notes

- The audit threshold is **high** severity. Moderate advisories in dev-only test tooling are reported but do not block merges. This is configurable with the `--audit-level` flag in `ci.yml`.
- Node 22 and 24 are tested because they are the currently supported LTS lines.