from supabase_client import client


class Neighbourhoods:
  def __init__(self):
    self.neighbourhoods = {}

    neighbourhoods = client.table('neighbourhoods').select('id,name').execute().data
    for neighbourhood in neighbourhoods:
      id = neighbourhood['id']
      name = neighbourhood['name']
      self.add_neighourhood(name, id)
    print(self.neighbourhoods)
    return self
  
  def delete_neighbourhood(self, id):
    self.neighbourhoods = { k: v for k, v in self.neighbourhoods if v != id }
    print(self.neighbourhoods)
  
  def update_neighourhood(self, name, id):
    self.delete_neighbourhood(id)
    self.add_neighourhood(name, id)
    print(self.neighbourhoods)
  
  def add_neighourhood(self, name, id):
    self.neighbourhoods[name.lower()] = id
    print(self.neighbourhoods)
  
  def get_neighbourhood_id(self, name):
    return self.neighbourhoods.get(name.lower())


neighbourhood_lookup = Neighbourhoods()