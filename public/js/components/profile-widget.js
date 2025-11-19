/**
 * OPIDAS Profile Widget - Dynamic Island
 * Animação estilo Apple Dynamic Island com funcionalidades completas
 */

window.ProfileWidgetDynamicIsland = (function () {
    'use strict';

    // Estado do widget
    let isExpanded = false;
    let userData = null;
    let subscriptionData = null;

    // Elementos DOM
    let islandContainer = null;
    let closeButton = null;

    /**
     * Inicializa o widget
     */
    function init() {
        createWidgetHTML();
        attachEventListeners();
        loadUserData();
        loadSubscriptionData();
    }

    /**
     * Cria a estrutura HTML do widget
     */
    function createWidgetHTML() {
        // Remove widget existente se houver
        const existing = document.getElementById('profile-island-container');
        if (existing) {
            existing.remove();
        }

        // Cria o container principal
        const container = document.createElement('div');
        container.id = 'profile-island-container';
        container.innerHTML = `
            <div class="island-background"></div>
            <div class="island-content-wrapper">
                <div class="island-initial-content">
                    <img class="user-avatar-circle" id="user-avatar-trigger" alt="Profile photo" src="">
                </div>

                <div class="island-expanded-content">
                    <div class="main-container">
                        <div class="flex-column-ef">
                            <div class="vector"></div>
                            
                            <!-- Ver Identidade -->
                            <div class="group" id="btn-ver-identidade">
                                <div class="rectangle"></div>
                                <div class="vector-1"></div>
                                <span class="ver-identidade">Ver Identidade</span>
                            </div>
                            
                            <div class="vector-2"></div>
                            
                            <!-- OPIDAS Investimento -->
                            <div class="group-3">
                                <div class="group-4" id="payment-progress-bar"></div>
                                <div class="rectangle-5"></div>
                                <div class="group-6">
                                    <span class="semana">/semana</span>
                                    <span class="number" id="subscription-price">3</span>
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
                                    <span class="number-a" id="days-remaining">4</span>
                                    <span class="days-b">/7 dias</span>
                                </div>
                                <div class="group-c" id="btn-config-pagamentos">
                                    <div class="rectangle-d"></div>
                                    <span class="configurar-pagamentos">Configurar Pagamentos</span>
                                </div>
                                <div class="group-e" id="btn-desistir">
                                    <div class="rectangle-f"></div>
                                    <span class="desistir-nao-quero">Desistir não quero mais</span>
                                </div>
                            </div>
                            
                            <div class="vector-10"></div>
                            
                            <!-- Trocar de Campo -->
                            <div class="group-16" id="change-field-container">
                                <div class="rectangle-17"></div>
                                <div class="union"></div>
                                <span class="change-field">Trocar de campo</span>
                                <div id="selected-field-value">Masturbação</div>
                                <ul id="field-options-list">
                                    <li data-value="masturbacao">Masturbação</li>
                                    <li data-value="pornografia">Pornografia</li>
                                    <li data-value="bebida">Bebida Alcoólica</li>
                                    <li data-value="fumar">Fumar</li>
                                    <li data-value="outro">Outro</li>
                                </ul>
                            </div>

                            <!-- Sair / Desconectar -->
                            <div class="group-11" id="btn-sair">
                                <div class="rectangle-12"></div>
                                <div class="vector-13"></div>
                                <span class="sair-desconectar">Sair / Desconectar</span>
                            </div>
                            
                            <!-- Header com Foto e Boas-vindas -->
                            <div class="welcome-photo">
                                <div class="profile-photo" id="profile-photo-expanded"></div>
                                <div class="welcome-back-user">
                                    <span class="welcome-back-message">Bem vindo(a) de volta</span>
                                    <span class="user-patent-name" id="user-patent-name">Capitão</span>
                                </div>
                            </div>
                            
                            <!-- Botão Fechar -->
                            <div class="vector-15" id="close-widget-btn"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        islandContainer = container;
        closeButton = document.getElementById('close-widget-btn');
    }

    /**
     * Anexa event listeners
     */
    function attachEventListeners() {
        // Abrir widget ao clicar no avatar
        const avatarTrigger = document.getElementById('user-avatar-trigger');
        if (avatarTrigger) {
            avatarTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                openWidget();
            });
        }

        // Fechar widget
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWidget();
            });
        }

        // Fechar ao clicar fora (quando expandido)
        document.addEventListener('click', (e) => {
            if (isExpanded && !islandContainer.contains(e.target)) {
                closeWidget();
            }
        });

        // Prevenir propagação de cliques dentro do widget
        islandContainer.addEventListener('click', (e) => {
            if (isExpanded && e.target === islandContainer.querySelector('.island-background')) {
                // Permite fechar clicando no fundo
                closeWidget();
            }
        });

        // Botões de ação
        setupActionButtons();
        setupFieldChanger();
    }

    /**
     * Configura os botões de ação
     */
    function setupActionButtons() {
        // Ver Identidade
        const btnIdentidade = document.getElementById('btn-ver-identidade');
        if (btnIdentidade) {
            btnIdentidade.addEventListener('click', (e) => {
                e.stopPropagation();
                handleVerIdentidade();
            });
        }

        // Configurar Pagamentos
        const btnPagamentos = document.getElementById('btn-config-pagamentos');
        if (btnPagamentos) {
            btnPagamentos.addEventListener('click', (e) => {
                e.stopPropagation();
                handleConfigurarPagamentos();
            });
        }

        // Desistir
        const btnDesistir = document.getElementById('btn-desistir');
        if (btnDesistir) {
            btnDesistir.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDesistir();
            });
        }

        // Sair
        const btnSair = document.getElementById('btn-sair');
        if (btnSair) {
            btnSair.addEventListener('click', (e) => {
                e.stopPropagation();
                handleSair();
            });
        }
    }

    /**
     * Configura o dropdown de trocar de campo
     */
    function setupFieldChanger() {
        const container = document.getElementById('change-field-container');
        const selectedValueDiv = document.getElementById('selected-field-value');
        const optionsList = document.getElementById('field-options-list');
        const options = optionsList.querySelectorAll('li');

        container.addEventListener('click', (event) => {
            event.stopPropagation();
            optionsList.classList.toggle('visible');
            container.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', (event) => {
                event.stopPropagation();
                const newHabit = option.getAttribute('data-value');
                const newHabitLabel = option.textContent;
                handleTrocarCampo(newHabit, newHabitLabel);
            });
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (event) => {
            if (!container.contains(event.target)) {
                optionsList.classList.remove('visible');
                container.classList.remove('open');
            }
        });
    }

    /**
     * Abre o widget
     */
    function openWidget() {
        if (!isExpanded) {
            islandContainer.classList.add('expanded');
            isExpanded = true;
        }
    }

    /**
     * Fecha o widget
     */
    function closeWidget() {
        if (isExpanded) {
            islandContainer.classList.remove('expanded');
            isExpanded = false;
            // Fecha dropdown se estiver aberto
            const optionsList = document.getElementById('field-options-list');
            const container = document.getElementById('change-field-container');
            if (optionsList) optionsList.classList.remove('visible');
            if (container) container.classList.remove('open');
        }
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
            updateUIWithUserData(profile);
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }

    /**
     * Atualiza a UI com os dados do usuário
     */
    function updateUIWithUserData(profile) {
        // Avatar
        const avatarUrl = profile.avatar_url || 'https://via.placeholder.com/150';
        const avatarTrigger = document.getElementById('user-avatar-trigger');
        const profilePhotoExpanded = document.getElementById('profile-photo-expanded');
        
        if (avatarTrigger) avatarTrigger.src = avatarUrl;
        if (profilePhotoExpanded) {
            profilePhotoExpanded.style.backgroundImage = `url(${avatarUrl})`;
        }

        // Nome e patente
        const patentName = document.getElementById('user-patent-name');
        if (patentName) {
            const rank = profile.rank || 'Recruta';
            const name = profile.full_name || profile.email?.split('@')[0] || 'Usuário';
            patentName.textContent = `${rank} ${name}`;
        }

        // Campo atual
        const selectedField = document.getElementById('selected-field-value');
        if (selectedField) {
            const habitLabels = {
                'masturbacao': 'Masturbação',
                'pornografia': 'Pornografia',
                'bebida': 'Bebida Alcoólica',
                'fumar': 'Fumar',
                'outro': 'Outro'
            };
            selectedField.textContent = habitLabels[profile.habit] || 'Masturbação';
        }
    }

    /**
     * Carrega dados da assinatura
     */
    async function loadSubscriptionData() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) return;

            const { data: profile } = await window.supabaseClient
                .from('profiles')
                .select('stripe_subscription_id, stripe_current_period_end')
                .eq('id', user.id)
                .single();

            if (profile && profile.stripe_subscription_id) {
                subscriptionData = profile;
                updateSubscriptionUI(profile);
            }
        } catch (error) {
            console.error('Erro ao carregar dados da assinatura:', error);
        }
    }

    /**
     * Atualiza a UI com dados da assinatura
     */
    function updateSubscriptionUI(subscription) {
        if (!subscription.stripe_current_period_end) return;

        const periodEnd = new Date(subscription.stripe_current_period_end);
        const now = new Date();
        const diffTime = periodEnd - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Atualiza dias restantes
        const daysRemainingEl = document.getElementById('days-remaining');
        if (daysRemainingEl) {
            daysRemainingEl.textContent = Math.max(0, diffDays);
        }

        // Atualiza barra de progresso
        const progressBar = document.getElementById('payment-progress-bar');
        if (progressBar) {
            const percentage = ((7 - diffDays) / 7) * 100;
            progressBar.style.background = `linear-gradient(90deg, var(--opidas-gold) ${percentage}%, rgba(197, 164, 126, 0.2) ${percentage}%)`;
        }
    }

    /**
     * Handler: Ver Identidade
     */
    function handleVerIdentidade() {
        closeWidget();
        
        // Dispara evento customizado para abrir o modal de identidade
        if (window.IdentityModal && typeof window.IdentityModal.open === 'function') {
            window.IdentityModal.open();
        } else {
            console.warn('IdentityModal não encontrado. Certifique-se de incluir identity-modal.js');
            alert('Modal de identidade será aberto aqui');
        }
    }

    /**
     * Handler: Configurar Pagamentos
     */
    async function handleConfigurarPagamentos() {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
                alert('Você precisa estar logado para acessar esta funcionalidade.');
                return;
            }

            // Chama Edge Function para criar sessão do Stripe Portal
            const { data, error } = await window.supabaseClient.functions.invoke('create-portal-session', {
                body: { userId: user.id }
            });

            if (error) throw error;

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Erro ao abrir portal de pagamentos:', error);
            alert('Erro ao abrir portal de pagamentos. Tente novamente.');
        }
    }

    /**
     * Handler: Desistir (Cancelar e Deletar Conta)
     */
    async function handleDesistir() {
        // Primeira confirmação
        if (!confirm('⚠️ ATENÇÃO: Você está prestes a CANCELAR sua assinatura e DELETAR sua conta permanentemente.\n\nTodos os seus dados serão perdidos. Tem certeza?')) {
            return;
        }

        // Segunda confirmação
        if (!confirm('🛑 ÚLTIMA CHANCE: Esta ação é IRREVERSÍVEL!\n\nSua conta, progresso e todos os dados serão permanentemente deletados.\n\nDeseja realmente continuar?')) {
            return;
        }

        // Terceira confirmação com digitação
        const confirmText = prompt('Digite "SIM" (em maiúsculas) para confirmar a exclusão definitiva da sua conta:');
        
        if (confirmText !== 'SIM') {
            alert('Operação cancelada. Sua conta permanece ativa.');
            return;
        }

        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
                alert('Erro: Usuário não autenticado.');
                return;
            }

            // Chama Edge Function para cancelar assinatura e deletar conta
            const { data, error } = await window.supabaseClient.functions.invoke('cancel-subscription-and-delete', {
                body: { userId: user.id }
            });

            if (error) throw error;

            // Logout
            await window.supabaseClient.auth.signOut();

            // Mensagem de despedida
            alert('Sua conta foi deletada com sucesso. Sentiremos sua falta! 👋');

            // Redireciona para página inicial
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Erro ao deletar conta:', error);
            alert('Erro ao deletar conta. Por favor, entre em contato com o suporte.');
        }
    }

    /**
     * Handler: Sair / Desconectar
     */
    async function handleSair() {
        if (!confirm('Deseja realmente sair?')) {
            return;
        }

        try {
            await window.supabaseClient.auth.signOut();
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao sair. Tente novamente.');
        }
    }

    /**
     * Handler: Trocar de Campo
     */
    async function handleTrocarCampo(newHabit, newHabitLabel) {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            
            if (!user) {
                alert('Você precisa estar logado para trocar de campo.');
                return;
            }

            // Busca dados atuais
            const { data: currentProfile } = await window.supabaseClient
                .from('profiles')
                .select('habit, retention_days, rank')
                .eq('id', user.id)
                .single();

            if (!currentProfile) {
                alert('Erro ao carregar perfil.');
                return;
            }

            // Confirma troca
            if (!confirm(`Deseja trocar de "${currentProfile.habit}" para "${newHabitLabel}"?\n\nSeu progresso atual será salvo e você poderá voltar depois.`)) {
                return;
            }

            // Chama função do banco para trocar de campo
            const { data: result, error } = await window.supabaseClient
                .rpc('switch_user_habit', {
                    p_user_id: user.id,
                    p_new_habit: newHabit,
                    p_current_habit: currentProfile.habit,
                    p_current_retention_days: currentProfile.retention_days,
                    p_current_rank: currentProfile.rank
                });

            if (error) throw error;

            // Atualiza UI
            const selectedField = document.getElementById('selected-field-value');
            if (selectedField) {
                selectedField.textContent = newHabitLabel;
            }

            // Fecha dropdown
            const optionsList = document.getElementById('field-options-list');
            const container = document.getElementById('change-field-container');
            if (optionsList) optionsList.classList.remove('visible');
            if (container) container.classList.remove('open');

            // Mensagem de sucesso
            if (result.had_previous_progress) {
                alert(`✅ Campo trocado com sucesso!\n\nVocê voltou para "${newHabitLabel}" com ${result.retention_days} dias de progresso.`);
            } else {
                alert(`✅ Campo trocado com sucesso!\n\nVocê começou em "${newHabitLabel}". Boa sorte!`);
            }

            // Recarrega a página para atualizar todos os dados
            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error('Erro ao trocar de campo:', error);
            alert('Erro ao trocar de campo. Tente novamente.');
        }
    }

    /**
     * API pública
     */
    return {
        init,
        open: openWidget,
        close: closeWidget
    };
})();

// Inicializa automaticamente quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ProfileWidgetDynamicIsland.init();
    });
} else {
    window.ProfileWidgetDynamicIsland.init();
}
