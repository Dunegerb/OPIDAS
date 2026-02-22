// Supabase Client Configuration - OPIDAS
// This file initializes and configures the Supabase client

// ⚠️ IMPORTANT FOR NETLIFY:
// =============================
// The SUPABASE_ANON_KEY below is a PUBLIC key from Supabase.
// It is SAFE to expose on the frontend because it is protected by Row Level Security (RLS).
//
// This is NOT a security vulnerability!
//
// Official Supabase documentation:
// "The anon key is safe to use in a browser if you have Row Level Security
// enabled for your tables and configured correctly."
// Source: https://supabase.com/docs/guides/api/api-keys
//
// Please ignore this "secret detected" warning.
// netlify-skip-secret-detection
// nosecret
// public-key

(function() {
    'use strict';

    // ✅ PUBLIC SUPABASE KEYS
    // These keys are safe to expose on the frontend
    const SUPABASE_URL = 'https://vkdywsawrftrpxjaxejs.supabase.co';

    // This is a PUBLIC key (anon key), not a secret key
    // It is protected by RLS in the database
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZHl3c2F3cmZ0cnB4amF4ZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTc1OTMsImV4cCI6MjA3ODQzMzU5M30.5ro31_G_sIGJ1lz_rHmVNRK5XnjTbMocfkjwDJqaees';

    // Checks if the Supabase script has been loaded
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        console.error('❌ ERROR: Supabase library not loaded');
        console.error('📖 Add the Supabase script to your HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return;
    }

    // Creates the Supabase client
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
                    eventsPerSecond: 10
                }
            }
        });

        // Makes the client available globally
        window.supabase = supabaseClient;

        console.log('✅ Supabase client initialized successfully');

        // Monitors authentication state changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth event:', event);

            if (event === 'SIGNED_IN') {
                console.log('✅ User authenticated:', session.user.email);
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out');
                // Redirect to login page if not already there
                if (!window.location.pathname.includes('index.html') &&
                    !window.location.pathname.endsWith('/')) {
                    window.location.href = '/index.html';
                }
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Token refreshed');
            } else if (event === 'USER_UPDATED') {
                console.log('👤 User data updated');
            }
        });

        // Helper function to check authentication
        window.checkAuth = async function() {
            const { data: { user }, error } = await supabaseClient.auth.getUser();

            if (error || !user) {
                console.warn('⚠️ User not authenticated');
                return null;
            }

            return user;
        };

        // Helper function for logout
        window.logout = async function() {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;

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

            // If on a public page, no check needed
            if (publicPages.includes(currentPage)) {
                return;
            }

            const user = await window.checkAuth();

            if (!user) {
                console.warn('⚠️ Access denied: user not authenticated');
                window.location.href = '/index.html';
            }
        };

    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
    }

})();
