// Chat Service - OPIDAS
// Gerencia mensagens em tempo real usando Supabase Realtime (WebSockets)

const ChatService = {
    currentSubscription: null,
    currentChannel: null,

    /**
     * Inscreve-se em um canal de chat para receber mensagens em tempo real
     * @param {string} channelId - ID do canal (ex: 'recruta', 'soldado')
     * @param {Function} onNewMessageCallback - Callback chamado quando nova mensagem chega
     * @returns {Promise<void>}
     */
    async subscribeToChannel(channelId, onNewMessageCallback) {
        try {
            // Cancela inscrição anterior se existir
            await this.unsubscribeFromChannel();

            console.log(`📡 Inscrevendo-se no canal: ${channelId}`);

            // Cria um canal Realtime do Supabase
            this.currentChannel = window.supabase.channel(`chat-${channelId}`, {
                config: {
                    broadcast: { self: true },
                    presence: { key: channelId }
                }
            });

            // Escuta mudanças na tabela messages
            this.currentSubscription = this.currentChannel
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `channel_id=eq.${channelId}`
                    },
                    async (payload) => {
                        console.log('📨 Nova mensagem recebida:', payload.new);
                        
                        // Busca informações do usuário que enviou a mensagem
                        const { data: profile, error } = await window.supabase
                            .from('profiles')
                            .select('first_name, last_name, avatar_url, rank')
                            .eq('id', payload.new.user_id)
                            .single();

                        if (error || !profile) {
                            console.error('❌ Erro ao buscar perfil do usuário:', error);
                            console.warn('⚠️ Mensagem recebida mas perfil não encontrado. Verifique as políticas RLS.');
                            return;
                        }

                        // Chama o callback com a mensagem e perfil do usuário
                        onNewMessageCallback(payload.new, profile);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Inscrito no canal com sucesso');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Erro ao inscrever no canal');
                    } else if (status === 'TIMED_OUT') {
                        console.error('⏱️ Timeout ao inscrever no canal');
                    }
                });

        } catch (error) {
            console.error('❌ Erro ao inscrever no canal:', error);
            throw error;
        }
    },

    /**
     * Cancela inscrição do canal atual
     * @returns {Promise<void>}
     */
    async unsubscribeFromChannel() {
        if (this.currentChannel) {
            console.log('🔌 Cancelando inscrição do canal');
            
            await window.supabase.removeChannel(this.currentChannel);
            this.currentChannel = null;
            this.currentSubscription = null;
        }
    },

    /**
     * Envia uma mensagem para um canal
     * @param {string} channelId - ID do canal
     * @param {string} text - Texto da mensagem
     * @returns {Promise<Object>} - Mensagem enviada
     */
    async sendMessage(channelId, text) {
        try {
            // Verifica autenticação
            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('Usuário não autenticado');
            }

            // Valida o texto
            if (!text || text.trim().length === 0) {
                throw new Error('Mensagem não pode estar vazia');
            }

            console.log(`📤 Enviando mensagem para ${channelId}:`, text);

            // Insere a mensagem no banco de dados
            const { data, error } = await window.supabase
                .from('messages')
                .insert({
                    channel_id: channelId,
                    content: text.trim(),
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Mensagem enviada com sucesso');
            return data;

        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    },

    /**
     * Busca mensagens de um canal
     * @param {string} channelId - ID do canal
     * @param {number} limit - Número máximo de mensagens
     * @returns {Promise<Array>} - Array de mensagens
     */
    async getMessages(channelId, limit = 50) {
        try {
            console.log(`📥 Buscando mensagens do canal: ${channelId}`);

            const { data, error } = await window.supabase
                .from('messages')
                .select(`
                    *,
                    profiles:user_id (
                        first_name,
                        last_name,
                        avatar_url,
                        rank
                    )
                `)
                .eq('channel_id', channelId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Inverte para mostrar as mais antigas primeiro
            const messages = data.reverse();
            
            console.log(`✅ ${messages.length} mensagens carregadas`);
            return messages;

        } catch (error) {
            console.error('❌ Erro ao buscar mensagens:', error);
            throw error;
        }
    },

    /**
     * Deleta uma mensagem (apenas o autor pode deletar)
     * @param {number} messageId - ID da mensagem
     * @returns {Promise<void>}
     */
    async deleteMessage(messageId) {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            console.log(`🗑️ Deletando mensagem: ${messageId}`);

            const { error } = await window.supabase
                .from('messages')
                .delete()
                .eq('id', messageId)
                .eq('user_id', user.id); // Garante que só o autor pode deletar

            if (error) throw error;

            console.log('✅ Mensagem deletada com sucesso');

        } catch (error) {
            console.error('❌ Erro ao deletar mensagem:', error);
            throw error;
        }
    },

    /**
     * Busca usuários online em um canal (usando Presence)
     * @param {string} channelId - ID do canal
     * @returns {Promise<Array>} - Array de usuários online
     */
    async getOnlineUsers(channelId) {
        try {
            if (!this.currentChannel) {
                console.warn('⚠️ Nenhum canal ativo');
                return [];
            }

            const presenceState = this.currentChannel.presenceState();
            const onlineUsers = Object.values(presenceState).flat();

            console.log(`👥 ${onlineUsers.length} usuários online no canal ${channelId}`);
            return onlineUsers;

        } catch (error) {
            console.error('❌ Erro ao buscar usuários online:', error);
            return [];
        }
    },

    /**
     * Marca presença do usuário no canal
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<void>}
     */
    async trackPresence(userData) {
        try {
            if (!this.currentChannel) {
                console.warn('⚠️ Nenhum canal ativo para rastrear presença');
                return;
            }

            await this.currentChannel.track({
                user_id: userData.id,
                username: userData.username,
                avatar_url: userData.avatar_url,
                online_at: new Date().toISOString()
            });

            console.log('✅ Presença rastreada no canal');

        } catch (error) {
            console.error('❌ Erro ao rastrear presença:', error);
        }
    },

    /**
     * Remove presença do usuário do canal
     * @returns {Promise<void>}
     */
    async untrackPresence() {
        try {
            if (!this.currentChannel) return;

            await this.currentChannel.untrack();
            console.log('✅ Presença removida do canal');

        } catch (error) {
            console.error('❌ Erro ao remover presença:', error);
        }
    }
};

// Exporta para uso global
window.ChatService = ChatService;

// Limpa inscrições quando a página é fechada
window.addEventListener('beforeunload', () => {
    ChatService.unsubscribeFromChannel();
});
