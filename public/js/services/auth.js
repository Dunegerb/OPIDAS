// --- AUTHENTICATION MODULE (auth.js) ---
// Responsible for login, logout, registration, and route protection.

/**
 * Registers a new user
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
async function signUp(email, password) {
    try {
        console.log(`[AuthService] Attempting to register with: ${email}`);
        
        // Calls Supabase to create the user
        const { data, error } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/onboarding/identification.html`,
                data: {
                    onboarding_status: 'pending'
                }
            }
        });

        if (error) throw error;

        console.log('✅ User registered successfully:', data);
        
        // Checks if the email needs to be confirmed
        if (data.user && !data.session) {
            // Email needs to be confirmed
            alert("Account created! Please check your email to confirm your registration before continuing.");
            return;
        }
        
        // If the session was created, the user is already logged in
        if (data.session) {
            console.log('✅ Session created automatically');
            
            // Waits a bit to ensure the session is persisted
            await new Promise(resolve => setTimeout(resolve, 500));
            
            alert("Account created successfully! You will be redirected to complete your profile.");
            window.location.href = 'onboarding/identification.html';
        }

    } catch (error) {
        console.error('❌ Error during registration:', error);
        alert(`Error creating account: ${error.message}`);
    }
}

/**
 * Logs the user in
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
async function signIn(email, password) {
    try {
        console.log(`[AuthService] Attempting to log in with: ${email}`);
        
        // Calls Supabase to sign in
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('✅ Login successful:', data);

        // Fetches the user profile to check the onboarding status
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('onboarding_status')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.warn('⚠️ Profile not found, redirecting to onboarding');
            window.location.href = 'onboarding/identification.html';
            return;
        }

        // Redirects based on onboarding status
        if (profile.onboarding_status === 'completed') {
            console.log('✅ Onboarding complete, redirecting to the battlefield');
            window.location.href = 'campo.html';
        } else {
            console.log('⚠️ Onboarding pending, redirecting to onboarding');
            window.location.href = 'onboarding/identification.html';
        }

    } catch (error) {
        console.error('❌ Error during login:', error);
        alert(`Error during login: ${error.message}`);
    }
}

/**
 * Logs the user out
 */
async function signOut() {
    try {
        console.log("[AuthService] Logging out user.");
        
        const { error } = await window.supabase.auth.signOut();
        
        if (error) throw error;

        console.log('✅ Logout successful');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('❌ Error during logout:', error);
        alert(`Error during logout: ${error.message}`);
    }
}

/**
 * Protects routes that require authentication
 * @returns {Promise<Object|null>} - Authenticated user or null
 */
async function protectRoute() {
    try {
        console.log("[AuthService] Verifying route authentication.");
        
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error || !user) {
            console.warn('⚠️ User not authenticated, redirecting to login');
            window.location.href = 'index.html';
            return null;
        }

        console.log('✅ User authenticated:', user.email);
        return user;

    } catch (error) {
        console.error('❌ Error verifying authentication:', error);
        window.location.href = 'index.html';
        return null;
    }
}

/**
 * Logs in with an OAuth provider (Google, Apple, Discord, etc)
 * @param {string} provider - Name of the provider (google, apple, discord, etc)
 */
async function signInWithProvider(provider) {
    try {
        console.log(`[AuthService] Attempting login with provider: ${provider}`);
        
        const { data, error } = await window.supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/onboarding/identification.html`
            }
        });

        if (error) throw error;

        console.log('✅ Redirecting to OAuth login:', provider);

    } catch (error) {
        console.error(`❌ Error logging in with ${provider}:`, error);
        alert(`Error logging in with ${provider}: ${error.message}`);
    }
}

// Exports the functions for global use
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.protectRoute = protectRoute;
window.signInWithProvider = signInWithProvider;

// --- UI logic for the login page ---
function initAuthPage() {
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const socialLoginButtons = document.querySelectorAll('.social-login button');
    const toggleLink = document.getElementById('toggle-form-link');
    const formTitle = document.getElementById('form-title');
    const submitButtonText = document.getElementById('submit-button-text');
    const toggleFormText = document.getElementById('toggle-form-text');

    let isLoginMode = false;

    function toggleMode() {
        isLoginMode = !isLoginMode;
        formTitle.textContent = isLoginMode ? 'Login to the Battlefield' : 'Welcome to the Battlefield, Warrior';
        submitButtonText.textContent = isLoginMode ? 'Enter' : 'Enlist';
        toggleFormText.textContent = isLoginMode ? 'Don\'t have an account?' : 'Already have an account?';
        toggleLink.querySelector('span').textContent = isLoginMode ? 'Enlist' : 'Login';
    }

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;

        // Disables the button during the process
        const submitButton = authForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButtonText.textContent = isLoginMode ? 'Entering...' : 'Creating account...';

        try {
            if (isLoginMode) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } finally {
            // Re-enables the button
            submitButton.disabled = false;
            submitButtonText.textContent = isLoginMode ? 'Enter' : 'Enlist';
        }
    });

    socialLoginButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.dataset.provider;
            signInWithProvider(provider);
        });
    });
}
