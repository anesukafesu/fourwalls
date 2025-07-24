from chat.neighbourhoods import Neighbourhoods
import pytest

@pytest.fixture
def neighbourhoods():
    return Neighbourhoods()

def test_add_and_get_neighbourhood(neighbourhoods):
    neighbourhoods.add_neighourhood('Avondale', 1)
    assert neighbourhoods.get_neighbourhood_id('Avondale') == 1

def test_update_neighbourhood(neighbourhoods):
    neighbourhoods.add_neighourhood('Borrowdale', 2)
    neighbourhoods.update_neighourhood('Borrowdale Updated', 2)
    # Depending on implementation, check if update is reflected

def test_delete_neighbourhood(neighbourhoods):
    neighbourhoods.add_neighourhood('Greendale', 3)
    neighbourhoods.delete_neighbourhood(3)
    # Depending on implementation, check if deletion is reflected
