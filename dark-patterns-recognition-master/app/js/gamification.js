// Gamification System for Dark Patterns Recognition Extension

class GamificationSystem {
  constructor() {
    this.data = {
      points: 0,
      level: 1,
      experience: 0,
      achievements: [],
      stats: {
        sitesAnalyzed: 0,
        patternsFound: 0,
        highRiskSites: 0,
        screenshotsTaken: 0,
        streakDays: 0,
        lastActiveDate: null,
        uniqueSites: new Set(),
      },
      unlockedAchievements: new Set(),
    };

    this.achievements = {
      // Analysis achievements
      firstAnalysis: {
        id: "firstAnalysis",
        title: "First Scan",
        description: "Complete your first site analysis",
        icon: "🔍",
        points: 10,
        requirement: { sitesAnalyzed: 1 },
      },
      patternHunter: {
        id: "patternHunter",
        title: "Pattern Hunter",
        description: "Find your first dark pattern",
        icon: "🎯",
        points: 25,
        requirement: { patternsFound: 1 },
      },
      riskDetector: {
        id: "riskDetector",
        title: "Risk Detector",
        description: "Identify a high-risk site",
        icon: "⚠️",
        points: 50,
        requirement: { highRiskSites: 1 },
      },

      // Milestone achievements
      analyst: {
        id: "analyst",
        title: "Privacy Analyst",
        description: "Analyze 10 unique sites",
        icon: "🕵️",
        points: 100,
        requirement: { sitesAnalyzed: 10 },
      },
      investigator: {
        id: "investigator",
        title: "Dark Pattern Investigator",
        description: "Find 50 dark patterns across all sites",
        icon: "🔎",
        points: 200,
        requirement: { patternsFound: 50 },
      },
      guardian: {
        id: "guardian",
        title: "Privacy Guardian",
        description: "Identify 5 high-risk sites",
        icon: "🛡️",
        points: 150,
        requirement: { highRiskSites: 5 },
      },

      // Daily achievements
      streakStarter: {
        id: "streakStarter",
        title: "Getting Started",
        description: "Use the extension for 3 consecutive days",
        icon: "📅",
        points: 75,
        requirement: { streakDays: 3 },
      },
      dedicated: {
        id: "dedicated",
        title: "Dedicated User",
        description: "Use the extension for 7 consecutive days",
        icon: "🔥",
        points: 150,
        requirement: { streakDays: 7 },
      },

      // Special achievements
      photographer: {
        id: "photographer",
        title: "Evidence Collector",
        description: "Take your first screenshot of dark patterns",
        icon: "📸",
        points: 30,
        requirement: { screenshotsTaken: 1 },
      },
    };

    this.levelThresholds = [
      0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500,
      5200, 5950, 6750, 7600, 8500, 9450, 10450,
    ];
  }

  // Initialize from stored data
  async loadData() {
    try {
      const result = await chrome.storage.local.get(["gamificationData"]);
      if (result.gamificationData) {
        this.data = { ...this.data, ...result.gamificationData };
        this.data.unlockedAchievements = new Set(
          this.data.unlockedAchievements || []
        );
        this.data.stats.uniqueSites = new Set(
          this.data.stats.uniqueSites || []
        );
      }
    } catch (error) {
      console.error("Failed to load gamification data:", error);
    }
  }

  // Save data to storage
  async saveData() {
    try {
      await chrome.storage.local.set({
        gamificationData: {
          ...this.data,
          unlockedAchievements: Array.from(this.data.unlockedAchievements),
          stats: {
            ...this.data.stats,
            uniqueSites: Array.from(this.data.stats.uniqueSites),
          },
        },
      });
    } catch (error) {
      console.error("Failed to save gamification data:", error);
    }
  }

  // Calculate experience needed for next level
  getExperienceForNextLevel() {
    const currentLevel = this.data.level;
    if (currentLevel >= this.levelThresholds.length) {
      return this.levelThresholds[this.levelThresholds.length - 1];
    }
    return this.levelThresholds[currentLevel - 1];
  }

