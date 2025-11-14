-- Migração para adicionar validações no backend
-- Data: 2025-11-14
-- Descrição: Adiciona triggers para validar dados antes de inserir/atualizar

-- Função para validar atualização de perfil
CREATE OR REPLACE FUNCTION validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar first_name
    IF NEW.first_name IS NOT NULL THEN
        IF LENGTH(TRIM(NEW.first_name)) < 2 THEN
            RAISE EXCEPTION 'Nome deve ter pelo menos 2 caracteres';
        END IF;
        IF LENGTH(TRIM(NEW.first_name)) > 50 THEN
            RAISE EXCEPTION 'Nome deve ter no máximo 50 caracteres';
        END IF;
    END IF;
    
    -- Validar last_name
    IF NEW.last_name IS NOT NULL THEN
        IF LENGTH(TRIM(NEW.last_name)) < 2 THEN
            RAISE EXCEPTION 'Sobrenome deve ter pelo menos 2 caracteres';
        END IF;
        IF LENGTH(TRIM(NEW.last_name)) > 50 THEN
            RAISE EXCEPTION 'Sobrenome deve ter no máximo 50 caracteres';
        END IF;
    END IF;
    
    -- Validar habit
    IF NEW.habit IS NOT NULL THEN
        IF NEW.habit NOT IN ('masturbacao', 'pornografia', 'fumar', 'bebida', 'outro') THEN
            RAISE EXCEPTION 'Hábito inválido. Valores permitidos: masturbacao, pornografia, fumar, bebida, outro';
        END IF;
    END IF;
    
    -- Validar rank
    IF NEW.rank IS NOT NULL THEN
        IF NEW.rank NOT IN ('recruta', 'soldado', 'cabo', 'sargento', 'marechal', 'tenente', 'capitao') THEN
            RAISE EXCEPTION 'Patente inválida';
        END IF;
    END IF;
    
    -- Validar retention_days
    IF NEW.retention_days IS NOT NULL THEN
        IF NEW.retention_days < 0 THEN
            RAISE EXCEPTION 'Dias de retenção não pode ser negativo';
        END IF;
    END IF;
    
    -- Validar remaining_resets
    IF NEW.remaining_resets IS NOT NULL THEN
        IF NEW.remaining_resets < 0 THEN
            RAISE EXCEPTION 'Resets restantes não pode ser negativo';
        END IF;
    END IF;
    
    -- Validar subscription_status
    IF NEW.subscription_status IS NOT NULL THEN
        IF NEW.subscription_status NOT IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid') THEN
            RAISE EXCEPTION 'Status de assinatura inválido';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar antes de atualizar
DROP TRIGGER IF EXISTS validate_profile_before_update ON public.profiles;
CREATE TRIGGER validate_profile_before_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile_update();

-- Função para validar inserção de mensagem (rate limiting)
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    message_count integer;
BEGIN
    -- Conta mensagens do usuário nos últimos 10 segundos
    SELECT COUNT(*) INTO message_count
    FROM public.messages
    WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '10 seconds';
    
    IF message_count >= 5 THEN
        RAISE EXCEPTION 'Você está enviando mensagens muito rápido. Aguarde alguns segundos.';
    END IF;
    
    -- Validar conteúdo da mensagem
    IF NEW.content IS NULL OR LENGTH(TRIM(NEW.content)) = 0 THEN
        RAISE EXCEPTION 'Mensagem não pode estar vazia';
    END IF;
    
    IF LENGTH(NEW.content) > 5000 THEN
        RAISE EXCEPTION 'Mensagem muito longa (máximo 5000 caracteres)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para rate limiting de mensagens
DROP TRIGGER IF EXISTS message_rate_limit ON public.messages;
CREATE TRIGGER message_rate_limit
    BEFORE INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_rate_limit();

-- Comentários para documentação
COMMENT ON FUNCTION validate_profile_update IS 'Valida dados do perfil antes de atualizar';
COMMENT ON FUNCTION check_message_rate_limit IS 'Implementa rate limiting para mensagens (máximo 5 mensagens a cada 10 segundos)';
