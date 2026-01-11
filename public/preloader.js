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
        this.minDuration = options.minDuration || 800; // Duração mínima em ms para garantir que o vídeo seja visto
        this.autoHide = options.autoHide !== undefined ? options.autoHide : false; // Desativado por padrão para controle manual
        this.debug = options.debug || false;

        // Elementos do DOM
        this.preloaderElement = null;
        this.startTime = Date.now(); // Inicia o contador assim que a classe é instanciada
        this.isVisible = true; // Assume que começa visível se estiver no HTML

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
            this.isVisible = false;
            return;
        }

        this.log('Preloader inicializado');

        // Se autoHide estiver ativado, oculta ao carregar a página
        if (this.autoHide) {
            window.addEventListener('load', () => {
                this.log('Página carregada (autoHide)');
                this.hide();
            });
        }

        // Escutar eventos de navegação para mostrar o preloader ao sair da página
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
                // Só mostra se for mudar de página
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && href !== window.location.pathname) {
                    this.show();
                    this.log(`Navegando para: ${link.href}`);
                }
            }
        });
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
        if (this.isVisible) return;

        if (this.preloaderElement) {
            this.preloaderElement.classList.remove('hidden');
            this.isVisible = true;
            this.startTime = Date.now();
            this.log('Preloader exibido');
        }
    }

    /**
     * Oculta o preloader
     */
    hide() {
        if (!this.isVisible) return;

        // Respeitar duração mínima para evitar "piscadas"
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDuration - elapsed);

        if (remainingTime > 0) {
            this.log(`Aguardando ${remainingTime}ms para ocultar preloader`);
            setTimeout(() => this.hide(), remainingTime);
            return;
        }

        if (this.preloaderElement) {
            this.preloaderElement.classList.add('hidden');
            this.isVisible = false;
            this.log('Preloader oculto');
        }
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
window.preloaderInstance = new PreloaderManager({
    preloaderId: 'preloader',
    minDuration: 1500, // Aumentado para garantir que a animação seja fluida
    autoHide: false,   // Controle manual via hidePreloader()
    debug: false
});

/**
 * ========================================
 * FUNÇÕES AUXILIARES GLOBAIS
 * ======================================== 
 */

function showPreloader() {
    if (window.preloaderInstance) window.preloaderInstance.show();
}

function hidePreloader() {
    if (window.preloaderInstance) window.preloaderInstance.hide();
}
