// --- MÓDULO DE AUTENTICAÇÃO (auth.js) ---
// Responsável por login, logout, registro e proteção de rotas.

async function signUp(email, password) {
    console.log(`[AuthService] Tentando registrar com: ${email}`);
    // TODO: Chamar supabase.auth.signUp()
    // Se sucesso, redirecionar para onboarding.html
    alert("Registro solicitado! Verifique seu e-mail para confirmação.");
    window.location.href = 'onboarding.html';
}

async function signIn(email, password) {
    console.log(`[AuthService] Tentando logar com: ${email}`);
    // TODO: Chamar supabase.auth.signInWithPassword()
    // TODO: Após login, buscar perfil para verificar onboarding_status
    // const { data: profile, error } = await supabase.from('profiles').select('onboarding_status').single();
    // if (profile.onboarding_status === 'completed') {
    //   window.location.href = 'campo.html';
    // } else {
    //   window.location.href = 'onboarding.html';
    // }
    alert("Login bem-sucedido (simulado)!");
    window.location.href = 'campo.html';
}

async function signOut() {
    console.log("[AuthService] Deslogando usuário.");
    // TODO: Chamar supabase.auth.signOut()
    window.location.href = 'index.html';
}

async function protectRoute() {
    console.log("[AuthService] Verificando autenticação da rota.");
    // TODO: Chamar supabase.auth.getUser()
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   window.location.href = 'index.html';
    // }
    // return user;
}

async function signInWithProvider(provider) {
    console.log(`[AuthService] Tentando login com provedor: ${provider}`);
    // TODO: Chamar supabase.auth.signInWithOAuth({ provider: provider })
    alert(`Login com ${provider} (simulado)!`);
}

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

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        if (isLoginMode) {
            signIn(email, password);
        } else {
            signUp(email, password);
        }
    });

    socialLoginButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.dataset.provider;
            signInWithProvider(provider);
        });
    });
}