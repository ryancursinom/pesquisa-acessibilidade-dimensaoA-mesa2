-- ==============================================================================
-- SISTEMA DE LEILÕES MIDAS - SCRIPT DE CRIAÇÃO (POSTGRESQL)
-- Versão simplificada para implementação rápida
-- ==============================================================================
 
-- ==============================================================================
-- 1. EXTENSÃO E ENUMS
-- ==============================================================================
 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE tipo_telefone AS ENUM (
	'COMERCIAL',
	'CELULAR',
	'RESIDENCIAL'
)
 
CREATE TYPE leilao_status AS ENUM (
    'AGUARDANDO',
    'ATIVO',
    'FINALIZADO',
    'CANCELADO'
);
 
CREATE TYPE produto_status AS ENUM (
    'DISPONIVEL',
    'EM_LEILAO',
    'VENDIDO'
);
 
CREATE TYPE pagamento_status AS ENUM (
    'PENDENTE',
    'PROCESSANDO',
    'APROVADO',
    'RECUSADO',
    'ESTORNADO'
);
 
CREATE TYPE tipo_pagamento AS ENUM (
    'PIX',
    'CARTAO_CREDITO',
    'CARTAO_DEBITO'
);
 
CREATE TYPE tipo_compra AS ENUM (
    'LEILAO',
    'COMPRA_IMEDIATA'
);
 
CREATE TYPE pedido_status AS ENUM (
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    'CANCELADO',
    'FINALIZADO'
);
 
-- ==============================================================================
-- 2. TABELAS DE DOMÍNIO
-- ==============================================================================
 
CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);
 
CREATE TABLE estado_fisico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT
);
 
CREATE TABLE raridade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);
 
CREATE TABLE identidade_visual (
    id SERIAL PRIMARY KEY,
    cor_primaria VARCHAR(7),
    cor_secundaria VARCHAR(7),
    descricao_paleta VARCHAR(255),
    formato VARCHAR(50),
    descricao_formato VARCHAR(255)
);
 
-- Arrumar tabela descrição
 
-- ==============================================================================
-- 3. USUÁRIO E TELEFONE
-- ==============================================================================
 
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE telefone (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL
        REFERENCES usuario(id)
        ON DELETE CASCADE,
 
    telefone VARCHAR(20) NOT NULL,
 
    tipo tipo_telefone NOT NULL,
 
    principal BOOLEAN DEFAULT FALSE
);
 
-- ==============================================================================
-- 4. PRODUTO E IMAGENS
-- ==============================================================================
 
CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
 
    id_usuario INT NOT NULL
        REFERENCES usuario(id)
        ON DELETE CASCADE,
 
    id_categoria INT NOT NULL
        REFERENCES categoria(id)
        ON DELETE RESTRICT,
 
    id_estado_fisico INT NOT NULL
        REFERENCES estado_fisico(id)
        ON DELETE RESTRICT,
 
    id_raridade INT NOT NULL
        REFERENCES raridade(id)
        ON DELETE RESTRICT,
 
    id_identidade_visual INT
        REFERENCES identidade_visual(id)
        ON DELETE SET NULL,
 
    nome VARCHAR(255) NOT NULL,
 
    ano_fabricacao INT,
    ano_lancamento INT,
 
    lance_minimo NUMERIC(12,2) NOT NULL
        CHECK (lance_minimo >= 0),
 
    resumo_descricao TEXT,
    marca VARCHAR(100),
 
    peso NUMERIC(10,3)
        CHECK (peso >= 0),
 
    status produto_status DEFAULT 'DISPONIVEL' NOT NULL,
 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE produto_imagem (
    id SERIAL PRIMARY KEY,
 
    id_produto INT NOT NULL
        REFERENCES produto(id)
        ON DELETE CASCADE,
 
    url VARCHAR(1024) NOT NULL,
 
    ordem INT DEFAULT 0
        CHECK (ordem >= 0)
);
 
-- ==============================================================================
-- 5. LEILÃO
-- ==============================================================================
 
