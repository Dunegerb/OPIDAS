// Access Control Service - OPIDAS
// Gerencia controle de acesso baseado em assinaturas e bloqueios

const AccessControl = {
    /**
     * Verifica se o usuário tem acesso ao conteúdo premium (Campo)
     * @returns {Promise<Object>} - Status de acesso
     */
    async checkAccess() {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) {
                return {
                    hasAccess: false,
                    reason: 'not_authenticated',
                    message: 'Você precisa estar autenticado para acessar esta página.'
                };
            }

            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('subscription_status, is_blocked, block_end_date, stripe_subscription_id')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Verifica se está bloqueado
            if (profile.is_blocked) {
                // Verifica se o bloqueio expirou
                if (profile.block_end_date) {
                    const blockEndDate = new Date(profile.block_end_date);
                    const now = new Date();

                    if (now < blockEndDate) {
                        return {
                            hasAccess: false,
                            reason: 'blocked',
                            message: 'Seu acesso está temporariamente bloqueado devido a problemas com o pagamento.',
                            blockEndDate: blockEndDate,
                            subscriptionStatus: profile.subscription_status
                        };
                    } else {
                        // Bloqueio expirou, remove o bloqueio
                        await window.supabase
                            .from('profiles')
                            .update({ is_blocked: false, block_end_date: null })
                            .eq('id', user.id);
                    }
                }
            }

            // Verifica status da assinatura
            const activeStatuses = ['active', 'trialing'];
            const hasActiveSubscription = activeStatuses.includes(profile.subscription_status);

            if (!hasActiveSubscription) {
                let reason = 'no_subscription';
                let message = 'Você precisa de uma assinatura ativa para acessar o Campo.';

                if (profile.subscription_status === 'past_due') {
                    reason = 'payment_failed';
                    message = 'Houve um problema com seu pagamento. Atualize seus dados de pagamento para continuar.';
                } else if (profile.subscription_status === 'canceled') {
                    reason = 'subscription_canceled';
                    message = 'Sua assinatura foi cancelada. Reative para continuar acessando o Campo.';
                }

                return {
                    hasAccess: false,
                    reason: reason,
                    message: message,
                    subscriptionStatus: profile.subscription_status
                };
            }

            // Usuário tem acesso
            return {
                hasAccess: true,
                subscriptionStatus: profile.subscription_status,
                subscriptionId: profile.stripe_subscription_id
            };

        } catch (error) {
            console.error('❌ Erro ao verificar acesso:', error);
            return {
                hasAccess: false,
                reason: 'error',
                message: 'Ocorreu um erro ao verificar seu acesso. Tente novamente.'
            };
        }
    },

    /**
     * Bloqueia o acesso do usuário
     * @param {string} userId - ID do usuário
     * @param {number} days - Número de dias de bloqueio
     * @returns {Promise<void>}
     */
    async blockUser(userId, days = 7) {
        try {
            const blockEndDate = new Date();
            blockEndDate.setDate(blockEndDate.getDate() + days);

            await window.supabase
                .from('profiles')
                .update({
                    is_blocked: true,
                    block_end_date: blockEndDate.toISOString()
                })
                .eq('id', userId);

            console.log(`🚫 Usuário ${userId} bloqueado até ${blockEndDate.toLocaleDateString()}`);

        } catch (error) {
            console.error('❌ Erro ao bloquear usuário:', error);
            throw error;
        }
    },

    /**
     * Desbloqueia o acesso do usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<void>}
     */
    async unblockUser(userId) {
        try {
            await window.supabase
                .from('profiles')
                .update({
                    is_blocked: false,
                    block_end_date: null
                })
                .eq('id', userId);

            console.log(`✅ Usuário ${userId} desbloqueado`);

        } catch (error) {
            console.error('❌ Erro ao desbloquear usuário:', error);
            throw error;
        }
    },

    /**
     * Exibe modal de bloqueio/aviso de pagamento
     * @param {Object} accessStatus - Status de acesso retornado por checkAccess
     */
    showAccessDeniedModal(accessStatus) {
        // Remove modal existente se houver
        const existingModal = document.getElementById('access-denied-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Cria o modal
        const modal = document.createElement('div');
        modal.id = 'access-denied-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        let iconSvg = '';
        let title = '';
        let actionButton = '';

        if (accessStatus.reason === 'blocked' || accessStatus.reason === 'payment_failed') {
            iconSvg = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;
            title = 'Acesso Bloqueado';
            actionButton = `
                <button onclick="AccessControl.redirectToPayment()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-right: 12px;">
                    Atualizar Pagamento
                </button>
            `;
        } else if (accessStatus.reason === 'subscription_canceled') {
            iconSvg = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
            title = 'Assinatura Cancelada';
            actionButton = `
                <button onclick="AccessControl.redirectToSubscription()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-right: 12px;">
                    Reativar Assinatura
                </button>
            `;
        } else {
            iconSvg = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            `;
            title = 'Assinatura Necessária';
            actionButton = `
                <button onclick="AccessControl.redirectToSubscription()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-right: 12px;">
                    Assinar Agora
                </button>
            `;
        }

        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); font-family: 'Inter', sans-serif;">
                <div style="margin-bottom: 24px;">
                    ${iconSvg}
                </div>
                <h2 style="margin: 0 0 16px 0; font-size: 28px; color: #1f2937;">${title}</h2>
                <p style="margin: 0 0 32px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                    ${accessStatus.message}
                </p>
                <div style="display: flex; justify-content: center; gap: 12px;">
                    ${actionButton}
                    <button onclick="AccessControl.redirectToDoutrina()" style="background: #f3f4f6; color: #374151; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
                        Ir para Doutrina
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Redireciona para página de pagamento
     */
    async redirectToPayment() {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await window.supabase
                .from('profiles')
                .select('stripe_customer_id')
                .eq('id', user.id)
                .single();

            if (profile && profile.stripe_customer_id) {
                const portalUrl = await window.StripeService.createCustomerPortal(profile.stripe_customer_id);
                window.location.href = portalUrl;
            }
        } catch (error) {
            console.error('❌ Erro ao redirecionar para pagamento:', error);
            alert('Não foi possível abrir a página de pagamento. Entre em contato com o suporte.');
        }
    },

    /**
     * Redireciona para página de assinatura
     */
    async redirectToSubscription() {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) return;

            const checkoutUrl = await window.StripeService.createCheckoutSession(
                user.id,
                user.email
            );

            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('❌ Erro ao redirecionar para assinatura:', error);
            alert('Não foi possível iniciar o processo de assinatura. Tente novamente.');
        }
    },

    /**
     * Redireciona para página Doutrina
     */
    redirectToDoutrina() {
        window.location.href = '/doutrina.html';
    },

    /**
     * Protege uma página verificando o acesso
     * @param {boolean} requiresSubscription - Se true, requer assinatura ativa
     * @returns {Promise<boolean>} - True se tem acesso
     */
    async protectPage(requiresSubscription = true) {
        try {
            // Verifica autenticação
            const { data: { user } } = await window.supabase.auth.getUser();
            
            if (!user) {
                console.warn('⚠️ Usuário não autenticado, redirecionando...');
                window.location.href = '/index.html';
                return false;
            }

            // Se não requer assinatura (ex: página Doutrina), permite acesso
            if (!requiresSubscription) {
                return true;
            }

            // Verifica acesso ao conteúdo premium
            const accessStatus = await this.checkAccess();

            if (!accessStatus.hasAccess) {
                console.warn('⚠️ Acesso negado:', accessStatus.reason);
                this.showAccessDeniedModal(accessStatus);
                return false;
            }

            // Verifica se precisa mostrar notificação de pagamento
            if (accessStatus.subscriptionStatus === 'past_due') {
                window.StripeService.showPaymentNotification({
                    isPastDue: true,
                    isCanceled: false
                });
            }

            return true;

        } catch (error) {
            console.error('❌ Erro ao proteger página:', error);
            return false;
        }
    }
};

// Exporta para uso global
window.AccessControl = AccessControl;
