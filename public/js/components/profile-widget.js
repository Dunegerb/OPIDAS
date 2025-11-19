// Profile Widget Component - OPIDAS
// Widget de perfil com funcionalidades completas

const ProfileWidget = {
    isOpen: false,
    currentUser: null,
    widgetElement: null,

    /**
     * Inicializa o widget de perfil
     */
    init() {
        this.createWidget();
        this.attachEventListeners();
        console.log('✅ Profile Widget inicializado');
    },

    /**
     * Cria o HTML do widget
     */
    createWidget() {
        const widgetHTML = `
            <div id="profile-widget-overlay" class="profile-widget-overlay hidden">
                <div class="profile-widget-container">
                    <!-- Header do Widget -->
                    <div class="widget-header">
                        <div class="widget-user-info">
                            <img id="widget-avatar" class="widget-avatar" src="" alt="Avatar">
                            <div class="widget-user-text">
                                <span class="widget-welcome">Bem vindo(a) de volta</span>
                                <span id="widget-user-name" class="widget-user-name">Carregando...</span>
                            </div>
                        </div>
                        <button id="widget-close-btn" class="widget-close-btn">
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path d="M1 1L10 10M10 1L1 10" stroke="#D9D9D9" stroke-width="1.5"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Campo Atual -->
                    <div class="widget-current-field">
                        <div class="field-label">Campo contra o(a)</div>
                        <div id="widget-current-habit" class="field-value">Carregando...</div>
                    </div>

                    <!-- Tabs: Patentes / Admin -->
                    <div class="widget-tabs">
                        <button class="widget-tab active" data-tab="patentes">Patentes</button>
                        <button class="widget-tab" data-tab="admin">Admin</button>
                    </div>

                    <div class="widget-divider"></div>

                    <!-- Botão: Ver Identidade -->
                    <button id="btn-ver-identidade" class="widget-button">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                            <path d="M1 6H15M1 1H15M1 11H15" stroke="#D9D9D9" stroke-width="1.5"/>
                        </svg>
                        <span>Ver Identidade</span>
                    </button>

                    <div class="widget-divider"></div>

                    <!-- Botão: Trocar de Campo -->
                    <button id="btn-trocar-campo" class="widget-button">
                        <span>Trocar de campo</span>
                        <div class="habit-selector">
                            <select id="habit-select" class="habit-select">
                                <option value="">Selecione...</option>
                                <option value="masturbacao">Masturbação</option>
                                <option value="pornografia">Pornografia</option>
                                <option value="bebida">Bebida Alcoólica</option>
                                <option value="fumar">Fumar</option>
                                <option value="outro">Outro</option>
                            </select>
                            <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                                <path d="M1 1L6.5 6.5L1 12" stroke="#D9D9D9" stroke-width="1.5"/>
                            </svg>
                        </div>
                    </button>

                    <div class="widget-divider"></div>

                    <!-- Seção: OPIDAS Investimento -->
                    <div class="widget-investment-section">
                        <div class="investment-header">
                            <div class="investment-badge">
                                <span>OPIDAS</span>
                            </div>
                            <span class="investment-label">Investimento</span>
                        </div>
                        
                        <div class="investment-price">
                            <span class="currency">R$</span>
                            <span id="investment-price" class="price">3</span>
                            <span class="period">/semana</span>
                        </div>

                        <div class="investment-next-payment">
                            <span class="next-payment-label">Próximo pagamento</span>
                            <div class="next-payment-days">
                                <span id="days-until-payment" class="days-number">4</span>
                                <span class="days-label">/7 dias</span>
                            </div>
                        </div>

                        <div class="investment-progress-bar">
                            <div id="payment-progress" class="investment-progress-fill" style="width: 57%"></div>
                        </div>

                        <div class="investment-buttons">
                            <button id="btn-configurar-pagamento" class="investment-btn primary">
                                Configurar Pagamentos
                            </button>
                            <button id="btn-desistir" class="investment-btn secondary">
                                Desistir não quero mais
                            </button>
                        </div>
                    </div>

                    <div class="widget-divider"></div>

                    <!-- Botão: Sair/Desconectar -->
                    <button id="btn-logout" class="widget-button logout-btn">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M4 1H2C1.44772 1 1 1.44772 1 2V10C1 10.5523 1.44772 11 2 11H4M8 9L11 6M11 6L8 3M11 6H4" stroke="#D9D9D9" stroke-width="1.5"/>
                        </svg>
                        <span>Sair / Desconectar</span>
                    </button>
                </div>
            </div>
        `;

        // Adiciona ao body
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        this.widgetElement = document.getElementById('profile-widget-overlay');
    },

    /**
     * Anexa event listeners aos botões
     */
    attachEventListeners() {
        // Fechar widget
        document.getElementById('widget-close-btn').addEventListener('click', () => this.close());
        document.getElementById('profile-widget-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'profile-widget-overlay') {
                this.close();
            }
        });

        // Ver Identidade
        document.getElementById('btn-ver-identidade').addEventListener('click', () => this.handleVerIdentidade());

        // Trocar de Campo
        document.getElementById('habit-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.handleTrocarCampo(e.target.value);
            }
        });

        // Configurar Pagamento
        document.getElementById('btn-configurar-pagamento').addEventListener('click', () => this.handleConfigurarPagamento());

        // Desistir
        document.getElementById('btn-desistir').addEventListener('click', () => this.handleDesistir());

        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

        // Tabs
        document.querySelectorAll('.widget-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.widget-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                // TODO: Implementar troca de conteúdo entre Patentes e Admin
            });
        });
    },

    /**
     * Abre o widget e carrega dados do usuário
     */
    async open() {
        try {
            console.log('📂 Abrindo Profile Widget...');

            // Carrega dados do usuário
            this.currentUser = await window.UserService.getCurrentUserProfile();
            
            // Atualiza UI do widget
            this.updateWidgetUI();

            // Mostra widget
            this.widgetElement.classList.remove('hidden');
            this.isOpen = true;

            console.log('✅ Profile Widget aberto');

        } catch (error) {
            console.error('❌ Erro ao abrir widget:', error);
            alert('Erro ao carregar perfil. Tente novamente.');
        }
    },

    /**
     * Fecha o widget
     */
    close() {
        this.widgetElement.classList.add('hidden');
        this.isOpen = false;
        console.log('✅ Profile Widget fechado');
    },

    /**
     * Atualiza UI do widget com dados do usuário
     */
    updateWidgetUI() {
        if (!this.currentUser) return;

        const habitLabels = {
            'masturbacao': 'Masturbação',
            'pornografia': 'Pornografia',
            'bebida': 'Bebida Alcoólica',
            'fumar': 'Fumar',
            'outro': 'Outro'
        };

        // Avatar
        document.getElementById('widget-avatar').src = this.currentUser.avatar_url || 'https://via.placeholder.com/34';

        // Nome do usuário
        const rankData = this.currentUser.rankData;
        const rankName = rankData ? rankData.name.charAt(0).toUpperCase() + rankData.name.slice(1) : 'Recruta';
        document.getElementById('widget-user-name').textContent = `${rankName} ${this.currentUser.last_name || ''}`;

        // Hábito atual
        const habitLabel = habitLabels[this.currentUser.habit] || 'Não definido';
        document.getElementById('widget-current-habit').textContent = habitLabel;

        // Dados de investimento (mock - será integrado com Stripe)
        // TODO: Buscar dados reais do Stripe
        document.getElementById('investment-price').textContent = '3';
        document.getElementById('days-until-payment').textContent = '4';
        
        // Calcula progresso do pagamento (4/7 dias = 57%)
        const progress = (4 / 7) * 100;
        document.getElementById('payment-progress').style.width = `${progress}%`;
    },

    /**
     * Handler: Ver Identidade
     * Abre modal com card de identidade completo
     */
    async handleVerIdentidade() {
        try {
            console.log('👁️ Abrindo Identidade...');

            // Fecha widget
            this.close();

            // Abre modal de identidade (reutiliza o card do onboarding)
            if (window.IdentityModal) {
                await window.IdentityModal.open(this.currentUser);
            } else {
                // Fallback: redireciona para página de identidade
                window.location.href = 'onboarding/habit-tracking.html';
            }

        } catch (error) {
            console.error('❌ Erro ao abrir identidade:', error);
            alert('Erro ao abrir identidade. Tente novamente.');
        }
    },

    /**
     * Handler: Trocar de Campo
     * Troca o hábito do usuário, salvando progresso do anterior
     */
    async handleTrocarCampo(newHabit) {
        try {
            const habitLabels = {
                'masturbacao': 'Masturbação',
                'pornografia': 'Pornografia',
                'bebida': 'Bebida Alcoólica',
                'fumar': 'Fumar',
                'outro': 'Outro'
            };

            const newHabitLabel = habitLabels[newHabit];
            const currentHabitLabel = habitLabels[this.currentUser.habit];

            // Confirmação
            const confirmed = confirm(
                `Você quer mesmo mudar de campo?\n\n` +
                `Campo atual: ${currentHabitLabel}\n` +
                `Novo campo: ${newHabitLabel}\n\n` +
                `Seu progresso no campo "${currentHabitLabel}" será salvo e você começará do zero no novo campo.\n\n` +
                `Tem certeza?`
            );

            if (!confirmed) {
                // Reseta select
                document.getElementById('habit-select').value = '';
                return;
            }

            console.log(`🔄 Trocando de ${this.currentUser.habit} para ${newHabit}...`);

            // Chama função do Supabase para trocar de campo
            const { data, error } = await window.supabase.rpc('switch_user_habit', {
                p_user_id: this.currentUser.id,
                p_new_habit: newHabit,
                p_current_habit: this.currentUser.habit,
                p_current_retention_days: this.currentUser.retention_days,
                p_current_rank: this.currentUser.rank
            });

            if (error) throw error;

            console.log('✅ Campo trocado com sucesso:', data);

            // Mostra mensagem de sucesso
            const hadPreviousProgress = data.had_previous_progress;
            const message = hadPreviousProgress
                ? `Campo trocado com sucesso!\n\nVocê já tinha ${data.retention_days} dias de progresso em "${newHabitLabel}". Seu progresso foi restaurado!`
                : `Campo trocado com sucesso!\n\nBem-vindo ao campo "${newHabitLabel}"! Você está começando do zero.`;

            alert(message);

            // Recarrega página para atualizar todos os dados
            window.location.reload();

        } catch (error) {
            console.error('❌ Erro ao trocar de campo:', error);
            alert('Erro ao trocar de campo. Tente novamente.');
            document.getElementById('habit-select').value = '';
        }
    },

    /**
     * Handler: Configurar Pagamento
     * Abre portal do Stripe para gerenciar assinatura
     */
    async handleConfigurarPagamento() {
        try {
            console.log('💳 Abrindo portal de pagamento...');

            // Verifica se tem stripe_customer_id
            if (!this.currentUser.stripe_customer_id) {
                alert('Você ainda não tem uma assinatura ativa.');
                return;
            }

            // Chama Edge Function para criar portal session
            const { data, error } = await window.supabase.functions.invoke('create-portal-session', {
                body: {
                    customerId: this.currentUser.stripe_customer_id,
                    returnUrl: window.location.origin + '/campo.html'
                }
            });

            if (error) throw error;

            // Redireciona para portal do Stripe
            window.location.href = data.url;

        } catch (error) {
            console.error('❌ Erro ao abrir portal de pagamento:', error);
            alert('Erro ao abrir portal de pagamento. Tente novamente.');
        }
    },

    /**
     * Handler: Desistir
     * Cancela assinatura e deleta conta
     */
    async handleDesistir() {
        try {
            // Primeira confirmação
            const confirmed1 = confirm(
                '⚠️ ATENÇÃO ⚠️\n\n' +
                'Você está prestes a CANCELAR sua assinatura e DELETAR sua conta permanentemente.\n\n' +
                'Isso significa:\n' +
                '• Seu progresso será PERDIDO\n' +
                '• Sua assinatura será CANCELADA\n' +
                '• Seus dados serão DELETADOS\n' +
                '• Esta ação é IRREVERSÍVEL\n\n' +
                'Tem certeza que deseja continuar?'
            );

            if (!confirmed1) return;

            // Segunda confirmação (mais forte)
            const confirmed2 = confirm(
                '🛑 ÚLTIMA CHANCE 🛑\n\n' +
                'Digite "SIM" no próximo prompt para confirmar que você realmente deseja deletar sua conta.\n\n' +
                'Clique OK para continuar ou Cancelar para voltar.'
            );

            if (!confirmed2) return;

            // Pede confirmação final com texto
            const finalConfirmation = prompt(
                'Digite "SIM" (em maiúsculas) para confirmar a exclusão da conta:'
            );

            if (finalConfirmation !== 'SIM') {
                alert('Cancelamento abortado. Sua conta está segura.');
                return;
            }

            console.log('🗑️ Deletando conta...');

            // Chama Edge Function para cancelar assinatura e deletar conta
            const { data, error } = await window.supabase.functions.invoke('cancel-subscription-and-delete', {
                body: {
                    userId: this.currentUser.id,
                    stripeCustomerId: this.currentUser.stripe_customer_id,
                    stripeSubscriptionId: this.currentUser.stripe_subscription_id
                }
            });

            if (error) throw error;

            console.log('✅ Conta deletada com sucesso');

            // Mostra mensagem final
            alert(
                'Sua assinatura foi cancelada e sua conta foi deletada.\n\n' +
                'Sentiremos sua falta, soldado. A porta está sempre aberta se quiser voltar.\n\n' +
                'Você será redirecionado para a página inicial.'
            );

            // Faz logout
            await window.supabase.auth.signOut();

            // Redireciona para home
            window.location.href = '/index.html';

        } catch (error) {
            console.error('❌ Erro ao deletar conta:', error);
            alert('Erro ao deletar conta. Entre em contato com o suporte.');
        }
    },

    /**
     * Handler: Logout
     * Desconecta usuário
     */
    async handleLogout() {
        try {
            const confirmed = confirm('Tem certeza que deseja sair?');
            if (!confirmed) return;

            console.log('👋 Fazendo logout...');

            // Faz logout no Supabase
            const { error } = await window.supabase.auth.signOut();
            if (error) throw error;

            console.log('✅ Logout realizado com sucesso');

            // Redireciona para página de login
            window.location.href = '/index.html';

        } catch (error) {
            console.error('❌ Erro ao fazer logout:', error);
            alert('Erro ao fazer logout. Tente novamente.');
        }
    }
};

// Exporta para uso global
window.ProfileWidget = ProfileWidget;

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProfileWidget.init());
} else {
    ProfileWidget.init();
}
