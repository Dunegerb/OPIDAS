// Edge Function: Cancel Subscription and Delete Account
// Cancela assinatura no Stripe e deleta conta do usuário

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, stripeCustomerId, stripeSubscriptionId } = await req.json()

    console.log('🗑️ Iniciando cancelamento e exclusão para usuário:', userId)

    // Validações
    if (!userId) {
      throw new Error('userId é obrigatório')
    }

    // Cria cliente Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Cancelar assinatura no Stripe (se existir)
    if (stripeSubscriptionId) {
      try {
        console.log('💳 Cancelando assinatura no Stripe:', stripeSubscriptionId)
        
        const subscription = await stripe.subscriptions.cancel(stripeSubscriptionId)
        
        console.log('✅ Assinatura cancelada:', subscription.id)
      } catch (stripeError) {
        console.error('⚠️ Erro ao cancelar assinatura (continuando):', stripeError.message)
        // Continua mesmo se falhar (pode já estar cancelada)
      }
    }

    // 2. Deletar customer no Stripe (se existir)
    if (stripeCustomerId) {
      try {
        console.log('💳 Deletando customer no Stripe:', stripeCustomerId)
        
        const deleted = await stripe.customers.del(stripeCustomerId)
        
        console.log('✅ Customer deletado:', deleted.id)
      } catch (stripeError) {
        console.error('⚠️ Erro ao deletar customer (continuando):', stripeError.message)
        // Continua mesmo se falhar
      }
    }

    // 3. Deletar dados do usuário no Supabase

    // 3.1. Deletar progresso de hábitos
    const { error: progressError } = await supabaseAdmin
      .from('user_habit_progress')
      .delete()
      .eq('user_id', userId)

    if (progressError) {
      console.error('⚠️ Erro ao deletar progresso de hábitos:', progressError.message)
    } else {
      console.log('✅ Progresso de hábitos deletado')
    }

    // 3.2. Deletar mensagens do chat
    const { error: messagesError } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('user_id', userId)

    if (messagesError) {
      console.error('⚠️ Erro ao deletar mensagens:', messagesError.message)
    } else {
      console.log('✅ Mensagens deletadas')
    }

    // 3.3. Deletar perfil (cascata vai deletar outras referências)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('⚠️ Erro ao deletar perfil:', profileError.message)
    } else {
      console.log('✅ Perfil deletado')
    }

    // 3.4. Deletar usuário do auth (isso vai fazer cascata em tudo)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      throw new Error(`Erro ao deletar usuário do auth: ${authError.message}`)
    }

    console.log('✅ Usuário deletado do auth')

    // 4. Log de auditoria
    console.log('✅ Conta completamente deletada:', {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Conta deletada com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro ao deletar conta:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
