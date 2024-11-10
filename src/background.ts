// Install menu items to the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(message => {
  const contexts = ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio'];

  // Clicking this item will send an event to the content script listening to messages
  chrome.contextMenus.create({
    title: 'Filter Useless Posts',
    id: 'filter-useless-posts',
    contexts: ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'browser_action']
  });

  console.log('Context menu created');
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
  if (info.menuItemId === 'filter-useless-posts') {
    getActiveTab(tab => {
      if (info.menuItemId === 'filter-useless-posts') {
        chrome.tabs.sendMessage(tab.id!, {
          type: 'filter-useless-posts',
          ...info
        });
      }
    });
  }
});

export {};
