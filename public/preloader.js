/**
 * ========================================
 * PRELOADER MANAGER - OPIDAS
 * Gerencia a exibição e ocultação do preloader
 * ======================================== 
 */

class PreloaderManager {
    constructor(options = {}) {
        // Configurações padrão
        this.preloaderId = options.preloaderId || 'preloader';
        this.minDuration = options.minDuration || 500; // Duração mínima em ms
        this.autoHideDelay = options.autoHideDelay || 0; // Delay para auto-hide
        this.debug = options.debug || false;

        // Elementos do DOM
        this.preloaderElement = null;
        this.startTime = null;
        this.isVisible = false;

        // Inicializar
        this.init();
    }

    /**
     * Inicializa o gerenciador do preloader
     */
    init() {
        this.preloaderElement = document.getElementById(this.preloaderId);

        if (!this.preloaderElement) {
            console.warn(`Preloader com ID "${this.preloaderId}" não encontrado no DOM`);
            return;
        }

        this.log('Preloader inicializado');

        // Ocultar preloader ao carregar a página
        window.addEventListener('load', () => {
            this.log('Página carregada');
            if (this.autoHideDelay > 0) {
                setTimeout(() => this.hide(), this.autoHideDelay);
            } else {
                this.hide();
            }
        });

        // Escutar eventos de navegação
        this.setupNavigationListeners();
    }

    /**
     * Configura listeners para eventos de navegação
     */
    setupNavigationListeners() {
        // Interceptar cliques em links internos
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && this.isInternalLink(link)) {
                this.show();
                this.log(`Navegando para: ${link.href}`);
            }
        });

        // Interceptar submissão de formulários
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form && !form.hasAttribute('data-no-preloader')) {
                this.show();
                this.log(`Formulário submetido: ${form.action || 'local'}`);
            }
        });

        // Escutar mudanças de URL (para SPAs)
        window.addEventListener('popstate', () => {
            this.show();
            this.log('Navegação com popstate detectada');
        });

        // Escutar eventos de histórico
        const originalPushState = window.history.pushState;
        window.history.pushState = (...args) => {
            this.show();
            this.log('pushState detectado');
            return originalPushState.apply(window.history, args);
        };
    }

    /**
     * Verifica se um link é interno
     */
    isInternalLink(link) {
        const href = link.getAttribute('href');

        // Ignorar links vazios, âncoras, e links externos
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            return false;
        }

        // Ignorar links com atributo data-no-preloader
        if (link.hasAttribute('data-no-preloader')) {
            return false;
        }

        // Verificar se é um link externo
        const isExternal = link.hostname && link.hostname !== window.location.hostname;
        if (isExternal) {
            return false;
        }

        return true;
    }

    /**
     * Exibe o preloader
     */
    show() {
        if (this.isVisible) {
            this.log('Preloader já está visível');
            return;
        }

        this.preloaderElement.classList.remove('hidden');
        this.isVisible = true;
        this.startTime = Date.now();
        this.log('Preloader exibido');
    }

    /**
     * Oculta o preloader
     */
    hide() {
        if (!this.isVisible) {
            this.log('Preloader já está oculto');
            return;
        }

        // Respeitar duração mínima
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDuration - elapsed);

        if (remainingTime > 0) {
            this.log(`Aguardando ${remainingTime}ms para ocultar preloader`);
            setTimeout(() => this.hide(), remainingTime);
            return;
        }

        this.preloaderElement.classList.add('hidden');
        this.isVisible = false;
        this.log('Preloader oculto');
    }

    /**
     * Alterna a visibilidade do preloader
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Verifica se o preloader está visível
     */
    isShowing() {
        return this.isVisible;
    }

    /**
     * Log para debug
     */
    log(message) {
        if (this.debug) {
            console.log(`[Preloader] ${message}`);
        }
    }
}

/**
 * ========================================
 * INICIALIZAÇÃO GLOBAL
 * ======================================== 
 */

// Criar instância global do preloader
let preloader = null;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar o preloader com configurações
    preloader = new PreloaderManager({
        preloaderId: 'preloader',
        minDuration: 500, // Duração mínima de 500ms
        autoHideDelay: 0, // Sem delay adicional
        debug: false // Mude para true para ver logs no console
    });
});

/**
 * ========================================
 * FUNÇÕES AUXILIARES GLOBAIS
 * ======================================== 
 */

/**
 * Exibe o preloader manualmente
 */
function showPreloader() {
    if (preloader) {
        preloader.show();
    }
}

/**
 * Oculta o preloader manualmente
 */
function hidePreloader() {
    if (preloader) {
        preloader.hide();
    }
}

/**
 * Alterna o preloader
 */
function togglePreloader() {
    if (preloader) {
        preloader.toggle();
    }
}

/**
 * Verifica se o preloader está visível
 */
function isPreloaderVisible() {
    return preloader ? preloader.isShowing() : false;
}

/**
 * ========================================
 * EXEMPLO DE USO COM FETCH API
 * ======================================== 
 */

/**
 * Wrapper para fetch com preloader automático
 */
async function fetchWithPreloader(url, options = {}) {
    try {
        showPreloader();
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        hidePreloader();
        return data;
    } catch (error) {
        console.error('Erro ao fazer fetch:', error);
        hidePreloader();
        throw error;
    }
}

/**
 * ========================================
 * EXEMPLO DE USO COM AXIOS (se disponível)
 * ======================================== 
 */

if (typeof axios !== 'undefined') {
    // Interceptar requisições do Axios
    axios.interceptors.request.use(
        (config) => {
            showPreloader();
            return config;
        },
        (error) => {
            hidePreloader();
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => {
            hidePreloader();
            return response;
        },
        (error) => {
            hidePreloader();
            return Promise.reject(error);
        }
    );
}

/**
 * ========================================
 * EXEMPLO DE USO COM XMLHttpRequest
 * ======================================== 
 */

// Sobrescrever XMLHttpRequest para mostrar preloader
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    
    const originalOpen = xhr.open;
    xhr.open = function(...args) {
        showPreloader();
        return originalOpen.apply(xhr, args);
    };

    const originalSend = xhr.send;
    xhr.send = function(...args) {
        xhr.addEventListener('loadend', () => {
            hidePreloader();
        });
        return originalSend.apply(xhr, args);
    };

    return xhr;
};
