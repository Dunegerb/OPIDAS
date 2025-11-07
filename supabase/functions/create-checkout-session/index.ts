// Placeholder para a Edge Function de criação de sessão do Stripe
// Esta função será chamada pelo frontend para iniciar o processo de pagamento.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@10.12.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-08-01",
});

serve(async (req) => {
  try {
    const { priceId } = await req.json(); // O ID do preço viria do frontend

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price: priceId, // Ex: 'price_12345ABCDE'
        quantity: 1,
      }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${Deno.env.get("SITE_URL")}/onboarding.html?step=3`,
      cancel_url: `${Deno.env.get("SITE_URL")}/onboarding.html?step=2`,
    });

    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});