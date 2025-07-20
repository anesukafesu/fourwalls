from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routes.parse import parse
from routes.migrate import migrate_facebook_posts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Running"}

@app.post("/parse")
async def parse_endpoint(request: Request):
    return await parse(request)

@app.post("/migrate/facebook")
async def migrate_facebook(request: Request):
    payload = await request.json()
    auth_header = request.headers.get("authorization")
    return migrate_facebook_posts(payload, auth_header)
