-- ============================================================================
-- MIDAS - DATALOAD DE PRODUTOS E IMAGENS
-- PostgreSQL
--
-- Baseado no modelo MIDAS já criado e nas 38 URLs do arquivo de imagens.
-- O script foi feito para poder ser executado novamente sem duplicar
-- categorias, usuário, produtos, imagens ou leilões.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. DADOS DE DOMÍNIO
-- ============================================================================

-- Valores padrão para o ambiente de desenvolvimento.
-- Se a coluna nome for VARCHAR, funcionam diretamente.
-- Se for ENUM, os valores precisam existir no ENUM do seu modelo.
INSERT INTO estado_fisico (nome, descricao) VALUES
    ('NOVO', 'Produto sem sinais relevantes de uso.'),
    ('EXCELENTE', 'Produto em excelente estado de conservação.'),
    ('MUITO_BOM', 'Produto com pequenos sinais de uso.'),
    ('BOM', 'Produto com sinais normais de uso.'),
    ('RESTAURADO', 'Produto restaurado e conservado.'),
    ('DANIFICADO', 'Produto com danos ou sinais significativos de uso.')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO raridade (nome) VALUES
    ('COMUM'),
    ('INCOMUM'),
    ('RARA'),
    ('MUITO_RARA'),
    ('LENDARIA'),
    ('UNICA')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO categoria (nome) VALUES
    ('Colecionáveis'),
    ('Esportes'),
    ('Cultura Pop'),
    ('Automóveis'),
    ('Imóveis Históricos'),
    ('Tecnologia'),
    ('Tecnologia e Games'),
    ('Antiguidades e Arte')
ON CONFLICT (nome) DO NOTHING;

-- ============================================================================
-- 2. USUÁRIO RESPONSÁVEL PELOS PRODUTOS DE TESTE
-- ============================================================================

INSERT INTO usuario (
    nome,
    username,
    email,
    senha_hash
)
SELECT
    'Administrador MIDAS',
    'admin_midas',
    'admin@midas.local',
    '$2a$10$7EqJtq98hPqEX7fNZaFWoO6W3Y6ZJ9n6Q9wJ7kJYwVQYw8QJv7S8K'
WHERE NOT EXISTS (
    SELECT 1 FROM usuario WHERE username = 'admin_midas'
);

-- ============================================================================
-- 3. PRODUTOS
-- ============================================================================

-- Os anos, marcas, pesos e valores abaixo são dados de demonstração para o
-- ambiente de desenvolvimento. As URLs são as URLs reais fornecidas no
-- arquivo de imagens do projeto.

