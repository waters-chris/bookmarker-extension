
// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

console.log("inside Sample.js")

var globalClickedElement = null;
var globalClickedTabId   = null;

function recordClickedElement(element, tabId) {
  globalClickedElement = element;
  globalClickedTabId = tabId;
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'openSidePanel',
      title: 'Open side panel',
      contexts: ['all']
    });
    chrome.tabs.create({ url: 'page.html' });
  });
  
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("content mencu OnCLick")
  if (info.menuItemId === 'openSidePanel') {
    console.log("openingi side pane;")
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId });
  // } else {
  //   console.log("not  side panel: ", info, tab)
  //   chrome.tabs.sendMessage(tab.id, "getClickedEl", {frameId: info.frameId}, data => {opening
  //     console.log("inside sendMessage:", info, data)
  //     elt.value = data.value;
  // });
  }
});
  
  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //   console.log("In this other listener: ");
  //   console.log("  >>  request: ", request);
  //   console.log("  >>  sender: ", sender);
  //   console.log("  >> sendResponse: ", sendResponse);
  //     if(request == "getClickedEl") {
  //       console.log("element cloicked?")
  //         sendMessage({value: clickedEl.value});
  //     }
  // });

chrome.runtime.onMessage.addListener((message, sender) => {
  // The callback for runtime.onMessage must return falsy if we're not sending a response
  
  (async () => {
    console.log("message: ", message, "sender:", sender);
    console.log("fetcedh bookmark content", message.fetchBookmarkContent);
    if (message.type === 'open_side_panel') {
      // This will open a tab-specific side panel only on the current tab.
      await chrome.sidePanel.open({ tabId: sender.tab.id });
      await chrome.sidePanel.setOptions({
        tabId: sender.tab.id,
        path: 'sidepanel-tab.html',
        enabled: true
      });
    } else if (message.value) {
      recordClickedElement(message.value, sender.tab.id);
    } else if (message.fetchBookmarkContent) {
        sendBookmarkContentToTab(message.fetchBookmarkContent, sender.tab.id)
    } else {
      return false;
    }
  })();
});
  
function sendBookmarkContentToTab(url, tabId) {
  console.log("FetchBookmark content for", url);

  chrome.storage.sync.get(['bookmarker_g']).then((retrievedData) => {
    console.log("retrienved: ", retrievedData);
    console.log("sendable:", retrievedData)
    // console.log("sendable:", retrievedData[url])

    if (retrievedData && retrievedData['bookmarker_g'][url]) {
      console.log("Sending reply")
      chrome.tabs.sendMessage(tabId, {bookmarkContent: retrievedData['bookmarker_g'][url]})
    }
  });
}
  
  

// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);
// chrome.contextMenus.onSelection.addListener(genericOnSelection);

// A generic onclick callback function.
function genericOnClick(info) {
  console.log("Generic On Click: ", info)

  switch (info.menuItemId) {
    case 'radio':
      // Radio item function
      console.log('Radio item clicked. Status:', info.checked);
      break;
    case 'checkbox':
      // Checkbox item function
      console.log('Checkbox item clicked. Status:', info.checked);
      break;
    case 'selection':
        handleSelection(info);
        break;
    default:
      // Standard context menu item function
      console.log('Standard context menu item clicked: ', info);
  }
}

function requestCsrfToken() {
  console.log("Requesting CSRF Token");
  var url = 'http://localhost:3000';
  
  return  fetch(url, { method: 'GET'})
    .then(response => response.text())
    .then(responseText => {
          // Printing our response
          console.log("success!: and the response is...")
          // console.log(responseText);
  
          const re = new RegExp(/<meta name="csrf-token" content="([^"]+)" \/>/);
          var potential_csrf_token = re.exec(responseText)[1];
  
          console.log("FOund: ", potential_csrf_token);
          
          return potential_csrf_token;
  
    })
    .catch(errorMsg => {
      console.log("Broken:");
      console.log(errorMsg)
    });
}

function storeLocally(thingsToStore, clickedElement) {
  console.log("About to store:", thingsToStore);

  chrome.storage.sync.get(['bookmarker_g']).then((storedBookmarks) => {

    // `storedBookmarks` will be an empty object if it didn't
    // already exist

    console.log("url: ", thingsToStore.pageUrl)
    console.log("storedBookmarks 1:", storedBookmarks);
    
    if (storedBookmarks['bookmarker_g']) {
      console.log("found")
      storedBookmarks = storedBookmarks['bookmarker_g']
    } else {
      console.log("empty")
    }

    var thisBookmark = storedBookmarks[thingsToStore.pageUrl];

    console.log("thisBookmark 1:", thisBookmark);
    thisBookmark ||= [];
    console.log("thisBookmark 2:", thisBookmark);
    thisBookmark.push({
      selected_text:    thingsToStore.selectionText,
      wrapping_element: clickedElement
    })
  
    storedBookmarks[thingsToStore.pageUrl] = thisBookmark;
  
    console.log("thisBookmark 3:", thisBookmark);
    console.log("storedBookmarks:", storedBookmarks);
  
    chrome.storage.sync.set({bookmarker_g: storedBookmarks}).then(() => {
      console.log("Stored locally.  Now sendingToTab")
        sendBookmarkContentToTab(thingsToStore.pageUrl, globalClickedTabId);
    });

    })

  

}

