// Supabase Client Configuration - OPIDAS (OPTIMIZED)
// This file initializes and configures the Supabase client with caching and optimizations

(function() {
    'use strict';

    // ⚠️ IMPORTANT: Replace these variables with your Supabase credentials
    const SUPABASE_URL = 'https://vkdywsawrftrpxjaxejs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZHl3c2F3cmZ0cnB4amF4ZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTc1OTMsImV4cCI6MjA3ODQzMzU5M30.5ro31_G_sIGJ1lz_rHmVNRK5XnjTbMocfkjwDJqaees';

    // ✅ CACHE SYSTEM - Improves performance
    const CACHE_CONFIG = {
        PROFILE_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
        USER_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
    };

    const cache = {
        profile: { data: null, timestamp: 0 },
        user: { data: null, timestamp: 0 },
    };

    function isCacheValid(cacheKey) {
        const now = Date.now();
        return cache[cacheKey].data && (now - cache[cacheKey].timestamp) < CACHE_CONFIG[cacheKey.toUpperCase() + '_CACHE_TIME'];
    }

    function setCache(cacheKey, data) {
        cache[cacheKey] = { data, timestamp: Date.now() };
    }

    function getCache(cacheKey) {
        return cache[cacheKey].data;
    }

    function clearCache(cacheKey) {
        cache[cacheKey] = { data: null, timestamp: 0 };
    }

    // Checks if the Supabase script has been loaded
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        console.error('❌ ERROR: Supabase library not loaded');
        console.error('📖 Add the Supabase script to your HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return;
    }

    // Creates the Supabase client with optimizations
    try {
        const { createClient } = window.supabase;
        
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'opidas-auth-token',
            },
            realtime: {
                params: {
                    eventsPerSecond: 5 // ✅ REDUCED for better performance
                }
            },
            // ✅ NEW: Reduced timeout for fast failures
            global: {
                headers: {
                    'X-Client-Info': 'opidas-web'
                }
            }
        });

        // Makes the client available globally
        window.supabase = supabaseClient;
        
        // ✅ NEW: Function to clear cache
        window.clearSupabaseCache = function(cacheKey) {
            if (cacheKey) {
                clearCache(cacheKey);
                console.log(`✅ Cache cleared: ${cacheKey}`);
            } else {
                cache.profile = { data: null, timestamp: 0 };
                cache.user = { data: null, timestamp: 0 };
                console.log('✅ All cache cleared');
            }
        };
        
        console.log('✅ Supabase client initialized successfully');

        // Monitors authentication state changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth event:', event);
            
            if (event === 'SIGNED_IN') {
                console.log('✅ User authenticated:', session.user.email);
                // ✅ NEW: Clears cache on login
                clearCache('profile');
                clearCache('user');
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out');
                // ✅ NEW: Clears cache on logout
                clearCache('profile');
                clearCache('user');
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.endsWith('/')) {
                    window.location.href = '/index.html';
                }
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Token refreshed');
            } else if (event === 'USER_UPDATED') {
                console.log('👤 User data updated');
                // ✅ NEW: Clears cache when user is updated
                clearCache('profile');
            }
        });

        // Helper function to check authentication (with cache)
        window.checkAuth = async function() {
            try {
                // ✅ NEW: Uses cache for auth
                if (isCacheValid('user')) {
                    console.log('📦 Using user cache');
                    return getCache('user');
                }

                const { data: { user }, error } = await supabaseClient.auth.getUser();
                
                if (error || !user) {
                    console.warn('⚠️ User not authenticated');
                    return null;
                }

                // ✅ NEW: Caches user data
                setCache('user', user);
                return user;
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                return null;
            }
        };

        // Helper function for logout
        window.logout = async function() {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
                
                // ✅ NEW: Clears cache on logout
                clearCache('profile');
                clearCache('user');
                
                console.log('✅ Logout successful');
                window.location.href = '/index.html';
            } catch (error) {
                console.error('❌ Error during logout:', error);
                throw error;
            }
        };

        // Protects pages that require authentication
        window.protectPage = async function() {
            const publicPages = ['index.html', '404.html', ''];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (publicPages.includes(currentPage)) {
                return;
            }

            const user = await window.checkAuth();
            
            if (!user) {
                console.warn('⚠️ Access denied: user not authenticated');
                window.location.href = '/index.html';
            }
        };

        // ✅ NEW: Function to get profile with cache
        window.getCachedProfile = async function(userId) {
            try {
                // Checks cache first
                if (isCacheValid('profile')) {
                    console.log('📦 Using profile cache');
                    return getCache('profile');
                }

                // If not in cache, fetch from Supabase
                const { data: profile, error } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) throw error;

                // ✅ NEW: Caches the profile
                setCache('profile', profile);
                return profile;
            } catch (error) {
                console.error('❌ Error fetching profile:', error);
                throw error;
            }
        };

        // ✅ NEW: Function to update profile and invalidate cache
        window.updateProfileAndClearCache = async function(userId, data) {
            try {
                const result = await supabaseClient
                    .from('profiles')
                    .update(data)
                    .eq('id', userId)
                    .select()
                    .single();

                // ✅ NEW: Clears cache after update
                clearCache('profile');
                
                return result;
            } catch (error) {
                console.error('❌ Error updating profile:', error);
                throw error;
            }
        };

    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
    }

})();
