// ================================================= 
// === PROFILE WIDGET - DYNAMIC ISLAND STYLE     ===
// === OPIDAS - Complete Replacement            ===
// ================================================= 

const ProfileWidget = {
    isOpen: false,
    currentUser: null,
    widgetElement: null,

    /**
     * Initializes the profile widget with Dynamic Island
     */
    init() {
        this.createWidget();
        this.attachEventListeners();
        console.log('✅ Profile Widget (Dynamic Island) initialized');
    },

    /**
     * Creates the HTML for the widget with Dynamic Island style
     */
    createWidget() {
        const widgetHTML = `
            <div id="profile-island-container">
                <div class="island-background"></div>
                <div class="island-content-wrapper">
                    <!-- INITIAL CONTENT (COLLAPSED) -->
                    <div class="island-initial-content">
                        <div class="user-welcome">
                            <img id="user-avatar" alt="Profile photo" src="https://placehold.co/34x34">
                            <div class="user-welcome-text">
                                <div class="greeting">Welcome back</div>
                                <div class="username" id="welcome-username">Loading...</div>
                            </div>
                        </div>
                    </div>

                    <!-- EXPANDED CONTENT -->
                    <div class="island-expanded-content">
                        <div class="main-container">
                            <div class="flex-column-ef">
                                <div class="vector"></div>
                                
                                <!-- BUTTON: VIEW IDENTITY -->
                                <div class="group" id="btn-view-identity">
                                    <div class="rectangle"></div>
                                    <div class="vector-1"></div>
                                    <span class="view-identity">View Identity</span>
                                </div>
                                
                                <div class="vector-2"></div>
                                
                                <!-- INVESTMENT SECTION -->
                                <div class="group-3">
                                    <div class="group-4">
                                        <div id="payment-progress" class="investment-progress-fill" style="width: 57%"></div>
                                    </div>
                                    <div class="rectangle-5"></div>
                                    <div class="group-6">
                                        <span class="week">/week</span>
                                        <span id="investment-price" class="number">3</span>
                                        <span class="currency">R$</span>
                                    </div>
                                    <div class="group-7">
                                        <div class="group-8">
                                            <span class="opidas">OPIDAS</span>
                                            <div class="rectangle-9"></div>
                                        </div>
                                        <span class="investment">Investment</span>
                                    </div>
                                    <span class="next-payment">Next payment</span>
                                    <div class="days">
                                        <span id="days-until-payment" class="number-a">4</span><span class="days-b">/7 days</span>
                                    </div>
                                    
                                    <!-- INVESTMENT BUTTONS -->
                                    <div class="group-c" id="btn-setup-payment">
                                        <div class="rectangle-d"></div>
                                        <span class="setup-payments">Set Up Payments</span>
                                    </div>
                                    <div class="group-e" id="btn-give-up">
                                        <div class="rectangle-f"></div>
                                        <span class="give-up-i-dont-want-it-anymore">I want to give up</span>
                                    </div>
                                </div>
                                
                                <div class="vector-10"></div>
                                
                                <!-- "CHANGE BATTLEFIELD" SECTION -->
                                <div class="group-16" id="change-field-container">
                                    <div class="rectangle-17"></div>
                                    <div class="union"></div>
                                    <span class="change-field">Change Battlefield</span>
                                    <div id="selected-field-value">Loading...</div>
                                    <ul id="field-options-list">
                                        <li data-value="masturbation">Masturbation</li>
                                        <li data-value="pornography">Pornography</li>
                                        <li data-value="alcoholic_beverages">Alcoholic Beverages</li>
                                        <li data-value="smoking">Smoking</li>
                                        <li data-value="other">Other</li>
                                    </ul>
                                </div>

                                <!-- BUTTON: LOGOUT / DISCONNECT -->
                                <div class="group-11" id="btn-logout">
                                    <div class="rectangle-12"></div>
                                    <div class="vector-13"></div>
                                    <span class="logout-disconnect">Logout / Disconnect</span>
                                </div>
                                
                                <!-- USER PHOTO AND NAME (EXPANDED) -->
                                <div class="welcome-photo">
                                    <div id="profile-photo-expanded" class="profile-photo"></div>
                                    <div class="welcome-back-user">
                                        <span class="welcome-back-message">Welcome back</span>
                                        <span id="user-patent-name" class="user-patent-name">Loading...</span>
                                    </div>
                                </div>
                                
                                <!-- CLOSE BUTTON -->
                                <div class="vector-15" id="widget-close-btn"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Replaces the existing user-welcome with the Dynamic Island
        const userWelcome = document.querySelector('.user-welcome');
        if (userWelcome) {
            userWelcome.outerHTML = widgetHTML;
        } else {
            // Fallback: adds to the body
            document.body.insertAdjacentHTML('beforeend', widgetHTML);
        }

        this.widgetElement = document.getElementById('profile-island-container');
    },

    /**
     * Attaches event listeners to the buttons
     */
    attachEventListeners() {
        const container = this.widgetElement;

        // Open Dynamic Island on click
        container.addEventListener('click', (e) => {
            // Only opens if not expanded and not an internal button click
            if (!container.classList.contains('expanded') && !e.target.closest('.group, .group-11, .group-16, .group-c, .group-e')) {
                this.open();
            }
        });

        // Close widget
        const closeBtn = document.getElementById('widget-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }

        // View Identity
        const btnViewIdentity = document.getElementById('btn-view-identity');
        if (btnViewIdentity) {
            btnViewIdentity.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleViewIdentity();
            });
        }

        // Change Battlefield (Dropdown)
        this.setupFieldChanger();

        // Set Up Payment
        const btnSetupPayment = document.getElementById('btn-setup-payment');
        if (btnSetupPayment) {
            btnSetupPayment.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSetupPayment();
            });
        }

        // Give Up
        const btnGiveUp = document.getElementById('btn-give-up');
        if (btnGiveUp) {
            btnGiveUp.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleGiveUp();
            });
        }

        // Logout
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLogout();
            });
        }
    },

    /**
     * Sets up the "Change Battlefield" dropdown
     */
    setupFieldChanger() {
        const container = document.getElementById('change-field-container');
        const optionsList = document.getElementById('field-options-list');
        const options = optionsList.querySelectorAll('li');

        container.addEventListener('click', (event) => {
            event.stopPropagation();
            optionsList.classList.toggle('visible');
        });

        options.forEach(option => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                const newHabit = option.getAttribute('data-value');
                optionsList.classList.remove('visible');
                this.handleChangeField(newHabit);
            });
        });

        // Closes dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!container.contains(event.target)) {
                optionsList.classList.remove('visible');
            }
        });
    },

    /**
     * Opens the widget and loads user data
     */
    async open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.widgetElement.classList.add('expanded');

        console.log('🏝️ Opening Dynamic Island');

        try {
            // Gets user data from Auth and DB
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not found.');

            const { data: userData, error: userError } = await window.supabase
                .from('profiles')
                .select('*, habits(*)')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;

            this.currentUser = { ...user, ...userData };
            console.log('👤 User data loaded:', this.currentUser);

            // Updates UI with user data
            this.updateUI();

        } catch (error) {
            console.error('❌ Error loading user data:', error);
            alert('Error loading your data. Please try again.');
            this.close();
        }
    },

    /**
     * Closes the widget
     */
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.widgetElement.classList.remove('expanded');
        console.log('🏝️ Closing Dynamic Island');
    },

    /**
     * Updates the UI with the loaded user data
     */
    updateUI() {
        if (!this.currentUser) return;

        const user = this.currentUser;

        // Collapsed state
        document.getElementById('welcome-username').textContent = user.username || 'Warrior';
        const avatar = document.getElementById('user-avatar');
        if (user.avatar_url) {
            avatar.src = user.avatar_url;
        }

        // Expanded state
        document.getElementById('user-patent-name').textContent = `${user.patent || 'Recruit'} ${user.username || ''}`.trim();
        const profilePhotoExpanded = document.getElementById('profile-photo-expanded');
        if (user.avatar_url) {
            profilePhotoExpanded.style.backgroundImage = `url(${user.avatar_url})`;
        }

        // Investment Info
        document.getElementById('investment-price').textContent = (user.subscription_price / 100).toFixed(2).replace('.', ',');
        
        // Payment progress
        const today = new Date();
        const startDate = new Date(user.subscription_start_date);
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) % 7;
        document.getElementById('days-until-payment').textContent = diffDays;
        document.getElementById('payment-progress').style.width = `${(diffDays / 7) * 100}%`;

        // Selected Battlefield
        const currentHabit = user.habits[0]?.habit_name || 'Not defined';
        document.getElementById('selected-field-value').textContent = this.translateHabit(currentHabit);
    },

    /**
     * Translates habit names for display
     * @param {string} habit - The habit name from the database
     * @returns {string} - The translated habit name
     */
    translateHabit(habit) {
        const translations = {
            'masturbacao': 'Masturbation',
            'pornografia': 'Pornography',
            'bebida': 'Alcoholic Beverages',
            'fumar': 'Smoking',
            'outro': 'Other'
        };
        return translations[habit] || habit;
    },

    /**
     * Handler: View Identity
     * Redirects to the user's identity page
     */
    handleViewIdentity() {
        console.log('💳 Redirecting to identity page...');
        window.location.href = '/user/identity.html';
    },

    /**
     * Handler: Change Battlefield
     * Updates the user's main habit
     * @param {string} newHabit - The new habit selected
     */
    async handleChangeField(newHabit) {
        try {
            const { data, error } = await window.supabase.rpc('change_primary_habit', {
                p_user_id: this.currentUser.id,
                p_new_habit_name: newHabit
            });

            if (error) throw error;

            console.log('✅ Battlefield changed successfully:', data);
            alert(`Battlefield changed to: ${this.translateHabit(newHabit)}`);

            // Reloads data to reflect the change
            this.updateUI();

        } catch (error) {
            console.error('❌ Error changing battlefield:', error);
            alert('Error changing battlefield. Please try again.');
        }
    },

    /**
     * Handler: Set Up Payment
     * Redirects to the Stripe customer portal
     */
    async handleSetupPayment() {
        try {
            console.log('⚙️ Redirecting to payment portal...');
            const { data, error } = await window.supabase.functions.invoke('create-customer-portal-session', {
                body: { customerId: this.currentUser.stripe_customer_id }
            });

            if (error) throw error;

            // Redirects user to the portal
            window.location.href = data.url;

        } catch (error) {
            console.error('❌ Error redirecting to portal:', error);
            alert('Error accessing payment settings. Please contact support.');
        }
    },

    /**
     * Handler: Give Up
     * Starts the account cancellation and deletion process
     */
    async handleGiveUp() {
        try {
            const confirmation = confirm(
                'Are you sure you want to give up?\n\n' +
                'This action is irreversible and will cancel your subscription and permanently delete your account and all associated data.\n\n' +
                'We are sad to see you go, warrior. Are you absolutely sure?'
            );

            if (!confirmation) {
                alert('Cancellation aborted. Your account is safe.');
                return;
            }

            const finalConfirmation = prompt(
                'This is the last step. To confirm the deletion of your account, type "SIM" in the field below.\n\n' +
                'This is your last chance to turn back.'
            );

            if (finalConfirmation !== 'SIM') {
                alert('Cancellation aborted. Your account is safe.');
                return;
            }

            console.log('🗑️ Deleting account...');

            // Calls Edge Function to cancel subscription and delete account
            const { data, error } = await window.supabase.functions.invoke('cancel-subscription-and-delete', {
                body: {
                    userId: this.currentUser.id,
                    stripeCustomerId: this.currentUser.stripe_customer_id,
                    stripeSubscriptionId: this.currentUser.stripe_subscription_id
                }
            });

            if (error) throw error;

            console.log('✅ Account deleted successfully');

            // Shows final message
            alert(
                'Your subscription has been canceled and your account has been deleted.\n\n' +
                'We will miss you, soldier. The door is always open if you want to come back.\n\n' +
                'You will be redirected to the homepage.'
            );

            // Logs out
            await window.supabase.auth.signOut();

            // Redirects to home
            window.location.href = '/index.html';

        } catch (error) {
            console.error('❌ Error deleting account:', error);
            alert('Error deleting account. Please contact support.');
        }
    },

    /**
     * Handler: Logout
     * Disconnects the user
     */
    async handleLogout() {
        try {
            const confirmed = confirm('Are you sure you want to log out?');
            if (!confirmed) return;

            console.log('👋 Logging out...');

            // Logs out from Supabase
            const { error } = await window.supabase.auth.signOut();
            if (error) throw error;

            console.log('✅ Logout successful');

            // Redirects to the login page
            window.location.href = '/index.html';

        } catch (error) {
            console.error('❌ Error logging out:', error);
            alert('Error logging out. Try again.');
        }
    }
};

// Exports for global use
window.ProfileWidget = ProfileWidget;

// Initializes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProfileWidget.init());
} else {
    ProfileWidget.init();
}
