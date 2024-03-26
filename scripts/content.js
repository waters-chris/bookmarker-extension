console.log("HERE WE GO!")

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

var url = 'http://localhost:3000';
var csrf_token = null;


function setNewContent(newContent) {

  // const re = new RegExp(/<meta name="csrf-token" content="([^"]+)" \/>/);
  // csrf_token = re.exec(newContent)[0];

  const existingContent = document.querySelector('#bookmarker-extension');

  if (existingContent) {
    existingContent.innerHTML = newContent;
  }
  
}

// console.log("Aboutt o submit no-cors request");
// console.log("CSRF TOKEN 1: ", csrf_token);

fetch(url, { method: 'GET' })
  .then(response => response.text())
  .then(responseText => {
        // Printing our response
        // console.log("success!: and the response is...")
        // console.log(responseText);
        setNewContent(responseText);
  })
  .catch(errorMsg => {
    console.log("Broken:");
    console.log(errorMsg)
  });


  // Next step
  // create a bookmark from chrome.