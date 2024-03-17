// Wait for the DOM to be loaded before executing the script
document.addEventListener('DOMContentLoaded', function () {
    // Get references to the required elements
    const modifierSpan = document.getElementById('modifier-value');
    const themeButton = document.getElementById('theme');
    const themeIcon = themeButton.querySelector('img');
    const clearButton = document.getElementById('clear');
    const pasteButton = document.getElementById('paste');
    const copyButton = document.getElementById('copy');
    const textInput = document.getElementById('text-input');
    const encodeBtn = document.getElementById('encode-btn');
    const decodeBtn = document.getElementById('decode-btn');
    const encodeXModBtn = document.getElementById('encode-xmod-btn');
    const decodeXModBtn = document.getElementById('decode-xmod-btn');
    const modifierDisplay = document.getElementById('modifier-display-decode');
    const modifierDisplayEncode = document.getElementById('modifier-display-encode');

    // Update the modifier display with the current value
    modifierDisplay.textContent = modifierSpan.textContent;
    modifierDisplayEncode.textContent = modifierSpan.textContent;

    // Retrieve theme preference from storage and apply styles
    browser.storage.local.get(['theme', 'modifier']).then(function (data) {
        const theme = data.theme || 'dark'; // Default to dark theme if no theme is stored
        applyThemeStyles(theme);

        const modifier = data.modifier || 2; // Default to 2 if no modifier is stored
        modifierSpan.textContent = modifier;
        modifierDisplay.textContent = modifier;
        modifierDisplayEncode.textContent = modifier;
    });

    // Event listener functions for button icon scaling
    const handleIconScaling = (button, scale, event) => {
        // Check if the event is a right-click
        if (event && event.button === 2) return; // Right-click, do nothing

        const icon = button.querySelector('img');
        if (icon) {
            // Apply the scale transformation to the icon image
            icon.style.transform = `scale(${scale})`;
            // Add a smooth transition effect when scaling the icon
            icon.style.transition = 'transform 0.1s ease-in-out';
        }
    };

    // Event listeners for button icon scaling
    clearButton.addEventListener('mousedown', (event) => handleIconScaling(clearButton, 0.9, event));
    clearButton.addEventListener('mouseup', (event) => handleIconScaling(clearButton, 1, event));
    clearButton.addEventListener('mouseleave', (event) => handleIconScaling(clearButton, 1, event));

    pasteButton.addEventListener('mousedown', (event) => handleIconScaling(pasteButton, 0.9, event));
    pasteButton.addEventListener('mouseup', (event) => handleIconScaling(pasteButton, 1, event));
    pasteButton.addEventListener('mouseleave', (event) => handleIconScaling(pasteButton, 1, event));

    copyButton.addEventListener('mousedown', (event) => handleIconScaling(copyButton, 0.9, event));
    copyButton.addEventListener('mouseup', (event) => handleIconScaling(copyButton, 1, event));
    copyButton.addEventListener('mouseleave', (event) => handleIconScaling(copyButton, 1, event));

    themeButton.addEventListener('mousedown', (event) => handleIconScaling(themeButton, 0.9, event));
    themeButton.addEventListener('mouseup', (event) => handleIconScaling(themeButton, 1, event));
    themeButton.addEventListener('mouseleave', (event) => handleIconScaling(themeButton, 1, event));

    // Clear button click event listener
    clearButton.addEventListener('click', () => {
        textInput.value = ''; // Clear the textbox
    });

    // Paste button click event listener
    pasteButton.addEventListener('click', () => {
        navigator.clipboard.readText() // Read text from clipboard
            .then((textFromClipboard) => {
                textInput.value += textFromClipboard; // Append text from clipboard to textbox
                console.log('Text pasted from clipboard:', textFromClipboard);
            })
            .catch((error) => {
                console.error('Failed to read text from clipboard:', error);
            });
    });

    // Copy button click event listener
    copyButton.addEventListener('click', () => {
        const textToCopy = textInput.value; // Get text from textbox
        navigator.clipboard.writeText(textToCopy) // Copy text to clipboard
            .then(() => {
                console.log('Text copied to clipboard:', textToCopy);
            })
            .catch((error) => {
                console.error('Failed to copy text:', error);
            });
    });

    // Theme button click event listener
    themeButton.addEventListener('click', () => {
        browser.storage.local.get('theme').then((data) => {
            const currentTheme = data.theme || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            const newIconSrc = newTheme === 'dark' ? '/icons/unfilled/theme_white_unfilled.svg' : '/icons/unfilled/theme_black_unfilled.svg';
            themeIcon.src = newIconSrc;
            console.log('Theme icon switched to:', newTheme);

            // Store the new theme preference in storage
            browser.storage.local.set({ theme: newTheme });

            // Apply the corresponding styles
            applyThemeStyles(newTheme);
        });
    });

    // Encode button click event listener
    encodeBtn.addEventListener('click', () => {
        const inputText = textInput.value;
        console.log('Encode button clicked with input text:', inputText);
        browser.runtime.sendMessage({ operation: 'encode', text: inputText })
            .then(response => {
                console.log('Received response from background script:', response);
                textInput.value = response.result;
            })
            .catch(error => {
                console.error('Error encoding text:', error);
            });
    });

    // Decode button click event listener
    decodeBtn.addEventListener('click', () => {
        const inputText = textInput.value;
        console.log('Decode button clicked with input text:', inputText);
        browser.runtime.sendMessage({ operation: 'decode', text: inputText })
            .then(response => {
                console.log('Received response from background script:', response);
                textInput.value = response.result;
            })
            .catch(error => {
                console.error('Error decoding text:', error);
            });
    });

    // Encode x button click event listener
    encodeXModBtn.addEventListener('click', () => {
        const inputText = textInput.value;
        browser.runtime.sendMessage({ operation: 'encode_xmod', text: inputText })
            .then(response => {
                textInput.value = response.result;
            })
            .catch(error => {
                console.error('Error encoding text with modifier:', error);
            });
    });

    // Decode x button click event listener
    decodeXModBtn.addEventListener('click', () => {
        const inputText = textInput.value;
        browser.runtime.sendMessage({ operation: 'decode_xmod', text: inputText })
            .then(response => {
                textInput.value = response.result;
            })
            .catch(error => {
                console.error('Error decoding text with modifier:', error);
            });
    });

    // Plus button click event listener (for single click)
    document.getElementById('plus').addEventListener('click', () => {
        let currentValue = parseInt(modifierSpan.textContent);
        if (currentValue < 99) {
            currentValue += 1;
            modifierSpan.textContent = currentValue;
            // Update the modifier display spans
            modifierDisplay.textContent = modifierSpan.textContent;
            modifierDisplayEncode.textContent = modifierSpan.textContent;
            // Store the updated modifier value in storage
            browser.storage.local.set({ modifier: modifierSpan.textContent });
            // Log the updated modifier value
            console.log('Modifier value stored in storage:', modifierSpan.textContent);
        }
    });

    // Minus button click event listener (for single click)
    document.getElementById('minus').addEventListener('click', () => {
        let currentValue = parseInt(modifierSpan.textContent);
        if (currentValue > 2) {
            currentValue -= 1;
            modifierSpan.textContent = currentValue;
            // Update the modifier display spans
            modifierDisplay.textContent = modifierSpan.textContent;
            modifierDisplayEncode.textContent = modifierSpan.textContent;
            // Store the updated modifier value in storage
            browser.storage.local.set({ modifier: modifierSpan.textContent });
            // Log the updated modifier value
            console.log('Modifier value stored in storage:', modifierSpan.textContent);
        }
    });

    // Prevent drag-click from changing the modifier value
    document.getElementById('plus').addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    document.getElementById('minus').addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    // Prevent drag-click for other SVG icons
    clearButton.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    pasteButton.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    copyButton.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    themeButton.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    // Retrieve modifier value from storage and update the span content if available
    browser.storage.local.get('modifier').then((data) => {
        console.log('Modifier value retrieved from storage:', data.modifier);
        if (data.modifier) {
            modifierSpan.textContent = data.modifier;
        }
    });

    // Function to apply theme styles
    function applyThemeStyles(theme) {
        const modifierNumber = document.querySelector('.modifier-number');
        const encodeBtn = document.getElementById('encode-btn');
        const decodeBtn = document.getElementById('decode-btn');
        const encodeXModBtn = document.getElementById('encode-xmod-btn');
        const decodeXModBtn = document.getElementById('decode-xmod-btn');
        const minusButton = document.getElementById('minus');
        const plusButton = document.getElementById('plus');

        if (theme === 'dark') {
            document.body.style.backgroundColor = '#201f1f';
            modifierNumber.style.color = 'white';
            minusButton.querySelector('img').src = 'icons/unfilled/minus_white_unfilled.svg';
            plusButton.querySelector('img').src = 'icons/unfilled/plus_white_unfilled.svg';
            themeIcon.src = '/icons/unfilled/theme_white_unfilled.svg';
            clearButton.querySelector('img').src = '/icons/unfilled/clear_white_unfilled.svg';
            pasteButton.querySelector('img').src = '/icons/unfilled/paste_white_unfilled.svg';
            copyButton.querySelector('img').src = '/icons/unfilled/copy_white_unfilled.svg';
            textInput.style.backgroundColor = '#212020';
            textInput.style.color = 'white';
            textInput.style.borderColor = 'white';
            encodeBtn.style.color = 'white';
            decodeBtn.style.color = 'white';
            encodeXModBtn.style.color = 'white';
            decodeXModBtn.style.color = 'white';
            document.body.classList.remove('light');
        } else {
            document.body.style.backgroundColor = 'white';
            modifierNumber.style.color = 'black';
            minusButton.querySelector('img').src = 'icons/unfilled/minus_black_unfilled.svg';
            plusButton.querySelector('img').src = 'icons/unfilled/plus_black_unfilled.svg';
            themeIcon.src = '/icons/unfilled/theme_black_unfilled.svg';
            clearButton.querySelector('img').src = '/icons/unfilled/clear_black_unfilled.svg';
            pasteButton.querySelector('img').src = '/icons/unfilled/paste_black_unfilled.svg';
            copyButton.querySelector('img').src = '/icons/unfilled/copy_black_unfilled.svg';
            textInput.style.backgroundColor = '#FAFAFA';
            textInput.style.color = 'black';
            textInput.style.borderColor = 'black';
            encodeBtn.style.color = 'black';
            decodeBtn.style.color = 'black';
            encodeXModBtn.style.color = 'black';
            decodeXModBtn.style.color = 'black';
            document.body.classList.add('light');
        }
    }
});