# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Single-process **Streamlit** blank app template. The entire application lives in `streamlit_app.py`. See `README.md` for standard run instructions.

### Services

| Service | Port | Command |
|---------|------|---------|
| Streamlit app | 8501 | `streamlit run streamlit_app.py` |

No database, Docker Compose, or external APIs are required.

### Running the app

1. Ensure `~/.local/bin` is on `PATH` (pip installs the `streamlit` CLI there by default):

   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

2. Start the dev server:

   ```bash
   streamlit run streamlit_app.py
   ```

   For headless/Cloud Agent environments, add:

   ```bash
   streamlit run streamlit_app.py --server.headless true --server.enableCORS false --server.enableXsrfProtection false
   ```

3. Open http://localhost:8501 and verify the title **"🎈 My new app"** renders.

### Lint / test

This repo has no configured linter or test suite. For a quick sanity check:

```bash
python3 -m compileall -q streamlit_app.py
```

### Environment variables

None required. No `.env` or `st.secrets` usage in the current code.
