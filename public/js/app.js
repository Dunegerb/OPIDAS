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
 * @param {boolean} options.skipRetentionSync - Se deve pular a sincronização automática de retention_days/rank (padrão: false)
 * @returns {Promise<Object>} - Retorna o perfil do usuário carregado
 */
async function loadTopBar(options = {}) {
  const {
    includeProgressBar = true,
    includeAvatar = true,
    includeUsername = true,
    skipRetentionSync = false,
  } = options;

  try {
    console.log("📊 Carregando dados do Top-Bar...");

    // Verifica se o UserService está disponível
    if (!window.UserService) {
      throw new Error(
        "UserService não está carregado. Certifique-se de que user.js foi incluído."
      );
    }

    // Busca o perfil completo do usuário do Supabase
    const userProfile = await window.UserService.getCurrentUserProfile();

    if (!userProfile) {
      throw new Error("Não foi possível carregar o perfil do usuário");
    }

    console.log("✅ Perfil carregado com sucesso:", userProfile);

    // Seleciona os elementos do DOM que precisam ser atualizados
    const topBarElements = {
      avatar: document.getElementById("user-avatar"),
      username: document.getElementById("welcome-username"),
      rankIcon: document.getElementById("status-rank-icon"),
      progressBar: document.getElementById("progress-bar-fill"),
      progressDays: document.getElementById("progress-days"),
    };

    // ------------------------------------------------------------
    // ✅ SINCRONIZAÇÃO AUTOMÁTICA DE RETENÇÃO (SEM "CHECK-IN")
    // ------------------------------------------------------------
    // Regra: Se last_habit_date existe, o backend pode recalcular:
    // retention_days = hoje - last_habit_date (no fuso correto)
    // e rank = calculate_rank(retention_days)
    //
    // Aqui a gente só pede essa sincronização (sem somar +1 no frontend).
    if (!skipRetentionSync && userProfile.last_habit_date) {
      try {
        console.log("🧮 Sincronizando retenção automaticamente (backend)...");

        // Mantemos o nome processDailyCheckin por compatibilidade,
        // mas ele NÃO deve fazer lógica de "check-in".
        // Ele deve apenas recalcular retention_days baseado em last_habit_date.
        const syncResult = await window.UserService.processDailyCheckin();

        if (syncResult && syncResult.success) {
          console.log("✅ Retenção sincronizada:", syncResult);

          userProfile.retention_days = syncResult.retention_days;
          userProfile.rank = syncResult.rank;
          userProfile.rankData = window.UserService.calculateRankData(
            userProfile.retention_days ?? 0
          );
        } else {
          console.log(
            "ℹ️ Sincronização não necessária:",
            syncResult?.message
          );
        }
      } catch (syncError) {
        console.warn("⚠️ Erro ao sincronizar retenção:", syncError);
        // Não trava o carregamento se a sincronização falhar
      }
    } else {
      if (skipRetentionSync) {
        console.log("⏭️ Sincronização de retenção ignorada (skipRetentionSync=true)");
      } else {
        console.log(
          "ℹ️ Sincronização ignorada (last_habit_date é nulo: sem data de recaída definida)."
        );
      }
    }

    // Garante rankData mesmo se não vier do banco
    if (!userProfile.rankData) {
      const safeDays = userProfile.retention_days ?? 0;
      userProfile.rankData = window.UserService.calculateRankData(safeDays);
    }

    // ------------------------------------------------------------
    // Atualiza o avatar do usuário
    // ------------------------------------------------------------
    if (includeAvatar && topBarElements.avatar) {
      topBarElements.avatar.src =
        userProfile.avatar_url ||
        "https://github.com/Dunegerb/OPIDAS/raw/ba479afa9718cc1bd2b6a3d4e75d7b1bbe0da0f4/public/assets/styles/images/profile-card.png";
      console.log("✅ Avatar atualizado");
    }

    // ------------------------------------------------------------
    // Atualiza o nome de usuário com a patente
    // ------------------------------------------------------------
    if (includeUsername && topBarElements.username) {
      const rankName = userProfile.rankData?.name || "Recruta";
      const lastName = userProfile.last_name || "Usuário";
      topBarElements.username.textContent = `${rankName} ${lastName}`;
      console.log(`✅ Nome de usuário atualizado: ${rankName} ${lastName}`);
    }

    // ------------------------------------------------------------
    // Atualiza o ícone da patente
    // ------------------------------------------------------------
    if (topBarElements.rankIcon && userProfile.rankData) {
      topBarElements.rankIcon.src = userProfile.rankData.icon;
      console.log(`✅ Ícone de patente atualizado: ${userProfile.rankData.name}`);
    }

    // ------------------------------------------------------------
    // Atualiza a barra de progresso e contagem de dias
    // ------------------------------------------------------------
    if (includeProgressBar && topBarElements.progressBar && topBarElements.progressDays) {
      let retentionDays = userProfile.retention_days;

      // normaliza null/undefined
      if (retentionDays === null || retentionDays === undefined) {
        retentionDays = 0;
      }

      // Se last_habit_date for nulo, a contagem deve ficar em 0
      // (sem data de recaída definida = nada a contar).
      if (!userProfile.last_habit_date && retentionDays === 0) {
        retentionDays = 0;
        userProfile.rankData = window.UserService.calculateRankData(0);
        console.log("ℹ️ last_habit_date é nulo. Mantendo retention_days em 0.");
      }

      const rankData = userProfile.rankData || window.UserService.calculateRankData(retentionDays);

      // Objetivo de dias para a patente atual
      const goalDays = isFinite(rankData.maxDays) ? rankData.maxDays + 1 : retentionDays;
      const progressPercentage = Math.min((retentionDays / goalDays) * 100, 100);

      topBarElements.progressBar.style.width = `${progressPercentage}%`;

      const currentDaysFormatted = String(retentionDays).padStart(2, "0");
      const totalDaysFormatted = String(goalDays).padStart(2, "0");
      topBarElements.progressDays.innerHTML = `${currentDaysFormatted}<span>/${totalDaysFormatted} Dias</span>`;

      console.log(
        `✅ Barra de progresso atualizada: ${retentionDays}/${goalDays} dias (${progressPercentage.toFixed(
          1
        )}%)`
      );
    }

    console.log("✅ Top-Bar carregado e atualizado com sucesso!");
    return userProfile;
  } catch (error) {
    console.error("❌ Erro ao carregar Top-Bar:", error);

    // fallback UI
    const topBarElements = {
      username: document.getElementById("welcome-username"),
      progressDays: document.getElementById("progress-days"),
    };

    if (topBarElements.username) {
      topBarElements.username.textContent = "Erro ao carregar";
    }
    if (topBarElements.progressDays) {
      topBarElements.progressDays.innerHTML = "00<span>/00 Dias</span>";
    }

    throw error;
  }
}

/**
 * Função para recarregar o Top-Bar quando há mudanças no perfil do usuário
 * Útil para atualizar a interface após ações (upload de foto, reset, etc)
 */
async function refreshTopBar(options = {}) {
  console.log("🔄 Atualizando Top-Bar...");
  return await loadTopBar(options);
}

// Exporta as funções para uso global
window.loadTopBar = loadTopBar;
window.refreshTopBar = refreshTopBar;

console.log("✅ Funções de Top-Bar disponíveis globalmente");
