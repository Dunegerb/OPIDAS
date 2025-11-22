-- =====================================================
-- Script SQL: Adicionar coluna onboarding_data
-- Descrição: Adiciona suporte para persistência de dados
--            do onboarding no servidor (Supabase)
-- =====================================================

-- Adiciona coluna JSONB para armazenar dados do onboarding
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Adiciona comentário descritivo
COMMENT ON COLUMN profiles.onboarding_data IS 'Dados temporários do processo de onboarding (firstName, lastName, habit, profilePhotoUrl, etc.)';

-- Cria índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status 
ON profiles(onboarding_status);

-- =====================================================
-- Estrutura esperada do JSON em onboarding_data:
-- =====================================================
-- {
--   "firstName": "João",
--   "lastName": "Silva",
--   "habit": {
--     "value": "masturbacao",
--     "label": "Masturbação"
--   },
--   "profilePhotoUrl": "https://...",
--   "enlistmentDate": "2025-11-22T13:54:37.000Z",
--   "lastHabitDate": "2025-11-15T00:00:00.000Z",
--   "stripeSessionId": "cs_test_...",
--   "paymentCompleted": true,
--   "rank": "soldado",
--   "retentionDays": 15
-- }
-- =====================================================

-- Exemplo de consulta para verificar dados:
-- SELECT id, email, onboarding_status, onboarding_data 
-- FROM profiles 
-- WHERE onboarding_status = 'in_progress';
