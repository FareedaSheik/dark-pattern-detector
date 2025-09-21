const endpoint = "http:/127.0.0.1:5000/";
const descriptions = {
  Sneaking:
    "Coerces users to act in ways that they would not normally act by obscuring information.",
  Urgency: "Places deadlines on things to make them appear more desirable",
  Misdirection:
    "Aims to deceptively incline a user towards one choice over the other.",
  "Social Proof":
    "Gives the perception that a given action or product has been approved by other people.",
  Scarcity:
    "Tries to increase the value of something by making it appear to be limited in availability.",
  Obstruction:
    "Tries to make an action more difficult so that a user is less likely to do that action.",
  "Forced Action":
    "Forces a user to complete extra, unrelated tasks to do something that should be simple.",
  "Hidden Button":
    "A camouflaged or tiny button/link that is intentionally difficult to notice.",
  "Pre-checked Option":
    "An option that is automatically selected without user consent.",
  "Forced Continuity":
    "Automatically charging users after a free trial without clear notice.",
};

function scrape() {
  // website has already been analyzed
  const existingData = document.getElementById("insite_count");
  if (existingData) {
    existingData.remove(); // Remove the old hidden data div
  }
  clearHighlights(); 
  // Detect hidden/camouflaged buttons and tiny cancel links
  detectHiddenButtons();

  // Detect pre-checked options
  detectPrecheckedOptions();

  // Detect forced continuity patterns
  detectForcedContinuity();

  // --- THE FIX IS HERE: Precise Element Selection ---
  // We select only the most common text-holding tags. This is our "scalpel".
  const textElements = document.querySelectorAll(
    "p, span, a, li, h1, h2, h3, h4, h5, h6, strong, em, button, div"
  );

  let elements_to_highlight = []; // This will store the actual HTML elements
  let filtered_text_to_send = []; // This will store the text we send to the backend

  for (const element of textElements) {
    // Get the element's own text, ignoring text from its children
    // This prevents highlighting a giant container for one word inside it.
    const ownText = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ");

    // We only care about elements that actually contain meaningful text
    if (ownText.length > 5) {
      // A threshold to ignore tiny/empty elements
      elements_to_highlight.push(element);
      filtered_text_to_send.push(ownText);
    }
  }

  // post to the web server
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Send only the clean text array to the backend
    body: JSON.stringify({ tokens: filtered_text_to_send }),
  })
    .then((resp) => resp.json())
    .then((data) => {
      let dp_count = 0;

      // The backend's response will have the same length as our filtered lists
      for (let i = 0; i < data.result.length; i++) {
        const patternType = data.result[i];
        if (patternType !== "Not Dark") {
          // Highlight the PRECISE element associated with this text
          highlight(elements_to_highlight[i], patternType);
          dp_count++;
        }
      }

      // store detailed dark pattern data
      let g = document.createElement("div");
      g.id = "insite_count";
      g.value = dp_count;
      g.dataset.transparencyScore = data.transparency_score;
      g.dataset.riskLevel = data.risk_level;
      g.dataset.riskColor = data.risk_color;
      g.dataset.patternCounts = JSON.stringify(data.pattern_counts);
      g.dataset.totalPatterns = data.total_patterns;
      g.style.opacity = 0;
      g.style.position = "fixed";
      document.body.appendChild(g);

      // Send detailed data to popup
      sendDetailedPatterns(data);
    })
    .catch((error) => {
      // We can remove the alert for a smoother experience
      console.error("Insite Error:", error);
    });
}

// function scrape() {
//   // website has already been analyzed
//   if (document.getElementById("insite_count")) {
//     return;
//   }

//   // aggregate all DOM elements on the page
//   let elements = segments(document.body);
//   let filtered_elements = [];

//   for (let i = 0; i < elements.length; i++) {
//     let text = elements[i].innerText.trim().replace(/\t/g, " ");
//     if (text.length == 0) {
//       continue;
//     }
//     filtered_elements.push(text);
//   }

//   // post to the web server
//   fetch(endpoint, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ tokens: filtered_elements }),
//   })
//     .then((resp) => resp.json())
//     .then((data) => {
//       // data = data.replace(/'/g, '"');
//       // json = JSON.parse(data);
//       let dp_count = 0;
//       let element_index = 0;

//       for (let i = 0; i < elements.length; i++) {
//         let text = elements[i].innerText.trim().replace(/\t/g, " ");
//         if (text.length == 0) {
//           continue;
//         }

