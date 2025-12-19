// ================================================= 
// === PROFILE WIDGET - DYNAMIC ISLAND STYLE     ===
// === OPIDAS - Substituição Completa            ===
// ================================================= 

const ProfileWidget = {
    isOpen: false,
    currentUser: null,
    widgetElement: null,

    /**
     * Inicializa o widget de perfil com Dynamic Island
     */
    init() {
        this.createWidget();
        this.attachEventListeners();
        console.log('✅ Profile Widget (Dynamic Island) inicializado');
    },

    /**
     * Cria o HTML do widget com estilo Dynamic Island
     */
    createWidget() {
        const widgetHTML = `
            <div id="profile-island-container">
                <div class="island-background"></div>
                <div class="island-content-wrapper">
                    <!-- CONTEÚDO INICIAL (COLLAPSED) -->
                    <div class="island-initial-content">
                        <div class="user-welcome">
                            <img id="user-avatar" alt="Profile photo" src="https://placehold.co/34x34">
                            <div class="user-welcome-text">
                                <div class="greeting">Bem vindo(a) de volta</div>
                                <div class="username" id="welcome-username">Carregando...</div>
                            </div>
                        </div>
                    </div>

                    <!-- CONTEÚDO EXPANDIDO (EXPANDED) -->
                    <div class="island-expanded-content">
                        <div class="main-container">
                            <div class="flex-column-ef">
                                <div class="vector"></div>
                                
                                <!-- BOTÃO: VER IDENTIDADE -->
                                <div class="group" id="btn-ver-identidade">
                                    <div class="rectangle"></div>
                                    <div class="vector-1"></div>
                                    <span class="ver-identidade">Ver Identidade</span>
                                </div>
                                
                                <div class="vector-2"></div>
                                
                                <!-- SEÇÃO DE INVESTIMENTO -->
                                <div class="group-3">
                                    <div class="group-4">
                                        <div id="payment-progress" class="investment-progress-fill" style="width: 57%"></div>
                                    </div>
                                    <div class="rectangle-5"></div>
                                    <div class="group-6">
                                        <span class="semana">/semana</span>
                                        <span id="investment-price" class="number">3</span>
                                        <span class="currency">R$</span>
                                    </div>
                                    <div class="group-7">
                                        <div class="group-8">
                                            <span class="opidas">OPIDAS</span>
                                            <div class="rectangle-9"></div>
                                        </div>
                                        <span class="investment">Investimento</span>
                                    </div>
                                    <span class="next-payment">Próximo pagamento</span>
                                    <div class="days">
                                        <span id="days-until-payment" class="number-a">4</span><span class="days-b">/7 dias</span>
                                    </div>
                                    
                                    <!-- BOTÕES DE INVESTIMENTO -->
                                    <div class="group-c" id="btn-configurar-pagamento">
                                        <div class="rectangle-d"></div>
                                        <span class="configurar-pagamentos">Configurar Pagamentos</span>
                                    </div>
                                    <div class="group-e" id="btn-desistir">
                                        <div class="rectangle-f"></div>
                                        <span class="desistir-nao-quero">Desistir não quero mais</span>
                                    </div>
                                </div>
                                
                                <div class="vector-10"></div>
                                
                                <!-- SEÇÃO "TROCAR DE CAMPO" -->
                                <div class="group-16" id="change-field-container">
                                    <div class="rectangle-17"></div>
                                    <div class="union"></div>
                                    <span class="change-field">Trocar de campo</span>
                                    <div id="selected-field-value">Carregando...</div>
                                    <ul id="field-options-list">
                                        <li data-value="masturbacao">Masturbação</li>
                                        <li data-value="pornografia">Pornografia</li>
                                        <li data-value="bebida">Bebida Alcoólica</li>
                                        <li data-value="fumar">Fumar</li>
                                        <li data-value="outro">Outro</li>
                                    </ul>
                                </div>

                                <!-- BOTÃO: SAIR / DESCONECTAR -->
                                <div class="group-11" id="btn-logout">
                                    <div class="rectangle-12"></div>
                                    <div class="vector-13"></div>
                                    <span class="sair-desconectar">Sair / Desconectar</span>
                                </div>
                                
                                <!-- FOTO E NOME DO USUÁRIO (EXPANDIDO) -->
                                <div class="welcome-photo">
                                    <div id="profile-photo-expanded" class="profile-photo"></div>
                                    <div class="welcome-back-user">
                                        <span class="welcome-back-message">Bem vindo(a) de volta</span>
                                        <span id="user-patent-name" class="user-patent-name">Carregando...</span>
                                    </div>
                                </div>
                                
                                <!-- BOTÃO FECHAR -->
                                <div class="vector-15" id="widget-close-btn"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Substitui o user-welcome existente pelo Dynamic Island
        const userWelcome = document.querySelector('.user-welcome');
        if (userWelcome) {
            userWelcome.outerHTML = widgetHTML;
        } else {
            // Fallback: adiciona ao body
            document.body.insertAdjacentHTML('beforeend', widgetHTML);
        }

        this.widgetElement = document.getElementById('profile-island-container');
    },

    /**
     * Anexa event listeners aos botões
     */
    attachEventListeners() {
        const container = this.widgetElement;

        // Abrir Dynamic Island ao clicar
        container.addEventListener('click', (e) => {
            // Só abre se não estiver expandido e não for clique em botão interno
            if (!container.classList.contains('expanded') && !e.target.closest('.group, .group-11, .group-16, .group-c, .group-e')) {
                this.open();
            }
        });

        // Fechar widget
        const closeBtn = document.getElementById('widget-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }

        // Ver Identidade
        const btnVerIdentidade = document.getElementById('btn-ver-identidade');
        if (btnVerIdentidade) {
            btnVerIdentidade.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleVerIdentidade();
            });
        }

        // Trocar de Campo (Dropdown)
        this.setupFieldChanger();

        // Configurar Pagamento
        const btnConfigurarPagamento = document.getElementById('btn-configurar-pagamento');
        if (btnConfigurarPagamento) {
            btnConfigurarPagamento.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleConfigurarPagamento();
            });
        }

        // Desistir
        const btnDesistir = document.getElementById('btn-desistir');
        if (btnDesistir) {
            btnDesistir.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleDesistir();
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
     * Configura o dropdown "Trocar de campo"
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
                this.handleTrocarCampo(newHabit);
            });
        });

        // Fecha dropdown ao clicar fora
        document.addEventListener('click', (event) => {
            if (!container.contains(event.target)) {
                optionsList.classList.remove('visible');
            }
        });
    },

    /**
     * Abre o widget e carrega dados do usuário
     */
    async open() {
        try {
            console.log('📂 Abrindo Profile Widget (Dynamic Island)...');

            // Carrega dados do usuário
            this.currentUser = await window.UserService.getCurrentUserProfile();
            
            // Atualiza UI do widget
            this.updateWidgetUI();

            // Expande Dynamic Island
            this.widgetElement.classList.add('expanded');
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
        this.widgetElement.classList.remove('expanded');
        
        // Fecha dropdown se estiver aberto
        const optionsList = document.getElementById('field-options-list');
        if (optionsList) {
            optionsList.classList.remove('visible');
        }
        
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

        // Avatar (collapsed)
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.src = this.currentUser.avatar_url || 'https://placehold.co/34x34';
        }

        // Avatar (expanded)
        const profilePhotoExpanded = document.getElementById('profile-photo-expanded');
        if (profilePhotoExpanded) {
            profilePhotoExpanded.style.backgroundImage = `url(${this.currentUser.avatar_url || 'https://placehold.co/34x34'})`;
        }

        // Nome do usuário (collapsed)
        const rankData = this.currentUser.rankData;
        const rankName = rankData ? rankData.name.charAt(0).toUpperCase() + rankData.name.slice(1) : 'Recruta';
        const fullName = `${rankName} ${this.currentUser.last_name || ''}`;
        
        const usernameCollapsed = document.getElementById('welcome-username');
        if (usernameCollapsed) {
            usernameCollapsed.textContent = fullName;
        }

        // Nome do usuário (expanded)
        const userPatentName = document.getElementById('user-patent-name');
        if (userPatentName) {
            userPatentName.textContent = fullName;
        }

        // Hábito atual no dropdown
        const habitLabel = habitLabels[this.currentUser.habit] || 'Não definido';
        const selectedFieldValue = document.getElementById('selected-field-value');
        if (selectedFieldValue) {
            selectedFieldValue.textContent = habitLabel;
        }

        // Dados de investimento (mock - será integrado com Stripe)
        // TODO: Buscar dados reais do Stripe
        const investmentPrice = document.getElementById('investment-price');
        if (investmentPrice) {
            investmentPrice.textContent = '3';
        }

        const daysUntilPayment = document.getElementById('days-until-payment');
        if (daysUntilPayment) {
            daysUntilPayment.textContent = '4';
        }
        
        // Calcula progresso do pagamento (4/7 dias = 57%)
        const progress = (4 / 7) * 100;
        const paymentProgress = document.getElementById('payment-progress');
        if (paymentProgress) {
            paymentProgress.style.width = `${progress}%`;
        }
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

            // Não faz nada se for o mesmo hábito
            if (newHabit === this.currentUser.habit) {
                return;
            }

            // Confirmação
            const confirmed = confirm(
                `Você quer mesmo mudar de campo?\n\n` +
                `Campo atual: ${currentHabitLabel}\n` +
                `Novo campo: ${newHabitLabel}\n\n` +
                `Seu progresso no campo "${currentHabitLabel}" será salvo e você começará do zero no novo campo.\n\n` +
                `Tem certeza?`
            );

            if (!confirmed) {
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
