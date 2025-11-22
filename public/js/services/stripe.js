/**
 * Serviço de integração com Stripe - OTIMIZADO
 * Gerencia checkout, assinaturas e portal do cliente
 */
const StripeService = {
    /**
     * Cria uma sessão de checkout do Stripe
     * @param {string} userId - ID do usuário
     * @param {string} email - Email do usuário
     * @returns {Promise<string>} - URL da sessão de checkout
     */
    async createCheckoutSession(userId, email) {
        try {
            // ✅ CORRIGIDO: Redireciona para welcome.html em vez de habit-tracking.html
            const { data, error } = await window.supabase.functions.invoke('create-checkout-session', {
                body: {
                    userId: userId,
                    email: email,
                    successUrl: `${window.location.origin}/public/onboarding/habit-tracking.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: `${window.location.origin}/onboarding.html`
                }
            });

            if (error) throw error;

            return data.url;
        } catch (error) {
            console.error('Erro ao criar sessão de checkout:', error);
            throw new Error('Não foi possível iniciar o processo de pagamento. Tente novamente.');
        }
    },

    /**
     * Cria um portal do cliente para gerenciar assinatura
     * @param {string} customerId - ID do cliente no Stripe
     * @returns {Promise<string>} - URL do portal do cliente
     */
    async createCustomerPortal(customerId) {
        try {
            const { data, error } = await window.supabase.functions.invoke('create-customer-portal', {
                body: {
                    customerId: customerId,
                    returnUrl: `${window.location.origin}/campo.html`
                }
            });

            if (error) throw error;

            return data.url;
        } catch (error) {
            console.error('Erro ao criar portal do cliente:', error);
            throw new Error('Não foi possível abrir o portal do cliente. Tente novamente.');
        }
    },

    /**
     * Verifica o status da assinatura do usuário
     * @param {string} userId - ID do usuário
     * @returns {Promise<Object>} - Status da assinatura
     */
    async checkSubscriptionStatus(userId) {
        try {
            // ✅ NOVO: Usa cache se disponível
            if (window.getCachedProfile) {
                const cachedProfile = await window.getCachedProfile(userId);
                if (cachedProfile) {
                    return {
                        isActive: cachedProfile.subscription_status === 'active' || cachedProfile.subscription_status === 'trialing',
                        status: cachedProfile.subscription_status,
                        endDate: cachedProfile.subscription_end_date,
                        isTrialing: cachedProfile.subscription_status === 'trialing',
                        isPastDue: cachedProfile.subscription_status === 'past_due',
                        isCanceled: cachedProfile.subscription_status === 'canceled'
                    };
                }
            }

            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('subscription_status, subscription_end_date')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return {
                isActive: profile.subscription_status === 'active' || profile.subscription_status === 'trialing',
                status: profile.subscription_status,
                endDate: profile.subscription_end_date,
                isTrialing: profile.subscription_status === 'trialing',
                isPastDue: profile.subscription_status === 'past_due',
                isCanceled: profile.subscription_status === 'canceled'
            };
        } catch (error) {
            console.error('Erro ao verificar status da assinatura:', error);
            return {
                isActive: false,
                status: 'unknown',
                endDate: null,
                isTrialing: false,
                isPastDue: false,
                isCanceled: false
            };
        }
    },

    /**
     * Mostra notificação de status da assinatura
     * @param {Object} status - Status da assinatura
     */
    showSubscriptionNotification(status) {
        if (status.isActive && !status.isPastDue) return;

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        let message = '';
        let actionButton = '';
        if (status.isPastDue) {
            message = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <strong style="font-size: 16px;">Pagamento Pendente</strong>
                </div>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">
                    Houve um problema com seu pagamento. Atualize seus dados de pagamento para continuar acessando o Campo.
                </p>
            `;
            actionButton = '<button onclick="StripeService.openPaymentUpdate()" style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">Atualizar Pagamento</button>';
        } else if (status.isCanceled) {
            message = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <strong style="font-size: 16px;">Assinatura Cancelada</strong>
                </div>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">
                    Sua assinatura foi cancelada. Reative para continuar acessando o Campo.
                </p>
            `;
            actionButton = '<button onclick="StripeService.reactivateSubscription()" style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">Reativar Assinatura</button>';
        }

        notification.innerHTML = `
            ${message}
            ${actionButton}
            <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; cursor: pointer; font-size: 20px; opacity: 0.7;">×</button>
        `;

        // Adiciona animação CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove automaticamente após 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    },

    /**
     * Abre página para atualizar pagamento
     */
    async openPaymentUpdate() {
        try {
            const user = await window.supabase.auth.getUser();
            if (!user.data.user) throw new Error('Usuário não autenticado');

            const { data: profile } = await window.supabase
                .from('profiles')
                .select('stripe_customer_id')
                .eq('id', user.data.user.id)
                .single();

            if (profile && profile.stripe_customer_id) {
                const portalUrl = await this.createCustomerPortal(profile.stripe_customer_id);
                window.location.href = portalUrl;
            }
        } catch (error) {
            console.error('Erro ao abrir atualização de pagamento:', error);
            alert('Não foi possível abrir a página de pagamento. Entre em contato com o suporte.');
        }
    },

    /**
     * Reativa assinatura cancelada
     */
    async reactivateSubscription() {
        try {
            const user = await window.supabase.auth.getUser();
            if (!user.data.user) throw new Error('Usuário não autenticado');

            const checkoutUrl = await this.createCheckoutSession(
                user.data.user.id,
                user.data.user.email
            );

            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Erro ao reativar assinatura:', error);
            alert('Não foi possível reativar a assinatura. Tente novamente.');
        }
    }
};

// Exporta para uso global
window.StripeService = StripeService;
