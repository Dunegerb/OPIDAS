// Loading Screen Component - OPIDAS
// Gerencia a tela de carregamento entre páginas

class LoadingScreen {
    constructor() {
        this.loadingElement = null;
        this.videoElement = null;
        this.minDisplayTime = 2000; // Tempo mínimo de exibição (2 segundos)
        this.startTime = null;
    }

    /**
     * Cria e exibe a tela de carregamento
     */
    show() {
        // Remove tela de carregamento existente se houver
        this.hide();

        // Cria o elemento da tela de carregamento
        this.loadingElement = document.createElement('div');
        this.loadingElement.className = 'loading-screen';
        
        // Cria o elemento de vídeo
        this.videoElement = document.createElement('video');
        this.videoElement.autoplay = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.loop = false;
        
        const source = document.createElement('source');
        source.src = '/assets/motiondesigns/teladecarregamento/loadingscreen.webm';
        source.type = 'video/webm';
        
        this.videoElement.appendChild(source);
        
        // Cria fallback caso o vídeo não carregue
        const fallback = document.createElement('div');
        fallback.className = 'loading-fallback';
        fallback.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Carregando...</div>
        `;
        
        this.loadingElement.appendChild(this.videoElement);
        this.loadingElement.appendChild(fallback);
        
        // Adiciona ao body
        document.body.appendChild(this.loadingElement);
        
        // Marca o tempo de início
        this.startTime = Date.now();
        
        // Tenta reproduzir o vídeo
        this.videoElement.play().catch(err => {
            console.warn('Não foi possível reproduzir o vídeo de carregamento:', err);
        });
    }

    /**
     * Remove a tela de carregamento com fade out
     */
    async hide() {
        if (!this.loadingElement) return;

        // Calcula o tempo decorrido
        const elapsed = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minDisplayTime - elapsed);

        // Aguarda o tempo mínimo se necessário
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // Aplica fade out
        this.loadingElement.classList.add('fade-out');

        // Remove do DOM após a transição
        setTimeout(() => {
            if (this.loadingElement && this.loadingElement.parentNode) {
                this.loadingElement.parentNode.removeChild(this.loadingElement);
            }
            this.loadingElement = null;
            this.videoElement = null;
        }, 500); // Tempo da transição CSS
    }

    /**
     * Navega para outra página com tela de carregamento
     * @param {string} url - URL de destino
     */
    static navigateWithLoading(url) {
        const loader = new LoadingScreen();
        loader.show();
        
        // Aguarda um frame para garantir que a tela de carregamento seja renderizada
        requestAnimationFrame(() => {
            window.location.href = url;
        });
    }
}

// Exporta para uso global
window.LoadingScreen = LoadingScreen;

// Adiciona listeners para links que devem ter tela de carregamento
document.addEventListener('DOMContentLoaded', () => {
    // Intercepta cliques em links específicos
    document.querySelectorAll('a[href*="campo.html"], a[href*="doutrina.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Ignora links externos e âncoras
            if (!href || href.startsWith('#') || href.startsWith('http')) {
                return;
            }

            e.preventDefault();
            LoadingScreen.navigateWithLoading(href);
        });
    });
});
