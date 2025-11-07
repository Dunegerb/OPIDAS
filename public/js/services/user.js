// --- MÓDULO DE GERENCIAMENTO DE USUÁRIO (user.js) ---

async function updateUserProfile(data) {
    console.log("[UserService] Atualizando perfil do usuário com:", data);
    // TODO: Implementar a chamada ao Supabase
    // const { data: user, error } = await supabase.auth.getUser();
    // if (error || !user) { console.error("Usuário não autenticado."); return; }
    // const { error: updateError } = await supabase.from('profiles').update(data).eq('id', user.id);
    // if (updateError) console.error("Erro ao atualizar perfil:", updateError);
    return { success: true }; // Simula sucesso
}

async function getCurrentUserProfile() {
    console.log("[UserService] Buscando perfil do usuário atual.");
    // TODO: Implementar a chamada ao Supabase para buscar o perfil completo do usuário
    // Ex: return await supabase.from('profiles').select('*').single();
    return { success: true, data: {} }; // Retorna dados mockados
}

async function handleReset() {
    console.log("[UserService] Solicitando reset de contagem.");
    // TODO: Implementar a chamada a uma função RPC do Supabase
    // const { error } = await supabase.rpc('handle_user_reset');
    // if (error) console.error("Erro no reset:", error);
    return { success: true };
}

// Funções específicas de progresso de vídeo
async function saveVideoProgress(episodeId, progress) {
    console.log(`[UserService] Salvando progresso do vídeo ${episodeId}: ${progress.toFixed(2)}%`);
    // TODO: Implementar lógica de upsert na tabela `video_progress` do Supabase
    return { success: true };
}

async function getVideoProgress() {
    console.log("[UserService] Buscando progresso de todos os vídeos.");
    // TODO: Implementar a busca na tabela `video_progress`
    return { success: true, data: {} };
}