#!/bin/bash

echo "🔍 Validando Projeto OPIDAS..."
echo ""

# Contador de erros
ERRORS=0

# 1. Verificar sintaxe JavaScript
echo "1️⃣ Verificando sintaxe JavaScript..."
for file in $(find public/js -name "*.js"); do
    if ! node --check "$file" 2>/dev/null; then
        echo "❌ Erro de sintaxe em: $file"
        ((ERRORS++))
    fi
done
echo "✅ Sintaxe JavaScript OK"
echo ""

# 2. Verificar se arquivos essenciais existem
echo "2️⃣ Verificando arquivos essenciais..."
ESSENTIAL_FILES=(
    "public/index.html"
    "public/campo.html"
    "public/doutrina.html"
    "public/onboarding.html"
    "public/404.html"
    "public/js/lib/supabase-config.js"
    "public/js/services/auth.js"
    "netlify.toml"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo não encontrado: $file"
        ((ERRORS++))
    fi
done
echo "✅ Arquivos essenciais OK"
echo ""

# 3. Verificar se há URLs do GitHub (não deveria ter mais)
echo "3️⃣ Verificando URLs do GitHub..."
if grep -r "github.com/Dunegerb" public/*.html public/onboarding/*.html 2>/dev/null; then
    echo "⚠️  URLs do GitHub ainda presentes"
    ((ERRORS++))
else
    echo "✅ Sem URLs do GitHub"
fi
echo ""

# 4. Verificar se netlify.toml tem force=false
echo "4️⃣ Verificando configuração Netlify..."
if grep -q "force = false" netlify.toml; then
    echo "✅ Netlify configurado corretamente"
else
    echo "⚠️  Netlify pode precisar de ajuste"
fi
echo ""

# 5. Verificar se 404.html não está vazio
echo "5️⃣ Verificando página 404..."
if [ -s "public/404.html" ]; then
    echo "✅ Página 404 implementada"
else
    echo "❌ Página 404 vazia"
    ((ERRORS++))
fi
echo ""

# Resultado final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Validação concluída com sucesso!"
    exit 0
else
    echo "❌ Validação falhou com $ERRORS erro(s)"
    exit 1
fi
