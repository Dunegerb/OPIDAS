// Identity Modal Component - OPIDAS
// Modal para exibir card de identidade completo

const IdentityModal = {
    isOpen: false,
    modalElement: null,
    currentUser: null,

    /**
     * Inicializa o modal de identidade
     */
    init() {
        this.createModal();
        this.attachEventListeners();
        console.log('✅ Identity Modal inicializado');
    },

    /**
     * Cria o HTML do modal
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

                    <!-- Card de Identidade (reutiliza design do onboarding) -->
                    <div class="identity-card">
                        <!-- Header do Card -->
                        <div class="identity-card-header">
                            <img src="assets/styles/images/campologo.svg" alt="OPIDAS" class="identity-logo">
                            <div class="identity-title">IDENTIDADE OPIDAS</div>
                        </div>

                        <!-- Foto e Nome -->
                        <div class="identity-profile">
                            <img id="identity-avatar" class="identity-avatar" src="" alt="Avatar">
                            <div id="identity-name" class="identity-name">NOME SOBRENOME</div>
                        </div>

                        <!-- Informações -->
                        <div class="identity-info-grid">
                            <div class="identity-info-item">
                                <div class="identity-info-label">Contra</div>
                                <div id="identity-habit" class="identity-info-value">HÁBITO</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Patente</div>
                                <div id="identity-rank" class="identity-info-value">PATENTE</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Data de Alistamento</div>
                                <div id="identity-enlistment" class="identity-info-value">DD/MM/AAAA</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Dias de Retenção</div>
                                <div id="identity-retention" class="identity-info-value">0 DIAS</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Matrícula</div>
                                <div id="identity-registration" class="identity-info-value">M0RSI-00000000</div>
                            </div>

                            <div class="identity-info-item">
                                <div class="identity-info-label">Status</div>
                                <div id="identity-status" class="identity-info-value status-active">ATIVO</div>
                            </div>
                        </div>

                        <!-- Ícone da Patente -->
                        <div class="identity-rank-badge">
                            <img id="identity-rank-icon" src="" alt="Patente">
                        </div>

                        <!-- Footer -->
                        <div class="identity-card-footer">
                            <div class="identity-footer-text">
                                "A disciplina é a ponte entre metas e conquistas"
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
     * Anexa event listeners
     */
    attachEventListeners() {
        // Fechar modal
        document.getElementById('identity-close-btn').addEventListener('click', () => this.close());
        document.getElementById('identity-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'identity-modal-overlay') {
                this.close();
            }
        });

        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    /**
     * Abre o modal com dados do usuário
     */
    async open(userData = null) {
        try {
            console.log('🪪 Abrindo Identity Modal...');

            // Se não passou userData, busca do Supabase
            if (!userData) {
                this.currentUser = await window.UserService.getCurrentUserProfile();
            } else {
                this.currentUser = userData;
            }

            // Atualiza UI do modal
            this.updateModalUI();

            // Mostra modal
            this.modalElement.classList.remove('hidden');
            this.isOpen = true;

            console.log('✅ Identity Modal aberto');

        } catch (error) {
            console.error('❌ Erro ao abrir Identity Modal:', error);
            alert('Erro ao carregar identidade. Tente novamente.');
        }
    },

    /**
     * Fecha o modal
     */
    close() {
        this.modalElement.classList.add('hidden');
        this.isOpen = false;
        console.log('✅ Identity Modal fechado');
    },

    /**
     * Atualiza UI do modal com dados do usuário
     */
    updateModalUI() {
        if (!this.currentUser) return;

        const habitLabels = {
            'masturbacao': 'MASTURBAÇÃO',
            'pornografia': 'PORNOGRAFIA',
            'bebida': 'BEBIDA ALCOÓLICA',
            'fumar': 'FUMAR',
            'outro': 'OUTRO'
        };

        const rankIcons = {
            'recruta': 'assets/styles/images/patentes/Recruta.png',
            'soldado': 'assets/styles/images/patentes/Soldado.png',
            'cabo': 'assets/styles/images/patentes/Cabo.png',
            'sargento': 'assets/styles/images/patentes/Sargento.png',
            'marechal': 'assets/styles/images/patentes/Marechal.png',
            'tenente': 'assets/styles/images/patentes/Tenente.png',
            'capitao': 'assets/styles/images/patentes/Capitão.png'
        };

        // Avatar
        document.getElementById('identity-avatar').src = this.currentUser.avatar_url || 'https://via.placeholder.com/120';

        // Nome
        const fullName = `${this.currentUser.first_name || ''} ${this.currentUser.last_name || ''}`.trim().toUpperCase();
        document.getElementById('identity-name').textContent = fullName || 'NOME NÃO DEFINIDO';

        // Hábito
        const habitLabel = habitLabels[this.currentUser.habit] || 'NÃO DEFINIDO';
        document.getElementById('identity-habit').textContent = habitLabel;

        // Patente
        const rankData = this.currentUser.rankData;
        const rankName = rankData ? rankData.name.toUpperCase() : 'RECRUTA';
        document.getElementById('identity-rank').textContent = rankName;

        // Ícone da patente
        const rankIcon = rankIcons[this.currentUser.rank] || rankIcons['recruta'];
        document.getElementById('identity-rank-icon').src = rankIcon;

        // Data de alistamento
        const enlistmentDate = this.currentUser.created_at 
            ? new Date(this.currentUser.created_at).toLocaleDateString('pt-BR')
            : 'NÃO DEFINIDO';
        document.getElementById('identity-enlistment').textContent = enlistmentDate;

        // Dias de retenção
        const retentionDays = this.currentUser.retention_days || 0;
        document.getElementById('identity-retention').textContent = `${retentionDays} DIAS`;

        // Matrícula
        const registration = this.currentUser.registration_number || 'M0RSI-00000000';
        document.getElementById('identity-registration').textContent = registration;

        // Status
        const isActive = !this.currentUser.is_blocked;
        const statusElement = document.getElementById('identity-status');
        statusElement.textContent = isActive ? 'ATIVO' : 'BLOQUEADO';
        statusElement.className = isActive ? 'identity-info-value status-active' : 'identity-info-value status-blocked';
    }
};

// Exporta para uso global
window.IdentityModal = IdentityModal;

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IdentityModal.init());
} else {
    IdentityModal.init();
}
