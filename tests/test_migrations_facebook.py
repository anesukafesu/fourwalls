import pytest
from unittest.mock import patch, MagicMock

@pytest.fixture
def mock_facebook_imports():
    with patch('migrations.utils.facebook.classify_as_housing', MagicMock(return_value=True)) as MockClassify, \
         patch('migrations.utils.facebook.extract_image_urls', MagicMock(return_value=["http://img1.jpg", "http://img2.jpg"])) as MockExtract:
        yield MockClassify, MockExtract

# Test classify_as_housing
def test_classify_as_housing_true(mock_facebook_imports):
    MockClassify, _ = mock_facebook_imports
    message = "Beautiful 3-bedroom house for rent in Harare!"
    assert MockClassify(message) is True

# Test extract_image_urls
def test_extract_image_urls(mock_facebook_imports):
    _, MockExtract = mock_facebook_imports
    post = {"images": ["http://img1.jpg", "http://img2.jpg"]}
    urls = MockExtract(post)
    assert isinstance(urls, list)
    assert all(isinstance(url, str) for url in urls)
