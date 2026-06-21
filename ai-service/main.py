from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from matching.router import router as matching_router

app = FastAPI(title="Tripzy AI Engine")

# Allow the Next.js dev server to call this API directly from the browser
# during local development. Tighten this list before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matching_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Tripzy AI Engine", "version": "1.0"}