  // Calculate current level progress (0-100)
  getLevelProgress() {
    const currentLevelExp = this.levelThresholds[this.data.level - 1] || 0;
    const nextLevelExp = this.getExperienceForNextLevel();
    const currentExpInLevel = this.data.experience - currentLevelExp;
    const expNeededForNext = nextLevelExp - currentLevelExp;

    if (expNeededForNext === 0) return 100;
    return Math.min(
      100,
      Math.max(0, (currentExpInLevel / expNeededForNext) * 100)
    );
  }

  // Add points and experience
  addPoints(points) {
    this.data.points += points;
    this.data.experience += points;
    this.checkLevelUp();
    this.saveData();
  }

  // Check for level up
  checkLevelUp() {
    while (
      this.data.level < this.levelThresholds.length &&
      this.data.experience >= this.levelThresholds[this.data.level]
    ) {
      this.data.level++;
      // Could add level up notifications here
    }
  }

  // Check and unlock achievements
  checkAchievements() {
    const newAchievements = [];

    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (!this.data.unlockedAchievements.has(achievement.id)) {
        let unlocked = true;

        for (const [stat, required] of Object.entries(
          achievement.requirement
        )) {
          if ((this.data.stats[stat] || 0) < required) {
            unlocked = false;
            break;
          }
        }

        if (unlocked) {
          this.data.unlockedAchievements.add(achievement.id);
          newAchievements.push(achievement);
        }
      }
    }

    if (newAchievements.length > 0) {
      this.saveData();
    }

    return newAchievements;
  }

  // Update streak
  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this.data.stats.lastActiveDate;

    if (lastActive === null) {
      this.data.stats.streakDays = 1;
    } else if (lastActive === today) {
      // Already active today, don't increment
      return;
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive === yesterday.toDateString()) {
        this.data.stats.streakDays++;
      } else {
        this.data.stats.streakDays = 1;
      }
    }

    this.data.stats.lastActiveDate = today;
    this.saveData();
  }

  // Event handlers for different actions
  async onSiteAnalyzed(patternCount, riskLevel, url = "") {
    this.updateStreak();

    // Extract domain from URL for unique site tracking
    let domain = "";
    try {
      if (url) {
        domain = new URL(url).hostname.toLowerCase();
      }
    } catch (error) {
      console.warn("Could not parse URL for unique site tracking:", error);
    }

    // Check if this is a new unique site
    const isNewSite = domain && !this.data.stats.uniqueSites.has(domain);
    if (isNewSite) {
      this.data.stats.uniqueSites.add(domain);
      this.data.stats.sitesAnalyzed++;
    }

    // Points based on patterns found (always give points for analysis)
    const basePoints = 5; // Base points for analyzing a site
    const patternPoints = patternCount * 2; // 2 points per pattern
    const totalPoints = basePoints + patternPoints;

    this.addPoints(totalPoints);

    // Update stats
    this.data.stats.patternsFound += patternCount;
    if (riskLevel === "High") {
      this.data.stats.highRiskSites++;
    }

    // Check for new achievements
    const newAchievements = this.checkAchievements();

    await this.saveData();

    return {
      pointsEarned: totalPoints,
      newAchievements: newAchievements,
      newLevel: this.data.level,
      isNewSite: isNewSite,
    };
  }

  async onScreenshotTaken() {
    this.data.stats.screenshotsTaken++;
    this.addPoints(10); // 10 points for taking a screenshot

    const newAchievements = this.checkAchievements();
    await this.saveData();

    return {
      pointsEarned: 10,
      newAchievements: newAchievements,
    };
  }

  // Get current status for display
  getStatus() {
    return {
      points: this.data.points,
      level: this.data.level,
      experience: this.data.experience,
      nextLevelExp: this.getExperienceForNextLevel(),
      levelProgress: this.getLevelProgress(),
      stats: this.data.stats,
      unlockedAchievements: Array.from(this.data.unlockedAchievements).map(
        (id) => this.achievements[id]
      ),
    };
  }

  // Get available achievements (not yet unlocked)
  getAvailableAchievements() {
    return Object.values(this.achievements).filter(
      (achievement) => !this.data.unlockedAchievements.has(achievement.id)
    );
  }
}

// Export for use in other scripts
window.GamificationSystem = GamificationSystem;