//         if (data.result[i] !== "Not Dark") {
//           highlight(elements[element_index], data.result[i]);
//           dp_count++;
//         }
//         element_index++;
//       }

//       // store number of dark patterns
//       let g = document.createElement("div");
//       g.id = "insite_count";
//       g.value = dp_count;
//       g.style.opacity = 0;
//       g.style.position = "fixed";
//       document.body.appendChild(g);
//       sendDarkPatterns(g.value);
//     })
//     .catch((error) => {
//       alert(error);
//       alert(error.stack);
//     });
// }

function highlight(element, type) {
  element.classList.add("insite-highlight");
  element.dataset.patternType = type;

  let body = document.createElement("span");
  body.classList.add("insite-highlight-body");

  /* header */
  let header = document.createElement("div");
  header.classList.add("modal-header");
  let headerText = document.createElement("h1");
  headerText.innerHTML = type + " Pattern";
  header.appendChild(headerText);
  body.appendChild(header);

  /* content */
  let content = document.createElement("div");
  content.classList.add("modal-content");
  content.innerHTML = descriptions[type];
  body.appendChild(content);

  element.appendChild(body);
}
function clearHighlights() {
    const highlightedElements = document.querySelectorAll('.insite-highlight');
    highlightedElements.forEach(el => {
        // Remove the highlight class itself
        el.classList.remove('insite-highlight');
        
        // Find and remove the tooltip body that was added inside
        const tooltip = el.querySelector('.insite-highlight-body');
        if (tooltip) {
            tooltip.remove();
        }
    });
}

function sendDarkPatterns(number) {
  chrome.runtime.sendMessage({
    message: "update_current_count",
    count: number,
  });
}

