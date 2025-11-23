**# Projeto OPIDAS**



**Este é o frontend do projeto OPIDAS, construído com HTML, CSS e JavaScript Vanilla.**



**## Visão Geral**



**O projeto está organizado em uma estrutura clara para separar as preocupações e facilitar a manutenção e integração com o backend (Supabase).**



**-   `/public`: Contém todos os arquivos estáticos que serão servidos. É o diretório raiz para o deploy.**

    **-   `assets/`: Imagens, fontes e folhas de estilo CSS.**

    **-   `js/`: Scripts JavaScript, divididos em bibliotecas (`lib`), lógica de negócio (`services`) e componentes de UI (`components`).**

    **-   Arquivos `.html`: Cada página principal da aplicação.**

**-   `/supabase`: Contém a configuração do backend.**

    **-   `migrations/`: Scripts SQL para a estrutura do banco de dados.**

    **-   `functions/`: Edge Functions para lógica server-side, como integração com Stripe.**



**## Como Executar**



**1.  Clone o repositório.**

**2.  Use uma extensão como "Live Server" no VS Code para servir o diretório `/public`.**

**3.  Acesse o endereço fornecido pelo Live Server (ex: `http://127.0.0.1:5500/public/index.html`).**



**## Próximos Passos**



**1.  \*\*Configurar Supabase:\*\* Crie um projeto no Supabase e preencha as variáveis de ambiente (URL e chave anônima) em `public/js/lib/supabase.js`.**

**2.  \*\*Executar Migrações:\*\* Aplique o schema de `supabase/migrations/` no editor SQL do seu projeto Supabase.**

**3.  \*\*Configurar Stripe:\*\* Crie contas no Stripe, obtenha as chaves e configure as Edge Functions e webhooks.**

**4.  \*\*Implementar Lógica:\*\* Substitua os `// TODO:` e a lógica mockada nos arquivos `.js` pelas chamadas reais às APIs do Supabase.**

