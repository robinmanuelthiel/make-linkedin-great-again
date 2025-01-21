/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Install menu items to the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(function (message) {
    // Clicking this item will send an event to the content script listening to messages
    chrome.contextMenus.create({
        title: 'Disable Posts Filter',
        id: 'disable-filter',
        contexts: ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio', 'browser_action']
    });
});
function getActiveTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        callback(activeTab);
    });
}
// When a context menu item is clicked
chrome.contextMenus.onClicked.addListener(function (info) {
    console.log(info);
    if (info.menuItemId === 'disable-filter') {
        getActiveTab(function (tab) {
            if (info.menuItemId === 'disable-filter') {
                chrome.tabs.sendMessage(tab.id, __assign({ type: 'disable-filter' }, info));
            }
        });
    }
});


/******/ })()
;
//# sourceMappingURL=background.js.map