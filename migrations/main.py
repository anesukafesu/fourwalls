from fastapi import FastAPI
from routes.extract import extract
from routes.migrate import migrate_facebook_posts

app = FastAPI()

@app.post("/extract")
async def extract_endpoint(request):
  return await extract(request)

@app.post("/migrate/facebook")
def migrate_facebook(payload: dict, authorization: str = ""):
  return migrate_facebook_posts(payload, authorization)
