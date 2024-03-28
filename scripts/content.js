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

  const json = JSON.parse(message.message);
  setNewContent(json);
})

const url = 'http://localhost:3000/bookmarks.json?url=' + encodeURIComponent(document.location.href);

function setNewContent(newContent) {


  if (newContent == null) {
    // nothing to do
    return;
  }
  // const re = new RegExp(/<meta name="csrf-token" content="([^"]+)" \/>/);
  // csrf_token = re.exec(newContent)[0];

  const existingContent = document.querySelector('#bookmarker-extension');

  if (existingContent) {
    existingContent.innerHTML = "<strong>Found !</strong>";
    let wrapping_element = newContent.wrapping_element;
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
      if (node.innerText.search(newContent.selected_text) != -1) {
        identifiedNode = node;
      }
    }

    // let identifiedNode = document.evaluate('//body/*[contains(text(), "' + newContent.selected_text + '")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
    
    if (identifiedNode) {
      console.log("Identified Note:", identifiedNode)
      identifiedNode.innerHTML = identifiedNode.innerHTML.replace(newContent.selected_text, '<span style="background-color: red;">' + newContent.selected_text  + '</span>')
      //identifiedNode.innerHTML = '<span style="background-color: red;">' + identifiedNode.innerHTML + '</span>';
    }

  }
  
}

// console.log("Aboutt o submit no-cors request");
// console.log("CSRF TOKEN 1: ", csrf_token);

const fetchBookmarkContent = async(url) => {

  const bookmark_for_url = fetch(url, { method: 'GET' })
    .then(response => response.json())
    .then(responseJson => {
          // Printing our response
          console.log("content success!: and the response is...")
          console.log(responseJson);
          return responseJson;
    })
    .catch(errorMsg => {
      console.log("Broken:");
      console.log(errorMsg)
    });

  const bookmark_content = await bookmark_for_url;
console.log("All teh book marks:", bookmark_content)
  for (var i = 0; i < bookmark_content.length; i++) {
    setNewContent(bookmark_content[i]);  
  } 
}

fetchBookmarkContent(url);

