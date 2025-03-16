import { Configuration, DEFAULT_CONFIG } from './types';

// DOM Elements
const bannedWordsTextarea = document.getElementById('bannedWords') as HTMLTextAreaElement;
const replacementTextInput = document.getElementById('replacementText') as HTMLInputElement;
const filterModeInputs = document.querySelectorAll('input[name="filterMode"]') as NodeListOf<HTMLInputElement>;
const bannedPostClassesCheckboxes = document.querySelectorAll(
  'input[name="bannedPostClasses"]'
) as NodeListOf<HTMLInputElement>;
const statusElement = document.getElementById('status') as HTMLDivElement;
const emojiReplacementInput = document.getElementById('emojiReplacement') as HTMLInputElement;

// Load configuration on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const config = await loadConfiguration();
  updateUI(config);
});

// Save configuration when inputs change
bannedWordsTextarea.addEventListener('input', debounce(saveConfiguration, 500));
replacementTextInput.addEventListener('input', debounce(saveConfiguration, 500));
emojiReplacementInput.addEventListener('input', debounce(saveConfiguration, 500));
filterModeInputs.forEach(input => {
  input.addEventListener('change', saveConfiguration);
});
bannedPostClassesCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', saveConfiguration);
});

// Load configuration from storage
async function loadConfiguration(): Promise<Configuration> {
  const result = await chrome.storage.sync.get('config');
  return result.config || DEFAULT_CONFIG;
}

// Save configuration to storage
async function saveConfiguration() {
  const config: Configuration = {
    bannedWords: bannedWordsTextarea.value.split('\n').filter(word => word.trim() !== ''),
    replacementText: replacementTextInput.value,
    filterMode: (document.querySelector('input[name="filterMode"]:checked') as HTMLInputElement).value as
      | 'hide'
      | 'fade'
      | 'none'
      | 'emoji',
    bannedPostClasses: Array.from(bannedPostClassesCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.value),
    emojiReplacement: (document.getElementById('emojiReplacement') as HTMLInputElement).value || 'x'
  };

  await chrome.storage.sync.set({ config });

  // Notify content script to update filtering
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'CONFIG_UPDATED', config });
  }

  showStatus('Settings saved.');
}

// Update UI with configuration
function updateUI(config: Configuration) {
  bannedWordsTextarea.value = config.bannedWords.join('\n');
  replacementTextInput.value = config.replacementText;
  const filterModeInput = document.querySelector(
    `input[name="filterMode"][value="${config.filterMode}"]`
  ) as HTMLInputElement;
  if (filterModeInput) {
    filterModeInput.checked = true;
  }

  // Update post type filtering options
  bannedPostClassesCheckboxes.forEach(checkbox => {
    checkbox.checked = config.bannedPostClasses.includes(checkbox.value);
  });

  // Update emoji replacement input
  const emojiReplacementInput = document.getElementById('emojiReplacement') as HTMLInputElement;
  if (emojiReplacementInput) {
    emojiReplacementInput.value = config.emojiReplacement || '🐓';
  }
}

// Show status message
function showStatus(message: string) {
  statusElement.style.display = 'flex';
  statusElement.textContent = message;
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.style.display = 'none';
  }, 2000);
}

// Debounce helper function
function debounce(func: Function, wait: number) {
  let timeout: number | undefined;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait) as unknown as number;
  };
}
