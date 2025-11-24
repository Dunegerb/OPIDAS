// Edge Function: Create Checkout Session
// Cria uma sessão de checkout do Stripe para assinatura recorrente
// Assinatura: R$ 3,00 por semana com 7 dias de trial gratuito
// ✅ CORRIGIDO: Vulnerabilidade IDOR removida - usa user.id do token JWT
// ✅ CORRIGIDO: Aceita body vazio ou inválido (erro 400 resolvido)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializa Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Inicializa Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // ✅ CORREÇÃO DE SEGURANÇA: Verifica autenticação e extrai user do token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // ✅ CORREÇÃO DE SEGURANÇA: Usa user.id do token, NÃO do body
    // Isso previne ataques IDOR (Insecure Direct Object Reference)
    const userId = user.id
    const email = user.email || ''

    // ✅ CORREÇÃO: Pega URLs do body (opcionais) - aceita body vazio
    let successUrl, cancelUrl;
    try {
      const body = await req.json();
      successUrl = body.successUrl;
      cancelUrl = body.cancelUrl;
    } catch (error) {
      // Body vazio ou inválido, usa valores padrão
      console.log('⚠️ Body vazio ou inválido, usando URLs padrão');
    }

    console.log(`✅ Usuário autenticado: ${email} (${userId})`)

    // Busca ou cria customer no Stripe
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    // Se não existe customer, cria um novo
    if (!customerId) {
      console.log('📝 Criando novo customer no Stripe')
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Salva o customer_id no perfil
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)

      console.log(`✅ Customer criado: ${customerId}`)
    } else {
      console.log(`✅ Customer existente: ${customerId}`)
    }

    // Cria a sessão de checkout
    // Price ID: price_1SQCVzIxv3cuCq8e6aQPBEq0 (R$ 3,00 por semana)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1SQCVzIxv3cuCq8e6aQPBEq0',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${Deno.env.get('SITE_URL')}/onboarding/habit-tracking.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${Deno.env.get('SITE_URL')}/onboarding/investment.html`,
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
        trial_period_days: 7, // 7 dias de trial gratuito
      },
      metadata: {
        supabase_user_id: userId,
      },
      allow_promotion_codes: true, // Permite códigos promocionais
    })

    // Atualiza status para trialing (mitigação parcial da race condition)
    await supabaseClient
      .from('profiles')
      .update({ 
        subscription_status: 'trialing',
      })
      .eq('id', userId)

    console.log(`✅ Checkout session created for user ${userId}: ${session.id}`)

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        customerId: customerId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
