// --- MÓDULO DE AUTENTICAÇÃO (auth.js) ---
// Responsável por login, logout, registro e proteção de rotas.
// Responsável por login, logout, registro e proteção de rotas.

/**
 * Registra um novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 */
async function signUp(email, password) {
    try {
        console.log(`[AuthService] Tentando registrar com: ${email}`);
        
        // Chama o Supabase para criar o usuário
        const { data, error } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: `${window.location.origin}/onboarding/identification.html`,
                data: {
                    onboarding_status: 'pending'
                }
            }
        });

        if (error) throw error;

        console.log('✅ Usuário registrado com sucesso:', data);
        
        // Verifica se o email precisa ser confirmado
        if (data.user && !data.session) {
            // Email precisa ser confirmado
            alert("Conta criada! Verifique seu email para confirmar o cadastro antes de continuar.");
            return;
        }
        
        // Se a sessão foi criada, o usuário já está logado
        if (data.session) {
            console.log('✅ Sessão criada automaticamente');
            
            // Aguarda um pouco para garantir que a sessão foi persistida
            await new Promise(resolve => setTimeout(resolve, 500));
            
            alert("Conta criada com sucesso! Você será redirecionado para completar seu perfil.");
            window.location.href = 'onboarding/identification.html';
        }

    } catch (error) {
        console.error('❌ Erro ao registrar:', error);
        alert(`Erro ao criar conta: ${error.message}`);
    }
}

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 */
async function signIn(email, password) {
    try {
        console.log(`[AuthService] Tentando logar com: ${email}`);
        
        // Chama o Supabase para fazer login
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        console.log('✅ Login bem-sucedido:', data);

        // Busca o perfil do usuário para verificar o status do onboarding
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('onboarding_status')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.warn('⚠️ Perfil não encontrado, redirecionando para onboarding');
            window.location.href = 'onboarding/identification.html';
            return;
        }

        // Redireciona baseado no status do onboarding
        if (profile.onboarding_status === 'completed') {
            console.log('✅ Onboarding completo, redirecionando para campo');
            window.location.href = 'campo.html';
        } else {
            console.log('⚠️ Onboarding pendente, redirecionando para onboarding');
            window.location.href = 'onboarding/identification.html';
        }

    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        alert(`Erro ao fazer login: ${error.message}`);
    }
}

/**
 * Faz logout do usuário
 */
async function signOut() {
    try {
        console.log("[AuthService] Deslogando usuário.");
        
        const { error } = await window.supabase.auth.signOut();
        
        if (error) throw error;

        console.log('✅ Logout realizado com sucesso');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        alert(`Erro ao fazer logout: ${error.message}`);
    }
}

/**
 * Protege rotas que requerem autenticação
 * @returns {Promise<Object|null>} - Usuário autenticado ou null
 */
async function protectRoute() {
    try {
        console.log("[AuthService] Verificando autenticação da rota.");
        
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error || !user) {
            console.warn('⚠️ Usuário não autenticado, redirecionando para login');
            window.location.href = 'index.html';
            return null;
        }

        console.log('✅ Usuário autenticado:', user.email);
        return user;

    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        window.location.href = 'index.html';
        return null;
    }
}

/**
 * Faz login com provedor OAuth (Google, Apple, Discord, etc)
 * @param {string} provider - Nome do provedor (google, apple, discord, etc)
 */
async function signInWithProvider(provider) {
    try {
        console.log(`[AuthService] Tentando login com provedor: ${provider}`);
        
        const { data, error } = await window.supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/onboarding/identification.html`
            }
        });

        if (error) throw error;

        console.log('✅ Redirecionando para login OAuth:', provider);

    } catch (error) {
        console.error(`❌ Erro ao fazer login com ${provider}:`, error);
        alert(`Erro ao fazer login com ${provider}: ${error.message}`);
    }
}

// Exporta as funções para uso global
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.protectRoute = protectRoute;
window.signInWithProvider = signInWithProvider;

// --- Lógica de UI para a página de login ---
function initAuthPage() {
    const authForm = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const socialLoginButtons = document.querySelectorAll('.social-login button');
    const toggleLink = document.getElementById('toggle-form-link');
    const formTitle = document.getElementById('form-title');
    const submitButtonText = document.getElementById('submit-button-text');
    const toggleFormText = document.getElementById('toggle-form-text');

    let isLoginMode = false;

    function toggleMode() {
        isLoginMode = !isLoginMode;
        formTitle.textContent = isLoginMode ? 'Login no Campo' : 'Bem-vindo(a) ao Campo Guerreiro(a)';
        submitButtonText.textContent = isLoginMode ? 'Entrar' : 'Fazer Alistamento';
        toggleFormText.textContent = isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?';
        toggleLink.querySelector('span').textContent = isLoginMode ? 'Aliste-se' : 'Login';
    }

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode();
    });

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;

        // Desabilita o botão durante o processo
        const submitButton = authForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButtonText.textContent = isLoginMode ? 'Entrando...' : 'Criando conta...';

        try {
            if (isLoginMode) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
            }
        } finally {
            // Reabilita o botão
            submitButton.disabled = false;
            submitButtonText.textContent = isLoginMode ? 'Entrar' : 'Fazer Alistamento';
        }
    });

    socialLoginButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.dataset.provider;
            signInWithProvider(provider);
        });
    });
}

