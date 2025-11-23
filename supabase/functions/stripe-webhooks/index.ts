// Edge Function: Stripe Webhooks
// Processa eventos do Stripe e atualiza o banco de dados
// Eventos suportados: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get("Stripe-Signature");
  
  if (!signature) {
    console.error("❌ Missing Stripe-Signature header");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  try {
    // Inicializa Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Inicializa Supabase com service role (acesso total)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Valida o webhook
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET") || ""
    );

    console.log(`📨 Webhook recebido: ${event.type}`);

    // Processa eventos
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error("❌ User ID não encontrado nos metadados");
          break;
        }

        console.log(`✅ Checkout completo para usuário: ${userId}`);

        // Busca a subscription para pegar a data de término do trial
        let subscriptionEndDate = null;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionEndDate = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString()
            : new Date(subscription.current_period_end * 1000).toISOString();
        }

        // Atualiza o perfil do usuário
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'trialing',
            stripe_subscription_id: session.subscription as string,
            subscription_end_date: subscriptionEndDate
          })
          .eq('id', userId);

        if (error) {
          console.error("❌ Erro ao atualizar perfil:", error);
        } else {
          console.log("✅ Perfil atualizado com status 'trialing'");
        }

        // Registra no log de pagamentos
        await supabase
          .from('payment_logs')
          .insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            status: 'success',
            amount: session.amount_total,
            currency: session.currency,
            metadata: session as any
          });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.subscription) {
          console.log("⚠️ Invoice sem subscription associada");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("❌ User ID não encontrado nos metadados da subscription");
          break;
        }

        console.log(`✅ Pagamento bem-sucedido para usuário: ${userId}`);

        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        // Atualiza o perfil do usuário
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            subscription_end_date: subscriptionEndDate,
            is_blocked: false, // Remove bloqueio se houver
            block_end_date: null
          })
          .eq('id', userId);

        if (error) {
          console.error("❌ Erro ao atualizar perfil:", error);
        } else {
          console.log("✅ Perfil atualizado com status 'active'");
        }

        // Registra no log de pagamentos
        await supabase
          .from('payment_logs')
          .insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            status: 'success',
            amount: invoice.amount_paid,
            currency: invoice.currency,
            metadata: invoice as any
          });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (!invoice.subscription) {
          console.log("⚠️ Invoice sem subscription associada");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("❌ User ID não encontrado nos metadados da subscription");
          break;
        }

        console.log(`❌ Falha no pagamento para usuário: ${userId}`);

        // Atualiza o perfil do usuário
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'past_due'
          })
          .eq('id', userId);

        if (error) {
          console.error("❌ Erro ao atualizar perfil:", error);
        } else {
          console.log("✅ Perfil atualizado com status 'past_due'");
        }

        // Registra no log de pagamentos
        await supabase
          .from('payment_logs')
          .insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            status: 'failed',
            amount: invoice.amount_due,
            currency: invoice.currency,
            metadata: invoice as any
          });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("❌ User ID não encontrado nos metadados da subscription");
          break;
        }

        console.log(`🚫 Assinatura cancelada para usuário: ${userId}`);

        // Atualiza o perfil do usuário
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'canceled',
            subscription_end_date: null
          })
          .eq('id', userId);

        if (error) {
          console.error("❌ Erro ao atualizar perfil:", error);
        } else {
          console.log("✅ Perfil atualizado com status 'canceled'");
        }

        // Registra no log de pagamentos
        await supabase
          .from('payment_logs')
          .insert({
            user_id: userId,
            stripe_event_id: event.id,
            event_type: event.type,
            status: 'canceled',
            metadata: subscription as any
          });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("❌ User ID não encontrado nos metadados da subscription");
          break;
        }

        console.log(`🔄 Assinatura atualizada para usuário: ${userId}`);

        const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        // Atualiza o perfil do usuário
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: subscription.status,
            subscription_end_date: subscriptionEndDate
          })
          .eq('id', userId);

        if (error) {
          console.error("❌ Erro ao atualizar perfil:", error);
        } else {
          console.log(`✅ Perfil atualizado com status '${subscription.status}'`);
        }

        break;
      }

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event: event.type }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
