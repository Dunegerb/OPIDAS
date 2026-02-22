// Chat Service - OPIDAS
// Manages real-time messages using Supabase Realtime (WebSockets)

const ChatService = {
    currentSubscription: null,
    currentChannel: null,

    /**
     * Subscribes to a chat channel to receive real-time messages
     * @param {string} channelId - Channel ID (e.g., 'recruit', 'soldier')
     * @param {Function} onNewMessageCallback - Callback called when a new message arrives
     * @returns {Promise<void>}
     */
    async subscribeToChannel(channelId, onNewMessageCallback) {
        try {
            // Unsubscribe from previous channel if it exists
            await this.unsubscribeFromChannel();

            console.log(`📡 Subscribing to channel: ${channelId}`);

            // Creates a Supabase Realtime channel
            this.currentChannel = window.supabase.channel(`chat-${channelId}`, {
                config: {
                    broadcast: { self: true },
                    presence: { key: channelId }
                }
            });

            // Listen for changes in the messages table
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
                        console.log('📨 New message received:', payload.new);
                        
                        // Fetches user information who sent the message
                        const { data: profile, error } = await window.supabase
                            .from('profiles')
                            .select('first_name, last_name, avatar_url, rank')
                            .eq('id', payload.new.user_id)
                            .single();

                        if (error || !profile) {
                            console.error('❌ Error fetching user profile:', error);
                            console.warn('⚠️ Message received but profile not found. Check RLS policies.');
                            return;
                        }

                        // Calls the callback with the message and user profile
                        onNewMessageCallback(payload.new, profile);
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Successfully subscribed to the channel');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Error subscribing to the channel');
                    } else if (status === 'TIMED_OUT') {
                        console.error('⏱️ Timeout subscribing to the channel');
                    }
                });

        } catch (error) {
            console.error('❌ Error subscribing to channel:', error);
            throw error;
        }
    },

    /**
     * Unsubscribes from the current channel
     * @returns {Promise<void>}
     */
    async unsubscribeFromChannel() {
        if (this.currentChannel) {
            console.log('🔌 Unsubscribing from the channel');
            
            await window.supabase.removeChannel(this.currentChannel);
            this.currentChannel = null;
            this.currentSubscription = null;
        }
    },

    /**
     * Sends a message to a channel
     * @param {string} channelId - Channel ID
     * @param {string} text - Message text
     * @returns {Promise<Object>} - Sent message
     */
    async sendMessage(channelId, text) {
        try {
            // Verify authentication
            const { data: { user }, error: authError } = await window.supabase.auth.getUser();
            
            if (authError || !user) {
                throw new Error('User not authenticated');
            }

            // Validate the text
            if (!text || text.trim().length === 0) {
                throw new Error('Message cannot be empty');
            }

            console.log(`📤 Sending message to ${channelId}:`, text);

            // Insert the message into the database
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

            console.log('✅ Message sent successfully');
            return data;

        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    },

    /**
     * Fetches messages from a channel
     * @param {string} channelId - Channel ID
     * @param {number} limit - Maximum number of messages
     * @returns {Promise<Array>} - Array of messages
     */
    async getMessages(channelId, limit = 50) {
        try {
            console.log(`📥 Fetching messages from channel: ${channelId}`);

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

            // Reverse to show the oldest first
            const messages = data.reverse();
            
            console.log(`✅ ${messages.length} messages loaded`);
            return messages;

        } catch (error) {
            console.error('❌ Error fetching messages:', error);
            throw error;
        }
    },

    /**
     * Deletes a message (only the author can delete)
     * @param {number} messageId - ID of the message
     * @returns {Promise<void>}
     */
    async deleteMessage(messageId) {
        try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            console.log(`🗑️ Deleting message: ${messageId}`);

            const { error } = await window.supabase
                .from('messages')
                .delete()
                .eq('id', messageId)
                .eq('user_id', user.id); // Ensures only the author can delete

            if (error) throw error;

            console.log('✅ Message deleted successfully');

        } catch (error) {
            console.error('❌ Error deleting message:', error);
            throw error;
        }
    },

    /**
     * Fetches online users in a channel (using Presence)
     * @param {string} channelId - Channel ID
     * @returns {Promise<Array>} - Array of online users
     */
    async getOnlineUsers(channelId) {
        try {
            if (!this.currentChannel) {
                console.warn('⚠️ No active channel');
                return [];
            }

            const presenceState = this.currentChannel.presenceState();
            const onlineUsers = Object.values(presenceState).flat();

            console.log(`👥 ${onlineUsers.length} users online in channel ${channelId}`);
            return onlineUsers;

        } catch (error) {
            console.error('❌ Error fetching online users:', error);
            return [];
        }
    },

    /**
     * Tracks user presence in the channel
     * @param {Object} userData - User data
     * @returns {Promise<void>}
     */
    async trackPresence(userData) {
        try {
            if (!this.currentChannel) {
                console.warn('⚠️ No active channel to track presence');
                return;
            }

            await this.currentChannel.track({
                user_id: userData.id,
                username: userData.username,
                avatar_url: userData.avatar_url,
                online_at: new Date().toISOString()
            });

            console.log('✅ Presence tracked in the channel');

        } catch (error) {
            console.error('❌ Error tracking presence:', error);
        }
    },

    /**
     * Removes user presence from the channel
     * @returns {Promise<void>}
     */
    async untrackPresence() {
        try {
            if (!this.currentChannel) return;

            await this.currentChannel.untrack();
            console.log('✅ Presence removed from the channel');

        } catch (error) {
            console.error('❌ Error removing presence:', error);
        }
    }
};

// Export for global use
window.ChatService = ChatService;

// Clean up subscriptions when the page is closed
window.addEventListener('beforeunload', () => {
    ChatService.unsubscribeFromChannel();
});
