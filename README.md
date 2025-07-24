# Fourwalls Project

Fourwalls is a modular platform for real estate, property management, and AI-powered property recommendations. The project is organized into several subfolders, each with its own purpose and setup instructions.

## Links

- [Demo video](https://youtu.be/PDyjBdkOAuk)
- [Analysis, Discussion and Recommendations](https://docs.google.com/document/d/12ociKvbOzayOstIgJypZI6NGMHtAlyRz5EEPAB34gqI)
- [Live Version](https://fourwalls.rw)
- [Figma Mockup Designs](https://www.figma.com/design/z4s7yG0teQHY23pD2SmYOf/PropertyHub?node-id=0-1&t=GRMXQoWacxX2uRnf-1)

## Project Structure

```
fourwalls/
├── chat/           # AI chat agent and related services (Python)
├── embeddings/     # Image embeddings and ML models (Python)
├── marketplace/    # Web frontend (TypeScript, React, Vite)
├── migrations/     # Data migration utilities (Python)
├── notebooks/      # Jupyter notebooks for experiments
├── recommendations/# Recommendation engine (Python)
├── shared/         # Shared configuration and data
```

---

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 18+ and npm](https://nodejs.org/)
- [Docker](https://www.docker.com/) (optional, for containerized runs)

---

## 1. Setting Up Python Services

Each Python-based subproject (`chat/`, `embeddings/`, `migrations/`, `recommendations/`) has its own `requirements.txt` file.

**Example setup for each Python service:**

```bash
cd <service-folder>
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Replace `<service-folder>` with one of: `chat`, `embeddings`, `migrations`, or `recommendations`.

---

## 2. Setting Up the Marketplace Frontend

The frontend is in `marketplace/` and uses Vite + React + TypeScript.

```bash
cd marketplace
npm install
npm run dev
```

This will start the development server. Visit the URL shown in the terminal (usually http://localhost:5173).

---

## 3. Running with Docker (Optional)

Some services include a `Dockerfile`. To build and run a service with Docker:

```bash
cd <service-folder>
docker build -t fourwalls-<service> .
docker run --rm -it fourwalls-<service>
```

---

## 4. Supabase Setup

If you use Supabase, ensure you have the CLI and have set up your project:

```bash
cd supabase
supabase start
```

Refer to the `supabase/` folder for configuration and migrations.

---

## 5. Jupyter Notebooks

Notebooks are in `notebooks/`. To run them:

```bash
cd notebooks/notebooks
jupyter notebook
```

---

## 6. Environment Variables

Some services may require environment variables (API keys, database URLs, etc.). Copy `.env.example` to `.env` in the relevant folder and update values as needed.

---

## 7. Additional Notes

- See each subfolder's `README.md` for more details.
- For production, review Docker and deployment best practices.
- For questions, open an issue or contact the maintainer.

---
