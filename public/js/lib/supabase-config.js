// Configuração do Cliente Supabase - OPIDAS
// Este arquivo inicializa e configura o cliente Supabase

(function() {
    'use strict';

    // ⚠️ IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Supabase
    // Você pode encontrar essas informações em: https://app.supabase.com/project/_/settings/api
    
    const SUPABASE_URL = 'https://vkdywsawrftrpxjaxejs.supabase.co'; // Ex: https://xyzcompany.supabase.co
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZHl3c2F3cmZ0cnB4amF4ZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTc1OTMsImV4cCI6MjA3ODQzMzU5M30.5ro31_G_sIGJ1lz_rHmVNRK5XnjTbMocfkjwDJqaees'; // Chave pública (anon/public)

    // Verifica se as credenciais foram configuradas
    if (SUPABASE_URL === 'https://vkdywsawrftrpxjaxejs.supabase.co' || SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZHl3c2F3cmZ0cnB4amF4ZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTc1OTMsImV4cCI6MjA3ODQzMzU5M30.5ro31_G_sIGJ1lz_rHmVNRK5XnjTbMocfkjwDJqaees') {
        console.error('❌ ERRO: Configure as credenciais do Supabase em js/lib/supabase-config.js');
        console.error('📖 Veja o README para instruções de configuração');
        
        // Cria um cliente mock para evitar erros
        window.supabase = {
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase não configurado') }),
                signUp: () => Promise.reject(new Error('Supabase não configurado')),
                signInWithPassword: () => Promise.reject(new Error('Supabase não configurado')),
                signOut: () => Promise.reject(new Error('Supabase não configurado')),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
            },
            from: () => ({
                select: () => Promise.reject(new Error('Supabase não configurado')),
                insert: () => Promise.reject(new Error('Supabase não configurado')),
                update: () => Promise.reject(new Error('Supabase não configurado')),
                delete: () => Promise.reject(new Error('Supabase não configurado'))
            }),
            functions: {
                invoke: () => Promise.reject(new Error('Supabase não configurado'))
            },
            channel: () => ({
                on: () => ({ subscribe: () => {} }),
                subscribe: () => {}
            })
        };
        return;
    }

    // Verifica se o script do Supabase foi carregado
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        console.error('❌ ERRO: Biblioteca do Supabase não foi carregada');
        console.error('📖 Adicione o script do Supabase no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return;
    }

    // Cria o cliente Supabase
    try {
        const { createClient } = window.supabase;
        
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'opidas-auth-token',
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });

        // Disponibiliza o cliente globalmente
        window.supabase = supabaseClient;
        
        console.log('✅ Cliente Supabase inicializado com sucesso');

        // Monitora mudanças no estado de autenticação
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth event:', event);
            
            if (event === 'SIGNED_IN') {
                console.log('✅ Usuário autenticado:', session.user.email);
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 Usuário desconectado');
                // Redireciona para página de login se não estiver nela
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.endsWith('/')) {
                    window.location.href = '/index.html';
                }
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Token atualizado');
            } else if (event === 'USER_UPDATED') {
                console.log('👤 Dados do usuário atualizados');
            }
        });

        // Função auxiliar para verificar autenticação
        window.checkAuth = async function() {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            
            if (error || !user) {
                console.warn('⚠️ Usuário não autenticado');
                return null;
            }
            
            return user;
        };

        // Função auxiliar para logout
        window.logout = async function() {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
                
                console.log('✅ Logout realizado com sucesso');
                window.location.href = '/index.html';
            } catch (error) {
                console.error('❌ Erro ao fazer logout:', error);
                throw error;
            }
        };

        // Protege páginas que requerem autenticação
        window.protectPage = async function() {
            const publicPages = ['index.html', '404.html', ''];
            const currentPage = window.location.pathname.split('/').pop();
            
            // Se está em página pública, não precisa verificar
            if (publicPages.includes(currentPage)) {
                return;
            }

            const user = await window.checkAuth();
            
            if (!user) {
                console.warn('⚠️ Acesso negado: usuário não autenticado');
                window.location.href = '/index.html';
            }
        };

    } catch (error) {
        console.error('❌ Erro ao inicializar cliente Supabase:', error);
    }

})();