WITH dados(ordem, nome, categoria, ano_fabricacao, ano_lancamento,
           lance_minimo, marca, peso, resumo_descricao, url) AS (
VALUES
(1, 'The Legend of Zelda - Edição Original Lacrada', 'Colecionáveis', 1987, 1987, 15000.00, 'Nintendo', NULL, 'Edição original lacrada de The Legend of Zelda, destinada a colecionadores.', 'https://lh3.googleusercontent.com/gg/ACRwjasQqE2ZMAQbtEIKm8jiRqIR2UOO6n5OZ7N_TQRCfIe9qEqQu0Ind47RUAeWxGj8dgBHCCd2sRS7ZOBn_0ktMscMEje2T5ALODoIeKVnDoFaZL0g9pHsYa_-vh2J2Li-gOWiwfw1-kA1X1rIwjKnKg278T70ogam0VFaQ-v9je0vtA_EBWUHPQK_WG71ls6COwe3M6kF0YwrYyyrGH6QjOxgyUd36xUP6vpQVlFJR3EMr2CAEl9mfre-tf_Dv471n6Cfk9tLtDO75e2ly9coxs9RU3GlNEDalok39_XIxwKmYnzAhBHTAts_ds52Obw5MV843doZwoLn0KpeH0u_M2rJ=s1024-rj'),
(2, 'Super Mario Bros. - Primeira Tiragem', 'Colecionáveis', 1985, 1985, 12000.00, 'Nintendo', NULL, 'Primeira tiragem de Super Mario Bros., item voltado ao mercado de colecionadores.', 'https://lh3.googleusercontent.com/gg/ACRwjav4Akvd9AGg7yl7tw1NfadRk1fA2XCUf91cGhrpzCoIseMUBkJyruwkB6TFyLp-s5g_bcHPWUKauH-KcHnmG7d8rNoIYoSZUzLm7LUuwJkayCZ277y6QRB7zjIfOTzLuMsMWJ6cSvCC3eStK4yrHl_4kRPHvLns_457PaaLF8gTP6Sn-2NEJWh6OTW8VuQs-i7eTKmlp1hOOKK6rWAvLcJiKAD92p0xSG3X4x4KYxmML1jjr_LCw87ndqxtqQHAlTC_Y1oRgb7lizH-jHhnFq9X7XAA8PbvBJZ8NT813bxEv_ptCPejoUiFESPZNn8VbVXArp20LowA9irzWnkYM4rF=s1024-rj'),
(3, 'Pokémon Red - Edição Lacrada', 'Colecionáveis', 1996, 1996, 18000.00, 'Nintendo', NULL, 'Edição lacrada de Pokémon Red para Game Boy.', 'https://lh3.googleusercontent.com/gg/ACRwjaszZURkBTaPxS59drfVW64MFxz1rV8VlfoTr7hcuMS1GKaLjVbaMbw6QT6P62TPKICawUViFzjMCRlgrakhev0fIOEXoi-BonMwFneGWt73SNOLLTsu8SGGQJ81UQWFNQF0T2PThRWb8C-wvLOJTWqAKP4B_TGyn5Ezi5rkD8pki2MSqN1rT57faAQI6BFa1ZOmNL1gCNgj9Xsh_9WuE6V1gP12VAUfWvgS_QA7l5xM52ZOKZu_Ds4eGzpv-Sq35C_38Qni1KufwiYXyk4IsOLiy6Xv36N5LUHLdgGfTnQ7Mn4QrueZZRgb82u-0Oeb8Qy5DaE5KKTIeqzOadYEM-Ek=s1024-rj'),
(4, 'Chrono Trigger - Edição Original', 'Colecionáveis', 1995, 1995, 10000.00, 'Square', NULL, 'Edição original de Chrono Trigger.', 'https://lh3.googleusercontent.com/gg/ACRwjaszZURkBTaPxS59drfVW64MFxz1rV8VlfoTr7hcuMS1GKaLjVbaMbw6QT6P62TPKICawUViFzjMCRlgrakhev0fIOEXoi-BonMwFneGWt73SNOLLTsu8SGGQJ81UQWFNQF0T2PThRWb8C-wvLOJTWqAKP4B_TGyn5Ezi5rkD8pki2MSqN1rT57faAQI6BFa1ZOmNL1gCNgj9Xsh_9WuE6V1gP12VAUfWvgS_QA7l5xM52ZOKZu_Ds4eGzpv-Sq35C_38Qni1KufwiYXyk4IsOLiy6Xv36N5LUHLdgGfTnQ7Mn4QrueZZRgb82u-0Oeb8Qy5DaE5KKTIeqzOadYEM-Ek=s1024-rj'),
(5, 'Charizard Base Set 1st Edition', 'Colecionáveis', 1999, 1999, 25000.00, 'Pokémon', NULL, 'Carta Charizard Base Set de primeira edição.', 'https://lh3.googleusercontent.com/gg/ACRwjaszZURkBTaPxS59drfVW64MFxz1rV8VlfoTr7hcuMS1GKaLjVbaMbw6QT6P62TPKICawUViFzjMCRlgrakhev0fIOEXoi-BonMwFneGWt73SNOLLTsu8SGGQJ81UQWFNQF0T2PThRWb8C-wvLOJTWqAKP4B_TGyn5Ezi5rkD8pki2MSqN1rT57faAQI6BFa1ZOmNL1gCNgj9Xsh_9WuE6V1gP12VAUfWvgS_QA7l5xM52ZOKZu_Ds4eGzpv-Sq35C_38Qni1KufwiYXyk4IsOLiy6Xv36N5LUHLdgGfTnQ7Mn4QrueZZRgb82u-0Oeb8Qy5DaE5KKTIeqzOadYEM-Ek=s1024-rj'),
(6, 'Pikachu - Edição Promocional Numerada', 'Colecionáveis', 1999, 1999, 9000.00, 'Pokémon', NULL, 'Edição promocional numerada de Pikachu.', 'https://lh3.googleusercontent.com/gg/ACRwjaseU2rJiKNPkEr3QM0QCAcifvHpne2boouWbi8_PQKaHhb8wa4paz91G1Pl4JVPjm3V9ySSACw2ouIfNkTwyBam8Li-syDWuNeYFpGrcHz4nUmRuBXGn3BZMg95bQoGwrIu-s9T9TA22Wgd3pZjRlPoXpY2L449a9tUQgIpPI4c_4hTTzz1N-i7zXlzG1OuAHoXtf0uyR2p0CQH-5_kUFE-DVPcjgwmkpAD17-9nwfiGUcZs8dyy8AaMcSHMNlFmdTg5MZmJCGDYO6XOQi-qZO9faiT7Moxs3reiDGs8h3vSQ4MZrWRaQfSmZdpG7MkYdLt17pBMbr-LAMow-7NbLE=s1024-rj'),
(7, 'Blue-Eyes White Dragon - Primeira Edição', 'Colecionáveis', 2002, 2002, 14000.00, 'Yu-Gi-Oh!', NULL, 'Carta Blue-Eyes White Dragon de primeira edição.', 'https://lh3.googleusercontent.com/gg/ACRwjaszZURkBTaPxS59drfVW64MFxz1rV8VlfoTr7hcuMS1GKaLjVbaMbw6QT6P62TPKICawUViFzjMCRlgrakhev0fIOEXoi-BonMwFneGWt73SNOLLTsu8SGGQJ81UQWFNQF0T2PThRWb8C-wvLOJTWqAKP4B_TGyn5Ezi5rkD8pki2MSqN1rT57faAQI6BFa1ZOmNL1gCNgj9Xsh_9WuE6V1gP12VAUfWvgS_QA7l5xM52ZOKZu_Ds4eGzpv-Sq35C_38Qni1KufwiYXyk4IsOLiy6Xv36N5LUHLdgGfTnQ7Mn4QrueZZRgb82u-0Oeb8Qy5DaE5KKTIeqzOadYEM-Ek=s1024-rj'),
(8, 'Mewtwo Holográfico - Primeira Coleção', 'Colecionáveis', 1999, 1999, 11000.00, 'Pokémon', NULL, 'Carta holográfica de Mewtwo da primeira coleção.', 'https://lh3.googleusercontent.com/gg/ACRwjasL41-79oCtNSG-6p46XFADSmg6lx3LWOUOLEuQJ1ldUy8Uo7-ZxGlICo1X3khHaedkWtB9JE1AT4ngH5GwtyXDcwx1hyWlzsEwUBW54Wc0lcj9Q3rWyVIfzP3XjPGAPlJX-q-hxDba5BweJRIkSsY46ENCb5oWodX21sSRcNyM_zCVf6PZlKvhKHiIenokW1NVYJFDBSi8ksiPEbSQVL-H5urdv7jQthkCxIP2VYzpm9GDukaV7bYJQyJE0W7mgzWwUqq1cEXATUv4K_O_EP-SgaFJDSOwfL1dGCbyRtooZIKS0JaSccFHYrWSuND40lBRjZn6o57XAEtdZr0xUw2=s1024-rj'),
(9, 'Camisa Oficial de Final Histórica', 'Esportes', 2014, 2014, 4500.00, NULL, NULL, 'Camisa esportiva associada a uma final histórica.', 'https://lh3.googleusercontent.com/gg/ACRwjasOOCxosoRt7PjPF-6bSqUbYUzzRRENMqYWw2U6z7uKpwFpAFfpsScwSWOSOu_Z43z0zqnnRz5X1X4Cj45KlYV5wRe-gpTzpWFbNFezjki1DWlU9Y9XVVLVO4NK7lpHCXwd7QTyWTQUZ89iIb61t4qxNsgFfb-WJXLFdCesz1UD_zXmCBcdti-iK1p2E00k9HhuX7pk9lVDlH8NG5-2ocamU1XxGM1HbxgZFPkcvFpzud13KJ9D1voYPozUZtW1SMu34xZNvPip0MvlDOMxcGztFRjme4dduz0ktSiK7adFJr6zMd9xkGdg26elZwIfm8oT5eXhQviMj4rN81Ab7O4=s1024-rj'),
(10, 'Bola Oficial de Final Autografada', 'Esportes', 2014, 2014, 7000.00, NULL, NULL, 'Bola oficial de final esportiva com autógrafos.', 'https://lh3.googleusercontent.com/gg/ACRwjas3nuZu7jTiHlUEnqLfKHtEB8nYj_8MnTVUUr65ERtgBEHqv9FfYhUcmH7CVUakQl1anoz3XCLn9RavRIrDUT8KjvTn5cA2lCx5LTkVOhjxa_UDab2-J_T2oRXX5rRysCWhzIXh_4M7nlAH7D2EhM6KvrHov3HTiExlV1pLXQwswswcFouQLjKi_XpzAjGBimqvNUi1FLiHiLLqNWU6B60Gh-zxD9BfEhs7r7WgstFiEbIjKTSagqGNaMFqEL14Gb9bFYtlaz3uI7zRAAgdP_NkOvrNON9CLh19Tqz8pvgoX3gQvG1fArDEO6D2f7Mo5-ekwIFYOuLqSwAL0LzIO3uS=s1024-rj'),
(11, 'Raquete Utilizada em Torneio Internacional', 'Esportes', 2010, 2010, 6000.00, NULL, NULL, 'Raquete utilizada em competição internacional.', 'https://lh3.googleusercontent.com/gg/ACRwjasBdQyGoCC0uG6fqBLN7hH_9x1H3GQNCnusKOd70QK1fuMNEDTG8FGBoD-QHP43ZI9kliXmpMZxXHBbkqV14ksIrtkbQDGLL6rUsZEzq5h2gc6ub8sxq-GV1Gvf9BoIgls0JCnqCeVURuFvDRfl-jqwshR9Kg1MEHwi8-cKHw3cwAznJtVakuxz075YOQ74aXnpoe7lNilI5nWHQL1LhgqV83vny_Mle1Nm7uFmURkJnzLAsi2JR7gpbc0-vyFeel2JT5Zn3s_ClEg1bMd4j34ifXjC4WCCCTPdo3zXycJn114y_yJ_U4U2Vqom4zYlQ_m7zF7UiVHwQ8Sqgc4PGPY=s1024-rj'),
(12, 'Darth Vader - Protótipo de Produção', 'Cultura Pop', 1978, 1978, 18000.00, 'Star Wars', NULL, 'Protótipo de produção relacionado ao personagem Darth Vader.', 'https://lh3.googleusercontent.com/gg/ACRwjau7IMaQ3KfwJtLAVysvpJb4FLqN1d8jWQYNUxLvIGG1B0S00XxqeGZanVMKXO_08WUrZtnnstW7Fs9xAnDji35d2xoi_F4MNo076Y5JAmtuQqL27RXYDftxHPWerxF0u5_DzMPEoL51NK-KCz8LM8ze_rEpCZLQFkICF-ei1JUFEn5ncgicFZA_rDUWPly8rBlvUXnLaQCq7n8B7kBiLzauOWzt8D0K60KJu9iI1S3RfKn_t3E_k-URiFffz3TpXUZ5xfqxoVFDeLkA7qD5_mkzwkuG9OykXjSYG8lMP9oLIyeLvR9KqZNUG1HDbVGO1uNhDBOOQCJK5K_aAIBOU9E=s1024-rj'),
(13, 'Batman - Edição Limitada de Convenção', 'Cultura Pop', 2020, 2020, 5000.00, 'DC', NULL, 'Item de edição limitada associado a uma convenção.', 'https://lh3.googleusercontent.com/gg/ACRwjattw_D_5wKk3GktYLXl3EIMF7E6r2Pldu1lrBtkQcrtX4fonRvkwLfcKctXSsW51dh29OqpZ7O5A41TcB5l3SqtbK0u_bJSw-xbjBpHWj875tovS53ir_kpVINZ2vw4JYwPuU_ZlDS0MRzO4cGQVHm7NDB6l6GMOdU8MfB4ZmujDdvpfA7XckNNzt3H3-MfSTyMoG8lDKxNy0d5s8nuWFK4JtZb1sa0oKqify6noUAtLCLlm3-184WIWqWFNruexOhiCwNI8FhznzffmE3CXXqNXilszg8U8IxonWH5GSMYXIcxEIFtIUMoZG2BNNVtzJY_OOCxOvLimDVMN-KOp868=s1024-rj'),
(14, 'Superman - Edição Comemorativa Limitada', 'Cultura Pop', 2020, 2020, 5000.00, 'DC', NULL, 'Edição comemorativa limitada associada ao personagem Superman.', 'https://lh3.googleusercontent.com/gg/ACRwjasBdQyGoCC0uG6fqBLN7hH_9x1H3GQNCnusKOd70QK1fuMNEDTG8FGBoD-QHP43ZI9kliXmpMZxXHBbkqV14ksIrtkbQDGLL6rUsZEzq5h2gc6ub8sxq-GV1Gvf9BoIgls0JCnqCeVURuFvDRfl-jqwshR9Kg1MEHwi8-cKHw3cwAznJtVakuxz075YOQ74aXnpoe7lNilI5nWHQL1LhgqV83vny_Mle1Nm7uFmURkJnzLAsi2JR7gpbc0-vyFeel2JT5Zn3s_ClEg1bMd4j34ifXjC4WCCCTPdo3zXycJn114y_yJ_U4U2Vqom4zYlQ_m7zF7UiVHwQ8Sqgc4PGPY=s1024-rj'),
(15, 'Porsche 911 Carrera RS 1973', 'Automóveis', 1973, 1973, 450000.00, 'Porsche', NULL, 'Automóvel clássico Porsche 911 Carrera RS de 1973.', 'https://lh3.googleusercontent.com/gg/ACRwjasBdQyGoCC0uG6fqBLN7hH_9x1H3GQNCnusKOd70QK1fuMNEDTG8FGBoD-QHP43ZI9kliXmpMZxXHBbkqV14ksIrtkbQDGLL6rUsZEzq5h2gc6ub8sxq-GV1Gvf9BoIgls0JCnqCeVURuFvDRfl-jqwshR9Kg1MEHwi8-cKHw3cwAznJtVakuxz075YOQ74aXnpoe7lNilI5nWHQL1LhgqV83vny_Mle1Nm7uFmURkJnzLAsi2JR7gpbc0-vyFeel2JT5Zn3s_ClEg1bMd4j34ifXjC4WCCCTPdo3zXycJn114y_yJ_U4U2Vqom4zYlQ_m7zF7UiVHwQ8Sqgc4PGPY=s1024-rj'),
(16, 'Volkswagen Kombi 1967 Restaurada', 'Automóveis', 1967, 1967, 180000.00, 'Volkswagen', NULL, 'Volkswagen Kombi de 1967 em condição restaurada.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHgjG8RpkRJY4SgKC-D5CfMQ38zMf70OFXQHUH93dD6pTrtDQ9SeExi2HiJBAvfJM4iWtUNlqI-DA42xI40tTz8wliHdWIeeEStW8EXrLcd6YBoLkKgHKGaGpWCjESO-FEIfgu8qcjmzy-rnD6ZE5s7zDycA88CnU2iv-KVfmhb-Zr3Zg=s1024-rj'),
(17, 'Ferrari 250 GT - Exemplar Histórico', 'Automóveis', 1960, 1960, 900000.00, 'Ferrari', NULL, 'Exemplar histórico da linha Ferrari 250 GT.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbEmNOuh9X5q6ubxlAbN52tgtsZN-WpvvIuOslNYRd2hQChwXzrBiiputoV2JSUHaxVWNX9T7wFUVkpyMKGyVPTqEXZ-P-i48TAlUaxEOCKkIPFc3tAS90sffg9xiAOOuqIdYgh5kCjbWobZvXYJe_g96l0jP2FbEdxxYf0SYMNZl7tBIw=s1024-rj'),
(18, 'Apartamento Histórico no Centro de São Paulo', 'Imóveis Históricos', 1930, NULL, 1200000.00, NULL, NULL, 'Apartamento histórico localizado no centro de São Paulo.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFfZvnPPgL9QeADl9vkI5sjiJOoEU7nnpM-5-LxtmrRZk6XzlB1eVKt8C4GTpNsxDYlqZqMbdxABVsg11xg12BP0m2sv3ZUrUe4hF1JpxkgXJIkCNTRrfbl33crzXU9fZBRgatD5namBrcxdgKVMeBPAk6oNtDhIUKA7XGFtDPW3t3Grw=s1024-rj'),
(19, 'Casa Modernista Preservada', 'Imóveis Históricos', 1950, NULL, 1800000.00, NULL, NULL, 'Casa de referência modernista em condição preservada.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbF3jQnNtkZxCvLQnBAcXJkV2rHzCCRVh6zQKTdKE6hX9PWI9yVNaadzHHcDKp_CsWmyz0kliVVAdrOi1lRR3HX7Yr56cdosy-E8HlU_uUSe6tGxrvsq8GfzwoSO7lgMFK7kGcfcpFKT8v0rcZnqdpGiI8fBrLd3iuMqBgPLsKHWPt87kg=s1024-rj'),
(20, 'Apple Macintosh 128K - Primeiro Modelo', 'Tecnologia', 1984, 1984, 25000.00, 'Apple', NULL, 'Apple Macintosh 128K, primeiro modelo da linha Macintosh.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbGNsp6QkRpbDfD4NJJy-Z8IvyL1hNAfDVH7_8m1CmuROpp324uCDljtnErnwAxb59pFmEX5sNlJT10HJ3LRIGcCU_nVGSfOj1ivmTXCMIAXvTL-GWZVgMWHF-fiUPsHuGHcRgWPmyE0nKyB2GG1kEnSzARPnMXcNhTyvR2HXjrXUoOphA=s1024-rj'),
(21, 'iPhone Original 2007 - Caixa Lacrada', 'Tecnologia', 2007, 2007, 20000.00, 'Apple', NULL, 'iPhone original de 2007 em caixa lacrada.', 'https://lh3.googleusercontent.com/gg/ACRwjas3nuZu7jTiHlUEnqLfKHtEB8nYj_8MnTVUUr65ERtgBEHqv9FfYhUcmH7CVUakQl1anoz3XCLn9RavRIrDUT8KjvTn5cA2lCx5LTkVOhjxa_UDab2-J_T2oRXX5rRysCWhzIXh_4M7nlAH7D2EhM6KvrHov3HTiExlV1pLXQwswswcFouQLjKi_XpzAjGBimqvNUi1FLiHiLLqNWU6B60Gh-zxD9BfEhs7r7WgstFiEbIjKTSagqGNaMFqEL14Gb9bFYtlaz3uI7zRAAgdP_NkOvrNON9CLh19Tqz8pvgoX3gQvG1fArDEO6D2f7Mo5-ekwIFYOuLqSwAL0LzIO3uS=s1024-rj'),
(22, 'Sony Walkman - Primeira Geração', 'Tecnologia', 1979, 1979, 12000.00, 'Sony', NULL, 'Sony Walkman de primeira geração.', 'https://lh3.googleusercontent.com/gg/ACRwjauUtOgByXWp29Vm3rEdkl9s_tzafZnENF3bMKbcRshCfxHTat1wBzN0_HTTO4xYSA1XB63GAYLC2mmotJY5dG03h0lpc0asZ61YOY1-Nig5Vwdfr847kPnoCThxt0or40avhMEAwX1yo5P_nfJI155Pj3QG5Vss61Nl1EsAxgarie7gXo-3gYgGfwTp2hgFOLc4BTOhmkPwcW-8-FyHXoE-ToS8Eg8SMwdZFujnvsh4RGtRBq2T8xfdlyaIfnf76crXURinUc5ISmyrw8D8AArb82UaUn56YOOXBThfqDQe_NRPHoc4oC-ygroyYQbfrYoVA9XkgjfKi7dy8jj41wk=s1024-rj'),
(23, 'Relógio de Bolso Suíço de 1890', 'Antiguidades e Arte', 1890, NULL, 8000.00, NULL, NULL, 'Relógio de bolso suíço datado de 1890.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHB6uMnDOZZFYxb0x1mMGH1RKa-jpqF0T3QFWNWoqNOEQ9hiRkSdlRp8SxlUcg95UiSfgjH4gRzzFPCTx5ECD5mEc6Fs1ccdV2BgH7H0NUri1sYej-9WVZZqd8eAgKeRXQqMb9mFxKptYSE2ZbqOxUZ1vedbrfswXiOw0jnwznVfUsF=s1024-rj'),
(24, 'Câmera Fotográfica de 1912', 'Antiguidades e Arte', 1912, NULL, 7000.00, NULL, NULL, 'Câmera fotográfica histórica de 1912.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbE0yPgFZ2fRI4sZ1_hm-4zn3gC18KZ3gKg7yluwPeLkuUK11Rd3cmDY9PHes2oNRG_TLHpZYpDTVuRuDU3m3tkLafTpGIqrRG27uKjlLw9omuQgFHtl5SIWbqH9FnJnEJG6o8rx01fObt-cchoQoJbQfy0zYjG-pm8bOTZV3QOSuedlUQ=s1024-rj'),
(25, 'Baú Europeu do Século XIX', 'Antiguidades e Arte', 1850, NULL, 9000.00, NULL, NULL, 'Baú europeu histórico do século XIX.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFq2HTllHAXwVl4jy-JeQ4fSJVtOEd41dNILx78EP1n0p-Gub-TcYklg7Fec7w-OM2rp2cbMXpMIPKh2LYDXgbc7ghF4cDGZx4vuSAYHN_65DIzXkXwhQ7F0nyBYqhq7mbxwHu39jJSxoolbJIbdHtnXQuf3BZ2msGdPlRKxBXwzlWMQA=s1024-rj'),
(26, 'Skin Digital de Evento Especial', 'Tecnologia e Games', NULL, NULL, 3000.00, NULL, NULL, 'Item digital de evento especial para ambiente de colecionáveis virtuais.', 'https://lh3.googleusercontent.com/gg/ACRwjauzUzHpAGkaSYpOShd8M2hob_JO9pzMQldNWG9aq978lMvPozAG9u1p2Fq73s2iM2w0Cvs1b1ys7QiEoIkxrmL1SuKRZhxL-5nmP1OIcDqWDqUBk4iy84-B3YpUq-_220WHL_8mGYg5EQgvZT0m4BWyuWyKAcbRKnbImyQIGtyXndLOs3WmPoFS2-ROkgBPpkUBlnhfWCrm83TMa_zWZ4ZfoNEgoZ0HwOyNLAVvNBdWO6wHGKZLF2nCb4dSA7EQlJUFNsCWgCD_7eb0wa0iePN9qBY7FJLgiCtiHKMA1XhP7ZZ2R8P6phslqt_EcLYX_sK9gdtcRoVfZO9XttvKQuN7=s1024-rj'),
(27, 'Console de Desenvolvimento - Unidade de Pré-Produção', 'Tecnologia e Games', NULL, NULL, 18000.00, NULL, NULL, 'Console de desenvolvimento destinado a testes e pré-produção.', 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbwClBgQKHKsgHcvlZgb8NsZohgupysOOCPY_GQpL1WstPHu23AvQqD4Dv4Ls8hzxxEp-SBag2I61Tcp7QdlI25drS_kyGkG2SiLVaTO6sGieizmEHpn92ArBl4uikQj7DXZw8yzHugOgNjieenbHSMDasY7EI3VzifoCSM4a3VnwNZOc_tN_TMnS-j2bmv90qdW1WjXDjsp7PwWH8qthRvmwzNdZjvHTvw4zjSIGHHBJ9vlZGZM_i939TqXejkYu5lVYQLwuO0aPIL38XyCjElJrBYxU8Z8=s1024-rj'),
(28, 'Protótipo de Controle de Videogame', 'Tecnologia e Games', NULL, NULL, 10000.00, NULL, NULL, 'Protótipo de controle de videogame.', 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbwClBgQKHKsgHcvlZgb8NsZohgupysOOCPY_GQpL1WstPHu23AvQqD4Dv4Ls8hzxxEp-SBag2I61Tcp7QdlI25drS_kyGkG2SiLVaTO6sGieizmEHpn92ArBl4uikQj7DXZw8yzHugOgNjieenbHSMDasY7EI3VzifoCSM4a3VnwNZOc_tN_TMnS-j2bmv90qdW1WjXDjsp7PwWH8qthRvmwzNdZjvHTvw4zjSIGHHBJ9vlZGZM_i939TqXejkYu5lVYQLwuO0aPIL38XyCjElJrBYxU8Z8=s1024-rj'),
(29, 'Relógio Astronômico de Mesa Europeu do Século XVIII', 'Antiguidades e Arte', 1750, NULL, 22000.00, NULL, NULL, 'Relógio astronômico europeu de mesa do século XVIII.', 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbwClBgQKHKsgHcvlZgb8NsZohgupysOOCPY_GQpL1WstPHu23AvQqD4Dv4Ls8hzxxEp-SBag2I61Tcp7QdlI25drS_kyGkG2SiLVaTO6sGieizmEHpn92ArBl4uikQj7DXZw8yzHugOgNjieenbHSMDasY7EI3VzifoCSM4a3VnwNZOc_tN_TMnS-j2bmv90qdW1WjXDjsp7PwWH8qthRvmwzNdZjvHTvw4zjSIGHHBJ9vlZGZM_i939TqXejkYu5lVYQLwuO0aPIL38XyCjElJrBYxU8Z8=s1024-rj'),
(30, 'Secrétaire Francesa de Madeira e Marchetaria de 1780', 'Antiguidades e Arte', 1780, NULL, 20000.00, NULL, NULL, 'Móvel francês de madeira e marchetaria datado de 1780.', 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbwClBgQKHKsgHcvlZgb8NsZohgupysOOCPY_GQpL1WstPHu23AvQqD4Dv4Ls8hzxxEp-SBag2I61Tcp7QdlI25drS_kyGkG2SiLVaTO6sGieizmEHpn92ArBl4uikQj7DXZw8yzHugOgNjieenbHSMDasY7EI3VzifoCSM4a3VnwNZOc_tN_TMnS-j2bmv90qdW1WjXDjsp7PwWH8qthRvmwzNdZjvHTvw4zjSIGHHBJ9vlZGZM_i939TqXejkYu5lVYQLwuO0aPIL38XyCjElJrBYxU8Z8=s1024-rj'),
(31, 'Astrolábio Náutico Português do Século XVII', 'Antiguidades e Arte', 1650, NULL, 15000.00, NULL, NULL, 'Astrolábio náutico português histórico do século XVII.', 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbwClBgQKHKsgHcvlZgb8NsZohgupysOOCPY_GQpL1WstPHu23AvQqD4Dv4Ls8hzxxEp-SBag2I61Tcp7QdlI25drS_kyGkG2SiLVaTO6sGieizmEHpn92ArBl4uikQj7DXZw8yzHugOgNjieenbHSMDasY7EI3VzifoCSM4a3VnwNZOc_tN_TMnS-j2bmv90qdW1WjXDjsp7PwWH8qthRvmwzNdZjvHTvw4zjSIGHHBJ9vlZGZM_i939TqXejkYu5lVYQLwuO0aPIL38XyCjElJrBYxU8Z8=s1024-rj'),
(32, 'Máscara Cerimonial Africana do Século XIX', 'Antiguidades e Arte', 1850, NULL, 12000.00, NULL, NULL, 'Máscara cerimonial africana histórica do século XIX.', 'https://lh3.googleusercontent.com/gg/ACRwjasNPgIw2Qqw1gLhJtW_1gfPLK4t9aD77dceqRTx8brusTECzq24VWfQoG3yifjw-fYz3knff-51Z2mErzdbxNVFGolKouhoPfUAqGkm7fDoLizIk5SiJaamh1UoZLlNS6VJ9ADxa4_ISu7qqfcZI-DiVhzvEgu8bdAjecGKJbgNHwhzVk0AsuRs05AhXnP8-HfP_8mPM3Rqc9ZfAuseCLZN3BqaKPDvFh2GdAEHLPumiNwqYHfTrR-YyqfvQ0qWTet7uFxtoI5ggu1I41B6WvWLer6d-EiH4__K1sNTtIFPA5N2egYPUn8mdvO1bQWkPiz9DlcfHQLjuTegCe4-9j3K=s1024-rj'),
(33, 'Página de Manuscrito Iluminado Europeu do Século XV', 'Antiguidades e Arte', 1450, NULL, 30000.00, NULL, NULL, 'Página de manuscrito iluminado europeu do século XV.', 'https://lh3.googleusercontent.com/gg/ACRwjavFMon4SKud9vKRp4gQcxSdu1KjgNp-UMj-XqTe6GOYuijqEFotAKdWZ8YDPBuCA4yfRI8GdotrC9pbgscib1LBhZ82I0pN2o-DLcBkkmWJ7dazXDNytM6wv6UDIBGTxX7yerVP69DRs1XPHbEpAA6BNz7wg83zGhibU0o52jUBf5Za0Cgjjejj0h9oloF-d-dgIMqti0NfpSFH_PqfT43hOx29YB2H3iorws9155a-BT5iKo2LmDzlEb1YsfnG9Xc8_jkgvzu_MI4EG2Ci9WEZXZQA5POuTOfFjyKaxQAjadpZLuKlP1TqIK1WZ-B7LLezwQdp4z1hFiz3eQc2oxIh=s1024-rj'),
(34, 'Espada Cerimonial Europeia do Século XVIII', 'Antiguidades e Arte', 1750, NULL, 18000.00, NULL, NULL, 'Espada cerimonial europeia do século XVIII.', 'https://lh3.googleusercontent.com/gg/ACRwjasBdQyGoCC0uG6fqBLN7hH_9x1H3GQNCnusKOd70QK1fuMNEDTG8FGBoD-QHP43ZI9kliXmpMZxXHBbkqV14ksIrtkbQDGLL6rUsZEzq5h2gc6ub8sxq-GV1Gvf9BoIgls0JCnqCeVURuFvDRfl-jqwshR9Kg1MEHwi8-cKHw3cwAznJtVakuxz075YOQ74aXnpoe7lNilI5nWHQL1LhgqV83vny_Mle1Nm7uFmURkJnzLAsi2JR7gpbc0-vyFeel2JT5Zn3s_ClEg1bMd4j34ifXjC4WCCCTPdo3zXycJn114y_yJ_U4U2Vqom4zYlQ_m7zF7UiVHwQ8Sqgc4PGPY=s1024-rj'),
(35, 'Painel de Vitral Art Nouveau Original de 1905', 'Antiguidades e Arte', 1905, NULL, 25000.00, NULL, NULL, 'Painel de vitral Art Nouveau original de 1905.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFZSbmIqGPC-CkVChfYni37Rv0wnVUfTSVeUnZa7vMO0r3pX22ljx8X3Bf-hD3XQNwlNZCLRc1QW4vOs5g4Nl6H3CIBL1tZynTR9M7E4cfGN67PempJeBK4qwLo52DkVSGkrsUG57XyPyU7YyC_4iuKPVNyVJh7f2_T9lq-qzKhzR2pOg=s1024-rj'),
(36, 'Máquina de Escrever Experimental de 1900', 'Antiguidades e Arte', 1900, NULL, 14000.00, NULL, NULL, 'Máquina de escrever experimental datada de 1900.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbG_kadAVMXjFeAM_LioNBlv6XZ3CRoqKMH8eoDEuiSfKPF7GPFvDL1YEOZil4o47kU1xg4jyfZm_9NNvXsSxoUcaSrToLlxBLyPU2x_mYBtlwmo0ETeCyH-n6Ja8tUSlaoEml5Ggat3VNrIq6_5r-a_lbYP4XvhMnrpmHJXKRiINT7xA=s1024-rj'),
(37, 'Ovo Decorativo Russo de Luxo do Início do Século XX', 'Antiguidades e Arte', 1910, NULL, 16000.00, NULL, NULL, 'Ovo decorativo russo de luxo do início do século XX.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFxyFU5WabYSDBCPpw65WNp3uZ-4swKN3xFgkKlKH-7z9acDrwCrBEtXIjxPw5cvr9ljinp8l4dksIwZJW9tGXcTuthl0QpUPMEPbB8llBU4mQiUaGqLerxlm9sCAOrdWT0ypVUGbkLeJ9DKQU_C_vaPAEFMAynZEvCCTgF_C1gYHQbHg=s1024-rj'),
(38, 'Caixa de Música Mecânica Suíça do Século XIX', 'Antiguidades e Arte', 1880, NULL, 13000.00, NULL, NULL, 'Caixa de música mecânica suíça do século XIX.', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHVXPTKctD4loMcZDyVgNi7HG_Yz4APzRJBBsaWiLS89igF7DrszAaNH6aMrSd0in6QR9n5FMNaVyAmPbtcZ5Y82BkfgrkojK3XcFWiALuFA0KEoQrE3jsK97cRDUUZQq1_-sUTxxzpm1DVUvscmpBcfMyy0Fkkb47OioLNJgVDqhVMcA=s1024-rj')
)
INSERT INTO produto (
    id_usuario,
    id_categoria,
    id_estado_fisico,
    id_raridade,
    nome,
    ano_fabricacao,
    ano_lancamento,
    lance_minimo,
    resumo_descricao,
    marca,
    peso,
    status
)
SELECT
    u.id,
    c.id,
    (SELECT id FROM estado_fisico ORDER BY id LIMIT 1),
    (SELECT id FROM raridade ORDER BY id LIMIT 1),
    d.nome,
    d.ano_fabricacao,
    d.ano_lancamento,
    d.lance_minimo,
    d.resumo_descricao,
    d.marca,
    d.peso::NUMERIC,
    'DISPONIVEL'::produto_status
FROM dados d
CROSS JOIN (SELECT id FROM usuario WHERE username = 'admin_midas') u
JOIN categoria c ON c.nome = d.categoria
WHERE NOT EXISTS (
    SELECT 1 FROM produto p WHERE p.nome = d.nome
);

-- ============================================================================
-- 4. IMAGENS DOS PRODUTOS
-- ============================================================================

WITH dados(nome, url, ordem) AS (
VALUES
        ('The Legend of Zelda - Edição Original Lacrada', 'https://lh3.googleusercontent.com/gg/ACRwjasQqE2ZMAQbtEIKm8jiRqIR2UOO6n5OZ7N_TQRCfIe9qEqQu0Ind47RUAeWxGj8dgBHCCd2sRS7ZOBn_0ktMscMEje2T5ALODoIeKVnDoFaZL0g9pHsYa_-vh2J2Li-gOWiwfw1-kA1X1rIwjKnKg278T70ogam0VFaQ-v9je0vtA_EBWUHPQK_WG71ls6COwe3M6kF0YwrYyyrGH6QjOxgyUd36xUP6vpQVlFJR3EMr2CAEl9mfre-tf_Dv471n6Cfk9tLtDO75e2ly9coxs9RU3GlNEDalok39_XIxwKmYnzAhBHTAts_ds52Obw5MV843doZwoLn0KpeH0u_M2rJ=s1024-rj', 1),
        ('Super Mario Bros. - Primeira Tiragem', 'https://lh3.googleusercontent.com/gg/ACRwjav4Akvd9AGg7yl7tw1NfadRk1fA2XCUf91cGhrpzCoIseMUBkJyruwkB6TFyLp-s5g_bcHPWUKauH-KcHnmG7d8rNoIYoSZUzLm7LUuwJkayCZ277y6QRB7zjIfOTzLuMsMWJ6cSvCC3eStK4yrHl_4kRPHvLns_457PaaLF8gTP6Sn-2NEJWh6OTW8VuQs-i7eTKmlp1hOOKK6rWAvLcJiKAD92p0xSG3X4x4KYxmML1jjr_LCw87ndqxtqQHAlTC_Y1oRgb7lizH-jHhnFq9X7XAA8PbvBJZ8NT813bxEv_ptCPejoUiFESPZNn8VbVXArp20LowA9irzWnkYM4rF=s1024-rj', 2),
        ('Pokémon Red - Edição Lacrada', 'https://lh3.googleusercontent.com/gg/ACRwjaszZURkBTaPxS59drfVW64MFxz1rV8VlfoTr7hcuMS1GKaLjVbaMbw6QT6P62TPKICawUViFzjMCRlgrakhev0fIOEXoi-BonMwFneGWt73SNOLLTsu8SGGQJ81UQWFNQF0T2PThRWb8C-wvLOJTWqAKP4B_TGyn5Ezi5rkD8pki2MSqN1rT57faAQI6BFa1ZOmNL1gCNgj9Xsh_9WuE6V1gP12VAUfWvgS_QA7l5xM52ZOKZu_Ds4eGzpv-Sq35C_38Qni1KufwiYXyk4IsOLiy6Xv36N5LUHLdgGfTnQ7Mn4QrueZZRgb82u-0Oeb8Qy5DaE5KKTIeqzOadYEM-Ek=s1024-rj', 3),
        ('Chrono Trigger - Edição Original', 'https://lh3.googleusercontent.com/gg/ACRwjavcELXTnTcLfWRYWiGFBSXpyswbpXbDrSV4ZtC4OibSotfm4yFbN0sEw-3CjNzDlvczMnE6P90cuyZuu51y--KISXQXNznK7vXDCM-royNEMXbo27xFNML4SplLSiNRrjvaBK-ia0h-YKckp2uWWiSlf923MbW8WoucdzDIm5UqhXafhHK5y6L7TXY5yzc2MO98AObXQCovnuOEkZD4f0S8B1EDxCaiRPxO1G_1iKFw-iGLbBB9wFKDn-Ad2xhOaaZduf91H_HkPIquUsbm-p516qJaQ8h-MVZQQEtpalVgpFwwrc-iIP_StdAzaSs_4-Kq1ciaKcADYNkmIscARyc=s1024-rj', 4),
        ('Charizard Base Set 1st Edition', 'https://lh3.googleusercontent.com/gg/ACRwjavuKruNDGGEG5-a4jfeitnU7dIOUnNUiDo1akNWlqgr8ItW0NQP7LcIipxT5A0wdOxt16GTEAYBPsgrZc_fIUnl4RVr5qs8x5V8YPyLtGzg6gzw7J1kkUUPYYXx_V7J1wzxkN2h6ClFpmAkw_hibr2WcNKRP_m8QnFtLOY7ikmvRTXS_mq-VVnyNL_N8mI_-XZICPJUH5jWzUhUpGpvDxmOqlADIzvukmGKh_38nxDLlKAnUqMZI1_nLFQbL_WN03cTR2cXzklKgV39bnu_Dz_nzfo0HyR9JKguZOK96I54o8EFJ4jkGuoj_YYFPEySBFQKjxog6TrnvzLFITePF2ch=s1024-rj', 5),
        ('Pikachu - Edição Promocional Numerada', 'https://lh3.googleusercontent.com/gg/ACRwjaseU2rJiKNPkEr3QM0QCAcifvHpne2boouWbi8_PQKaHhb8wa4paz91G1Pl4JVPjm3V9ySSACw2ouIfNkTwyBam8Li-syDWuNeYFpGrcHz4nUmRuBXGn3BZMg95bQoGwrIu-s9T9TA22Wgd3pZjRlPoXpY2L449a9tUQgIpPI4c_4hTTzz1N-i7zXlzG1OuAHoXtf0uyR2p0CQH-5_kUFE-DVPcjgwmkpAD17-9nwfiGUcZs8dyy8AaMcSHMNlFmdTg5MZmJCGDYO6XOQi-qZO9faiT7Moxs3reiDGs8h3vSQ4MZrWRaQfSmZdpG7MkYdLt17pBMbr-LAMow-7NbLE=s1024-rj', 6),
        ('Blue-Eyes White Dragon - Primeira Edição', 'https://lh3.googleusercontent.com/gg/ACRwjau0ssMCH5jqzQY19dHFzwp8VbYTp3KVUnCpkTT4BwVmZ0ENjFprevSL2xLdunz9jo5jg_lLQdNtxP_iT1rG2JxnkKmDYiXeEldghuDWR7ByMdU09rcIRFy6INTm5Lw6u3RpTuBoI5XKMVzZXRg___pbrCKG-YsZu3lOwWUihfy0LAH7d3Mcvs4EfbIzhNBcjYZQLm2DR4TLnhfSYSrdW6aLzFOJbGBO5BFQ8P2mLCsTwYQRUVBuS-_5ZX36RwhZRPBfISgcxELuctknXdd38T7oBHpuKCG_qTC4cx0FOeAQSl0LDI4-mAradvyW0dr45Hes2NtdqrkGEm617FjYmzo=s1024-rj', 7),
        ('Mewtwo Holográfico - Primeira Coleção', 'https://lh3.googleusercontent.com/gg/ACRwjavL41-79oCtNSG-6p46XFADSmg6lx3LWOUOLEuQJ1ldUy8Uo7-ZxGlICo1X3khHaedkWtB9JE1AT4ngH5GwtyXDcwx1hyWlzsEwUBW54Wc0lcj9Q3rWyVIfzP3XjPGAPlJX-q-hxDba5BweJRIkSsY46ENCb5oWodX21sSRcNyM_zCVf6PZlKvhKHiIenokW1NVYJFDBSi8ksiPEbSQVL-H5urdv7jQthkCxIP2VYzpm9GDukaV7bYJQyJE0W7mgzWwUqq1cEXATUv4K_O_EP-SgaFJDSOwfL1dGCbyRtooZIKS0JaSccFHYrWSuND40lBRRjZn6o57XAEtdZr0xUw2=s1024-rj', 8),
        ('Camisa Oficial de Final Histórica', 'https://lh3.googleusercontent.com/gg/ACRwjasOOCxosoRt7PjPF-6bSqUbYUzzRRENMqYWw2U6z7uKpwFpAFfpsScwSWOSOu_Z43z0zqnnRz5X1X4Cj45KlYV5wRe-gpTzpWFbNFezjki1DWlU9Y9XVVLVO4NK7lpHCXwd7QTyWTQUZ89iIb61t4qxNsgFfb-WJXLFdCesz1UD_zXmCBcdti-iK1p2E00k9HhuX7pk9lVDlH8NG5-2ocamU1XxGM1HbxgZFPkcvFpzud13KJ9D1voYPozUZtW1SMu34xZNvPip0MvlDOMxcGztFRjme4dduz0ktSiK7adFJr6zMd9xkGdg26elZwIfm8oT5eXhQviMj4rN81Ab7O4=s1024-rj', 9),
        ('Bola Oficial de Final Autografada', 'https://lh3.googleusercontent.com/gg/ACRwjascEEylj_LaYl8unQbGC9zz1PgxTfw1GeOfMVSl46hjYhlFninJRjWjXIVtElqft270TLuzRFhJX-jtDvcs49-vT9TOTGMlgRH0HyFL4aajItjFYsQG5n17DWp0biEnx1ck-lSmCaiBP6Fr8eWthV9ruABzizoYaRMn_Zwi9PndmphfORh2fJCmKWSt2KKA6sjufOBoP19zSsVofomckU3n32pP5-Tf5YG6IEjPZLqGA-leSE7tvC0gafMn4x9_RYW-KSdt9gotPkwe9iq3ij0pkznRxKU2P_4p7fj6FJm-wN1FShk1rFyH1LKVcd6t43OzYxOvKqSJmVggduvXOZc=s1024-rj', 10),
        ('Raquete Utilizada em Torneio Internacional', 'https://lh3.googleusercontent.com/gg/ACRwjauO97sWKv0rm3svYcVsiPiXR9FktIenH9NxLwJDC8deoqat4shIFyKfU_OvBUCRAtBoDSzqWuonZ9KvdU9SCuG-P9rR_01vgdISAgbo1-dcTGq3WYQnTk_oyTnKEDFKXFFQXcnp3V13mHQ1LaFEHzm6FVFUm0SUynldhYLOnxGLMEMV6-GSEDyxjMXUa_RYzrL-VkkPLZ8Ecx7EzxV8xK8FOQSBGQXGk3c9XDRnFFL-txf_u8rqQW72u-zQ3KkXTRzLiJj8beFUOG7-xoxUcYq1CYADHs8AzjJqJkIY_B4fa0SX2xsTH7hl5gDcTm7EIsZw2fpnAnJPtCtonr7q8bUG=s1024-rj', 11),
        ('Darth Vader - Protótipo de Produção', 'https://lh3.googleusercontent.com/gg/ACRwjau7IMaQ3KfwJtLAVysvpJb4FLqN1d8jWQYNUxLvIGG1B0S00XxqeGZanVMKXO_08WUrZtnnstW7Fs9xAnDji35d2xoi_F4MNo076Y5JAmtuQqL27RXYDftxHPWerxF0u5_DzMPEoL51NK-KCz8LM8ze_rEpCZLQFkICF-ei1JUFEn5ncgicFZA_rDUWPly8rBlvUXnLaQCq7n8B7kBiLzauOWzt8D0K60KJu9iI1S3RfKn_t3E_k-URiFffz3TpXUZ5xfqxoVFDeLkA7qD5_mkzwkuG9OykXjSYG8lMP9oLIyeLvR9KqZNUG1HDbVGO1uNhDBOOQCJK5K_aAIBOU9E=s1024-rj', 12),
        ('Batman - Edição Limitada de Convenção', 'https://lh3.googleusercontent.com/gg/ACRwjattw_D_5wKk3GktYLXl3EIMF7E6r2Pldu1lrBtkQcrtX4fonRvkwLfcKctXSsW51dh29OqpZ7O5A41TcB5l3SqtbK0u_bJSw-xbjBpHWj875tovS53ir_kpVINZ2vw4JYwPuU_ZlDS0MRzO4cGQVHm7NDB6l6GMOdU8MfB4ZmujDdvpfA7XckNNzt3H3-MfSTyMoG8lDKxNy0d5s8nuWFK4JtZb1sa0oKqify6noUAtLCLlm3-184WIWqWFNruexOhiCwNI8FhznzffmE3CXXqNXilszg8U8IxonWH5GSMYXIcxEIFtIUMoZG2BNNVtzJY_OOCxOvLimDVMN-KOp868=s1024-rj', 13),
        ('Superman - Edição Comemorativa Limitada', 'https://lh3.googleusercontent.com/gg/ACRwjau3_pAdG0H2risKfmy93rNVtxviYdAOuV3FqFozRY4zNEkaIvLcc0k5YktcPDTAqlJLZGbKpwf9xqd_MqXDRz8A6kESzEfsJ6a08DUM4SGmB-nDsyKANtODGImQWBW6LPatOGWo4lF6LZgEKTj3rkB1jtXDELCOqTPbsCF6kk45Za_8iQf7nkHTJDjbq5klp579_85BwZok7JO5P93dhsNGUoRz5FGzQ-uWDbRBOdb3uE3wIdYE1sZ19FIpQckR0HlXo1USu2dEzqjMkQ_gUVa7QHQ8uamT6-zsIYYW002QSLEOCnL7xfU3t8hMO0veslaDsnUxxoeT9wT6ejWHHfDh=s1024-rj', 14),
        ('Porsche 911 Carrera RS 1973', 'https://lh3.googleusercontent.com/gg/ACRwjasBdQyGoCC0uG6fqBLN7hH_9x1H3GQNCnusKOd70QK1fuMNEDTG8FGBoD-QHP43ZI9kliXmpMZxXHBbkqV14ksIrtkbQDGLL6rUsZEzq5h2gc6ub8sxq-GV1Gvf9BoIgls0JCnqCeVURuFvDRfl-jqwshR9Kg1MEHwi8-cKHw3cwAznJtVakuxz075YOQ74aXnpoe7lNilI5nWHQL1LhgqV83vny_Mle1Nm7uFmURkJnzLAsi2JR7gpbc0-vyFeel2JT5Zn3s_ClEg1bMd4j34ifXjC4WCCCTPdo3zXycJn114y_yJ_U4U2Vqom4zYlQ_m7zF7UiVHwQ8Sqgc4PGPY=s1024-rj', 15),
        ('Volkswagen Kombi 1967 Restaurada', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHgjG8RpkRJY4SgKC-D5CfMQ38zMf70OFXQHUH93dD6pTrtDQ9SeExi2HiJBAvfJM4iWtUNlqI-DA42xI40tTz8wliHdWIeeEStW8EXrLcd6YBoLkKgHKGaGpWCjESO-FEIfgu8qcjmzy-rnD6ZE5s7zDycA88CnU2iv-KVfmhb-Zr3Zg=s1024-rj', 16),
        ('Ferrari 250 GT - Exemplar Histórico', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbEmNOuh9X5q6ubxlAbN52tgtsZN-WpvvIuOslNYRd2hQChwXzrBiiputoV2JSUHaxVWNX9T7wFUVkpyMKGyVPTqEXZ-P-i48TAlUaxEOCKkIPFc3tAS90sffg9xiAOOuqIdYgh5kCjbWobZvXYJe_g96l0jP2FbEdxxYf0SYMNZl7tBIw=s1024-rj', 17),
        ('Apartamento Histórico no Centro de São Paulo', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFfZvnPPgL9QeADl9vkI5sjiJOoEU7nnpM-5-LxtmrRZk6XzlB1eVKt8C4GTpNsxDYlqZqMbdxABVsg11xg12BP0m2sv3ZUrUe4hF1JpxkgXJIkCNTRrfbl33crzXU9fZBRgatD5namBrcxdgKVMeBPAk6oNtDhIUKA7XGFtDPW3t3Grw=s1024-rj', 18),
        ('Casa Modernista Preservada', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbF3jQnNtkZxCvLQnBAcXJkV2rHzCCRVh6zQKTdKE6hX9PWI9yVNaadzHHcDKp_CsWmyz0kliVVAdrOi1lRR3HX7Yr56cdosy-E8HlU_uUSe6tGxrvsq8GfzwoSO7lgMFK7kGcfcpFKT8v0rcZnqdpGiI8fBrLd3iuMqBgPLsKHWPt87kg=s1024-rj', 19),
        ('Apple Macintosh 128K - Primeiro Modelo', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbGNsp6QkRpbDfD4NJJy-Z8IvyL1hNAfDVH7_8m1CmuROpp324uCDljtnErnwAxb59pFmEX5sNlJT10HJ3LRIGcCU_nVGSfOj1ivmTXCMIAXvTL-GWZVgMWHF-fiUPsHuGHcRgWPmyE0nKyB2GG1kEnSzARPnMXcNhTyvR2HXjrXUoOphA=s1024-rj', 20),
        ('iPhone Original 2007 - Caixa Lacrada', 'https://lh3.googleusercontent.com/gg/ACRwjas3nuZu7jTiHlUEnqLfKHtEB8nYj_8MnTVUUr65ERtgBEHqv9FfYhUcmH7CVUakQl1anoz3XCLn9RavRIrDUT8KjvTn5cA2lCx5LTkVOhjxa_UDab2-J_T2oRXX5rRysCWhzIXh_4M7nlAH7D2EhM6KvrHov3HTiExlV1pLXQwswswcFouQLjKi_XpzAjGBimqvNUi1FLiHiLLqNWU6B60Gh-zxD9BfEhs7r7WgstFiEbIjKTSagqGNaMFqEL14Gb9bFYtlaz3uI7zRAAgdP_NkOvrNON9CLh19Tqz8pvgoX3gQvG1fArDEO6D2f7Mo5-ekwIFYOuLqSwAL0LzIO3uS=s1024-rj', 21),
        ('Sony Walkman - Primeira Geração', 'https://lh3.googleusercontent.com/gg/ACRwjauUtOgByXWp29Vm3rEdkl9s_tzafZnENF3bMKbcRshCfxHTat1wBzN0_HTTO4xYSA1XB63GAYLC2mmotJY5dG03h0lpc0asZ61YOY1-Nig5Vwdfr847kPnoCThxt0or40avhMEAwX1yo5P_nfJI155Pj3QG5Vss61Nl1EsAxgarie7gXo-3gYgGfwTp2hgFOLc4BTOhmkPwcW-8-FyHXoE-ToS8Eg8SMwdZFujnvsh4RGtRBq2T8xfdlyaIfnf76crXURinUc5ISmyrw8D8AArb82UaUn56YOOXBThfqDQe_NRPHoc4oC-ygroyYQbfrYoVA9XkgjfKi7dy8jj41wk=s1024-rj', 22),
        ('Relógio de Bolso Suíço de 1890', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHB6uMnDOZZFYxb0x1mMGH1RKa-jpqF0T3QFWNWoqNOEQ9hiRkSdlRp8SxlUcg95UiSfgjH4gRzzFPCTx5ECD5mEc6Fs1ccdV2BgH7H0NUri1sYej-9WVZZqd8eAgKeRXQqMb9mFxKptYSE2ZbqOxUZ1vedbrfswXiOw0jnwznVfUsF=s1024-rj', 23),
        ('Câmera Fotográfica de 1912', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbE0yPgFZ2fRI4sZ1_hm-4zn3gC18KZ3gKg7yluwPeLkuUK11Rd3cmDY9PHes2oNRG_TLHpZYpDTVuRuDU3m3tkLafTpGIqrRG27uKjlLw9omuQgFHtl5SIWbqH9FnJnEJG6o8rx01fObt-cchoQoJbQfy0zYjG-pm8bOTZV3QOSuedlUQ=s1024-rj', 24),
        ('Baú Europeu do Século XIX', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFq2HTllHAXwVl4jy-JeQ4fSJVtOEd41dNILx78EP1n0p-Gub-TcYklg7Fec7w-OM2rp2cbMXpMIPKh2LYDXgbc7ghF4cDGZx4vuSAYHN_65DIzXkXwhQ7F0nyBYqhq7mbxwHu39jJSxoolbJIbdHtnXQuf3BZ2msGdPlRKxBXwzlWMQA=s1024-rj', 25),
        ('Skin Digital de Evento Especial', 'https://lh3.googleusercontent.com/gg/ACRwjauzUzHpAGkaSYpOShd8M2hob_JO9pzMQldNWG9aq978lMvPozAG9u1p2Fq73s2iM2w0Cvs1b1ys7QiEoIkxrmL1SuKRZhxL-5nmP1OIcDqWDqUBk4iy84-B3YpUq-_220WHL_8mGYg5EQgvZT0m4BWyuWyKAcbRKnbImyQIGtyXndLOs3WmPoFS2-ROkgBPpkUBlnhfWCrm83TMa_zWZ4ZfoNEgoZ0HwOyNLAVvNBdWO6wHGKZLF2nCb4dSA7EQlJUFNsCWgCD_7eb0wa0iePN9qBY7FJLgiCtiHKMA1XhP7ZZ2R8P6phslqt_EcLYX_sK9gdtcRoVfZO9XttvKQuN7=s1024-rj', 26),
        ('Console de Desenvolvimento - Unidade de Pré-Produção', 'https://lh3.googleusercontent.com/gg/ACRwjauSWZ7_LDGxNqmDusqtrJULtfBPgQ589bO2sUJu3to_4qL-Bf521y0RjloBhqvh16IGeq2XbcR96IAjBQx_uUu5gQOpEIjXgZ0Eh5PVInTuGW6zcVi7u6ACT4bjw_ebjZmW6lIEt_QgiqVHuBUYYD5RJkxlNzS-sQ1JJ3gfZztAIaDjyCYcnpyeFrxpdufYlMe0AX_AW3u1oX2DVflgXikFurzOhTn2UA9zFq5xTq-CWmYuXk_mnnSMIEyu3otkZRzrpmuVS8ffMpoCO1Vo49I7cWEF80ClhO_9RHPGFiV9R2sqfsVTGokAJHhPjkLMRIlyX6_fGlVJDjNrRU5MoGw=s1024-rj', 27),
        ('Protótipo de Controle de Videogame', 'https://lh3.googleusercontent.com/gg/ACRwjassCv_1xIDuur_BQ_uKmyY83FtQrMDZDp0QkZveQriXoVb1oHrA_XKZY1qDoz0MwUpDCaA1JDG6BPSvTW6LSYoWugva9pL8wTXbDGs5E6ruqzWMZxK2pwEQoTP_nLspaOQcTB-7C7LKQfdfie7ZeE-ZfeiMnp0sEV-CXk7O1LVv_Tjns5ODi9SlVPfAWbU2WpPLf-PeHDOJlxoapM2AS2u9w9Cg84H5NaJx2flSfLe2NCgCJUBcPwdPGP2fV0DXmRP-DDZNfz-goqr761oVVH6ILzYrmW5WGLaDHKcFZBvcjNWS0mC_p4J3KKOQ77jsvI8S_wZ_wE6_bQdv0o23blTY=s1024-rj', 28),
        ('Relógio Astronômico de Mesa Europeu do Século XVIII', 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbwClBgQKHKsgHcvlZgb8NsZohgupysOOCPY_GQpL1WstPHu23AvQqD4Dv4Ls8hzxxEp-SBag2I61Tcp7QdlI25drS_kyGkG2SiLVaTO6sGieizmEHpn92ArBl4uikQj7DXZw8yzHugOgNjieenbHSMDasY7EI3VzifoCSM4a3VnwNZOc_tN_TMnS-j2bmv90qdW1WjXDjsp7PwWH8qthRvmwzNdZjvHTvw4zjSIGHHBJ9vlZGZM_i939TqXejkYu5lVYQLwuO0aPIL38XyCjElJrBYxU8Z8=s1024-rj', 29),
        ('Secrétaire Francesa de Madeira e Marchetaria de 1780', 'https://lh3.googleusercontent.com/gg/ACRwjavp5y48QT0xIlEzm6Fjqor2w_i-VgmBd1MujEcqV6UxPDpDxapCdKZiRkRO-O4BJxXeQzxI-NLanXEBza3c0C9Lhk5c3tjZv1pvMpREVrq0rcm_BHovVfL-mS_C9Q06fZVauvptZnrD9CKGKBC2GKD30Bq81T3BRmAt7gFh9Y4yqpTAS1IP5sg5hi7yok6FeaF_gcZm9dVTdL_QUfYMLaX3pc0XnedZmIoqjVN37MTF0ifB6WgR_F4weupnfs76K8lj_69hzLNBBgqoU43Qo_jq1v-FovZhlwPHp2kIXfbAsXjGLh6zP6EebuSYmmqTKNl90AnYdBrcT-JQX_srql4=s1024-rj', 30),
        ('Astrolábio Náutico Português do Século XVII', 'https://lh3.googleusercontent.com/gg/ACRwjasyfkFNmMcbktypdCLb81NXTyCn07PbJ2qs667M_GcyIfKtLiA528Whsy-CaBfjQ1vxAuinXwOXtur0oh_1CRfV71b9tqAdimqSJzdrBvd39P4A1eNeztc1LFbH-2u34E0SI_6G1IW6CLljoMtad_YAzGGZFEzPZMVbiGtbj5m64tfkINcecTXRTkDCPE4fWRLYRylj62P_1e1ACZKiJGFCRRA0NHB0qs6WalNUeYBwRSN7V9LFQiThsU5qMtU5KIK9pLcSCsX7-ZcNNz1gvh0P2fkcEjZkpL8hT4iYftRnGjVzlkgr5F1h9wIi8QMg3POzqDzifDVhNpJmi64MH0H9=s1024-rj', 31),
        ('Máscara Cerimonial Africana do Século XIX', 'https://lh3.googleusercontent.com/gg/ACRwjasNPgIw2Qqw1gLhJtW_1gfPLK4t9aD77dceqRTx8brusTECzq24VWfQoG3yifjw-fYz3knff-51Z2mErzdbxNVFGolKouhoPfUAqGkm7fDoLizIk5SiJaamh1UoZLlNS6VJ9ADxa4_ISu7qqfcZI-DiVhzvEgu8bdAjecGKJbgNHwhzVk0AsuRs05AhXnP8-HfP_8mPM3Rqc9ZfAuseCLZN3BqaKPDvFh2GdAEHLPumiNwqYHfTrR-YyqfvQ0qWTet7uFxtoI5ggu1I41B6WvWLer6d-EiH4__K1sNTtIFPA5N2egYPUn8mdvO1bQWkPiz9DlcfHQLjuTegCe4-9j3K=s1024-rj', 32),
        ('Página de Manuscrito Iluminado Europeu do Século XV', 'https://lh3.googleusercontent.com/gg/ACRwjavFMon4SKud9vKRp4gQcxSdu1KjgNp-UMj-XqTe6GOYuijqEFotAKdWZ8YDPBuCA4yfRI8GdotrC9pbgscib1LBhZ82I0pN2o-DLcBkkmWJ7dazXDNytM6wv6UDIBGTxX7yerVP69DRs1XPHbEpAA6BNz7wg83zGhibU0o52jUBf5Za0Cgjjejj0h9oloF-d-dgIMqti0NfpSFH_PqfT43hOx29YB2H3iorws9155a-BT5iKo2LmDzlEb1YsfnG9Xc8_jkgvzu_MI4EG2Ci9WEZXZQA5POuTOfFjyKaxQAjadpZLuKlP1TqIK1WZ-B7LLezwQdp4z1hFiz3eQc2oxIh=s1024-rj', 33),
        ('Espada Cerimonial Europeia do Século XVIII', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFZSbmIqGPC-CkVChfYni37Rv0wnVUfTSVeUnZa7vMO0r3pX22ljx8X3Bf-hD3XQNwlNZCLRc1QW4vOs5g4Nl6H3CIBL1tZynTR9M7E4cfGN67PempJeBK4qwLo52DkVSGkrsUG57XyPyU7YyC_4iuKPVNyVJh7f2_T9lq-qzKhzR2pOg=s1024-rj', 34),
        ('Painel de Vitral Art Nouveau Original de 1905', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHh4WpwC3vZPVm1WsBfDlhJY9QFmy-SUb7aBf_8CLzIRJaGPlkZm9tUDxZvlwnZK9jq-paVpofnHAq3cSXJPztDoCxF7GBxP51qv8TFCS6PQ2xjQpM1-XoyymfGYiQ6x6EEw57CaqHKG1Rm1_M5FWT3twIYnITt8eh9agRXUwPhmCgzgw=s1024-rj', 35),
        ('Máquina de Escrever Experimental de 1900', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbG_kadAVMXjFeAM_LioNBlv6XZ3CRoqKMH8eoDEuiSfKPF7GPFvDL1YEOZil4o47kU1xg4jyfZm_9NNvXsSxoUcaSrToLlxBLyPU2x_mYBtlwmo0ETeCyH-n6Ja8tUSlaoEml5Ggat3V2NrIq6_5r-a_lbYP4XvhMnrpmHJXKRiINT7xA=s1024-rj', 36),
        ('Ovo Decorativo Russo de Luxo do Início do Século XX', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFxyFU5WabYSDBCPpw65WNp3uZ-4swKN3xFgkKlKH-7z9acDrwCrBEtXIjxPw5cvr9ljinp8l4dksIwZJW9tGXcTuthl0QpUPMEPbB8llBU4mQiUaGqLerxlm9sCAOrdWT0ypVUGbkLeJ9DKQU_C_vaPAEFMAynZEvCCTgF_C1gYHQbHg=s1024-rj', 37),
        ('Caixa de Música Mecânica Suíça do Século XIX', 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHVXPTKctD4loMcZDyVgNi7HG_Yz4APzRJBBsaWiLS89igF7DrszAaNH6aMrSd0in6QR9n5FMNaVyAmPbtcZ5Y82BkfgrkojK3XcFWiALuFA0KEoQrE3jsK97cRDUUZQq1_-sUTxxzpm1DVUvscmpBcfMyy0Fkkb47OioLNJgVDqhVMcA=s1024-rj', 38)
)
INSERT INTO produto_imagem (id_produto, url, ordem)
SELECT pr.id, d.url, d.ordem
FROM dados d
JOIN produto pr ON pr.nome = d.nome
WHERE NOT EXISTS (
    SELECT 1
    FROM produto_imagem pi
    WHERE pi.id_produto = pr.id
      AND pi.url = d.url
);

-- ============================================================================
-- 5. LEILÕES DE DEMONSTRAÇÃO
-- ============================================================================

INSERT INTO leilao (
    id_produto,
    data_inicio,
    data_fim,
    status,
    tipo_compra
)
SELECT
    p.id,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '8 days',
    'AGUARDANDO'::leilao_status,
    'LEILAO'::tipo_compra
FROM produto p
WHERE p.nome IN (
    'The Legend of Zelda - Edição Original Lacrada',
    'Super Mario Bros. - Primeira Tiragem',
    'Pokémon Red - Edição Lacrada',
    'Chrono Trigger - Edição Original',
    'Charizard Base Set 1st Edition',
    'Pikachu - Edição Promocional Numerada',
    'Blue-Eyes White Dragon - Primeira Edição',
    'Mewtwo Holográfico - Primeira Coleção',
    'Camisa Oficial de Final Histórica',
    'Bola Oficial de Final Autografada',
    'Raquete Utilizada em Torneio Internacional',
    'Darth Vader - Protótipo de Produção',
    'Batman - Edição Limitada de Convenção',
    'Superman - Edição Comemorativa Limitada',
    'Porsche 911 Carrera RS 1973',
    'Volkswagen Kombi 1967 Restaurada',
    'Ferrari 250 GT - Exemplar Histórico',
    'Apartamento Histórico no Centro de São Paulo',
    'Casa Modernista Preservada',
    'Apple Macintosh 128K - Primeiro Modelo',
    'iPhone Original 2007 - Caixa Lacrada',
    'Sony Walkman - Primeira Geração',
    'Relógio de Bolso Suíço de 1890',
    'Câmera Fotográfica de 1912',
    'Baú Europeu do Século XIX',
    'Skin Digital de Evento Especial',
    'Console de Desenvolvimento - Unidade de Pré-Produção',
    'Protótipo de Controle de Videogame',
    'Relógio Astronômico de Mesa Europeu do Século XVIII',
    'Secrétaire Francesa de Madeira e Marchetaria de 1780',
    'Astrolábio Náutico Português do Século XVII',
    'Máscara Cerimonial Africana do Século XIX',
    'Página de Manuscrito Iluminado Europeu do Século XV',
    'Espada Cerimonial Europeia do Século XVIII',
    'Painel de Vitral Art Nouveau Original de 1905',
    'Máquina de Escrever Experimental de 1900',
    'Ovo Decorativo Russo de Luxo do Início do Século XX',
    'Caixa de Música Mecânica Suíça do Século XIX'
)
AND NOT EXISTS (
    SELECT 1 FROM leilao l WHERE l.id_produto = p.id
);

-- Os produtos que receberam leilão passam para EM_LEILAO.
UPDATE produto p
SET status = 'EM_LEILAO'::produto_status
WHERE EXISTS (
    SELECT 1 FROM leilao l WHERE l.id_produto = p.id
);

COMMIT;

-- ============================================================================
-- 6. CONSULTAS DE CONFERÊNCIA
-- ============================================================================

-- Quantidade de produtos:
-- SELECT COUNT(*) AS total_produtos FROM produto;

-- Quantidade de imagens:
-- SELECT COUNT(*) AS total_imagens FROM produto_imagem;

-- Quantidade de leilões:
-- SELECT COUNT(*) AS total_leiloes FROM leilao;

-- Conferência produto + imagem:
-- SELECT p.id, p.nome, pi.url
-- FROM produto p
-- LEFT JOIN produto_imagem pi ON pi.id_produto = p.id
-- ORDER BY p.id;

-- Conferência completa:
-- SELECT p.id, p.nome, c.nome AS categoria, p.status,
--        p.lance_minimo, pi.url
-- FROM produto p
-- JOIN categoria c ON c.id = p.id_categoria
-- LEFT JOIN produto_imagem pi ON pi.id_produto = p.id
-- ORDER BY p.id;