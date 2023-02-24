// Put all the javascript code here, that you want to execute in background.
console.log("🚀 ~ file: background_script.js:2 ~ console.log():", "BACKGROUND SCRIPT RUNNING")

function interceptAssests(details) {
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const decoder = new TextDecoder("utf-8");
    const encoder = new TextEncoder();
    let data = "";
  
    filter.ondata = event => {
      let str = decoder.decode(event.data, {stream: true});
      data += str;
      filter.write(encoder.encode(str));
    }

    filter.onstop = (event) => {
        const message = {request: "assets", data}
        console.log("🚀 ~ file: background_script.js:20 ~ listener ~ str:", JSON.parse(data));
        browser.
        browser.runtime.sendMessage("MEAL_ALLOWANCE", { type: "FROM_MEAL_ALLOWANCE", text: JSON.stringify(message)})
        filter.close();
    };
  
    return {};
  }
  
  browser.webRequest.onBeforeRequest.addListener(
    interceptAssests,
    {urls: ["https://api.lunchmoney.app/assets"]},
    ["blocking"]
  );