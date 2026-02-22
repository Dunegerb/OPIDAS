/**
 * Stripe integration service
 * Manages checkout, subscriptions, and the customer portal
 * ✅ FIXED: No longer sends userId from the frontend (IDOR security)
 */
const StripeService = {
    /**
     * Creates a Stripe checkout session
     * ✅ FIX: Removed userId parameter - it will be extracted from the token on the backend
     * @param {string} successUrl - Success URL (optional)
     * @param {string} cancelUrl - Cancel URL (optional)
     * @returns {Promise<string>} - Checkout session URL
     */
    async createCheckoutSession(successUrl = null, cancelUrl = null) {
        try {
            // ✅ SECURITY FIX: We no longer send userId or email
            // The backend extracts this information from the authenticated JWT token
            const { data, error } = await window.supabase.functions.invoke('create-checkout-session', {
                body: {
                    // ✅ URLs are non-sensitive data, can come from the frontend
                    successUrl: successUrl || `${window.location.origin}/onboarding/habit-tracking.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: cancelUrl || `${window.location.origin}/onboarding/investment.html`
                }
            });

            if (error) throw error;

            return data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw new Error('Could not start the payment process. Please try again.');
        }
    },

    /**
     * Creates a customer portal to manage subscription
     * @param {string} customerId - Stripe customer ID
     * @returns {Promise<string>} - Customer portal URL
     */
    async createCustomerPortal(customerId) {
        try {
            const { data, error } = await window.supabase.functions.invoke('create-portal-session', {
                body: {
                    customerId: customerId,
                    returnUrl: `${window.location.origin}/battlefield.html`
                }
            });

            if (error) throw error;

            return data.url;
        } catch (error) {
            console.error('Error creating customer portal:', error);
            throw new Error('Could not open the customer portal. Please try again.');
        }
    },

    /**
     * Checks the user's subscription status
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Subscription status
     */
    async checkSubscriptionStatus(userId) {
        try {
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
            console.error('Error checking subscription status:', error);
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
     * ✅ NEW: Waits for subscription confirmation after payment
     * Implements polling to resolve race condition with webhook
     * @param {string} userId - User ID
     * @param {number} maxAttempts - Maximum number of attempts
     * @param {number} interval - Interval between attempts (ms)
     * @returns {Promise<Object>} - Subscription status
     */
    async waitForSubscriptionActivation(userId, maxAttempts = 5, interval = 2000) {
        console.log('⏳ Waiting for subscription confirmation...');
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`🔄 Attempt ${attempt}/${maxAttempts}`);
            
            const status = await this.checkSubscriptionStatus(userId);
            
            if (status.isActive || status.isTrialing) {
                console.log('✅ Subscription confirmed!');
                return status;
            }
            
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
        
        console.warn('⚠️ Timeout waiting for confirmation. Webhook might be delayed.');
        return await this.checkSubscriptionStatus(userId);
    },

    /**
     * Shows subscription status notification
     * @param {Object} status - Subscription status
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
                    <strong style="font-size: 16px;">Payment Due</strong>
                </div>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">
                    There was a problem with your payment. Please update your payment details to continue accessing the Battlefield.
                </p>
            `;
            actionButton = '<button onclick="StripeService.openPaymentUpdate()" style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">Update Payment</button>';
        } else if (status.isCanceled) {
            message = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <strong style="font-size: 16px;">Subscription Canceled</strong>
                </div>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5;">
                    Your subscription has been canceled. Reactivate to continue accessing the Battlefield.
                </p>
            `;
            actionButton = '<button onclick="StripeService.reactivateSubscription()" style="background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">Reactivate Subscription</button>';
        }

        notification.innerHTML = `
            ${message}
            ${actionButton}
            <button onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; cursor: pointer; font-size: 20px; opacity: 0.7;">×</button>
        `;

        // Add CSS animation
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

        // Automatically remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 10000);
    },

    /**
     * Opens page to update payment
     */
    async openPaymentUpdate() {
        try {
            const user = await window.supabase.auth.getUser();
            if (!user.data.user) throw new Error('User not authenticated');

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
            console.error('Error opening payment update:', error);
            alert('Could not open the payment page. Please contact support.');
        }
    },

    /**
     * Reactivates a canceled subscription
     */
    async reactivateSubscription() {
        try {
            const user = await window.supabase.auth.getUser();
            if (!user.data.user) throw new Error('User not authenticated');

            // ✅ FIX: No longer passes userId
            const checkoutUrl = await this.createCheckoutSession();

            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Error reactivating subscription:', error);
            alert('Could not reactivate the subscription. Please try again.');
        }
    }
};

// Export for global use
window.StripeService = StripeService;
