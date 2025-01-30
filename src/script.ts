// Load saved configuration on popup open
chrome.storage.local.get(['bannedWords', 'replacementText'], (data) => {
  const bannedInput = document.getElementById('bannedWords') as HTMLInputElement;
  const replacementInput = document.getElementById('replacementText') as HTMLInputElement;
  const defaultBannedWords = ['elon', 'musk', 'trump', 'biden', 'israel', 'putin', 'afd', 'weidel'];
  
  bannedInput.value = data.bannedWords?.join(', ') || defaultBannedWords.join(', ');
  replacementInput.value = data.replacementText || '💩 Bullshit';
});

// Save configuration when the save button is clicked
document.getElementById('saveConfig')?.addEventListener('click', () => {
  const bannedInput = document.getElementById('bannedWords') as HTMLInputElement;
  const replacementInput = document.getElementById('replacementText') as HTMLInputElement;
  const status = document.getElementById('status');

  const bannedWords = bannedInput.value
    .split(',')
    .map(word => word.trim().toLowerCase())
    .filter(word => word.length > 0);

  const config = {
    bannedWords,
    replacementText: replacementInput.value || '💩 Bullshit'
  };

  chrome.storage.local.set(config, () => {
    if (status) {
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'config-updated' });
      }
    });
  });
});