CREATE TABLE leilao (
    id SERIAL PRIMARY KEY,
 
    -- UNIQUE garante que um produto só possa possuir um leilão.
    id_produto INT NOT NULL UNIQUE
        REFERENCES produto(id)
        ON DELETE RESTRICT,
 
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
 
    status leilao_status DEFAULT 'AGUARDANDO' NOT NULL,
 
    tipo_compra tipo_compra NOT NULL DEFAULT 'LEILAO',
 
    valor_compra_imediata NUMERIC(12,2),
 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
    CHECK (data_fim > data_inicio),
 
    CHECK (
        valor_compra_imediata IS NULL
        OR valor_compra_imediata > 0
    )
);
 
-- ==============================================================================
-- 6. LANCES
-- ==============================================================================
 
CREATE TABLE lance (
    id SERIAL PRIMARY KEY,
 
    id_leilao INT NOT NULL
        REFERENCES leilao(id)
        ON DELETE CASCADE,
 
    id_usuario INT NOT NULL
        REFERENCES usuario(id)
        ON DELETE RESTRICT,
 
    valor NUMERIC(12,2) NOT NULL
        CHECK (valor > 0),
 
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- ==============================================================================
-- 7. FAVORITOS
-- ==============================================================================
 
CREATE TABLE favorito (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL
        REFERENCES usuario(id)
        ON DELETE CASCADE,
 
    id_leilao INT NOT NULL
        REFERENCES leilao(id)
        ON DELETE CASCADE,
 
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- ==============================================================================
-- 8. AVALIAÇÃO DO SITE
-- ==============================================================================
 
CREATE TABLE avaliacao (
    id SERIAL PRIMARY KEY,
 
    id_usuario INT
        REFERENCES usuario(id)
        ON DELETE CASCADE,
 
    nota INT NOT NULL,
 
    observacao TEXT,
 
    CONSTRAINT ck_nota CHECK (nota BETWEEN 1 AND 5)
);
 
-- ==============================================================================
-- 9. PRODUTOS DA LOJA
-- ==============================================================================
 
CREATE TABLE produto_loja (
    id SERIAL PRIMARY KEY,
 
    nome VARCHAR(50) NOT NULL,
 
    preco NUMERIC(10,2) NOT NULL
        CHECK (preco >= 0),
 
    descricao TEXT NOT NULL,
 
    CONSTRAINT uq_nome UNIQUE(nome)
);
 
-- ==============================================================================
-- 10. CARRINHO
-- ==============================================================================
 
CREATE TABLE carrinho (
    id SERIAL PRIMARY KEY,
 
    id_usuario INT NOT NULL UNIQUE
        REFERENCES usuario(id)
        ON DELETE CASCADE,
 
    qtd_itens INT DEFAULT 0
        CHECK (qtd_itens >= 0),
 
    total NUMERIC(10,2) DEFAULT 0.00
        CHECK (total >= 0),
 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE carrinho_item (
    id SERIAL PRIMARY KEY,
 
    id_carrinho INT NOT NULL
        REFERENCES carrinho(id)
        ON DELETE CASCADE,
 
    id_produto_loja INT NOT NULL
        REFERENCES produto_loja(id)
        ON DELETE RESTRICT,
 
    quantidade INT NOT NULL DEFAULT 1
        CHECK (quantidade > 0),
 
    UNIQUE (id_carrinho, id_produto_loja)
);
 
-- ==============================================================================
-- 11. PEDIDO
-- ==============================================================================
 
CREATE TABLE pedido (
    id SERIAL PRIMARY KEY,
 
    id_usuario INT NOT NULL
        REFERENCES usuario(id)
        ON DELETE RESTRICT,
 
    status pedido_status DEFAULT 'AGUARDANDO_PAGAMENTO' NOT NULL,
 
    valor_total NUMERIC(12,2) NOT NULL
        CHECK (valor_total >= 0),
 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- ==============================================================================
-- 12. ITENS DO PEDIDO
-- ==============================================================================
 
CREATE TABLE pedido_item (
    id SERIAL PRIMARY KEY,
 
    id_pedido INT NOT NULL
        REFERENCES pedido(id)
        ON DELETE CASCADE,
 
    -- Preenchido quando o item veio da loja.
    id_produto_loja INT
        REFERENCES produto_loja(id)
        ON DELETE RESTRICT,
 
    -- Preenchido quando o item veio de um leilão.
    id_leilao INT
        REFERENCES leilao(id)
        ON DELETE RESTRICT,
 
    quantidade INT NOT NULL DEFAULT 1
        CHECK (quantidade > 0),
 
    preco_unitario NUMERIC(12,2) NOT NULL
        CHECK (preco_unitario >= 0),
 
    subtotal NUMERIC(12,2) NOT NULL
        CHECK (subtotal >= 0),
 
    -- Cada item do pedido representa OU um produto da loja
    -- OU um leilão.
    CONSTRAINT ck_pedido_item_origem CHECK (
        (id_produto_loja IS NOT NULL AND id_leilao IS NULL)
        OR
        (id_produto_loja IS NULL AND id_leilao IS NOT NULL)
    )
);
 
-- ==============================================================================
-- 13. PAGAMENTO
-- ==============================================================================
 
CREATE TABLE pagamento (
    id SERIAL PRIMARY KEY,
 
    id_pedido INT NOT NULL
        REFERENCES pedido(id)
        ON DELETE RESTRICT,
 
    -- Quem realizou o pagamento.
    id_pagador INT NOT NULL
        REFERENCES usuario(id)
        ON DELETE RESTRICT,
 
    -- Para compras de leilão, identifica o leiloeiro/vendedor que
    -- receberá o pagamento. Para produtos da loja pode ficar NULL,
    -- caso o destinatário seja a própria plataforma.
    id_recebedor INT
        REFERENCES usuario(id)
        ON DELETE RESTRICT,
 
    meio_pagamento tipo_pagamento NOT NULL,
 
    valor_total NUMERIC(12,2) NOT NULL
        CHECK (valor_total > 0),
 
    status pagamento_status DEFAULT 'PENDENTE' NOT NULL,
 
    -- Identificador retornado pelo gateway de pagamento.
    -- Não armazenar número do cartão, CVV ou senha.
    id_transacao VARCHAR(255),
 
    -- Para PIX, pode armazenar o identificador/txid retornado
    -- pelo provedor, sem armazenar credenciais bancárias.
    txid_pix VARCHAR(255),
 
    data_pagamento TIMESTAMP,
 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- ==============================================================================
-- 14. ÍNDICES IMPORTANTES
-- ==============================================================================
 
CREATE INDEX idx_produto_usuario
    ON produto(id_usuario);
 
CREATE INDEX idx_produto_categoria
    ON produto(id_categoria);
 
CREATE INDEX idx_leilao_status
    ON leilao(status);
 
CREATE INDEX idx_leilao_data_fim
    ON leilao(data_fim);
 
CREATE INDEX idx_lance_leilao
    ON lance(id_leilao);
 
CREATE INDEX idx_lance_usuario
    ON lance(id_usuario);
 
CREATE INDEX idx_favorito_usuario
    ON favorito(id_usuario);
 
CREATE INDEX idx_favorito_leilao
    ON favorito(id_leilao);
 
CREATE INDEX idx_carrinho_item_carrinho
    ON carrinho_item(id_carrinho);
 
CREATE INDEX idx_pedido_usuario
    ON pedido(id_usuario);
 
CREATE INDEX idx_pedido_status
    ON pedido(status);
 
CREATE INDEX idx_pedido_item_pedido
    ON pedido_item(id_pedido);
 
CREATE INDEX idx_pagamento_pedido
    ON pagamento(id_pedido);
 
CREATE INDEX idx_pagamento_pagador
    ON pagamento(id_pagador);
 
CREATE INDEX idx_pagamento_recebedor
    ON pagamento(id_recebedor);
 
-- ==============================================================================
-- FIM DO SCRIPT
-- ==============================================================================