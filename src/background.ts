// Install menu items to the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(message => {
  // Clicking this item will send an event to the content script listening to messages
  chrome.contextMenus.create({
    title: 'Disable Posts Filter',
    id: 'disable-filter',
    contexts: ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'browser_action']
  });
});

function getActiveTab(callback: (tab: chrome.tabs.Tab) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    callback(activeTab);
  });
}

// When a context menu item is clicked
chrome.contextMenus.onClicked.addListener(info => {
  console.log(info);
  if (info.menuItemId === 'disable-filter') {
    getActiveTab(tab => {
      if (info.menuItemId === 'disable-filter') {
        chrome.tabs.sendMessage(tab.id!, {
          type: 'disable-filter',
          ...info
        });
      }
    });
  }
});

export {};
