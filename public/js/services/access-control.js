// Access Control Service - OPIDAS
// Manages access control based on subscriptions and blocks

const AccessControl = {
    /**
     * Checks if the user has access to premium content (Battlefield)
     * @returns {Promise<Object>} - Access status
     */
    async checkAccess() {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) {
                return {
                    hasAccess: false,
                    reason: 'not_authenticated',
                    message: 'You need to be authenticated to access this page.'
                };
            }

            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('subscription_status, is_blocked, block_end_date, stripe_subscription_id')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Checks if the user is blocked
            if (profile.is_blocked) {
                // Checks if the block has expired
                if (profile.block_end_date) {
                    const blockEndDate = new Date(profile.block_end_date);
                    const now = new Date();

                    if (now < blockEndDate) {
                        return {
                            hasAccess: false,
                            reason: 'blocked',
                            message: 'Your access is temporarily blocked due to payment issues.',
                            blockEndDate: blockEndDate,
                            subscriptionStatus: profile.subscription_status
                        };
                    } else {
                        // Block has expired, remove the block
                        await window.supabase
                            .from('profiles')
                            .update({ is_blocked: false, block_end_date: null })
                            .eq('id', user.id);
                    }
                }
            }

            // Checks subscription status
            const activeStatuses = ['active', 'trialing'];
            const hasActiveSubscription = activeStatuses.includes(profile.subscription_status);

            if (!hasActiveSubscription) {
                let reason = 'no_subscription';
                let message = 'You need an active subscription to access the Battlefield.';

                if (profile.subscription_status === 'past_due') {
                    reason = 'payment_failed';
                    message = 'There was a problem with your payment. Please update your payment details to continue.';
                } else if (profile.subscription_status === 'canceled') {
                    reason = 'subscription_canceled';
                    message = 'Your subscription has been canceled. Reactivate it to continue accessing the Battlefield.';
                }

                return {
                    hasAccess: false,
                    reason: reason,
                    message: message,
                    subscriptionStatus: profile.subscription_status
                };
            }

            // User has access
            return {
                hasAccess: true,
                subscriptionStatus: profile.subscription_status,
                subscriptionId: profile.stripe_subscription_id
            };

        } catch (error) {
            console.error('❌ Error checking access:', error);
            return {
                hasAccess: false,
                reason: 'error',
                message: 'An error occurred while checking your access. Please try again.'
            };
        }
    },

    /**
     * Blocks user access
     * @param {string} userId - User ID
     * @param {number} days - Number of days to block
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

            console.log(`🚫 User ${userId} blocked until ${blockEndDate.toLocaleDateString('en-US')}`);

        } catch (error) {
            console.error('❌ Error blocking user:', error);
            throw error;
        }
    },

    /**
     * Unblocks user access
     * @param {string} userId - User ID
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

            console.log(`✅ User ${userId} unblocked`);

        } catch (error) {
            console.error('❌ Error unblocking user:', error);
            throw error;
        }
    },

    /**
     * Displays a block/payment warning modal
     * @param {Object} accessStatus - Access status returned by checkAccess
     */
    showAccessDeniedModal(accessStatus) {
        // Remove existing modal if any
        const existingModal = document.getElementById('access-denied-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create the modal
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
            title = 'Access Blocked';
            actionButton = `
                <button onclick="AccessControl.redirectToPayment()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-right: 12px;">
                    Update Payment
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
            title = 'Subscription Canceled';
            actionButton = `
                <button onclick="AccessControl.redirectToSubscription()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-right: 12px;">
                    Reactivate Subscription
                </button>
            `;
        } else {
            iconSvg = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            `;
            title = 'Subscription Required';
            actionButton = `
                <button onclick="AccessControl.redirectToSubscription()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; margin-right: 12px;">
                    Subscribe Now
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
                        Go to Doctrine
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Redirects to the payment page
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
            console.error('❌ Error redirecting to payment:', error);
            alert('Could not open the payment page. Please contact support.');
        }
    },

    /**
     * Redirects to the subscription page
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
            console.error('❌ Error redirecting to subscription:', error);
            alert('Could not start the subscription process. Please try again.');
        }
    },

    /**
     * Redirects to the Doctrine page
     */
    redirectToDoutrina() {
        window.location.href = '/doutrina.html';
    },

    /**
     * Protects a page by checking access
     * @param {boolean} requiresSubscription - If true, requires an active subscription
     * @returns {Promise<boolean>} - True if access is granted
     */
    async protectPage(requiresSubscription = true) {
        try {
            // Check authentication
            const { data: { user } } = await window.supabase.auth.getUser();
            
            if (!user) {
                console.warn('⚠️ User not authenticated, redirecting...');
                window.location.href = '/index.html';
                return false;
            }

            // If subscription is not required (e.g., Doctrine page), allow access
            if (!requiresSubscription) {
                return true;
            }

            // Check access to premium content
            const accessStatus = await this.checkAccess();

            if (!accessStatus.hasAccess) {
                console.warn('⚠️ Access denied:', accessStatus.reason);
                this.showAccessDeniedModal(accessStatus);
                return false;
            }

            // Check if a payment notification needs to be shown
            if (accessStatus.subscriptionStatus === 'past_due') {
                window.StripeService.showPaymentNotification({
                    isPastDue: true,
                    isCanceled: false
                });
            }

            return true;

        } catch (error) {
            console.error('❌ Error protecting page:', error);
            return false;
        }
    }
};

// Export for global use
window.AccessControl = AccessControl;