function sendDetailedPatterns(data) {
  // Send to popup
  chrome.runtime.sendMessage({
    message: "update_detailed_analysis",
    transparency_score: data.transparency_score,
    risk_level: data.risk_level,
    risk_color: data.risk_color,
    pattern_counts: data.pattern_counts,
    total_patterns: data.total_patterns,
    dark_patterns: data.dark_patterns,
    count: data.total_patterns.toString(),
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // When the popup opens, it will send this message.
  if (request.message === "popup_open") {
    let element = document.getElementById("insite_count");
    // Check if the page has been analyzed.
    if (element) {
      // If yes, send the detailed data back immediately.
      const detailedData = {
        message: "update_detailed_analysis",
        transparency_score: element.dataset.transparencyScore,
        risk_level: element.dataset.riskLevel,
        risk_color: element.dataset.riskColor,
        pattern_counts: JSON.parse(element.dataset.patternCounts || "{}"),
        total_patterns: parseInt(element.dataset.totalPatterns || "0"),
        count: element.value,
      };
      chrome.runtime.sendMessage(detailedData);
    } else {
      // If NOT analyzed, tell the popup it's ready to start.
      chrome.runtime.sendMessage({
        message: "update_current_count",
        count: "?",
      });
    }
  }
  // When the user clicks the analyze button.
  else if (request.message === "analyze_site") {
    scrape();
  }
  // When the user wants to capture highlighted elements
  else if (request.action === "captureHighlightedElements") {
    captureHighlightedElements(sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Function to capture highlighted elements
function captureHighlightedElements(sendResponse) {
  const highlightedElements = document.querySelectorAll('.insite-highlight');
  
  if (highlightedElements.length === 0) {
    sendResponse({ success: false, message: "No highlighted elements found" });
    return;
  }
  
  // Create a canvas to draw the highlighted elements
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Fill with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw page title
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText(`Dark Patterns on: ${document.title}`, 20, 30);
  ctx.fillText(`URL: ${window.location.href}`, 20, 50);
  ctx.fillText(`Captured on: ${new Date().toLocaleString()}`, 20, 70);
  
  // Draw a separator line
  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.lineTo(canvas.width - 20, 80);
  ctx.stroke();
  
  let yOffset = 100;
  
  // Draw each highlighted element
  highlightedElements.forEach((element, index) => {
    // Get pattern type from data attribute
    const patternType = element.dataset.patternType || "Unknown Pattern";
    
    // Draw pattern type as header
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#d32f2f'; // Red color for pattern type
    ctx.fillText(`${index + 1}. ${patternType} Pattern:`, 20, yOffset);
    yOffset += 25;
    
    // Draw element text content
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    
    // Get text content and wrap it
    const text = element.innerText.replace(/\n/g, ' ').trim();
    const words = text.split(' ');
    let line = '';
    
    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > canvas.width - 40 && line !== '') {
        ctx.fillText(line, 30, yOffset);
        line = word + ' ';
        yOffset += 20;
      } else {
        line = testLine;
      }
    });
    
    // Draw remaining text
    if (line.trim() !== '') {
      ctx.fillText(line, 30, yOffset);
      yOffset += 20;
    }
    
    // Draw a red border around the text
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, yOffset - 65, canvas.width - 40, 70);
    
    // Add some space between elements
    yOffset += 30;
  });
  
  // Convert canvas to data URL
  const dataUrl = canvas.toDataURL('image/png');
  sendResponse({ success: true, dataUrl: dataUrl });
}
// Functions for detecting specific dark patterns

// Detect hidden/camouflaged buttons and tiny cancel links
function detectHiddenButtons() {
  // Run an initial scan for obvious hidden buttons
  scanForHiddenButtons();
  
  // Run a deeper scan for subscription cancellation flows
  scanForCancellationFlows();
}

// Scan for basic hidden buttons
function scanForHiddenButtons() {
  // Find all links, buttons, spans, and divs that might be clickable
  const elements = document.querySelectorAll('a, button, span[onclick], div[onclick], [role="button"], input[type="submit"], input[type="button"], [class*="btn"], [class*="button"], [id*="btn"], [id*="button"]');
  
  elements.forEach(element => {
    // Skip elements that are not visible or have no dimensions
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      return;
    }
    
    // Get computed style
    const style = window.getComputedStyle(element);
    const fontSize = parseInt(style.fontSize);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    const text = element.textContent.trim().toLowerCase();
    const opacity = parseFloat(style.opacity);
    const visibility = style.visibility;
    const display = style.display;
    const position = style.position;
    const zIndex = parseInt(style.zIndex) || 0;
    
    // Check for tiny font size (less than 12px)
    const isTinyFont = fontSize < 12;
    
    // Check for low contrast
    const hasLowContrast = isLowContrast(color, backgroundColor);
    
    // Check for semi-hidden elements
    const isSemiHidden = opacity < 0.7 || visibility === 'hidden' || display === 'none';
    
    // Check if positioned off-screen or very far from main content
    const isOffPosition = position === 'absolute' && 
                         (parseInt(style.top) < 0 || parseInt(style.left) < 0 || 
                          parseInt(style.bottom) < 0 || parseInt(style.right) < 0);
    
    // Check if element has a very low z-index (potentially hidden behind other elements)
    const hasLowZIndex = zIndex < 0;
    
    // Check if it's a cancel/close/decline link
    const cancelKeywords = [
      'cancel', 'close', 'no thanks', 'decline', 'no, thanks', 'skip', 
      'not now', 'later', 'opt out', 'unsubscribe', 'end subscription', 
      'stop subscription', 'terminate', 'quit', 'exit', 'leave', 
      'no longer', 'remove', 'delete account', 'continue cancelling'
    ];
    const isCancelLink = cancelKeywords.some(keyword => text.includes(keyword));
    
    // Check if element is very small (tiny clickable area)
    const isTinyElement = element.offsetWidth < 30 || element.offsetHeight < 15;
    
    // Check if the element is at the bottom of a container or page
    const isAtBottom = isElementAtBottom(element);
    
    // Check if the element is visually de-emphasized compared to other buttons
    const isDeemphasized = checkForDeemphasizedButton(element);
    
    // If it meets any of our dark pattern criteria
    if (((isTinyFont || hasLowContrast || isSemiHidden || isOffPosition || 
          isTinyElement || hasLowZIndex || isAtBottom || isDeemphasized) && isCancelLink) ||
         (isCancelLink && checkForBuriedCancelButton(element))) {
      // Create alert for hidden button
      createDarkPatternAlert(element, "Hidden Button");
    }
  });
}

