// Put all the javascript code here, that you want to execute after page load.
console.log("🚀 ~ file: content_script.js:3 ~ CONTENT SCRIPT RUNNING:", "CONTENT SCRIPT RUNNING")

window.addEventListener("message", function(event) {

    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "FROM_MEAL_ALLOWANCE")) {
      console.log("Content script received: " + event.data.text);
      chrome.runtime.sendMessage({hello: 1});
    }
  }, false);