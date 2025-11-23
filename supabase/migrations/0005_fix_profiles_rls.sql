-- Migration: Corrigir política RLS para permitir leitura de perfis de outros usuários
-- Data: 2025-11-22
-- Descrição: Permite que usuários autenticados vejam perfis de outros usuários
--            Isso é necessário para o sistema de chat funcionar corretamente

-- Remove a política antiga que só permitia ver o próprio perfil
drop policy if exists "User can view their own profile." on public.profiles;

-- Cria nova política que permite usuários autenticados verem todos os perfis
create policy "Authenticated users can view all profiles." on public.profiles
  for select using (auth.role() = 'authenticated');

-- Mantém a política de atualização (usuários só podem atualizar o próprio perfil)
-- Não precisa recriar pois já existe e está correta