// Scan specifically for subscription cancellation flows
function scanForCancellationFlows() {
  // Look for pages that might be subscription management or cancellation pages
  const pageContent = document.body.textContent.toLowerCase();
  const isSubscriptionPage = 
    pageContent.includes('subscription') || 
    pageContent.includes('account') || 
    pageContent.includes('membership') ||
    pageContent.includes('billing') ||
    pageContent.includes('payment');
  
  if (!isSubscriptionPage) return;
  
  // Find all links and buttons on the page
  const allButtons = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
  
  // Look for primary action buttons that are visually emphasized
  const primaryButtons = Array.from(allButtons).filter(button => {
    const style = window.getComputedStyle(button);
    // Check if button has characteristics of a primary action button
    return (style.backgroundColor !== 'transparent' && 
            style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            button.offsetWidth > 100);
  });
  
  // Find all cancel-related buttons
  const cancelButtons = Array.from(allButtons).filter(button => {
    const text = button.textContent.trim().toLowerCase();
    return text.includes('cancel') || 
           text.includes('unsubscribe') || 
           text.includes('end subscription') ||
           text.includes('terminate') ||
           text.includes('stop subscription') ||
           (text.includes('no') && text.includes('thanks')) ||
           text.includes('continue cancelling');
  });
  
  // If there are primary buttons but cancel buttons are not among them,
  // this might indicate a dark pattern
  if (primaryButtons.length > 0 && cancelButtons.length > 0) {
    cancelButtons.forEach(cancelButton => {
      // Check if this cancel button is visually de-emphasized
      if (!primaryButtons.includes(cancelButton)) {
        createDarkPatternAlert(cancelButton, "Hidden Button");
      }
    });
  }
  
  // Check for "No thanks, continue cancelling" type buttons at the bottom of forms
  const forms = document.querySelectorAll('form, [role="form"], div[class*="form"], section, article');
  forms.forEach(form => {
    const buttons = form.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
    if (buttons.length > 0) {
      const lastButton = buttons[buttons.length - 1];
      const text = lastButton.textContent.trim().toLowerCase();
      if (text.includes('cancel') || text.includes('no thanks') || text.includes('continue cancelling')) {
        createDarkPatternAlert(lastButton, "Hidden Button");
      }
    }
  });
}

// Helper function to check if an element is at the bottom of its container
function isElementAtBottom(element) {
  const parent = element.parentElement;
  if (!parent) return false;
  
  const parentRect = parent.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  // Check if element is in the bottom 20% of its container
  return (elementRect.bottom > parentRect.top + parentRect.height * 0.8);
}

// Helper function to check if a button is visually de-emphasized compared to others
function checkForDeemphasizedButton(element) {
  // Get all sibling buttons
  const parent = element.parentElement;
  if (!parent) return false;
  
  const siblings = Array.from(parent.children).filter(child => 
    child.tagName === 'A' || 
    child.tagName === 'BUTTON' || 
    child.getAttribute('role') === 'button' ||
    child.tagName === 'INPUT' && (child.type === 'submit' || child.type === 'button')
  );
  
  if (siblings.length <= 1) return false;
  
  const elementStyle = window.getComputedStyle(element);
  
  // Check if this button has less visual emphasis than its siblings
  let hasLessEmphasis = false;
  for (const sibling of siblings) {
    if (sibling === element) continue;
    
    const siblingStyle = window.getComputedStyle(sibling);
    
    // Compare visual properties
    if ((siblingStyle.backgroundColor !== 'transparent' && elementStyle.backgroundColor === 'transparent') ||
        (parseInt(siblingStyle.fontSize) > parseInt(elementStyle.fontSize)) ||
        (siblingStyle.fontWeight > elementStyle.fontWeight) ||
        (siblingStyle.color === siblingStyle.backgroundColor && elementStyle.color !== elementStyle.backgroundColor)) {
      hasLessEmphasis = true;
      break;
    }
  }
  
  return hasLessEmphasis;
}

// Helper function to check for buried cancel buttons in multi-step flows
function checkForBuriedCancelButton(element) {
  // Check if this button is far down the page
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
  
  // Button is in the bottom 30% of the page
  const isLowOnPage = rect.top > documentHeight * 0.7;
  
  // Check if there are multiple steps or forms before this button
  const forms = document.querySelectorAll('form');
  const isMultiStep = forms.length > 1;
  
  // Check if there are offers or benefits listed above this button
  const elementPosition = getElementPosition(element);
  const benefitsAbove = document.querySelectorAll('ul, ol, div[class*="benefit"], div[class*="feature"], div[class*="offer"]');
  
  let hasBenefitsAbove = false;
  for (const benefit of benefitsAbove) {
    const benefitPosition = getElementPosition(benefit);
    if (benefitPosition < elementPosition) {
      hasBenefitsAbove = true;
      break;
    }
  }
  
  return (isLowOnPage && (isMultiStep || hasBenefitsAbove));
}

// Helper function to get the vertical position of an element in the document
function getElementPosition(element) {
  let position = 0;
  let currentElement = element;
  
  while (currentElement) {
    position += currentElement.offsetTop;
    currentElement = currentElement.offsetParent;
  }
  
  return position;
}

