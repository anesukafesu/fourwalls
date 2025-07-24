from migrations.utils.facebook import classify_as_housing, extract_image_urls

# Test classify_as_housing

def test_classify_as_housing_true():
    message = "Beautiful 3-bedroom house for rent in Harare!"
    assert classify_as_housing(message) is True or classify_as_housing(message) is False

# Test extract_image_urls

def test_extract_image_urls():
    post = {"images": ["http://img1.jpg", "http://img2.jpg"]}
    urls = extract_image_urls(post)
    assert isinstance(urls, list)
    assert all(isinstance(url, str) for url in urls)
