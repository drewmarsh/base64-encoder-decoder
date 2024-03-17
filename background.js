let modifier;

// Listen for messages from the popup script
browser.runtime.onMessage.addListener((message) => {
   console.log('Modifier value received in background:', message.modifier); // Log the received modifier value
   if (message.modifier !== undefined) {
       modifier = parseInt(message.modifier);
   }
});

// Function to repeat encoding or decoding based on the modifier
function repeatEncodingOrDecoding(text, modifier, encode) {
   let result = text;

   for (let i = 0; i < modifier; i++) {
       if (encode) {
           result = btoa(result);
       } else {
           result = atob(result);
       }
   }

   return result;
}

// Listen for messages from the popup script for encoding/decoding
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
   console.log('Received message from popup script:', request);
   if (request.operation === 'encode') {
       const encodedText = repeatEncodingOrDecoding(request.text, 1, true);
       console.log('Encoded text:', encodedText);
       sendResponse({ result: encodedText });
   } else if (request.operation === 'decode') {
       const decodedText = repeatEncodingOrDecoding(request.text, 1, false);
       console.log('Decoded text:', decodedText);
       sendResponse({ result: decodedText });
   } else if (request.operation === 'encode_xmod') {
       const encodedText = repeatEncodingOrDecoding(request.text, modifier, true);
       console.log('Encoded text with modifier:', encodedText);
       sendResponse({ result: encodedText });
   } else if (request.operation === 'decode_xmod') {
       const decodedText = repeatEncodingOrDecoding(request.text, modifier, false);
       console.log('Decoded text with modifier:', decodedText);
       sendResponse({ result: decodedText });
   }
   return true;
});

// Function to handle context menu item clicks
function handleContextMenuClick(info, tab) {
   if (info.menuItemId === "encode") {
       const encodedText = repeatEncodingOrDecoding(info.selectionText, 1, true);
       copyToClipboard(encodedText);
   } else if (info.menuItemId === "decode") {
       const decodedText = repeatEncodingOrDecoding(info.selectionText, 1, false);
       copyToClipboard(decodedText);
   } else if (info.menuItemId === "encode_xMod") {
       const encodedText = repeatEncodingOrDecoding(info.selectionText, modifier, true);
       copyToClipboard(encodedText);
   } else if (info.menuItemId === "decode_xMod") {
       const decodedText = repeatEncodingOrDecoding(info.selectionText, modifier, false);
       copyToClipboard(decodedText);
   }
}

// Function to update context menu items with current modifier value
function updateContextMenuItems() {
   // Remove existing context menu items
   browser.contextMenus.removeAll(() => {
       // Create context menu items with updated titles
       browser.contextMenus.create({
           id: "encode",
           title: "Encode",
           contexts: ["selection"]
       });

       browser.contextMenus.create({
           id: "decode",
           title: "Decode",
           contexts: ["selection"]
       });

       browser.contextMenus.create({
           id: "encode_xMod",
           title: `Encode x${modifier}`, // Using template literal to include modifier value
           contexts: ["selection"]
       });

       browser.contextMenus.create({
           id: "decode_xMod",
           title: `Decode x${modifier}`, // Using template literal to include modifier value
           contexts: ["selection"]
       });
   });
}

// Create context menu items initially
updateContextMenuItems();

// Update context menu items whenever modifier value changes
browser.storage.local.get('modifier').then((data) => {
   modifier = data.modifier || 2; // Default modifier value
   updateContextMenuItems(); // Update context menu items with default modifier value
});

browser.storage.onChanged.addListener((changes, areaName) => {
   if (areaName === "local" && changes.modifier) {
       modifier = changes.modifier.newValue;
       updateContextMenuItems(); // Update context menu items with new modifier value
   }
});

// Add event listener for context menu item clicks
browser.contextMenus.onClicked.addListener(handleContextMenuClick);

// Function to copy text to the clipboard
function copyToClipboard(text) {
   navigator.clipboard.writeText(text)
       .then(() => {
           console.log('Text copied to clipboard:', text);
       })
       .catch((error) => {
           console.error('Failed to copy text:', error);
       });
}