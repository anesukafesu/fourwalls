from supabase import create_client
from os import getenv
from json import load

with open('./services.json') as f:
  services = load(f)

SUPABASE_URL = services['SUPABASE']
SUPABASE_ANON_KEY = getenv('SUPABASE_ANON_KEY')

client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)