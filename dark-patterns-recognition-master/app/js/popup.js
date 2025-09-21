// This script is specifically written to match your popup.html file.

// Initialize gamification system
let gamificationSystem;

// We wrap the code in a DOMContentLoaded listener to ensure
// all HTML elements are loaded before the script tries to find them.
document.addEventListener("DOMContentLoaded", async function () {
  // Initialize gamification system
  gamificationSystem = new window.GamificationSystem();
  await gamificationSystem.loadData();

  // --- ELEMENT SELECTIONS based on your HTML ---
  const numberElement = document.querySelector(".number");
  const analyzeButton = document.querySelector(".analyze-button");
  const linkElement = document.querySelector(".link");
  const transparencyScore = document.getElementById("transparencyScore");
  const progressCircle = document.querySelector(".progress-circle");
  const progressValue = document.querySelector(".progress-value");
  const riskLevel = document.getElementById("riskLevel");
  const patternBreakdown = document.getElementById("patternBreakdown");
  const patternList = document.getElementById("patternList");
  const suggestedActions = document.getElementById("suggestedActions");
  const actionsList = document.getElementById("actionsList");
  const screenshotBtn = document.getElementById("screenshotBtn");

  // --- GAMIFICATION ELEMENT SELECTIONS ---
  const gamificationSection = document.getElementById("gamificationSection");
  const currentLevel = document.getElementById("currentLevel");
  const experienceFill = document.getElementById("experienceFill");
  const experienceText = document.getElementById("experienceText");
  const currentPoints = document.getElementById("currentPoints");
  const achievementsPreview = document.getElementById("achievementsPreview");
  const achievementNotification = document.getElementById(
    "achievementNotification"
  );
  const achievementText = document.getElementById("achievementText");
  const recentAchievements = document.getElementById("recentAchievements");
  const statsSection = document.getElementById("statsSection");
  const sitesAnalyzed = document.getElementById("sitesAnalyzed");
  const patternsFound = document.getElementById("patternsFound");
  const streakDays = document.getElementById("streakDays");
  const achievementsUnlocked = document.getElementById("achievementsUnlocked");

  // --- FUNCTIONS to update the UI ---
  function updateCount(count) {
    if (numberElement) {
      numberElement.textContent = count;
    }
  }

  function updateTransparencyScore(score, riskLevelText, riskColor) {
    if (progressValue && progressCircle && riskLevel) {
      progressValue.textContent = score;
      progressCircle.style.background = `conic-gradient(${riskColor} ${
        score * 3.6
      }deg, #2a2a2a 0deg)`;
      riskLevel.textContent = riskLevelText;
      riskLevel.style.color = riskColor;
    }
  }

  function updatePatternBreakdown(patternCounts) {
    if (patternList && patternBreakdown) {
      patternList.innerHTML = "";

      let hasPatterns = false;
      for (const [pattern, count] of Object.entries(patternCounts)) {
        if (count > 0) {
          hasPatterns = true;
          const patternItem = document.createElement("div");
          patternItem.className = "pattern-item";

          const patternName = document.createElement("span");
          patternName.textContent = pattern;

          const patternCount = document.createElement("span");
          patternCount.className = "pattern-count";
          patternCount.textContent = count;

          patternItem.appendChild(patternName);
          patternItem.appendChild(patternCount);
          patternList.appendChild(patternItem);
        }
      }

      if (hasPatterns) {
        patternBreakdown.style.display = "block";
      } else {
        patternBreakdown.style.display = "none";
      }
    }
  }
  const recommendationsData = {
        positiveFeedback: {
            highScore: `<h4>🎉 Great Transparency!</h4><p>This site appears to use ethical design practices like clear language and easy-to-find options.</p>`,
            perfectScore: `<h4>🏆 Excellent Work!</h4><p>This page is a model of transparent design, respecting your choices without deceptive tactics.</p>`
        },
        actionableFixes: {
            "Obstruction": `<h4>Actionable Tip: Hard to Cancel</h4><p>This pattern makes it difficult to leave. Try looking for "Manage Subscription" in the page footer or searching the page for "cancel".</p>`,
            "Urgency": `<h4>Actionable Tip: False Urgency</h4><p>This site uses timers or pressure language. These often reset if you reload the page. Take your time to consider the purchase.</p>`,
            "Scarcity": `<h4>Actionable Tip: False Scarcity</h4><p>Claims like "Only 2 left!" can be misleading. Check other retail sites to see if the product is truly scarce before rushing.</p>`,
            "Misdirection": `<h4>Actionable Tip: Misleading Design</h4><p>The design may be intentionally confusing. Read each option carefully and ignore any pre-selected "recommended" choices.</p>`,
            "Social Proof": `<h4>Actionable Tip: Fake Social Proof</h4><p>Messages like "15 people are viewing this" can be fake. Trust independent review sites over on-site testimonials.</p>`,
            "Sneaking": `<h4>Actionable Tip: Hidden Costs/Items</h4><p>Before you pay, review your order summary carefully for any unexpected items, fees, or automatically added insurance.</p>`,
            "Forced Action": `<h4>Actionable Tip: Forced Registration</h4><p>This site is forcing you to create an account. Consider if you can find a guest checkout option.</p>`
        },
        ethicalAlternatives: {
            "netflix": { mainService: "Netflix", alternatives: [{ name: "Kanopy", url: "https://www.kanopy.com/", reason: "Free access with many public library cards." }] },
            "amazon": { mainService: "Amazon", alternatives: [{ name: "Etsy", url: "https://www.etsy.com", reason: "Focuses on independent sellers." }] },
        }
    };

  // function updateSuggestedActions(patternCounts, currentUrl = "") {
  //   if (actionsList && suggestedActions) {
  //     actionsList.innerHTML = "";

  //     const actions = generateSuggestedActions(patternCounts, currentUrl);
  //     if (actions.length > 0) {
  //       actions.forEach((action) => {
  //         const actionItem = document.createElement("div");
  //         actionItem.className = `action-item ${action.riskLevel
  //           .toLowerCase()
  //           .replace(" ", "-")}-risk`;

  //         const actionTitle = document.createElement("div");
  //         actionTitle.className = "action-title";
  //         actionTitle.textContent = action.title;

  //         const actionDesc = document.createElement("div");
  //         actionDesc.className = "action-description";
  //         actionDesc.textContent = action.description;

  //         if (action.alternative) {
  //           const alternativeBtn = document.createElement("div");
  //           alternativeBtn.className = "action-alternative";
  //           alternativeBtn.textContent = `Try ${action.alternative}`;
  //           alternativeBtn.onclick = () => {
  //             if (action.alternativeUrl) {
  //               chrome.tabs.create({ url: action.alternativeUrl });
  //             }
  //           };
  //           actionDesc.appendChild(alternativeBtn);
  //         }

  //         actionItem.appendChild(actionTitle);
  //         actionItem.appendChild(actionDesc);
  //         actionsList.appendChild(actionItem);
  //       });

  //       suggestedActions.style.display = "block";
  //     } else {
  //       suggestedActions.style.display = "none";
  //     }
  //   }
  // }

  function updateSuggestedActions(patternCounts, score, currentUrl = "") {
        if (actionsList && suggestedActions) {
            actionsList.innerHTML = "";
            const recommendationsHTML = generateSuggestedActions(patternCounts, score, currentUrl);
            if (recommendationsHTML) {
                actionsList.innerHTML = recommendationsHTML;
                suggestedActions.style.display = "block";
            } else {
                suggestedActions.style.display = "none";
            }
        }
    }

  function generateSuggestedActions(patternCounts, score, currentUrl) {
        if (score === "..." || score === "n/a" || score === undefined) return "";
        
        let html = '';
        const hostname = currentUrl ? new URL(currentUrl).hostname.toLowerCase() : "";

        // Show positive feedback for high scores
        if (score >= 80) {
            html += `<div class="action-item positive-feedback">${score === 100 ? recommendationsData.positiveFeedback.perfectScore : recommendationsData.positiveFeedback.highScore}</div>`;
        }

        // Show actionable fixes for detected patterns
        for (const patternType in patternCounts) {
            if (recommendationsData.actionableFixes[patternType]) {
                html += `<div class="action-item high-risk">${recommendationsData.actionableFixes[patternType]}</div>`;
            }
        }

        // Show ethical alternatives
        for (const key in recommendationsData.ethicalAlternatives) {
            if (hostname.includes(key)) {
                const altData = recommendationsData.ethicalAlternatives[key];
                html += `<h4>Ethical Alternatives to ${altData.mainService}:</h4>`;
                altData.alternatives.forEach(alt => {
                    html += `<div class="alternative-card"><strong><a href="${alt.url}" target="_blank">${alt.name}</a></strong><p>${alt.reason}</p></div>`;
                });
                break;
            }
        }
        return html;
    }
    
  // function generateSuggestedActions(patternCounts, currentUrl) {
  //   const actions = [];
  //   const hostname = currentUrl
  //     ? new URL(currentUrl).hostname.toLowerCase()
  //     : "";

  //   // Urgency patterns
  //   if (patternCounts.Urgency > 0) {
  //     actions.push({
  //       title: "Urgency Tactics Detected",
  //       description:
  //         "This site uses time pressure to influence decisions. Take your time to make informed choices.",
  //       riskLevel: "Medium",
  //       alternative: null,
  //     });
  //   }

  //   // Sneaking patterns
  //   if (patternCounts.Sneaking > 0) {
  //     actions.push({
  //       title: "Hidden Information Found",
  //       description:
  //         "Information is being obscured. Look for terms & conditions, cancellation policies, and hidden fees.",
  //       riskLevel: "High",
  //       alternative: null,
  //     });
  //   }

  //   // Misdirection patterns
  //   if (patternCounts.Misdirection > 0) {
  //     actions.push({
  //       title: "Misdirection Detected",
  //       description:
  //         "The site may be steering you away from better options. Compare alternatives before deciding.",
  //       riskLevel: "Medium",
  //       alternative: null,
  //     });
  //   }

  //   // Social Proof patterns
  //   if (patternCounts["Social Proof"] > 0) {
  //     actions.push({
  //       title: "Social Proof Manipulation",
  //       description:
  //         "Fake reviews or testimonials detected. Check independent review sites for genuine feedback.",
  //       riskLevel: "Medium",
  //       alternative: null,
  //     });
  //   }

  //   // Scarcity patterns
  //   if (patternCounts.Sarcity > 0) {
  //     actions.push({
  //       title: "Scarcity Claims",
  //       description:
  //         "Limited availability claims may be artificial. Similar products are usually available elsewhere.",
  //       riskLevel: "Low",
  //       alternative: null,
  //     });
  //   }

  //   // Obstruction patterns
  //   if (patternCounts.Obstruction > 0) {
  //     actions.push({
  //       title: "Intentional Barriers",
  //       description:
  //         "The site makes it difficult to cancel or opt-out. Save cancellation instructions for later.",
  //       riskLevel: "High",
  //       alternative: null,
  //     });
  //   }

  //   // Forced Action patterns
  //   if (patternCounts["Forced Action"] > 0) {
  //     actions.push({
  //       title: "Forced Actions Required",
  //       description:
  //         "Extra steps are required that shouldn't be necessary. Consider if you really need this service.",
  //       riskLevel: "High",
  //       alternative: null,
  //     });
  //   }

  //   // Add service-specific alternatives
  //   if (hostname.includes("netflix")) {
  //     actions.push({
  //       title: "Better Streaming Alternative",
  //       description:
  //         "Consider services with easier cancellation and better content libraries.",
  //       riskLevel: "Low",
  //       alternative: "Disney+",
  //       alternativeUrl: "https://www.disneyplus.com",
  //     });
  //   } else if (hostname.includes("amazon")) {
  //     actions.push({
  //       title: "Alternative Marketplace",
  //       description:
  //         "Consider ethical alternatives with better customer service and return policies.",
  //       riskLevel: "Low",
  //       alternative: "Etsy",
  //       alternativeUrl: "https://www.etsy.com",
  //     });
  //   } else if (hostname.includes("spotify")) {
  //     actions.push({
  //       title: "Better Music Alternative",
  //       description: "Services with better discovery algorithms and fewer ads.",
  //       riskLevel: "Low",
  //       alternative: "YouTube Music",
  //       alternativeUrl: "https://music.youtube.com",
  //     });
  //   }

  //   return actions;
  // }

  function resetAnalysis() {
    updateCount("n/a");
    updateTransparencyScore("n/a", "Not Analyzed", "#B8B8B8");
    if (patternBreakdown) {
      patternBreakdown.style.display = "none";
    }
    if (suggestedActions) {
      suggestedActions.style.display = "none";
    }
    if (screenshotBtn) {
      screenshotBtn.style.display = "none";
    }
  }

  async function takeScreenshot(type = "full") {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const currentTab = tabs[0];

      if (type === "highlighted") {
        // For highlighted elements, we need to communicate with content script
        chrome.tabs.sendMessage(
          currentTab.id,
          { action: "captureHighlightedElements" },
          async function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              return;
            }
            
            if (response && response.success) {
              processScreenshot(response.dataUrl, currentTab);
            }
          }
        );
      } else {
        // Full page screenshot
        chrome.tabs.captureVisibleTab(
          null,
          { format: "png" },
          async function (dataUrl) {
            if (chrome.runtime.lastError) {
              console.error(
                "Screenshot failed:",
                chrome.runtime.lastError.message
              );
              return;
            }
            
            processScreenshot(dataUrl, currentTab);
          }
        );
      }
    });
  }
  
  async function processScreenshot(dataUrl, currentTab) {
    // Get current analysis data for the report
    chrome.storage.local.get(["currentAnalysis"], async function (result) {
      const analysisData = result.currentAnalysis || {};
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const hostname = currentTab.url
        ? new URL(currentTab.url).hostname
        : "unknown";
      const filename = `dark-patterns-${hostname}-${timestamp}.png`;
      
      // Create a report object with all relevant data
      const report = {
        timestamp: new Date().toISOString(),
        url: currentTab.url,
        title: currentTab.title,
        screenshot: dataUrl,
        transparencyScore: analysisData.transparencyScore || "n/a",
        riskLevel: analysisData.riskLevel || "Not Analyzed",
        patternCounts: analysisData.patternCounts || {},
        totalPatterns: analysisData.totalPatterns || 0,
        darkPatterns: analysisData.darkPatterns || []
      };
      
      // Store the report in local storage
      chrome.storage.local.get(["reports"], function (result) {
        const reports = result.reports || [];
        reports.push(report);
        chrome.storage.local.set({ reports: reports });
      });

      // Create DOC report using HTML
      try {
        // Create HTML content for the DOC file
        let htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
          <head>
            <meta charset="utf-8">
            <title>Dark Patterns Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #2E8B57; text-align: center; }
              h2 { color: #333; margin-top: 20px; }
              .info { margin-bottom: 20px; }
              .score { font-size: 18px; font-weight: bold; }
              .pattern-item { margin: 5px 0; }
              .screenshot { margin-top: 30px; text-align: center; }
              img { max-width: 100%; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <h1>Dark Patterns Report</h1>
            
            <div class="info">
              <p><strong>Website:</strong> ${currentTab.title}</p>
              <p><strong>URL:</strong> ${currentTab.url}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <h2>Transparency Score</h2>
            <p class="score">Score: ${report.transparencyScore}</p>
            <p>Risk Level: ${report.riskLevel}</p>
            
            <h2>Pattern Breakdown</h2>
        `;
        
        // Add pattern counts
        if (Object.keys(report.patternCounts).length > 0) {
          htmlContent += '<ul>';
          for (const pattern in report.patternCounts) {
            htmlContent += `<li class="pattern-item">${pattern}: ${report.patternCounts[pattern]}</li>`;
          }
          htmlContent += '</ul>';
        } else {
          htmlContent += '<p>No patterns detected</p>';
        }
        
        // Add screenshot if available
        if (dataUrl) {
          htmlContent += `
            <div class="screenshot">
              <h2>Screenshot</h2>
              <img src="${dataUrl}" alt="Website Screenshot">
            </div>
          `;
        }
        
        // Close HTML document
        htmlContent += `
          </body>
          </html>
        `;
        
        // Create Blob and download
        const docBlob = new Blob([htmlContent], { type: 'application/msword' });
        const docUrl = URL.createObjectURL(docBlob);
        const docFilename = `dark-patterns-report-${hostname}-${timestamp}.doc`;
        
        const docLink = document.createElement("a");
        docLink.href = docUrl;
        docLink.download = docFilename;
        document.body.appendChild(docLink);
        docLink.click();
        document.body.removeChild(docLink);
        URL.revokeObjectURL(docUrl);
        
      } catch (error) {
        console.error("Error generating DOC report:", error);
      }
      
      // Download the screenshot separately
      const imgLink = document.createElement("a");
      imgLink.href = dataUrl;
      imgLink.download = filename;
      document.body.appendChild(imgLink);
      imgLink.click();
      document.body.removeChild(imgLink);

      // Award gamification points for screenshot
      if (gamificationSystem) {
        const result = await gamificationSystem.onScreenshotTaken();
        showGamificationReward("📸 Screenshot & Report!", result.pointsEarned);
        updateGamificationDisplay();
      }

      // Show success feedback
      const originalText = screenshotBtn.textContent;
      screenshotBtn.textContent = "✅ REPORT SAVED!";
      screenshotBtn.style.backgroundColor = "#228B22";

      setTimeout(() => {
        screenshotBtn.textContent = originalText;
        screenshotBtn.style.backgroundColor = "#2E8B57";
      }, 2000);
    });
  }

  // --- GAMIFICATION FUNCTIONS ---
  function updateGamificationDisplay() {
    if (!gamificationSystem) return;

    const status = gamificationSystem.getStatus();

    // Update level and experience
    if (currentLevel) currentLevel.textContent = status.level;
    if (experienceFill) experienceFill.style.width = `${status.levelProgress}%`;
    if (experienceText) {
      experienceText.textContent = `${status.experience} / ${status.nextLevelExp} XP`;
    }

    // Update points
    if (currentPoints) currentPoints.textContent = status.points;

    // Update stats
    if (sitesAnalyzed)
      sitesAnalyzed.textContent = status.stats.uniqueSites.size;
    if (patternsFound) patternsFound.textContent = status.stats.patternsFound;
    if (streakDays) streakDays.textContent = status.stats.streakDays;
    if (achievementsUnlocked)
      achievementsUnlocked.textContent = status.unlockedAchievements.length;

    // Show gamification section if user has started
    if (
      gamificationSection &&
      (status.points > 0 || status.stats.uniqueSites.size > 0)
    ) {
      gamificationSection.style.display = "block";
      statsSection.style.display = "block";
    }

    // Update recent achievements
    updateRecentAchievements(status.unlockedAchievements);
  }

  function updateRecentAchievements(achievements) {
    if (!recentAchievements) return;

    recentAchievements.innerHTML = "";

    // Show up to 3 most recent achievements
    const recentOnes = achievements.slice(-3).reverse();

    recentOnes.forEach((achievement) => {
      const achievementElement = document.createElement("div");
      achievementElement.className = "achievement-item";
      achievementElement.innerHTML = `
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-info">
          <span class="achievement-title">${achievement.title}</span>
          <span class="achievement-desc">${achievement.description}</span>
        </div>
      `;
      recentAchievements.appendChild(achievementElement);
    });

    if (recentOnes.length > 0 && achievementsPreview) {
      achievementsPreview.style.display = "block";
    }
  }

  function showGamificationReward(message, points) {
    // Create a temporary notification
    const notification = document.createElement("div");
    notification.className = "gamification-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">⭐</span>
        <span class="notification-text">${message}</span>
        <span class="notification-points">+${points} pts</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add("show"), 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  function showAchievementNotification(achievements) {
    if (!achievements || achievements.length === 0) return;

    achievements.forEach((achievement) => {
      if (achievementNotification && achievementText) {
        achievementText.textContent = `${achievement.icon} ${achievement.title} unlocked!`;
        achievementNotification.style.display = "block";

        // Hide after 4 seconds
        setTimeout(() => {
          achievementNotification.style.display = "none";
        }, 4000);
      }
    });
  }

  // Initialize gamification display
  updateGamificationDisplay();

  // --- EVENT LISTENERS ---

  // When the popup opens, immediately ask the content script for its current status.
 chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    const currentTab = tabs[0];

    // Check if we are on a real, analyzable webpage.
    if (currentTab && currentTab.id && currentTab.url && (currentTab.url.startsWith('http://') || currentTab.url.startsWith('https://'))) {
        // This is a real website, so we can safely send the message.
        chrome.tabs.sendMessage(
            currentTab.id,
            { message: "popup_open" },
            function (response) {
                if (chrome.runtime.lastError) {
                    console.warn("Content script not ready yet. Waiting for user action.");
                    resetAnalysis(); // Use your reset function for a clean initial state.
                }
            }
        );
    } else {
        // This is a protected browser page (like New Tab or chrome://extensions).
        // Give the user a helpful message instead of showing an error.
        console.log("On a protected browser page. Informing the user.");
        resetAnalysis(); // Set the UI to its base state first.
        
        // --- THIS IS THE USER ALERT YOU WANTED ---
        // We'll use the "suggested actions" section to display the message.
        if (suggestedActions && actionsList) {
            actionsList.innerHTML = `
                <div class="action-item info-risk">
                    <div class="action-title">Protected Page</div>
                    <div class="action-description">
                        For your security, this extension cannot analyze internal browser pages or the Chrome Web Store. Please navigate to a website to begin analysis.
                    </div>
                </div>
            `;
            suggestedActions.style.display = 'block';
        }
    }
  });

  // Set up the click listener for the "ANALYZE SITE" button.
  if (analyzeButton) {
    analyzeButton.onclick = function () {
      // Show loading state
      analyzeButton.classList.add("loading");
      analyzeButton.textContent = "ANALYZING...";
      analyzeButton.disabled = true;

      // Reset the UI to show analyzing state
      updateCount("...");
      updateTransparencyScore("...", "Analyzing...", "#FFA500");

      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });
      });
    };
  }

  // Set up the click listener for the "What are dark patterns?" link.
  if (linkElement) {
    linkElement.onclick = function (e) {
      e.preventDefault(); // Prevent the link from navigating away
      chrome.tabs.create({ url: linkElement.getAttribute("href") });
    };
  }

  // Set up the click listener for the screenshot button.
  if (screenshotBtn) {
    // Create dropdown menu for screenshot options
    const screenshotOptions = document.createElement("div");
    screenshotOptions.className = "screenshot-options";
    screenshotOptions.style.display = "none";
    screenshotOptions.innerHTML = `
      <button class="screenshot-option" id="fullPageScreenshot">Full Page Screenshot</button>
      <button class="screenshot-option" id="highlightedElementsScreenshot">Highlighted Elements Only</button>
    `;
    screenshotBtn.parentNode.insertBefore(screenshotOptions, screenshotBtn.nextSibling);
    
    // Show options on screenshot button click
    screenshotBtn.onclick = function() {
      if (screenshotOptions.style.display === "none") {
        screenshotOptions.style.display = "block";
      } else {
        screenshotOptions.style.display = "none";
      }
    };
    
    // Full page screenshot
    document.getElementById("fullPageScreenshot").addEventListener("click", function() {
      screenshotOptions.style.display = "none";
      takeScreenshot("full");
    });
    
    // Highlighted elements screenshot
    document.getElementById("highlightedElementsScreenshot").addEventListener("click", function() {
      screenshotOptions.style.display = "none";
      takeScreenshot("highlighted");
    });
  }

  // Set up the listener to receive messages from content.js
  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.message === "update_current_count") {
      updateCount(request.count);

      // Reset loading state
      if (analyzeButton) {
        analyzeButton.classList.remove("loading");
        analyzeButton.textContent = "ANALYZE SITE";
        analyzeButton.disabled = false;
      }

      // If count is "?", reset the analysis UI
      if (request.count === "?") {
        resetAnalysis();
      }
    } else if (request.message === "update_detailed_analysis") {
      // Update all the detailed analysis information
      updateCount(request.count);
      updateTransparencyScore(
        request.transparency_score,
        request.risk_level,
        request.risk_color
      );
      updatePatternBreakdown(request.pattern_counts);
      
      // Store the analysis data for report generation
      const currentAnalysis = {
        transparencyScore: request.transparency_score,
        riskLevel: request.risk_level,
        riskColor: request.risk_color,
        patternCounts: request.pattern_counts,
        totalPatterns: request.total_patterns,
        darkPatterns: request.dark_patterns || []
      };
      chrome.storage.local.set({ currentAnalysis: currentAnalysis });

      // Show screenshot button if patterns were found
      if (screenshotBtn && parseInt(request.count) > 0) {
        screenshotBtn.style.display = "block";
      }

      // Get current tab URL for suggested actions and gamification
      chrome.tabs.query(
        { currentWindow: true, active: true },
        async function (tabs) {
          const currentUrl = tabs[0]?.url || "";
          updateSuggestedActions(request.pattern_counts, currentUrl);

          // Handle gamification for site analysis
          if (gamificationSystem && request.count !== "?") {
            const patternCount = parseInt(request.count) || 0;
            const result = await gamificationSystem.onSiteAnalyzed(
              patternCount,
              request.risk_level,
              currentUrl
            );

            // Show points earned notification
            if (result.pointsEarned > 0) {
              const message = result.isNewSite
                ? "🔍 New site analyzed!"
                : "🔍 Site re-analyzed!";
              showGamificationReward(message, result.pointsEarned);
            }

            // Show achievement notifications
            if (result.newAchievements.length > 0) {
              showAchievementNotification(result.newAchievements);
            }

            // Update display
            updateGamificationDisplay();
          }
        }
      );

      // Reset loading state
      if (analyzeButton) {
        analyzeButton.classList.remove("loading");
        analyzeButton.textContent = "ANALYZE SITE";
        analyzeButton.disabled = false;
      }
    }
  });
});
// // --- popup.js (REPLACE the entire file with this) ---

// window.onload = function () {
//   // When the popup opens, immediately ask the content script for its status.
//   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, { message: "popup_open" }, function(response) {
//       if (chrome.runtime.lastError) {
//         // This catches the error if the content script isn't ready.
//         // We can just have the user click the button to start.
//         console.warn("Content script not ready, waiting for user action.");
//         document.getElementsByClassName("number")[0].textContent = "?";
//         document.getElementsByClassName("number-container")[0].classList.add('ready-to-scan');
//       }
//     });
//   });

//   // Setup the analyze button click listener
//   document.getElementsByClassName("analyze-button")[0].onclick = function () {
//     // Show a loading/analyzing state in the UI
//     document.getElementsByClassName("number")[0].textContent = "...";
//     document.getElementsByClassName("number-container")[0].classList.remove('ready-to-scan');

//     // Send the message to start the analysis
//     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });
//     });
//   };

//   // Setup the link click listener
//   document.getElementsByClassName("link")[0].onclick = function () {
//     chrome.tabs.create({
//       url: document.getElementsByClassName("link")[0].getAttribute("href"),
//     });
//   };
// };

// // Listen for the final count from the content script
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.message === "update_current_count") {
//     document.getElementsByClassName("number")[0].textContent = request.count;
//     if (request.count === "?") {
//         document.getElementsByClassName("number-container")[0].classList.add('ready-to-scan');
//     } else {
//         document.getElementsByClassName("number-container")[0].classList.remove('ready-to-scan');
//     }
//   }
// });

// // window.onload = function () {
// //   chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
// //     chrome.tabs.sendMessage(tabs[0].id, { message: "popup_open" });
// //   });

// //   document.getElementsByClassName("analyze-button")[0].onclick = function () {
// //     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
// //       chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });
// //     });
// //   };

// //   document.getElementsByClassName("link")[0].onclick = function () {
// //     chrome.tabs.create({
// //       url: document.getElementsByClassName("link")[0].getAttribute("href"),
// //     });
// //   };
// // };

// // chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// //   if (request.message === "update_current_count") {
// //     document.getElementsByClassName("number")[0].textContent = request.count;
// //   }
// // });
