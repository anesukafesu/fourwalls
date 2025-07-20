from fastapi import FastAPI
from routes.parse import parse
from routes.migrate import migrate_facebook_posts

app = FastAPI()

@app.post("/parse")
async def parse_endpoint(request):
  return await parse(request)

@app.post("/migrate/facebook")
def migrate_facebook(payload: dict, authorization: str = ""):
  return migrate_facebook_posts(payload, authorization)
