-- Migração para corrigir campos faltantes no schema
-- Data: 2025-11-14
-- Descrição: Adiciona campos registration_number e subscription_end_date

-- Adicionar campo registration_number
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS registration_number text;

-- Adicionar campo subscription_end_date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone;

-- Gerar números de registro para usuários existentes usando CTE
WITH numbered_profiles AS (
    SELECT 
        id,
        'M0RSI-' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 8, '0') as new_registration_number
    FROM public.profiles
    WHERE registration_number IS NULL
)
UPDATE public.profiles p
SET registration_number = np.new_registration_number
FROM numbered_profiles np
WHERE p.id = np.id;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_habit ON public.profiles(habit);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_registration ON public.profiles(registration_number);

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.registration_number IS 'Número único de registro do guerreiro no formato M0RSI-XXXXXXXX';
COMMENT ON COLUMN public.profiles.subscription_end_date IS 'Data de término da assinatura atual';
