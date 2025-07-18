
// Popup script for Chrome extension settings
document.addEventListener('DOMContentLoaded', () => {
  const authTokenInput = document.getElementById('authToken');
  const apiUrlInput = document.getElementById('apiUrl');
  const saveButton = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['authToken', 'apiUrl'], (result) => {
    if (result.authToken) {
      authTokenInput.value = result.authToken;
    }
    if (result.apiUrl) {
      apiUrlInput.value = result.apiUrl;
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const authToken = authTokenInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (!authToken) {
      showStatus('Please enter an auth token', 'error');
      return;
    }

    chrome.storage.local.set({
      authToken: authToken,
      apiUrl: apiUrl
    }, () => {
      showStatus('Settings saved successfully!', 'success');
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }
});
