// User Service - OPIDAS
// Manages user profile, progress, ranks, and resets

const UserService = {
    /**
     * Fetches the complete profile of the current user
     * @returns {Promise<Object>} - User profile with rank data
     */
    async getCurrentUserProfile() {
        try {
            console.log('👤 Fetching current user profile');

            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('User not authenticated');
            }

            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Calculate rank data
            const rankData = this.calculateRankData(profile.retention_days);

            console.log('✅ Profile loaded:', profile);

            return {
                ...profile,
                email: user.email,
                rankData: rankData
            };

        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            throw error;
        }
    },

    /**
     * Updates the user profile
     * @param {Object} data - Data to be updated
     * @returns {Promise<Object>} - Updated profile
     */
    async updateUserProfile(data) {
        try {
            console.log('📝 Updating user profile:', data);

            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('User not authenticated');
            }

            const { data: updatedProfile, error } = await window.supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Profile updated successfully');
            return updatedProfile;

        } catch (error) {
            console.error('❌ Error updating profile:', error);
            throw error;
        }
    },

    /**
     * Uploads the profile picture
     * @param {File} file - Image file
     * @returns {Promise<string>} - Image URL
     */
    async uploadAvatar(file) {
        try {
            console.log('📸 Uploading avatar');

            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Generate a unique name for the file
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to storage
            const { error: uploadError } = await window.supabase.storage
                .from('user-uploads')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = window.supabase.storage
                .from('user-uploads')
                .getPublicUrl(filePath);

            // Update the profile with the new URL
            await this.updateUserProfile({ avatar_url: publicUrl });

            console.log('✅ Avatar updated successfully');
            return publicUrl;

        } catch (error) {
            console.error('❌ Error uploading avatar:', error);
            throw error;
        }
    },

    /**
     * Calculates rank data based on retention days
     * @param {number} days - Retention days
     * @returns {Object} - Rank data
     */
    calculateRankData(days) {
        const ranks = [
            { id: 'recruta', level: 0, name: 'Recruit', minDays: 0, maxDays: 9, icon: 'assets/styles/images/patentes/Recruta.png' },
            { id: 'soldado', level: 1, name: 'Soldier', minDays: 10, maxDays: 29, icon: 'assets/styles/images/patentes/Soldado.png' },
            { id: 'cabo', level: 2, name: 'Corporal', minDays: 30, maxDays: 59, icon: 'assets/styles/images/patentes/Cabo.png' },
            { id: 'sargento', level: 3, name: 'Sergeant', minDays: 60, maxDays: 89, icon: 'assets/styles/images/patentes/Sargento.png' },
            { id: 'marechal', level: 4, name: 'Marshal', minDays: 90, maxDays: 179, icon: 'assets/styles/images/patentes/Marechal.png' },
            { id: 'tenente', level: 5, name: 'Lieutenant', minDays: 180, maxDays: 364, icon: 'assets/styles/images/patentes/Tenente.png' },
            { id: 'capitao', level: 6, name: 'Captain', minDays: 365, maxDays: Infinity, icon: 'assets/styles/images/patentes/Capitão.png' }
        ];

        for (const rank of ranks) {
            if (days >= rank.minDays && days <= rank.maxDays) {
                return rank;
            }
        }

        return ranks[0]; // Returns Recruit as default
    },

    /**
     * Processes the user's daily check-in
     * @returns {Promise<Object>} - Check-in result
     */
    async processDailyCheckin() {
        try {
            console.log('✅ Processing daily check-in');

            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await window.supabase
                .rpc('process_daily_checkin', { user_uuid: user.id });

            if (error) throw error;

            console.log('✅ Check-in processed:', data);
            return data;

        } catch (error) {
            console.error('❌ Error processing check-in:', error);
            throw error;
        }
    },

    /**
     * Resets the user's day count
     * @returns {Promise<Object>} - Reset result
     */
    async handleReset() {
        try {
            console.log('🔄 Requesting count reset');

            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Fetch current profile
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('retention_days, rank, remaining_resets')
                .eq('id', user.id)
                .single();

            if (profile.remaining_resets <= 0) {
                throw new Error('You have no more reset chances available');
            }

            // Save to history
            await window.supabase
                .from('reset_history')
                .insert({
                    user_id: user.id,
                    days_before_reset: profile.retention_days,
                    rank_before_reset: profile.rank
                });

            // Reset the count
            // ✅ FIX: We save the current date (today) instead of NULL so that the day count works correctly
            const today = new Date().toISOString();
            
            const { data: updatedProfile, error } = await window.supabase
                .from('profiles')
                .update({
                    retention_days: 0,
                    rank: 'recruta',
                    remaining_resets: profile.remaining_resets - 1,
                    last_habit_date: today
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Reset successful');
            return {
                success: true,
                remaining_resets: updatedProfile.remaining_resets
            };

        } catch (error) {
            console.error('❌ Error resetting count:', error);
            throw error;
        }
    },

    /**
     * Saves video progress
     * @param {number} episodeId - Episode ID
     * @param {number} progress - Progress in percentage (0-100)
     * @returns {Promise<void>}
     */
    async saveVideoProgress(episodeId, progress) {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            console.log(`💾 Saving video progress ${episodeId}: ${progress.toFixed(2)}%`);

            const { error } = await window.supabase
                .from('video_progress')
                .upsert({
                    user_id: user.id,
                    episode_id: episodeId,
                    progress_percentage: progress,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,episode_id'
                });

            if (error) throw error;

        } catch (error) {
            console.error('❌ Error saving video progress:', error);
        }
    },

    /**
     * Fetches progress for all user videos
     * @returns {Promise<Object>} - Object with episodeId: progress
     */
    async getVideoProgress() {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            console.log('📥 Fetching video progress');

            const { data, error } = await window.supabase
                .from('video_progress')
                .select('episode_id, progress_percentage')
                .eq('user_id', user.id);

            if (error) throw error;

            // Convert to object { episodeId: progress }
            const progressMap = {};
            data.forEach(item => {
                progressMap[item.episode_id] = item.progress_percentage;
            });

            return progressMap;

        } catch (error) {
            console.error('❌ Error fetching video progress:', error);
            return {};
        }
    },

    /**
     * Calculates days since onboarding
     * @param {string} onboardingDate - Onboarding date (ISO string)
     * @returns {number} - Number of days
     */
    calculateDaysSinceOnboarding(onboardingDate) {
        if (!onboardingDate) return 0;

        const onboarding = new Date(onboardingDate);
        onboarding.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = today - onboarding;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    },

    /**
     * Updates the progress bar and top-bar information
     * @param {HTMLElement} elements - DOM elements
     * @param {Object} profile - User profile
     */
    updateTopBar(elements, profile) {
        const { rankData } = profile;

        // Update avatar
        if (elements.avatar) {
            elements.avatar.src = profile.avatar_url || 'https://github.com/Dunegerb/OPIDAS/raw/ba479afa9718cc1bd2b6a3d4e75d7b1bbe0da0f4/public/assets/styles/images/profile-card.png';
        }

        // Update username
        if (elements.username) {
            elements.username.textContent = `${rankData.name} ${profile.last_name || ''}`;
        }

        // Update rank icon
        if (elements.rankIcon) {
            elements.rankIcon.src = rankData.icon;
        }

        // Update progress days
        const goalDays = isFinite(rankData.maxDays) ? rankData.maxDays + 1 : profile.retention_days;
        const progressPercentage = Math.min((profile.retention_days / goalDays) * 100, 100);

        if (elements.progressBar) {
            elements.progressBar.style.width = `${progressPercentage}%`;
        }

        if (elements.progressDays) {
            const currentDays = String(profile.retention_days).padStart(2, '0');
            const totalDays = String(goalDays).padStart(2, '0');
            elements.progressDays.innerHTML = `${currentDays}<span>/${totalDays} Days</span>`;
        }
    }
};

// Export for global use
window.UserService = UserService;