// Detect pre-checked options in forms
function detectPrecheckedOptions() {
  // Find all checkboxes and radio buttons
  const checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
  
  checkboxes.forEach(checkbox => {
    // Check if it's pre-checked
    if (checkbox.checked) {
      // Look for subscription-related text nearby
      const parent = findParentWithText(checkbox, 5);
      if (parent) {
        const text = parent.textContent.toLowerCase();
        if (text.includes('subscribe') || text.includes('newsletter') || 
            text.includes('renew') || text.includes('auto') || 
            text.includes('month') || text.includes('agree')) {
          // Create alert for pre-checked option
          createDarkPatternAlert(parent, "Pre-checked Option");
        }
      }
    }
  });
}

// Detect forced continuity patterns
function detectForcedContinuity() {
  // Find all text elements that might contain trial language
  const elements = document.querySelectorAll('p, span, div, small, footer');
  
  elements.forEach(element => {
    const text = element.textContent.toLowerCase();
    
    // Check for trial language with auto-renewal
    if ((text.includes('free trial') || text.includes('trial period') || text.includes('trial ends')) && 
        (text.includes('auto') || text.includes('renew') || text.includes('charg') || 
         text.includes('bill') || text.includes('subscription'))) {
      
      // Check if it's in small text or footer
      const style = window.getComputedStyle(element);
      const fontSize = parseInt(style.fontSize);
      const isSmallText = fontSize < 14;
      const isFooter = element.tagName === 'FOOTER' || 
                       element.closest('footer') !== null || 
                       element.parentElement.tagName === 'FOOTER';
      
      if (isSmallText || isFooter) {
        // Create alert for forced continuity
        createDarkPatternAlert(element, "Forced Continuity");
      }
    }
  });
}

// Helper function to create dark pattern alerts
function createDarkPatternAlert(element, patternType) {
  // Add highlight class
  element.classList.add("insite-highlight");
  
  // Create tooltip container
  const tooltip = document.createElement("div");
  tooltip.classList.add("insite-alert-tooltip");
  tooltip.innerHTML = `<strong>${patternType} Detected</strong>`;
  
  // Position the tooltip
  const rect = element.getBoundingClientRect();
  tooltip.style.position = "absolute";
  tooltip.style.top = `${rect.top + window.scrollY - 40}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.zIndex = "10000";
  tooltip.style.backgroundColor = "#ffeb3b";
  tooltip.style.color = "#000";
  tooltip.style.padding = "5px 10px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  tooltip.style.pointerEvents = "none";
  
  // Add to document
  document.body.appendChild(tooltip);
  
  // Create overlay for pre-checked options
  if (patternType === "Pre-checked Option") {
    const overlay = document.createElement("div");
    overlay.classList.add("insite-warning-overlay");
    overlay.style.position = "absolute";
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.backgroundColor = "rgba(255, 235, 59, 0.3)";
    overlay.style.border = "2px solid #ffeb3b";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);
  }
  
  // Add click event to show more information
  element.addEventListener("click", function(e) {
    // Only show info if it's not already showing
    if (!element.querySelector(".insite-highlight-body")) {
      highlight(element, patternType);
    }
    e.stopPropagation();
  });
}

// Helper function to check contrast
function isLowContrast(color, backgroundColor) {
  // Simple contrast check - convert colors to grayscale and compare
  function getRGB(str) {
    const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
  }
  
  const foreground = getRGB(color);
  const background = getRGB(backgroundColor);
  
  // Convert to grayscale using luminance formula
  const fgLuminance = 0.299 * foreground[0] + 0.587 * foreground[1] + 0.114 * foreground[2];
  const bgLuminance = 0.299 * background[0] + 0.587 * background[1] + 0.114 * background[2];
  
  // Calculate contrast ratio
  const contrast = Math.abs(fgLuminance - bgLuminance);
  
  return contrast < 50; // Low contrast threshold
}

// Helper function to find parent with relevant text
function findParentWithText(element, maxDepth) {
  let current = element;
  let depth = 0;
  
  while (current && depth < maxDepth) {
    if (current.textContent && current.textContent.trim().length > 0) {
      return current;
    }
    current = current.parentElement;
    depth++;
  }
  
  return null;
}

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.message === "analyze_site") {
//     scrape();
//   } else if (request.message === "popup_open") {
//     let element = document.getElementById("insite_count");
//     if (element) {
//       sendDarkPatterns(element.value);
//     }
//   }
// });
