document.getElementById('hello-world')?.addEventListener('click', onHelloWorldClick);

function onHelloWorldClick() {
  // Update button text
  const button = document.getElementById('hello-world');
  if (button) {
    button.textContent = 'Clicked!';
  }
}

document.getElementById('save-config')?.addEventListener('click', onSaveConfigClick);

function onSaveConfigClick() {
  const bannedWordsInput = document.getElementById('banned-words') as HTMLInputElement;
  const replacementTextInput = document.getElementById('replacement-text') as HTMLInputElement;

  const bannedWords = bannedWordsInput.value.split(',').map(word => word.trim());
  const replacementText = replacementTextInput.value;

  chrome.storage.sync.set({ bannedWords, replacementText }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id!, { type: 'config-changed' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const bannedWordsInput = document.getElementById('banned-words') as HTMLInputElement;
  const replacementTextInput = document.getElementById('replacement-text') as HTMLInputElement;

  chrome.storage.sync.get(['bannedWords', 'replacementText'], result => {
    bannedWordsInput.value = result.bannedWords ? result.bannedWords.join(', ') : 'elon, musk, trump, biden, israel, putin, afd, weidel';
    replacementTextInput.value = result.replacementText || '💩 Bullshit';
  });
});
