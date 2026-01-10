// Arquivo principal de inicialização do aplicativo OPIDAS
// Contém lógica global de inicialização, carregamento de dados do usuário e atualização da UI

console.log("🚀 App OPIDAS inicializado.");

/**
 * Função centralizada para carregar e atualizar o Top-Bar com dados reais do usuário
 * Busca o perfil do usuário no Supabase e atualiza todos os elementos da interface
 * 
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.includeProgressBar - Se deve atualizar a barra de progresso (padrão: true)
 * @param {boolean} options.includeAvatar - Se deve atualizar o avatar (padrão: true)
 * @param {boolean} options.includeUsername - Se deve atualizar o nome de usuário (padrão: true)
 * @returns {Promise<Object>} - Retorna o perfil do usuário carregado
 */
async function loadTopBar(options = {}) {
    const {
        includeProgressBar = true,
        includeAvatar = true,
        includeUsername = true,
        skipCheckin = false
    } = options;

    try {
        console.log('📊 Carregando dados do Top-Bar...');

        // Verifica se o UserService está disponível
        if (!window.UserService) {
            throw new Error('UserService não está carregado. Certifique-se de que user.js foi incluído.');
        }

        // Busca o perfil completo do usuário do Supabase
        const userProfile = await window.UserService.getCurrentUserProfile();

        if (!userProfile) {
            throw new Error('Não foi possível carregar o perfil do usuário');
        }

        console.log('✅ Perfil carregado com sucesso:', userProfile);

        // Seleciona os elementos do DOM que precisam ser atualizados
        const topBarElements = {
            avatar: document.getElementById('user-avatar'),
            username: document.getElementById('welcome-username'),
            rankIcon: document.getElementById('status-rank-icon'),
            progressBar: document.getElementById('progress-bar-fill'),
            progressDays: document.getElementById('progress-days')
        };

		
		if (!skipCheckin && userProfile.last_habit_date) {
		    try {
		        console.log('📅 Processando check-in diário automático...');
		        const checkinResult = await window.UserService.processDailyCheckin();
		        if (checkinResult && checkinResult.success) {
		            console.log('✅ Check-in diário realizado com sucesso:', checkinResult);
		            // Atualiza os dados do perfil com os novos valores do check-in
		            userProfile.retention_days = checkinResult.retention_days;
		            userProfile.rank = checkinResult.rank;
		            userProfile.rankData = window.UserService.calculateRankData(userProfile.retention_days);
		        } else {
		            console.log('ℹ️ Check-in diário já realizado ou não necessário:', checkinResult?.message);
		        }
		    } catch (checkinError) {
		        console.warn('⚠️ Erro ao processar check-in automático:', checkinError);
		        // Não trava o carregamento se o check-in falhar
		    }
		} else {
		    if (skipCheckin) {
		        console.log('⏭️ Check-in automático ignorado (skipCheckin=true)');
		    } else {
		        console.log('ℹ️ Check-in automático ignorado (last_habit_date é nulo, indica novo usuário ou reset recente).');
		    }
		}

        // Atualiza o avatar do usuário
        if (includeAvatar && topBarElements.avatar) {
            topBarElements.avatar.src = userProfile.avatar_url || 'https://github.com/Dunegerb/OPIDAS/raw/ba479afa9718cc1bd2b6a3d4e75d7b1bbe0da0f4/public/assets/styles/images/profile-card.png';
            console.log('✅ Avatar atualizado');
        }

        // Atualiza o nome de usuário com a patente
        if (includeUsername && topBarElements.username) {
            const rankName = userProfile.rankData?.name || 'Recruta';
            const lastName = userProfile.last_name || 'Usuário';
            topBarElements.username.textContent = `${rankName} ${lastName}`;
            console.log(`✅ Nome de usuário atualizado: ${rankName} ${lastName}`);
        }

        // Atualiza o ícone da patente
        if (topBarElements.rankIcon && userProfile.rankData) {
            topBarElements.rankIcon.src = userProfile.rankData.icon;
            console.log(`✅ Ícone de patente atualizado: ${userProfile.rankData.name}`);
        }

// Atualiza a barra de progresso e contagem de dias
	        if (includeProgressBar && topBarElements.progressBar && topBarElements.progressDays) {
	            const rankData = userProfile.rankData;
	            let retentionDays = userProfile.retention_days || 0;
	
		            // ⚠️ CORREÇÃO: Se retention_days for nulo ou indefinido, garante que seja 0
		            if (retentionDays === null || retentionDays === undefined) {
		                retentionDays = 0;
		            }
		            
		            // Se retention_days for 0 e NÃO for um caso de reset recente (last_habit_date nulo),
		            // podemos tentar calcular os dias desde o onboarding como fallback.
		            // Mas se o usuário acabou de resetar, last_habit_date será nulo e queremos que continue 0.
		            if (retentionDays === 0 && userProfile.onboarding_data && userProfile.last_habit_date) {
		                const calculatedDays = window.UserService.calculateDaysSinceOnboarding(userProfile.onboarding_data);
		                if (calculatedDays > 0) {
		                    retentionDays = calculatedDays;
		                    // O rankData precisa ser recalculado com os novos dias, caso a patente tenha mudado
		                    userProfile.rankData = window.UserService.calculateRankData(retentionDays);
		                    console.log(`⚠️ retention_days era 0. Recalculado para ${retentionDays} dias.`);
		                }
		            } else if (!userProfile.last_habit_date) {
		                // Se last_habit_date for nulo, forçamos retention_days a 0 (caso de reset)
		                retentionDays = 0;
		                userProfile.rankData = window.UserService.calculateRankData(0);
		                console.log('ℹ️ last_habit_date é nulo. Mantendo retention_days em 0.');
		            }
	
	            // Calcula o objetivo de dias para a patente atual
	            const goalDays = isFinite(rankData.maxDays) ? rankData.maxDays + 1 : retentionDays;
	            const progressPercentage = Math.min((retentionDays / goalDays) * 100, 100);
	
	            // Atualiza a largura da barra de progresso
	            topBarElements.progressBar.style.width = `${progressPercentage}%`;
	
	            // Atualiza o texto de dias (com padding de zeros)
	            const currentDaysFormatted = String(retentionDays).padStart(2, '0');
	            const totalDaysFormatted = String(goalDays).padStart(2, '0');
	            topBarElements.progressDays.innerHTML = `${currentDaysFormatted}<span>/${totalDaysFormatted} Dias</span>`;
	
	            console.log(`✅ Barra de progresso atualizada: ${retentionDays}/${goalDays} dias (${progressPercentage.toFixed(1)}%)`);
	        }

        console.log('✅ Top-Bar carregado e atualizado com sucesso!');
        return userProfile;

    } catch (error) {
        console.error('❌ Erro ao carregar Top-Bar:', error);
        
        // Se houver erro, mostra valores padrão
        const topBarElements = {
            username: document.getElementById('welcome-username'),
            progressDays: document.getElementById('progress-days')
        };

        if (topBarElements.username) {
            topBarElements.username.textContent = 'Erro ao carregar';
        }
        if (topBarElements.progressDays) {
            topBarElements.progressDays.innerHTML = '00<span>/00 Dias</span>';
        }

        throw error;
    }
}

/**
 * Função para recarregar o Top-Bar quando há mudanças no perfil do usuário
 * Útil para atualizar a interface após o usuário fazer uma ação (upload de foto, reset, etc)
 */
async function refreshTopBar(options = {}) {
    console.log('🔄 Atualizando Top-Bar...');
    return await loadTopBar(options);
}

// Exporta as funções para uso global
window.loadTopBar = loadTopBar;
window.refreshTopBar = refreshTopBar;

console.log('✅ Funções de Top-Bar disponíveis globalmente');

