// Identity Modal Component - OPIDAS
// Modal to display the full identity card

const IdentityModal = {
    isOpen: false,
    modalElement: null,
    currentUser: null,

    /**
     * Initializes the identity modal
     */
    init() {
        this.createModal();
        this.attachEventListeners();
        console.log('✅ Identity Modal initialized');
    },

    /**
     * Creates the modal's HTML
     */
    createModal() {
        const modalHTML = `
            <div id="identity-modal-overlay" class="identity-modal-overlay hidden">
                <div class="identity-modal-container">
                    <button id="identity-close-btn" class="identity-close-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="#D9D9D9" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>

                    <!-- Identity Card (reuses onboarding design) -->
                    <div class="identity-card">
                        <!-- Card Header -->
                        <div class="identity-card-header">
                            <img src="assets/styles/images/campologo.svg" alt="OPIDAS" class="identity-logo">
                            <div class="identity-title">OPIDAS IDENTITY</div>
                        </div>

                        <!-- Photo and Name -->
                        <div class="identity-profile">
                            <img id="identity-avatar" class="identity-avatar" src="" alt="Avatar">
                            <div id="identity-name" class="identity-name">FIRSTNAME LASTNAME</div>
                        </div>

                        <!-- Information -->
                        <div class="identity-info-grid">
                            <div class="identity-info-item">
                                <div class="identity-info-label">Against</div>
                                <div id="identity-habit" class="identity-info-value">HABIT</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Rank</div>
                                <div id="identity-rank" class="identity-info-value">RANK</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Enlistment Date</div>
                                <div id="identity-enlistment" class="identity-info-value">MM/DD/YYYY</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Retention Days</div>
                                <div id="identity-retention" class="identity-info-value">0 DAYS</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Registration</div>
                                <div id="identity-registration" class="identity-info-value">M0RSI-00000000</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Status</div>
                                <div id="identity-status" class="identity-info-value status-active">ACTIVE</div>
                            </div>
                        </div>

                        <!-- Rank Badge -->
                        <div class="identity-rank-badge">
                            <img id="identity-rank-icon" src="" alt="Rank">
                        </div>

                        <!-- Footer -->
                        <div class="identity-card-footer">
                            <div class="identity-footer-text">
                                "Discipline is the bridge between goals and achievements"
                            </div>
                            <div class="identity-footer-signature">
                                — OPIDAS
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modalElement = document.getElementById('identity-modal-overlay');
    },

    /**
     * Attaches event listeners
     */
    attachEventListeners() {
        // Close modal
        document.getElementById('identity-close-btn').addEventListener('click', () => this.close());
        document.getElementById('identity-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'identity-modal-overlay') {
                this.close();
            }
        });

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * Opens the modal with user data
     */
    async open(userData = null) {
        try {
            console.log('🪪 Opening Identity Modal...');

            // If userData is not provided, fetch from Supabase
            if (!userData) {
                this.currentUser = await window.UserService.getCurrentUserProfile();
            } else {
                this.currentUser = userData;
            }

            // Update modal UI
            this.updateModalUI();

            // Show modal
            this.modalElement.classList.remove('hidden');
            this.isOpen = true;

            console.log('✅ Identity Modal opened');

        } catch (error) {
            console.error('❌ Error opening Identity Modal:', error);
            alert('Error loading identity. Please try again.');
        }
    },

    /**
     * Closes the modal
     */
    close() {
        this.modalElement.classList.add('hidden');
        this.isOpen = false;
        console.log('✅ Identity Modal closed');
    },

    /**
     * Updates the modal UI with user data
     */
    updateModalUI() {
        if (!this.currentUser) return;

        const habitLabels = {
            'masturbation': 'MASTURBATION',
            'pornography': 'PORNOGRAPHY',
            'alcoholic_beverages': 'ALCOHOLIC BEVERAGES',
            'smoking': 'SMOKING',
            'other': 'OTHER'
        };

        const rankIcons = {
            'recruit': 'assets/styles/images/ranks/Recruit.png',
            'soldier': 'assets/styles/images/ranks/Soldier.png',
            'corporal': 'assets/styles/images/ranks/Corporal.png',
            'sergeant': 'assets/styles/images/ranks/Sergeant.png',
            'marshal': 'assets/styles/images/ranks/Marshal.png',
            'lieutenant': 'assets/styles/images/ranks/Lieutenant.png',
            'captain': 'assets/styles/images/ranks/Captain.png'
        };

        // Avatar
        document.getElementById('identity-avatar').src = this.currentUser.avatar_url || 'https://placehold.co/120x120';

        // Name
        const fullName = `${this.currentUser.first_name || ''} ${this.currentUser.last_name || ''}`.trim().toUpperCase();
        document.getElementById('identity-name').textContent = fullName || 'NAME NOT SET';

        // Habit
        const habitLabel = habitLabels[this.currentUser.habit] || 'NOT SET';
        document.getElementById('identity-habit').textContent = habitLabel;

        // Rank
        const rankData = this.currentUser.rankData;
        const rankName = rankData ? rankData.name.toUpperCase() : 'RECRUIT';
        document.getElementById('identity-rank').textContent = rankName;

        // Rank icon
        const rankIcon = rankIcons[this.currentUser.rank] || rankIcons['recruit'];
        document.getElementById('identity-rank-icon').src = rankIcon;

        // Enlistment date
        const enlistmentDate = this.currentUser.created_at 
            ? new Date(this.currentUser.created_at).toLocaleDateString('en-US')
            : 'NOT SET';
        document.getElementById('identity-enlistment').textContent = enlistmentDate;

        // Retention days
        const retentionDays = this.currentUser.retention_days || 0;
        document.getElementById('identity-retention').textContent = `${retentionDays} DAYS`;

        // Registration
        const registration = this.currentUser.registration_number || 'M0RSI-00000000';
        document.getElementById('identity-registration').textContent = registration;

        // Status
        const isActive = !this.currentUser.is_blocked;
        const statusElement = document.getElementById('identity-status');
        statusElement.textContent = isActive ? 'ACTIVE' : 'BLOCKED';
        statusElement.className = isActive ? 'identity-info-value status-active' : 'identity-info-value status-blocked';
    }
};

// Export for global use
window.IdentityModal = IdentityModal;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IdentityModal.init());
} else {
    IdentityModal.init();
}
