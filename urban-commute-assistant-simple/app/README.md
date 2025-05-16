# App Directory

This directory exists solely to accommodate Render's default app structure expectation. 

The default Render start command is:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This directory contains a minimal `main.py` that imports and re-exports the actual application from the `backend/api/main.py` file.

**Do not modify the files in this directory unless you know what you're doing.**

If you want to make changes to the actual application, work in the `backend/` directory instead.
