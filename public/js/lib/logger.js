/**
 * Logger System - Sistema de Logging Condicional
 * Remove logs de desenvolvimento em produção
 * ✅ NOVO: Melhoria de segurança e performance
 */

(function() {
    'use strict';

    // ✅ Detecta ambiente automaticamente
    // Em produção, window.location.hostname não será 'localhost' ou '127.0.0.1'
    const isDevelopment = 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.port !== '';

    // Permite forçar modo debug via localStorage
    const forceDebug = localStorage.getItem('OPIDAS_DEBUG') === 'true';
    const DEBUG_MODE = isDevelopment || forceDebug;

    // Salva referências originais do console
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
        table: console.table,
        group: console.group,
        groupEnd: console.groupEnd,
        time: console.time,
        timeEnd: console.timeEnd
    };

    /**
     * Logger customizado com controle de ambiente
     */
    const Logger = {
        /**
         * Log normal (apenas em desenvolvimento)
         */
        log(...args) {
            if (DEBUG_MODE) {
                originalConsole.log(...args);
            }
        },

        /**
         * Log de informação (apenas em desenvolvimento)
         */
        info(...args) {
            if (DEBUG_MODE) {
                originalConsole.info(...args);
            }
        },

        /**
         * Log de debug (apenas em desenvolvimento)
         */
        debug(...args) {
            if (DEBUG_MODE) {
                originalConsole.debug(...args);
            }
        },

        /**
         * Log de aviso (sempre mostra, mas pode ser silenciado)
         */
        warn(...args) {
            if (DEBUG_MODE) {
                originalConsole.warn(...args);
            }
        },

        /**
         * Log de erro (sempre mostra)
         */
        error(...args) {
            // Erros sempre são mostrados, mesmo em produção
            originalConsole.error(...args);
        },

        /**
         * Tabela (apenas em desenvolvimento)
         */
        table(data) {
            if (DEBUG_MODE) {
                originalConsole.table(data);
            }
        },

        /**
         * Grupo (apenas em desenvolvimento)
         */
        group(label) {
            if (DEBUG_MODE) {
                originalConsole.group(label);
            }
        },

        /**
         * Fim do grupo (apenas em desenvolvimento)
         */
        groupEnd() {
            if (DEBUG_MODE) {
                originalConsole.groupEnd();
            }
        },

        /**
         * Inicia timer (apenas em desenvolvimento)
         */
        time(label) {
            if (DEBUG_MODE) {
                originalConsole.time(label);
            }
        },

        /**
         * Finaliza timer (apenas em desenvolvimento)
         */
        timeEnd(label) {
            if (DEBUG_MODE) {
                originalConsole.timeEnd(label);
            }
        },

        /**
         * Verifica se está em modo debug
         */
        isDebug() {
            return DEBUG_MODE;
        },

        /**
         * Ativa modo debug manualmente
         */
        enableDebug() {
            localStorage.setItem('OPIDAS_DEBUG', 'true');
            console.log('🐛 Modo debug ativado. Recarregue a página.');
        },

        /**
         * Desativa modo debug manualmente
         */
        disableDebug() {
            localStorage.removeItem('OPIDAS_DEBUG');
            console.log('✅ Modo debug desativado. Recarregue a página.');
        }
    };

    // Exporta para uso global
    window.Logger = Logger;

    // ✅ OPCIONAL: Sobrescreve console.log globalmente
    // Descomente as linhas abaixo para aplicar o logger em todo o código existente
    // sem precisar modificar cada console.log
    /*
    if (!DEBUG_MODE) {
        console.log = Logger.log;
        console.info = Logger.info;
        console.debug = Logger.debug;
        console.warn = Logger.warn;
        // console.error permanece inalterado (sempre mostra)
    }
    */

    // Mostra status do logger na inicialização
    if (DEBUG_MODE) {
        originalConsole.log(
            '%c🔧 OPIDAS Logger Inicializado',
            'background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
        );
        originalConsole.log(`📍 Ambiente: ${isDevelopment ? 'Desenvolvimento' : 'Produção (debug forçado)'}`);
        originalConsole.log(`🐛 Debug Mode: ${DEBUG_MODE ? 'ATIVADO' : 'DESATIVADO'}`);
        originalConsole.log('💡 Dica: Use Logger.enableDebug() para ativar logs em produção');
    }

})();
