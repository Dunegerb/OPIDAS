import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: () => void;
    onStartOnboarding: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onStartOnboarding }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegisterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (email && password) {
        // In a real app, this would trigger registration API call
        onStartOnboarding();
    } else {
        alert("Por favor, preencha o e-mail e a senha para o alistamento.");
    }
  };

  const handleLoginClick = (event: React.MouseEvent) => {
    event.preventDefault();
    // In a real app, you'd validate credentials here before logging in
    onLogin();
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Login com ${provider} clicado!`);
    // In a real app, this would trigger a social login flow, which would eventually call onLogin()
  };

  return (
    <div className="bg-[#0b0b0a] text-[#eeeeee] min-h-screen grid place-items-center p-6 relative overflow-hidden font-['Inter',_Helvetica,_Arial,_sans-serif]">
      <header className="absolute top-[21px] left-1/2 -translate-x-1/2 z-10 hidden lg:block">
        <img alt="OPIDAS Brand Logos" src="https://c.animaapp.com/ShvBdWgZ/img/group-37@2x.png" className="w-[80px] h-auto" style={{ mixBlendMode: 'exclusion' }}/>
      </header>

      <div className="login-card flex w-full max-w-[1246px] max-h-[90vh] border-[1.5px] border-[#27272a] rounded-[13px] overflow-hidden bg-[#11110f] lg:flex-row flex-col">
        {/* Left Column: Hero Image */}
        <section className="hero-section flex-shrink-0 w-[560px] relative hidden lg:block" aria-label="Hero Image">
          <img className="background-image w-full h-full object-cover" alt="Campo Guerreiro Background" src="https://c.animaapp.com/ShvBdWgZ/img/rectangle-30.png" />
          <img className="decorative-element absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12px] h-[140px]" style={{ mixBlendMode: 'exclusion' }} alt="Decorative Element" src="https://c.animaapp.com/ShvBdWgZ/img/---------@4x.png" />
        </section>

        {/* Right Column: Login Form */}
        <main className="main-content flex-1 flex flex-col items-center justify-between p-6 md:p-10 bg-[#11110f] rounded-[13px] lg:rounded-none">
          <div className="opidas-header flex items-center gap-[5px]" style={{ mixBlendMode: 'exclusion' }}>
            <img alt="OPIDAS Logo" src="https://c.animaapp.com/ShvBdWgZ/img/add-a-heading--4--2@2x.png" className="w-[9px] h-[9px]" />
            <div className="text-[8px] text-white whitespace-nowrap">OPIDAS</div>
          </div>

          <div className="login-form-wrapper w-full max-w-[340px] text-center">
            <h1 className="text-xl font-bold text-[#eeeeee] mb-4">Bem-vindo(a) ao Campo Guerreiro(a)</h1>
            <p className="text-[10px] text-[#b7b7b7] mb-8 max-w-[241px] mx-auto leading-normal">
              Bem vindo(a) ao seu campo de batalha. Crie sua conta ou faça o login com sua conta opidas.
            </p>

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group relative mb-[13px]">
                <label htmlFor="email" className="sr-only">Email</label>
                <input id="email" type="email" placeholder="Email" required aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[43px] px-[13px] border-[1.5px] border-[#27272a] rounded-lg text-sm text-[#eeeeee] bg-transparent placeholder-[#707070] outline-none" />
              </div>
              <div className="form-group relative mb-[13px]">
                <label htmlFor="password" className="sr-only">Senha</label>
                <input id="password" type="password" placeholder="Senha" required aria-required="true" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[43px] px-[13px] border-[1.5px] border-[#27272a] rounded-lg text-sm text-[#eeeeee] bg-transparent placeholder-[#707070] outline-none" />
              </div>
              <button type="submit" className="submit-button w-full max-w-[340px] h-[43px] bg-[#27272a] rounded-lg flex justify-center items-center relative text-sm text-[#eeeeee] transition-colors hover:bg-[#3f3f46] mt-4" aria-label="Fazer Alistamento">
                <span>Fazer Alistamento</span>
                <img alt="" src="https://c.animaapp.com/ShvBdWgZ/img/group-54@2x.png" className="absolute right-[5px] top-[5px] w-[33px] h-[33px]" />
              </button>
            </form>

            <div className="separator flex items-center gap-[15px] w-full max-w-[340px] text-[#b7b7b7] text-[8px] my-8 mx-auto">
              <div className="line flex-grow h-[1px] bg-[#27272a]"></div>
              <span>OU</span>
              <div className="line flex-grow h-[1px] bg-[#27272a]"></div>
            </div>

            <div className="social-login flex justify-center gap-[13px] mb-8" role="group" aria-label="Social Login Options">
              {['Google', 'Apple', 'Discord', 'ProtonMail'].map((provider, index) => (
                <button key={provider} data-provider={provider} aria-label={`Login with ${provider}`} onClick={() => handleSocialLogin(provider)} className="w-[53px] h-[35px] transition-opacity hover:opacity-80">
                  <img alt={`${provider} Login`} src={`https://c.animaapp.com/ShvBdWgZ/img/group-4${index + 1}@2x.png`} className="w-full h-full" />
                </button>
              ))}
            </div>

            <div className="login-link-section flex items-center justify-center text-[10px] text-[#707070] gap-[5px]">
              <span>Já tem uma conta?</span>
              <a href="#" onClick={handleLoginClick} className="text-[#eeeeee] flex items-center gap-[5px] hover:underline">
                <span>Login</span>
                <img alt="arrow" src="https://c.animaapp.com/ShvBdWgZ/img/vector-76.svg" className="w-[6px] h-[6px]" />
              </a>
            </div>
          </div>

          <footer className="footer flex justify-center items-center flex-wrap gap-5 text-[10px] text-[#909090] w-full pt-4">
            <a href="#" className="hover:text-[#eeeeee]">Politica de privacidade</a>
            <a href="#" className="hover:text-[#eeeeee]">Termos de Serviço</a>
            <p><span>©</span> 2025 OPIDAS</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
