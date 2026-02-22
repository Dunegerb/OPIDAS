// Main initialization file for the OPIDAS application
// Contains global initialization logic, user data loading, and UI updates

console.log("🚀 OPIDAS App initialized.");

/**
 * Centralized function to load and update the Top-Bar with real user data
 * Fetches the user profile from Supabase and updates all interface elements
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeProgressBar - Whether to update the progress bar (default: true)
 * @param {boolean} options.includeAvatar - Whether to update the avatar (default: true)
 * @param {boolean} options.includeUsername - Whether to update the username (default: true)
 * @param {boolean} options.skipRetentionSync - Whether to skip the automatic retention_days/rank synchronization (default: false)
 * @returns {Promise<Object>} - Returns the loaded user profile
 */
async function loadTopBar(options = {}) {
  const {
    includeProgressBar = true,
    includeAvatar = true,
    includeUsername = true,
    skipRetentionSync = false,
  } = options;

  try {
    console.log("📊 Loading Top-Bar data...");

    // Checks if UserService is available
    if (!window.UserService) {
      throw new Error(
        "UserService is not loaded. Make sure user.js has been included."
      );
    }

    // Fetches the complete user profile from Supabase
    const userProfile = await window.UserService.getCurrentUserProfile();

    if (!userProfile) {
      throw new Error("Could not load user profile");
    }

    console.log("✅ Profile loaded successfully:", userProfile);

    // Selects the DOM elements that need to be updated
    const topBarElements = {
      avatar: document.getElementById("user-avatar"),
      username: document.getElementById("welcome-username"),
      rankIcon: document.getElementById("status-rank-icon"),
      progressBar: document.getElementById("progress-bar-fill"),
      progressDays: document.getElementById("progress-days"),
    };

    // ------------------------------------------------------------
    // ✅ AUTOMATIC RETENTION SYNCHRONIZATION (WITHOUT "CHECK-IN")
    // ------------------------------------------------------------
    // Rule: If last_habit_date exists, the backend can recalculate:
    // retention_days = today - last_habit_date (in the correct timezone)
    // and rank = calculate_rank(retention_days)
    //
    // Here we just request this synchronization (without adding +1 on the frontend).
    if (!skipRetentionSync && userProfile.last_habit_date) {
      try {
        console.log("🧮 Automatically synchronizing retention (backend)...");

        // We keep the name processDailyCheckin for compatibility,
        // but it should NOT perform "check-in" logic.
        // It should only recalculate retention_days based on last_habit_date.
        const syncResult = await window.UserService.processDailyCheckin();

        if (syncResult && syncResult.success) {
          console.log("✅ Retention synchronized:", syncResult);

          userProfile.retention_days = syncResult.retention_days;
          userProfile.rank = syncResult.rank;
          userProfile.rankData = window.UserService.calculateRankData(
            userProfile.retention_days ?? 0
          );
        } else {
          console.log(
            "ℹ️ Synchronization not necessary:",
            syncResult?.message
          );
        }
      } catch (syncError) {
        console.warn("⚠️ Error synchronizing retention:", syncError);
        // Does not block loading if synchronization fails
      }
    } else {
      if (skipRetentionSync) {
        console.log("⏭️ Retention synchronization skipped (skipRetentionSync=true)");
      } else {
        console.log(
          "ℹ️ Synchronization skipped (last_habit_date is null: no relapse date set)."
        );
      }
    }

    // Ensures rankData even if it doesn't come from the database
    if (!userProfile.rankData) {
      const safeDays = userProfile.retention_days ?? 0;
      userProfile.rankData = window.UserService.calculateRankData(safeDays);
    }

    // ------------------------------------------------------------
    // Updates the user avatar
    // ------------------------------------------------------------
    if (includeAvatar && topBarElements.avatar) {
      topBarElements.avatar.src =
        userProfile.avatar_url ||
        "https://github.com/Dunegerb/OPIDAS/raw/ba479afa9718cc1bd2b6a3d4e75d7b1bbe0da0f4/public/assets/styles/images/profile-card.png";
      console.log("✅ Avatar updated");
    }

    // ------------------------------------------------------------
    // Updates the username with the rank
    // ------------------------------------------------------------
    if (includeUsername && topBarElements.username) {
      const rankName = userProfile.rankData?.name || "Recruit";
      const lastName = userProfile.last_name || "User";
      topBarElements.username.textContent = `${rankName} ${lastName}`;
      console.log(`✅ Username updated: ${rankName} ${lastName}`);
    }

    // ------------------------------------------------------------
    // Updates the rank icon
    // ------------------------------------------------------------
    if (topBarElements.rankIcon && userProfile.rankData) {
      topBarElements.rankIcon.src = userProfile.rankData.icon;
      console.log(`✅ Rank icon updated: ${userProfile.rankData.name}`);
    }

    // ------------------------------------------------------------
    // Updates the progress bar and day count
    // ------------------------------------------------------------
    if (includeProgressBar && topBarElements.progressBar && topBarElements.progressDays) {
      let retentionDays = userProfile.retention_days;

      // normalize null/undefined
      if (retentionDays === null || retentionDays === undefined) {
        retentionDays = 0;
      }

      // If last_habit_date is null, the count should remain at 0
      // (no relapse date set = nothing to count).
      if (!userProfile.last_habit_date && retentionDays === 0) {
        retentionDays = 0;
        userProfile.rankData = window.UserService.calculateRankData(0);
        console.log("ℹ️ last_habit_date is null. Keeping retention_days at 0.");
      }

      const rankData = userProfile.rankData || window.UserService.calculateRankData(retentionDays);

      // Goal days for the current rank
      const goalDays = isFinite(rankData.maxDays) ? rankData.maxDays + 1 : retentionDays;
      const progressPercentage = Math.min((retentionDays / goalDays) * 100, 100);

      topBarElements.progressBar.style.width = `${progressPercentage}%`;

      const currentDaysFormatted = String(retentionDays).padStart(2, "0");
      const totalDaysFormatted = String(goalDays).padStart(2, "0");
      topBarElements.progressDays.innerHTML = `${currentDaysFormatted}<span>/${totalDaysFormatted} Days</span>`;

      console.log(
        `✅ Progress bar updated: ${retentionDays}/${goalDays} days (${progressPercentage.toFixed(
          1
        )}%)`
      );
    }

    console.log("✅ Top-Bar loaded and updated successfully!");
    return userProfile;
  } catch (error) {
    console.error("❌ Error loading Top-Bar:", error);

    // fallback UI
    const topBarElements = {
      username: document.getElementById("welcome-username"),
      progressDays: document.getElementById("progress-days"),
    };

    if (topBarElements.username) {
      topBarElements.username.textContent = "Error loading";
    }
    if (topBarElements.progressDays) {
      topBarElements.progressDays.innerHTML = "00<span>/00 Days</span>";
    }

    throw error;
  }
}

/**
 * Function to reload the Top-Bar when there are changes to the user profile
 * Useful for updating the interface after actions (photo upload, reset, etc)
 */
async function refreshTopBar(options = {}) {
  console.log("🔄 Refreshing Top-Bar...");
  return await loadTopBar(options);
}

// Exports the functions for global use
window.loadTopBar = loadTopBar;
window.refreshTopBar = refreshTopBar;

console.log("✅ Top-Bar functions available globally");
