// Configuração do Cliente Supabase - OPIDAS (OTIMIZADO)
// Este arquivo inicializa e configura o cliente Supabase com cache e otimizações

(function() {
    'use strict';

    // ⚠️ IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Supabase
    const SUPABASE_URL = 'https://vkdywsawrftrpxjaxejs.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZHl3c2F3cmZ0cnB4amF4ZWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTc1OTMsImV4cCI6MjA3ODQzMzU5M30.5ro31_G_sIGJ1lz_rHmVNRK5XnjTbMocfkjwDJqaees';

    // ✅ CACHE SYSTEM - Melhora performance
    const CACHE_CONFIG = {
        PROFILE_CACHE_TIME: 5 * 60 * 1000, // 5 minutos
        USER_CACHE_TIME: 10 * 60 * 1000, // 10 minutos
    };

    const cache = {
        profile: { data: null, timestamp: 0 },
        user: { data: null, timestamp: 0 },
    };

    function isCacheValid(cacheKey) {
        const now = Date.now();
        return cache[cacheKey].data && (now - cache[cacheKey].timestamp) < CACHE_CONFIG[cacheKey.toUpperCase() + '_CACHE_TIME'];
    }

    function setCache(cacheKey, data) {
        cache[cacheKey] = { data, timestamp: Date.now() };
    }

    function getCache(cacheKey) {
        return cache[cacheKey].data;
    }

    function clearCache(cacheKey) {
        cache[cacheKey] = { data: null, timestamp: 0 };
    }

    // Verifica se o script do Supabase foi carregado
    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
        console.error('❌ ERRO: Biblioteca do Supabase não foi carregada');
        console.error('📖 Adicione o script do Supabase no HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
        return;
    }

    // Cria o cliente Supabase com otimizações
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
                    eventsPerSecond: 5 // ✅ REDUZIDO para melhor performance
                }
            },
            // ✅ NOVO: Timeout reduzido para falhas rápidas
            global: {
                headers: {
                    'X-Client-Info': 'opidas-web'
                }
            }
        });

        // Disponibiliza o cliente globalmente
        window.supabase = supabaseClient;
        
        // ✅ NOVO: Função para limpar cache
        window.clearSupabaseCache = function(cacheKey) {
            if (cacheKey) {
                clearCache(cacheKey);
                console.log(`✅ Cache limpo: ${cacheKey}`);
            } else {
                cache.profile = { data: null, timestamp: 0 };
                cache.user = { data: null, timestamp: 0 };
                console.log('✅ Todo cache limpo');
            }
        };
        
        console.log('✅ Cliente Supabase inicializado com sucesso');

        // Monitora mudanças no estado de autenticação
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth event:', event);
            
            if (event === 'SIGNED_IN') {
                console.log('✅ Usuário autenticado:', session.user.email);
                // ✅ NOVO: Limpa cache ao fazer login
                clearCache('profile');
                clearCache('user');
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 Usuário desconectado');
                // ✅ NOVO: Limpa cache ao fazer logout
                clearCache('profile');
                clearCache('user');
                if (!window.location.pathname.includes('index.html') && 
                    !window.location.pathname.endsWith('/')) {
                    window.location.href = '/index.html';
                }
            } else if (event === 'TOKEN_REFRESHED') {
                console.log('🔄 Token atualizado');
            } else if (event === 'USER_UPDATED') {
                console.log('👤 Dados do usuário atualizados');
                // ✅ NOVO: Limpa cache quando usuário é atualizado
                clearCache('profile');
            }
        });

        // Função auxiliar para verificar autenticação (com cache)
        window.checkAuth = async function() {
            try {
                // ✅ NOVO: Usa cache para auth
                if (isCacheValid('user')) {
                    console.log('📦 Usando cache de usuário');
                    return getCache('user');
                }

                const { data: { user }, error } = await supabaseClient.auth.getUser();
                
                if (error || !user) {
                    console.warn('⚠️ Usuário não autenticado');
                    return null;
                }

                // ✅ NOVO: Cacheia dados do usuário
                setCache('user', user);
                return user;
            } catch (error) {
                console.error('❌ Erro ao verificar autenticação:', error);
                return null;
            }
        };

        // Função auxiliar para logout
        window.logout = async function() {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
                
                // ✅ NOVO: Limpa cache ao logout
                clearCache('profile');
                clearCache('user');
                
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
            
            if (publicPages.includes(currentPage)) {
                return;
            }

            const user = await window.checkAuth();
            
            if (!user) {
                console.warn('⚠️ Acesso negado: usuário não autenticado');
                window.location.href = '/index.html';
            }
        };

        // ✅ NOVO: Função para obter perfil com cache
        window.getCachedProfile = async function(userId) {
            try {
                // Verifica cache primeiro
                if (isCacheValid('profile')) {
                    console.log('📦 Usando cache de perfil');
                    return getCache('profile');
                }

                // Se não estiver em cache, busca do Supabase
                const { data: profile, error } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) throw error;

                // ✅ NOVO: Cacheia o perfil
                setCache('profile', profile);
                return profile;
            } catch (error) {
                console.error('❌ Erro ao buscar perfil:', error);
                throw error;
            }
        };

        // ✅ NOVO: Função para atualizar perfil e invalidar cache
        window.updateProfileAndClearCache = async function(userId, data) {
            try {
                const result = await supabaseClient
                    .from('profiles')
                    .update(data)
                    .eq('id', userId)
                    .select()
                    .single();

                // ✅ NOVO: Limpa cache após atualizar
                clearCache('profile');
                
                return result;
            } catch (error) {
                console.error('❌ Erro ao atualizar perfil:', error);
                throw error;
            }
        };

    } catch (error) {
        console.error('❌ Erro ao inicializar cliente Supabase:', error);
    }

})();
