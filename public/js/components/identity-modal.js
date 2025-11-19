/**
 * OPIDAS Identity Modal
 * Modal para exibir a identidade completa do usuário
 */

window.IdentityModal = (function () {
    'use strict';

    let modalOverlay = null;
    let userData = null;

    /**
     * Inicializa o modal
     */
    function init() {
        createModalHTML();
        attachEventListeners();
    }

    /**
     * Cria a estrutura HTML do modal
     */
    function createModalHTML() {
        // Remove modal existente se houver
        const existing = document.getElementById('identity-modal-overlay');
        if (existing) {
            existing.remove();
        }

        // Cria o overlay e modal
        const overlay = document.createElement('div');
        overlay.id = 'identity-modal-overlay';
        overlay.className = 'identity-modal-overlay';
        overlay.innerHTML = `
            <div class="identity-modal-container">
                <button class="identity-modal-close" aria-label="Fechar"></button>
                
                <div class="identity-modal-header">
                    <h2 class="identity-modal-title">🪪 Identidade OPIDAS</h2>
                    <p class="identity-modal-subtitle">Seus dados de soldado</p>
                </div>

                <div class="identity-modal-avatar">
                    <img id="identity-avatar" src="https://via.placeholder.com/150" alt="Avatar">
                </div>

                <div class="identity-modal-info">
                    <div class="identity-info-row">
                        <span class="identity-info-label">Nome Completo</span>
                        <div class="identity-info-value" id="identity-full-name">-</div>
                    </div>

                    <div class="identity-info-row">
                        <span class="identity-info-label">E-mail</span>
                        <div class="identity-info-value" id="identity-email">-</div>
                    </div>

                    <div class="identity-info-row">
                        <span class="identity-info-label">Patente Atual</span>
                        <div class="identity-info-value">
                            <span class="identity-rank-badge" id="identity-rank">Recruta</span>
                        </div>
                    </div>

                    <div class="identity-info-row">
                        <span class="identity-info-label">Campo de Batalha</span>
                        <div class="identity-info-value" id="identity-habit">-</div>
                    </div>

                    <div class="identity-info-row">
                        <span class="identity-info-label">Dias de Retenção</span>
                        <div class="identity-info-value">
                            <span class="identity-days-badge" id="identity-retention-days">0 dias</span>
                        </div>
                    </div>

                    <div class="identity-info-row">
                        <span class="identity-info-label">Data de Nascimento</span>
                        <div class="identity-info-value" id="identity-birth-date">-</div>
                    </div>

                    <div class="identity-info-row">
                        <span class="identity-info-label">Sexo</span>
                        <div class="identity-info-value" id="identity-gender">-</div>
                    </div>
                </div>

                <div class="identity-stats">
                    <div class="identity-stat-card">
                        <div class="identity-stat-value" id="identity-stat-days">0</div>
                        <div class="identity-stat-label">Dias Limpo</div>
                    </div>
                    <div class="identity-stat-card">
                        <div class="identity-stat-value" id="identity-stat-rank-level">1</div>
                        <div class="identity-stat-label">Nível de Patente</div>
                    </div>
                </div>

                <div class="identity-modal-footer">
                    <p class="identity-modal-footer-text">
                        Continue firme na sua jornada! 💪<br>
                        Cada dia é uma vitória.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        modalOverlay = overlay;
    }

    /**
     * Anexa event listeners
     */
    function attachEventListeners() {
        // Fechar ao clicar no botão X
        const closeButton = modalOverlay.querySelector('.identity-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', close);
        }

        // Fechar ao clicar no overlay (fora do modal)
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                close();
            }
        });

        // Fechar com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                close();
            }
        });

        // Prevenir propagação de cliques dentro do modal
        const modalContainer = modalOverlay.querySelector('.identity-modal-container');
        if (modalContainer) {
            modalContainer.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    /**
     * Abre o modal
     */
    async function open() {
        await loadUserData();
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Previne scroll da página
    }

    /**
     * Fecha o modal
     */
    function close() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaura scroll da página
    }

    /**
     * Carrega dados do usuário
     */
    async function loadUserData() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
                console.error('Usuário não autenticado');
                return;
            }

            const { data: profile, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            userData = profile;
            updateModalWithUserData(profile, user);
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    /**
     * Atualiza o modal com os dados do usuário
     */
    function updateModalWithUserData(profile, user) {
        // Avatar
        const avatarEl = document.getElementById('identity-avatar');
        if (avatarEl) {
            avatarEl.src = profile.avatar_url || 'https://via.placeholder.com/150';
        }

        // Nome completo
        const fullNameEl = document.getElementById('identity-full-name');
        if (fullNameEl) {
            fullNameEl.textContent = profile.full_name || user.email?.split('@')[0] || 'Não informado';
        }

        // E-mail
        const emailEl = document.getElementById('identity-email');
        if (emailEl) {
            emailEl.textContent = user.email || 'Não informado';
        }

        // Patente
        const rankEl = document.getElementById('identity-rank');
        if (rankEl) {
            rankEl.textContent = profile.rank || 'Recruta';
        }

        // Campo de batalha (hábito)
        const habitEl = document.getElementById('identity-habit');
        if (habitEl) {
            const habitLabels = {
                'masturbacao': 'Masturbação',
                'pornografia': 'Pornografia',
                'bebida': 'Bebida Alcoólica',
                'fumar': 'Fumar',
                'outro': 'Outro'
            };
            habitEl.textContent = habitLabels[profile.habit] || 'Não definido';
        }

        // Dias de retenção
        const retentionDaysEl = document.getElementById('identity-retention-days');
        if (retentionDaysEl) {
            const days = profile.retention_days || 0;
            retentionDaysEl.textContent = `${days} ${days === 1 ? 'dia' : 'dias'}`;
        }

        // Data de nascimento
        const birthDateEl = document.getElementById('identity-birth-date');
        if (birthDateEl) {
            if (profile.birth_date) {
                const date = new Date(profile.birth_date);
                birthDateEl.textContent = date.toLocaleDateString('pt-BR');
            } else {
                birthDateEl.textContent = 'Não informado';
            }
        }

        // Sexo
        const genderEl = document.getElementById('identity-gender');
        if (genderEl) {
            const genderLabels = {
                'masculino': 'Masculino',
                'feminino': 'Feminino',
                'outro': 'Outro',
                'prefiro_nao_dizer': 'Prefiro não dizer'
            };
            genderEl.textContent = genderLabels[profile.gender] || 'Não informado';
        }

        // Estatísticas
        const statDaysEl = document.getElementById('identity-stat-days');
        if (statDaysEl) {
            statDaysEl.textContent = profile.retention_days || 0;
        }

        const statRankLevelEl = document.getElementById('identity-stat-rank-level');
        if (statRankLevelEl) {
            const rankLevels = {
                'recruta': 1,
                'soldado': 2,
                'cabo': 3,
                'sargento': 4,
                'tenente': 5,
                'capitao': 6,
                'major': 7,
                'coronel': 8,
                'general': 9
            };
            const rankKey = (profile.rank || 'recruta').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            statRankLevelEl.textContent = rankLevels[rankKey] || 1;
        }
    }

    /**
     * API pública
     */
    return {
        init,
        open,
        close
    };
})();

// Inicializa automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.IdentityModal.init();
    });
} else {
    window.IdentityModal.init();
}
