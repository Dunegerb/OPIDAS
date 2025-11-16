-- Migração para Sistema de Múltiplos Progressos por Hábito
-- Data: 2025-11-16
-- Descrição: Permite usuário ter progresso separado para cada hábito

-- 1. Criar tabela de progresso por hábito
CREATE TABLE IF NOT EXISTS public.user_habit_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit text NOT NULL CHECK (habit IN ('masturbacao', 'pornografia', 'fumar', 'bebida', 'outro')),
    retention_days integer DEFAULT 0,
    last_habit_date timestamp with time zone DEFAULT now(),
    rank text DEFAULT 'recruta' CHECK (rank IN ('recruta', 'soldado', 'cabo', 'sargento', 'marechal', 'tenente', 'capitao')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Garantir que cada usuário tenha apenas um registro por hábito
    UNIQUE(user_id, habit)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_habit_progress_user ON public.user_habit_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_habit_progress_habit ON public.user_habit_progress(user_id, habit);

-- 3. Habilitar RLS
ALTER TABLE public.user_habit_progress ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY "Usuários podem ver seu próprio progresso"
    ON public.user_habit_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio progresso"
    ON public.user_habit_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso"
    ON public.user_habit_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_habit_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_habit_progress_updated_at
    BEFORE UPDATE ON public.user_habit_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_habit_progress_updated_at();

-- 6. Migrar dados existentes do profiles para user_habit_progress
-- Apenas para usuários que já têm um hábito definido
INSERT INTO public.user_habit_progress (user_id, habit, retention_days, last_habit_date, rank)
SELECT 
    id,
    habit,
    retention_days,
    COALESCE(last_habit_date, created_at),
    COALESCE(rank, 'recruta')
FROM public.profiles
WHERE habit IS NOT NULL
ON CONFLICT (user_id, habit) DO NOTHING;

-- 7. Comentários para documentação
COMMENT ON TABLE public.user_habit_progress IS 'Armazena o progresso individual do usuário para cada hábito que ele já trabalhou';
COMMENT ON COLUMN public.user_habit_progress.habit IS 'Hábito específico: masturbacao, pornografia, fumar, bebida, outro';
COMMENT ON COLUMN public.user_habit_progress.retention_days IS 'Dias de retenção (streak) para este hábito específico';
COMMENT ON COLUMN public.user_habit_progress.last_habit_date IS 'Data da última vez que trabalhou neste hábito';
COMMENT ON COLUMN public.user_habit_progress.rank IS 'Patente atual neste hábito específico';

-- 8. Função helper para trocar de campo (hábito)
CREATE OR REPLACE FUNCTION switch_user_habit(
    p_user_id uuid,
    p_new_habit text,
    p_current_habit text,
    p_current_retention_days integer,
    p_current_rank text
) RETURNS json AS $$
DECLARE
    v_new_progress record;
BEGIN
    -- 1. Salvar progresso do hábito atual
    IF p_current_habit IS NOT NULL THEN
        INSERT INTO public.user_habit_progress (user_id, habit, retention_days, rank, last_habit_date)
        VALUES (p_user_id, p_current_habit, p_current_retention_days, p_current_rank, now())
        ON CONFLICT (user_id, habit) 
        DO UPDATE SET 
            retention_days = EXCLUDED.retention_days,
            rank = EXCLUDED.rank,
            last_habit_date = EXCLUDED.last_habit_date,
            updated_at = now();
    END IF;

    -- 2. Buscar progresso do novo hábito (se existir)
    SELECT * INTO v_new_progress
    FROM public.user_habit_progress
    WHERE user_id = p_user_id AND habit = p_new_habit;

    -- 3. Atualizar perfil principal com novo hábito
    UPDATE public.profiles
    SET 
        habit = p_new_habit,
        retention_days = COALESCE(v_new_progress.retention_days, 0),
        rank = COALESCE(v_new_progress.rank, 'recruta'),
        last_habit_date = COALESCE(v_new_progress.last_habit_date, now())
    WHERE id = p_user_id;

    -- 4. Retornar novo progresso
    RETURN json_build_object(
        'habit', p_new_habit,
        'retention_days', COALESCE(v_new_progress.retention_days, 0),
        'rank', COALESCE(v_new_progress.rank, 'recruta'),
        'last_habit_date', COALESCE(v_new_progress.last_habit_date, now()),
        'had_previous_progress', v_new_progress IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comentário na função
COMMENT ON FUNCTION switch_user_habit IS 'Troca o hábito ativo do usuário, salvando o progresso do hábito anterior e carregando o progresso do novo hábito (se existir)';

-- 10. Verificação final
SELECT 
    'Migração concluída!' as status,
    COUNT(*) as total_progressos_migrados
FROM public.user_habit_progress;
