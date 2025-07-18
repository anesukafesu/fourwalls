
// Content script for Facebook post extraction
let selectedElement = null;

// Listen for right-clicks to track the clicked element
document.addEventListener('contextmenu', (event) => {
  selectedElement = event.target;
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractPost") {
    try {
      const postData = extractPostData(selectedElement);
      
      if (postData) {
        // Send extracted data back to background script
        chrome.runtime.sendMessage({
          action: "postExtracted",
          data: postData
        }, (response) => {
          if (response.success) {
            showNotification("Post added to listings buffer successfully!", "success");
          } else {
            showNotification("Error: " + response.error, "error");
          }
        });
      } else {
        showNotification("No Facebook post found at this location", "warning");
      }
    } catch (error) {
      showNotification("Error extracting post: " + error.message, "error");
    }
  }
});

function extractPostData(element) {
  // Find the closest Facebook post container
  const postContainer = findPostContainer(element);
  
  if (!postContainer) {
    return null;
  }

  // Extract post text
  const textElements = postContainer.querySelectorAll('[data-ad-preview="message"], [dir="auto"]');
  let postText = "";
  
  textElements.forEach(el => {
    if (el.textContent && el.textContent.trim().length > 10) {
      postText += el.textContent.trim() + "\n";
    }
  });

  // Extract images
  const images = postContainer.querySelectorAll('img');
  const imageUrls = [];
  
  images.forEach(img => {
    if (img.src && !img.src.includes('emoji') && !img.src.includes('icon')) {
      // Get the highest quality image URL
      const highQualityUrl = getHighQualityImageUrl(img.src);
      if (highQualityUrl && !imageUrls.includes(highQualityUrl)) {
        imageUrls.push(highQualityUrl);
      }
    }
  });

  // Extract post ID if available
  const postId = extractPostId(postContainer);

  return {
    post_id: postId,
    post_text: postText.trim(),
    image_urls: imageUrls,
    source_url: window.location.href,
    extracted_at: new Date().toISOString()
  };
}

function findPostContainer(element) {
  let current = element;
  
  // Look for common Facebook post container patterns
  while (current && current !== document.body) {
    if (current.getAttribute && (
      current.getAttribute('role') === 'article' ||
      current.querySelector('[role="article"]') ||
      current.classList.contains('userContent') ||
      current.getAttribute('data-pagelet') ||
      current.querySelector('[data-ad-preview]')
    )) {
      return current;
    }
    current = current.parentElement;
  }
  
  return null;
}

function extractPostId(container) {
  // Try to extract post ID from various Facebook patterns
  const links = container.querySelectorAll('a[href*="/posts/"], a[href*="/photos/"], a[href*="story_fbid"]');
  
  for (let link of links) {
    const href = link.getAttribute('href');
    if (href) {
      const postIdMatch = href.match(/\/posts\/(\d+)/) || 
                         href.match(/\/photos\/[^\/]+\/(\d+)/) ||
                         href.match(/story_fbid=(\d+)/);
      if (postIdMatch) {
        return postIdMatch[1];
      }
    }
  }
  
  return null;
}

function getHighQualityImageUrl(src) {
  // Facebook image URL patterns - try to get highest quality
  if (src.includes('scontent')) {
    // Remove size restrictions from Facebook CDN URLs
    return src.replace(/\/s\d+x\d+\//, '/').replace(/&oh=[^&]*/, '').replace(/&oe=[^&]*/, '');
  }
  return src;
}

function showNotification(message, type) {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 300px;
    ${type === 'success' ? 'background-color: #10b981;' : ''}
    ${type === 'error' ? 'background-color: #ef4444;' : ''}
    ${type === 'warning' ? 'background-color: #f59e0b;' : ''}
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}
