

console.log("inside Sample.js")

const storageId = 'bookmarker_v1'
var globalClickedElement = null;
var globalClickedTabId   = null;

function recordClickedElement(element, tabId) {
  globalClickedElement = element;
  globalClickedTabId = tabId;
}


chrome.runtime.onMessage.addListener((message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  
  (async () => {
    console.log("message: ", message, "sender:", sender);

    if (message.bookmarkerClickedElement) {
      recordClickedElement(message.bookmarkerClickedElement, sender.tab.id);
    } else if (message.fetchBookmarkContent) {
        sendBookmarkContentToTab(message.fetchBookmarkContent, sender.tab.id)
    } else {
      return false;
    }
  })();
});
  
function sendBookmarkContentToTab(url, tabId) {
  console.log("FetchBookmark content for", url);

  chrome.storage.sync.get(['bookmarker_v1']).then((retrievedData) => {

    if (retrievedData && retrievedData['bookmarker_v1'] && retrievedData['bookmarker_v1'][url]) {
      console.log("Sending reply: ", retrievedData['bookmarker_v1'][url])
      chrome.tabs.sendMessage(tabId, {bookmarkContent: retrievedData['bookmarker_v1'][url]})
    }
  });
}
  
  
chrome.contextMenus.onClicked.addListener(genericOnClick);

function genericOnClick(info) {
  switch (info.menuItemId) {
    case 'selection':
        handleSelection(info);
        break;
    default:
      // no op
  }
}


function storeLocally(thingsToStore, clickedElement) {
  console.log("About to store:", thingsToStore);

  chrome.storage.sync.get(['bookmarker_v1']).then((storedBookmarks) => {

    // `storedBookmarks` will be an empty object if it didn't
    // already exist
   
    if (storedBookmarks['bookmarker_v1']) {
      storedBookmarks = storedBookmarks['bookmarker_v1']
    }

    var thisBookmark = storedBookmarks[thingsToStore.pageUrl];

    thisBookmark ||= [];
    thisBookmark.push({
      selected_text:    thingsToStore.selectionText,
      wrapping_element: clickedElement
    })
  
    console.log("thisBookmark:", thisBookmark);
    console.log("Clicked element: ", clickedElement)

    storedBookmarks[thingsToStore.pageUrl] = thisBookmark;
  
    chrome.storage.sync.set({bookmarker_v1: storedBookmarks}).then(() => {
      sendBookmarkContentToTab(thingsToStore.pageUrl, globalClickedTabId);
    });

    })

  

}

async function handleSelection(selectionInfo) {
  const foo = await storeLocally(selectionInfo, globalClickedElement)

  console.log("done");
}



chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  // let contexts = [
  //   'page',
  //   'selection',
  //   'link',
  //   'editable',
  //   'image',
  //   'video',
  //   'audio'
  // ];
  // for (let i = 0; i < contexts.length; i++) {
  //   let context = contexts[i];
  //   let title = "Test '" + context + "' menu item";
  //   chrome.contextMenus.create({
  //     title: title,
  //     contexts: [context],
  //     id: context
  //   });
  // }

  chrome.contextMenus.create({
    title: "Bookmark this selection",
    contexts: ['selection'],
    id: 'selection'
  })

});
