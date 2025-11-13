// User Service - OPIDAS
// Gerencia perfil do usuário, progresso, patentes e resets

const UserService = {
    /**
     * Busca o perfil completo do usuário atual
     * @returns {Promise<Object>} - Perfil do usuário com dados de patente
     */
    async getCurrentUserProfile() {
        try {
            console.log('👤 Buscando perfil do usuário atual');

            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('Usuário não autenticado');
            }

            const { data: profile, error } = await window.supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            // Calcula dados da patente
            const rankData = this.calculateRankData(profile.retention_days);

            console.log('✅ Perfil carregado:', profile);

            return {
                ...profile,
                email: user.email,
                rankData: rankData
            };

        } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error);
            throw error;
        }
    },

    /**
     * Atualiza o perfil do usuário
     * @param {Object} data - Dados a serem atualizados
     * @returns {Promise<Object>} - Perfil atualizado
     */
    async updateUserProfile(data) {
        try {
            console.log('📝 Atualizando perfil do usuário:', data);

            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('Usuário não autenticado');
            }

            const { data: updatedProfile, error } = await window.supabase
                .from('profiles')
                .update(data)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Perfil atualizado com sucesso');
            return updatedProfile;

        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            throw error;
        }
    },

    /**
     * Faz upload da foto de perfil
     * @param {File} file - Arquivo de imagem
     * @returns {Promise<string>} - URL da imagem
     */
    async uploadAvatar(file) {
        try {
            console.log('📸 Fazendo upload do avatar');

            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // Gera nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Faz upload para o storage
            const { error: uploadError } = await window.supabase.storage
                .from('user-uploads')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Pega a URL pública
            const { data: { publicUrl } } = window.supabase.storage
                .from('user-uploads')
                .getPublicUrl(filePath);

            // Atualiza o perfil com a nova URL
            await this.updateUserProfile({ avatar_url: publicUrl });

            console.log('✅ Avatar atualizado com sucesso');
            return publicUrl;

        } catch (error) {
            console.error('❌ Erro ao fazer upload do avatar:', error);
            throw error;
        }
    },

    /**
     * Calcula dados da patente baseado nos dias de retenção
     * @param {number} days - Dias de retenção
     * @returns {Object} - Dados da patente
     */
    calculateRankData(days) {
        const ranks = [
            { id: 'recruta', level: 0, name: 'Recruta', minDays: 0, maxDays: 9, icon: 'assets/styles/images/patentes/Recruta.png' },
            { id: 'soldado', level: 1, name: 'Soldado', minDays: 10, maxDays: 29, icon: 'assets/styles/images/patentes/Soldado.png' },
            { id: 'cabo', level: 2, name: 'Cabo', minDays: 30, maxDays: 59, icon: 'assets/styles/images/patentes/Cabo.png' },
            { id: 'sargento', level: 3, name: 'Sargento', minDays: 60, maxDays: 89, icon: 'assets/styles/images/patentes/Sargento.png' },
            { id: 'marechal', level: 4, name: 'Marechal', minDays: 90, maxDays: 179, icon: 'assets/styles/images/patentes/Marechal.png' },
            { id: 'tenente', level: 5, name: 'Tenente', minDays: 180, maxDays: 364, icon: 'assets/styles/images/patentes/Tenente.png' },
            { id: 'capitao', level: 6, name: 'Capitão', minDays: 365, maxDays: Infinity, icon: 'assets/styles/images/patentes/Capitão.png' }
        ];

        for (const rank of ranks) {
            if (days >= rank.minDays && days <= rank.maxDays) {
                return rank;
            }
        }

        return ranks[0]; // Retorna Recruta como padrão
    },

    /**
     * Processa check-in diário do usuário
     * @returns {Promise<Object>} - Resultado do check-in
     */
    async processDailyCheckin() {
        try {
            console.log('✅ Processando check-in diário');

            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await window.supabase
                .rpc('process_daily_checkin', { user_uuid: user.id });

            if (error) throw error;

            console.log('✅ Check-in processado:', data);
            return data;

        } catch (error) {
            console.error('❌ Erro ao processar check-in:', error);
            throw error;
        }
    },

    /**
     * Reseta a contagem de dias do usuário
     * @returns {Promise<Object>} - Resultado do reset
     */
    async handleReset() {
        try {
            console.log('🔄 Solicitando reset de contagem');

            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // Busca perfil atual
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('retention_days, rank, remaining_resets')
                .eq('id', user.id)
                .single();

            if (profile.remaining_resets <= 0) {
                throw new Error('Você não tem mais chances de reset disponíveis');
            }

            // Salva no histórico
            await window.supabase
                .from('reset_history')
                .insert({
                    user_id: user.id,
                    days_before_reset: profile.retention_days,
                    rank_before_reset: profile.rank
                });

            // Reseta a contagem
            const { data: updatedProfile, error } = await window.supabase
                .from('profiles')
                .update({
                    retention_days: 0,
                    rank: 'recruta',
                    remaining_resets: profile.remaining_resets - 1,
                    last_habit_date: null
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Reset realizado com sucesso');
            return {
                success: true,
                remaining_resets: updatedProfile.remaining_resets
            };

        } catch (error) {
            console.error('❌ Erro ao resetar contagem:', error);
            throw error;
        }
    },

    /**
     * Salva progresso de vídeo
     * @param {number} episodeId - ID do episódio
     * @param {number} progress - Progresso em porcentagem (0-100)
     * @returns {Promise<void>}
     */
    async saveVideoProgress(episodeId, progress) {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            console.log(`💾 Salvando progresso do vídeo ${episodeId}: ${progress.toFixed(2)}%`);

            const { error } = await window.supabase
                .from('video_progress')
                .upsert({
                    user_id: user.id,
                    episode_id: episodeId,
                    progress_percentage: progress,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,episode_id'
                });

            if (error) throw error;

        } catch (error) {
            console.error('❌ Erro ao salvar progresso do vídeo:', error);
        }
    },

    /**
     * Busca progresso de todos os vídeos do usuário
     * @returns {Promise<Object>} - Objeto com episodeId: progress
     */
    async getVideoProgress() {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            console.log('📥 Buscando progresso de vídeos');

            const { data, error } = await window.supabase
                .from('video_progress')
                .select('episode_id, progress_percentage')
                .eq('user_id', user.id);

            if (error) throw error;

            // Converte para objeto { episodeId: progress }
            const progressMap = {};
            data.forEach(item => {
                progressMap[item.episode_id] = item.progress_percentage;
            });

            return progressMap;

        } catch (error) {
            console.error('❌ Erro ao buscar progresso de vídeos:', error);
            return {};
        }
    },

    /**
     * Calcula dias desde o onboarding
     * @param {string} onboardingDate - Data do onboarding (ISO string)
     * @returns {number} - Número de dias
     */
    calculateDaysSinceOnboarding(onboardingDate) {
        if (!onboardingDate) return 0;

        const onboarding = new Date(onboardingDate);
        const today = new Date();
        const diffTime = Math.abs(today - onboarding);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    },

    /**
     * Atualiza a barra de progresso e informações do top-bar
     * @param {HTMLElement} elements - Elementos do DOM
     * @param {Object} profile - Perfil do usuário
     */
    updateTopBar(elements, profile) {
        const { rankData } = profile;

        // Atualiza avatar
        if (elements.avatar) {
            elements.avatar.src = profile.avatar_url || 'https://github.com/Dunegerb/OPIDAS/raw/ba479afa9718cc1bd2b6a3d4e75d7b1bbe0da0f4/public/assets/styles/images/profile-card.png';
        }

        // Atualiza nome de usuário
        if (elements.username) {
            elements.username.textContent = `${rankData.name} ${profile.last_name || ''}`;
        }

        // Atualiza ícone de patente
        if (elements.rankIcon) {
            elements.rankIcon.src = rankData.icon;
        }

        // Atualiza dias de progresso
        const goalDays = isFinite(rankData.maxDays) ? rankData.maxDays + 1 : profile.retention_days;
        const progressPercentage = Math.min((profile.retention_days / goalDays) * 100, 100);

        if (elements.progressBar) {
            elements.progressBar.style.width = `${progressPercentage}%`;
        }

        if (elements.progressDays) {
            const currentDays = String(profile.retention_days).padStart(2, '0');
            const totalDays = String(goalDays).padStart(2, '0');
            elements.progressDays.innerHTML = `${currentDays}<span>/${totalDays} Dias</span>`;
        }
    }
};

// Exporta para uso global
window.UserService = UserService;