async function handleSelection(selectionInfo) {
  console.log("Selection made:", selectionInfo);
  console.log("Global :", globalClickedElement);

  const foo = await storeLocally(selectionInfo, globalClickedElement)

  // const bar = await sendBookmarkContentToTab(selectionInfo.pageUrl, globalClickedTabId);
  
  console.log("done");



//   console.log("Requesting CSRF Token");
//   var url = 'http://localhost:3000';
  
//   const csrf_token = fetch(url, { method: 'GET'})
//     .then(response => response.text())
//     .then(responseText => {
//           // Printing our response
//           console.log("success!: and the response is...")
//           // console.log(responseText);
  
//           const re = new RegExp(/<meta name="csrf-token" content="([^"]+)" \/>/);
//           var potential_csrf_token = re.exec(responseText)[1];
  
//           console.log("FOund: ", potential_csrf_token);
          
//           return potential_csrf_token;
  
//     })
//     .catch(errorMsg => {
//       console.log("Broken:");
//       console.log(errorMsg)
//     });


  
  

//   // need to pass through a Rails CSRF token.
//   // Need to be given this when we first do the request at the beginning
//   // and then remember it to pass through here
//   const submitSelection = async (selectionInfo) => {
    
//     const actual_csrf_token = await csrf_token;

//     console.log("CSRF TOKTEN 2: ", actual_csrf_token);

//       var url = 'http://localhost:3000/bookmarks.json';
//       var payload = new FormData();
//       const headers = {
//         'X-CSRF-Token': actual_csrf_token

//       }
//       const bookmarkPayload = {
//         bookmark: {
//           url: selectionInfo.pageUrl, 
//           selected_text: selectionInfo.selectionText,
//           wrapping_element: globalClickedElement
//         }
//       }
      
//       for (let key in bookmarkPayload) {
//         if (typeof(bookmarkPayload[key]) === 'object') {
//           for (let subKey in bookmarkPayload[key]) {
//             payload.append(`${key}[${subKey}]`, bookmarkPayload[key][subKey]);
//           }
//         } else {
//           payload.append(key, bookmarkPayload[key]);
//         }        
//       }

//       payload.append('authenticity_token', actual_csrf_token);
      

//       fetch(url, { method: 'POST', body: payload })
//       .then(response => response.text())
//       .then(responseText => {
//           console.log("fetch() has finished successfully")
          
          

//             // Printing our response 
//             // console.log(responseText);
//             console.log("Wantring to send messae now: ", globalClickedTabId)
//                   chrome.tabs.sendMessage(globalClickedTabId, {message: responseText});
//       })
//       .catch(errorMsg => console.log(errorMsg));
// // 
//     };

//     submitSelection(selectionInfo);
}



chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  let contexts = [
    'page',
    'selection',
    'link',
    'editable',
    'image',
    'video',
    'audio'
  ];
  for (let i = 0; i < contexts.length; i++) {
    let context = contexts[i];
    let title = "Test '" + context + "' menu item";
    chrome.contextMenus.create({
      title: title,
      contexts: [context],
      id: context
    });
  }

  // Create a parent item and two children.
  let parent = chrome.contextMenus.create({
    title: 'Test parent item',
    id: 'parent'
  });
  chrome.contextMenus.create({
    title: 'Child 1',
    parentId: parent,
    id: 'child1'
  });
  chrome.contextMenus.create({
    title: 'Child 2',
    parentId: parent,
    id: 'child2'
  });

  // Create a radio item.
  chrome.contextMenus.create({
    title: 'radio',
    type: 'radio',
    id: 'radio'
  });

  // Create a checkbox item.
  chrome.contextMenus.create({
    title: 'checkbox',
    type: 'checkbox',
    id: 'checkbox'
  });

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  // chrome.contextMenus.create(
  //   { title: 'Oops', parentId: 999, id: 'errorItem' },
  //   function () {
  //     if (chrome.runtime.lastError) {
  //       console.log('Got expected error: ' + chrome.runtime.lastError.message);
  //     }
  //   }
  // );
});
