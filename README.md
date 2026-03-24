# TG Store — E-Commerce

E-commerce completo com Front-end + Painel Administrativo.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Prisma 5** + **SQLite**
- **Vanilla CSS** (Design System personalizado)
- **JWT** para autenticação do admin

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env

# 3. Criar banco de dados e popular
npx prisma db push
node prisma/seed.js

# 4. Iniciar servidor dev
npm run dev
```

O site estará disponível em `http://localhost:3000`

## Acesso Admin

- **URL**: `/admin`
- **Email**: `admin@tg.com`
- **Senha**: `admin123`

## Estrutura de Páginas

### Front-end (Loja)
- `/` — Home (vídeo, como enviamos, cartão fidelidade, produtos em destaque)
- `/loja` — Catálogo com filtros
- `/produto/[slug]` — Página do produto
- `/carrinho` — Carrinho de compras
- `/checkout` — Checkout (BH = Reserva | Fora = Pagamento online)
- `/confirmacao` — Confirmação do pedido
- `/comparativos` — Comparativos e diferenças (TG, Lipoless, Tirzec, Lipoland, Retatrutide, GHK-Cu)

### Admin
- `/admin` — Login
- `/admin/dashboard` — Dashboard com gráficos e stats
- `/admin/produtos` — CRUD de produtos
- `/admin/pedidos` — Gestão de pedidos com filtros e status
- `/admin/usuarios` — Gestão de usuários internos com roles
- `/admin/relatorios` — Relatórios, gráficos e exportação CSV

## Funcionalidades

### Seletor de Localidade
- **BH e região (até 45 km)**: Reserva + Pagamento na entrega + WhatsApp
- **Fora de BH**: Pagamento online + envio

### Admin
- CRUD completo de produtos
- Criação de usuários internos com roles (Admin, Atendimento, Estoque, Relatórios)
- Gestão de pedidos com fluxo de status completo
- Gráficos de estoque, vendas brutas e pedidos
- Exportação CSV (pedidos, produtos/estoque, vendas)
- Ação direta para WhatsApp em pedidos BH

### Assets obrigatórios
Colocar na pasta `public/`:
- `files/video/video.mp4` — Vídeo da Home
- `files/imagens/exemplo.webp` — Imagem de como enviamos
- `files/imagens/cartao-fidelidade.webp` — Imagem do cartão fidelidade

## Design System

- **Fontes**: Sora (títulos) + Inter (texto/UI)
- **Cores**: Verde #1F8A5B, Grafite #101828, Fundo #F8FAFC
- **Componentes**: Botões, inputs, badges, cards, modais com estados (default/hover/disabled/loading/focus/error)
