/**
 * Toast Component - Sistema de Notificações Visuais
 * Substitui alert() e console.error() por notificações elegantes
 * ✅ NOVO: Melhoria de UX
 */

const Toast = {
    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duração em ms (padrão: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        // Remove toasts anteriores se houver muitos
        const existingToasts = document.querySelectorAll('.toast-notification');
        if (existingToasts.length >= 3) {
            existingToasts[0].remove();
        }

        // Cria o elemento toast
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        // Define ícones para cada tipo
        const icons = {
            success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };

        // Cores para cada tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Adiciona estilos inline
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #333;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 500px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            border-left: 4px solid ${colors[type]};
            margin-bottom: 10px;
        `;

        // Adiciona CSS para os elementos internos
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            .toast-icon {
                flex-shrink: 0;
                color: ${colors[type]};
            }
            .toast-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.5;
            }
            .toast-close {
                flex-shrink: 0;
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }
            .toast-close:hover {
                color: #333;
            }
        `;
        
        if (!document.getElementById('toast-styles')) {
            style.id = 'toast-styles';
            document.head.appendChild(style);
        }

        // Adiciona ao DOM
        document.body.appendChild(toast);

        // Remove automaticamente após a duração especificada
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);

        return toast;
    },

    /**
     * Mostra notificação de sucesso
     * @param {string} message - Mensagem
     * @param {number} duration - Duração em ms
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    },

    /**
     * Mostra notificação de erro
     * @param {string} message - Mensagem
     * @param {number} duration - Duração em ms
     */
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    },

    /**
     * Mostra notificação de aviso
     * @param {string} message - Mensagem
     * @param {number} duration - Duração em ms
     */
    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    },

    /**
     * Mostra notificação informativa
     * @param {string} message - Mensagem
     * @param {number} duration - Duração em ms
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    },

    /**
     * Mostra notificação de carregamento (não desaparece automaticamente)
     * @param {string} message - Mensagem
     * @returns {Object} - Toast element com método close()
     */
    loading(message = 'Carregando...') {
        const toast = document.createElement('div');
        toast.className = 'toast-notification toast-loading';
        
        toast.innerHTML = `
            <div class="toast-spinner">
                <div style="width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <div class="toast-message">${message}</div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #333;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 500px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            border-left: 4px solid #3b82f6;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        if (!document.getElementById('spinner-styles')) {
            style.id = 'spinner-styles';
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        return {
            element: toast,
            close: () => {
                if (toast.parentElement) {
                    toast.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => toast.remove(), 300);
                }
            },
            update: (newMessage) => {
                const messageEl = toast.querySelector('.toast-message');
                if (messageEl) {
                    messageEl.textContent = newMessage;
                }
            }
        };
    },

    /**
     * Remove todos os toasts
     */
    clearAll() {
        document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
    }
};

// Exporta para uso global
window.Toast = Toast;

// ✅ NOVO: Sobrescreve console.error para mostrar toast também (opcional)
if (window.OPIDAS_SHOW_ERROR_TOASTS) {
    const originalError = console.error;
    console.error = function(...args) {
        originalError.apply(console, args);
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        Toast.error(message);
    };
}
