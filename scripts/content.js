console.log("content.js HERE WE GO!")

var newContent = document.createElement('div');
newContent.setAttribute('id', 'bookmarker-extension');
newContent.setAttribute("style", "background-color: red; color: white; font-weight: bold; z-index: 9999; position: absolute; right: 0; top: 0;");
// newContent.innerHTML= '<h1>HERE</h1><p>' + title.textContent + '</p>';

newContent.innerHTML = '<em>Loading...</em>';

const body = document.querySelector('body');

if (body) {
  body.appendChild(newContent);
} else {
  console.log("Denied:  no body")
}


var clickedEl = null;

document.addEventListener("contextmenu", function(event){
  console.log("contentmenu vent listener: ", event);
    clickedEl = event.target;
    console.log("clickedEl: ", clickedEl);
    chrome.runtime.sendMessage({value: clickedEl.outerHTML});
}, true);

chrome.runtime.onMessage.addListener((message) => {
  console.log("Tab Message received: ", message);

  if (message.bookmarkContent) {
    // const json = JSON.parse(message.bookmarkContent);
    setNewContent(message.bookmarkContent);
  }
})

// const url = 'http://localhost:3000/bookmarks.json?url=' + encodeURIComponent(document.location.href);
const url = document.location.href;

function applyBookmarkContent(bookmarkContent) {

  if (bookmarkContent == null) {
    // nothing to do
    return;
  }

  const existingContent = document.querySelector('#bookmarker-extension');

  if (existingContent) {
    existingContent.innerHTML = "<strong>Found !</strong>";
    console.log("NewConent: ", bookmarkContent)
    let wrapping_element = bookmarkContent.wrapping_element;
    console.log("Wrapping Element: ", wrapping_element);
    // if there's nothing to identify where it goes then we'll ignore it
    if (wrapping_element == 'null') {
      return;
    }

    var tempElement = document.createElement('div');
    tempElement.innerHTML = wrapping_element;

    var wrapping_class = tempElement.children[0].className;
    var wrapping_id = tempElement.children[0].id;
    var wrapping_element_type = tempElement.children[0].tagName;

    var identifiedNodeSelector =  wrapping_element_type;
    if (wrapping_id) {
      identifiedNodeSelector += '#' + wrapping_id;
    }
    if (wrapping_class) {
      identifiedNodeSelector += '.' + wrapping_class.replace(/\s/, '.');
    }

    console.log("Css matcher:", identifiedNodeSelector);
    let identifiedNodes = document.querySelectorAll(identifiedNodeSelector);
identifiedNodes
    let identifiedNode = null;
    for (var i = 0; i < identifiedNodes.length; i++) { 
      let node = identifiedNodes[i];
      if (node.innerText.search(bookmarkContent.selected_text) != -1) {
        identifiedNode = node;
      }
    }

    // let identifiedNode = document.evaluate('//body/*[contains(text(), "' + newContent.selected_text + '")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    
    if (identifiedNode) {
      console.log("Identified Note:", identifiedNode)
      identifiedNode.innerHTML = identifiedNode.innerHTML.replace(bookmarkContent.selected_text, '<span style="background-color: red;">' + bookmarkContent.selected_text  + '</span>')
      //identifiedNode.innerHTML = '<span style="background-color: red;">' + identifiedNode.innerHTML + '</span>';
    }

  }  
}


function setNewContent(newContent) {

  if (newContent == null) {
    // nothing to do
    return;
  }

  console.log("New Content to write: ", newContent.length)
  for (var i = 0; i < newContent.length; i++) {
    applyBookmarkContent(newContent[i]);
  }
}

// console.log("Aboutt o submit no-cors request");
// console.log("CSRF TOKEN 1: ", csrf_token);

const fetchBookmarkContent = async(url) => {
  console.log("About to fetch bookmark content for:", url)
  chrome.runtime.sendMessage({fetchBookmarkContent: url})

//   const bookmark_for_url = fetch(url, { method: 'GET' })
//     .then(response => response.json())
//     .then(responseJson => {
//           // Printing our response
//           console.log("content success!: and the response is...")
//           console.log(responseJson);
//           return responseJson;
//     })
//     .catch(errorMsg => {
//       console.log("Broken:");
//       console.log(errorMsg)
//     });

//   const bookmark_content = await bookmark_for_url;
// console.log("All teh book marks:", bookmark_content)
//   for (var i = 0; i < bookmark_content.length; i++) {
//     setNewContent(bookmark_content[i]);  
//   } 
}

fetchBookmarkContent(url);

