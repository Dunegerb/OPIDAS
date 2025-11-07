// --- MÓDULO DE LÓGICA DO CHAT (chat.js) ---

let currentSubscription = null;

async function subscribeToChannel(channelId, onNewMessageCallback) {
    console.log(`[ChatService] Inscrevendo-se no canal: ${channelId}`);
    // TODO: Implementar inscrição em tempo real do Supabase
    /*
    currentSubscription = supabase.channel(`public:messages:channel_id=eq.${channelId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            console.log('Nova mensagem recebida!', payload.new);
            onNewMessageCallback(payload.new);
        })
        .subscribe();
    */
}

async function unsubscribeFromChannel() {
    console.log("[ChatService] Cancelando inscrição do canal atual.");
    // TODO: Implementar cancelamento da inscrição
    // if (currentSubscription) {
    //     supabase.removeChannel(currentSubscription);
    //     currentSubscription = null;
    // }
}

async function sendMessage(channelId, text) {
    console.log(`[ChatService] Enviando mensagem para ${channelId}: "${text}"`);
    // TODO: Implementar inserção de mensagem no Supabase
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return;
    // await supabase.from('messages').insert({ channel_id: channelId, content: text, user_id: user.id });
}

async function getMessages(channelId, limit = 50) {
    console.log(`[ChatService] Buscando mensagens do canal: ${channelId}`);
    // TODO: Implementar busca de mensagens no Supabase
    // const { data, error } = await supabase
    //     .from('messages')
    //     .select('*')
    //     .eq('channel_id', channelId)
    //     .order('created_at', { ascending: false })
    //     .limit(limit);
    // return data.reverse(); // Inverte para mostrar as mais antigas primeiro
    return []; // Retorna array vazio por enquanto
}