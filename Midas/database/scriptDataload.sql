
-- ==============================================================================
-- SISTEMA DE LEILÕES MIDAS - SCRIPT DE CARGA DE DADOS (DATALOAD)
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. DOMÍNIOS
-- ------------------------------------------------------------------------------

INSERT INTO categoria (id, nome) VALUES
(1, 'Games & Consoles'),
(2, 'Cards & Colecionáveis'),
(3, 'Memorabilia Esportiva'),
(4, 'Action Figures & Brinquedos'),
(5, 'Automóveis de Coleção'),
(6, 'Imóveis Históricos'),
(7, 'Tecnologia Vintage'),
(8, 'Antiguidades & Arte');

INSERT INTO estado_fisico (id, nome, descricao) VALUES
(1, 'Lacrado / Novo', 'Item nunca aberto, em sua embalagem original de fábrica.'),
(2, 'Excelente (Grade A)', 'Item usado com pouquíssimas marcas de uso, impecável.'),
(3, 'Bom (Grade B)', 'Item funcionando perfeitamente, com leves sinais de desgaste.'),
(4, 'Restaurado', 'Item antigo que passou por processo profissional de restauração.');

INSERT INTO raridade (id, nome) VALUES
(1, 'Comum'),
(2, 'Raro'),
(3, 'Muito Raro'),
(4, 'Ultra Raro / Único');

INSERT INTO identidade_visual (id, cor_primaria, cor_secundaria, descricao_paleta, formato, descricao_formato) VALUES
(1, '#FFD700', '#000000', 'Dourado Clássico e Preto Midas', 'Retangular', 'Proporção padrão para itens vintage'),
(2, '#E60012', '#FFFFFF', 'Vermelho Retro e Branco', 'Quadrado', 'Estilo caixas clássicas de games'),
(3, '#0055A5', '#FFCC00', 'Azul Real e Amarelo Mágico', 'Vertical', 'Formato moldurado estilo Card');

-- Ajusta a sequência dos IDs das tabelas de domínio
SELECT setval('categoria_id_seq', (SELECT MAX(id) FROM categoria));
SELECT setval('estado_fisico_id_seq', (SELECT MAX(id) FROM estado_fisico));
SELECT setval('raridade_id_seq', (SELECT MAX(id) FROM raridade));
SELECT setval('identidade_visual_id_seq', (SELECT MAX(id) FROM identidade_visual));


-- ------------------------------------------------------------------------------
-- 2. USUÁRIOS E TELEFONES
-- ------------------------------------------------------------------------------

INSERT INTO usuario (id, nome, username, email, senha_hash) VALUES
(1, 'Administrador Midas', 'admin', 'admin@midasauctions.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.s88R3K2V3c84Y93Xf5K7g71/aP9m.'),
(2, 'Carlos Eduardo', 'carlos_colector', 'carlos@email.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.s88R3K2V3c84Y93Xf5K7g71/aP9m.'),
(3, 'Ana Beatriz', 'ana_retro', 'ana@email.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.s88R3K2V3c84Y93Xf5K7g71/aP9m.'),
(4, 'Lucas Mendes', 'lucas_leiloes', 'lucas@email.com', '$2a$12$eImiTXuWVxfM37uY4JANjOL.s88R3K2V3c84Y93Xf5K7g71/aP9m.');

-- Usando o enum 'tipo_telefone' ('COMERCIAL', 'CELULAR', 'RESIDENCIAL')
INSERT INTO telefone (id_usuario, telefone) VALUES
(1, '+55 11 99999-0000'),
(2, '+55 11 98888-1111'),
(3, '+55 21 97777-2222'),
(4, '+55 31 96666-3333');

SELECT setval('usuario_id_seq', (SELECT MAX(id) FROM usuario));
SELECT setval('telefone_id_seq', (SELECT MAX(id) FROM telefone));

-- Precisa atualizar o código para subir, pq esta diferente do script que esta no git hub.

-- ------------------------------------------------------------------------------
-- 3. PRODUTOS E IMAGENS
-- ------------------------------------------------------------------------------

INSERT INTO produto (id, id_usuario, id_categoria, id_estado_fisico, id_raridade, id_identidade_visual, nome, ano_fabricacao, ano_lancamento, lance_minimo, resumo_descricao, marca, peso, status) VALUES
(1, 2, 1, 1, 4, 2, 'The Legend of Zelda - Edição Original Lacrada', 1986, 1986, 15000.00, 'Cartucho lacrado de fábrica em estado de conservação impecável.', 'Nintendo', 0.450, 'EM_LEILAO'),
(2, 2, 1, 1, 4, 2, 'Super Mario Bros. - Primeira Tiragem', 1985, 1985, 20000.00, 'Cópia selada da primeira tiragem do icônico jogo de NES.', 'Nintendo', 0.420, 'EM_LEILAO'),
(3, 2, 1, 1, 3, 2, 'Pokémon Red - Edição Lacrada', 1996, 1996, 8000.00, 'Edição clássica de Game Boy totalmente selada.', 'Nintendo', 0.200, 'EM_LEILAO'),
(4, 2, 1, 2, 3, 1, 'Chrono Trigger - Edição Original', 1995, 1995, 3500.00, 'Jogo completo na caixa com mapas e manuais originais.', 'Square', 0.350, 'EM_LEILAO'),
(5, 3, 2, 2, 4, 3, 'Charizard Base Set 1st Edition', 1999, 1999, 25000.00, 'Carta holográfica PSA 9 Mint de 1ª edição.', 'Wizards of the Coast', 0.050, 'EM_LEILAO'),
(6, 3, 2, 1, 3, 3, 'Pikachu - Edição Promocional Numerada', 1998, 1998, 4500.00, 'Carta comemorativa em perfeito estado de conservação.', 'Wizards of the Coast', 0.050, 'EM_LEILAO'),
(7, 3, 2, 2, 4, 3, 'Blue-Eyes White Dragon - Primeira Edição', 2002, 2002, 12000.00, 'Carta clássica de Yu-Gi-Oh! 1st Edition em estado excelente.', 'Konami', 0.050, 'EM_LEILAO'),
(8, 3, 2, 2, 3, 3, 'Mewtwo Holográfico - Primeira Coleção', 1999, 1999, 3000.00, 'Carta holográfica clássica avaliada com grade alta.', 'Wizards of the Coast', 0.050, 'EM_LEILAO'),
(9, 4, 3, 2, 3, 1, 'Camisa Oficial de Final Histórica', 1970, 1970, 18000.00, 'Camisa usada em partida decisiva com certificado de autenticidade.', 'Athleta', 0.300, 'EM_LEILAO'),
(10, 4, 3, 2, 4, 1, 'Bola Oficial de Final Autografada', 2002, 2002, 9000.00, 'Bola autografada por todo o elenco campeão mundial.', 'Adidas', 0.450, 'EM_LEILAO'),
(11, 4, 3, 2, 3, 1, 'Raquete Utilizada em Torneio Internacional', 2008, 2008, 5500.00, 'Raquete de tênis usada pelo campeão na final de Grand Slam.', 'Wilson', 0.340, 'EM_LEILAO'),
(12, 2, 4, 2, 4, 1, 'Darth Vader - Protótipo de Produção', 1977, 1977, 14000.00, 'Figura de ação protótipo extremamente rara da Kenner.', 'Kenner', 0.150, 'EM_LEILAO'),
(13, 2, 4, 1, 3, 1, 'Batman - Edição Limitada de Convenção', 1989, 1989, 2200.00, 'Edição exclusiva para colecionadores distribuída em evento.', 'Kenner', 0.250, 'EM_LEILAO'),
(14, 2, 4, 1, 3, 1, 'Superman - Edição Comemorativa Limitada', 1992, 1992, 2800.00, 'Item de colecionador lacrado na caixa original.', 'Hasbro', 0.300, 'EM_LEILAO'),
(15, 3, 5, 4, 4, 1, 'Porsche 911 Carrera RS 1973', 1973, 1973, 450000.00, 'Veículo clássico totalmente restaurado dentro dos padrões originais.', 'Porsche', 975.000, 'EM_LEILAO'),
(16, 3, 5, 4, 3, 1, 'Volkswagen Kombi 1967 Restaurada', 1967, 1967, 85000.00, 'Kombi Corujinha de 23 janelas impecável.', 'Volkswagen', 1100.000, 'EM_LEILAO'),
(17, 3, 5, 4, 4, 1, 'Ferrari 250 GT - Exemplar Histórico', 1962, 1962, 1200000.00, 'Um dos poucos exemplares mantidos em estado de concurso.', 'Ferrari', 1100.000, 'EM_LEILAO'),
(18, 4, 6, 2, 4, 1, 'Apartamento Histórico no Centro de São Paulo', 1940, 1940, 950000.00, 'Imóvel amplo com arquitetura neoclássica preservada.', 'Construção Histórica', 0.000, 'EM_LEILAO'),
(19, 4, 6, 2, 3, 1, 'Casa Modernista Preservada', 1958, 1958, 1800000.00, 'Projeto assinado por grande nome da arquitetura nacional.', 'Arquitetura autoral', 0.000, 'EM_LEILAO'),
(20, 2, 7, 2, 3, 1, 'Apple Macintosh 128K - Primeiro Modelo', 1984, 1984, 11000.00, 'Computador completo e funcionando, com caixa original.', 'Apple', 7.500, 'EM_LEILAO'),
(21, 2, 7, 1, 4, 1, 'iPhone Original 2007 - Caixa Lacrada', 2007, 2007, 35000.00, 'Primeira geração do iPhone totalmente lacrada em plástico original.', 'Apple', 0.135, 'EM_LEILAO'),
(22, 2, 7, 2, 2, 1, 'Sony Walkman - Primeira Geração', 1979, 1979, 4200.00, 'Toca-fitas portátil TPS-L2 em pleno funcionamento.', 'Sony', 0.390, 'EM_LEILAO'),
(23, 4, 8, 3, 3, 1, 'Relógio de Bolso Suíço de 1890', 1890, 1890, 6800.00, 'Caixa em ouro 18k com maquinário mecânico funcional.', 'Marca Suíça', 0.120, 'EM_LEILAO'),
(24, 4, 8, 3, 2, 1, 'Câmera Fotográfica de 1912', 1912, 1912, 3100.00, 'Câmera de fole artesanal para colecionadores de fotografia.', 'Eastman Kodak', 1.200, 'EM_LEILAO'),
(25, 4, 8, 3, 2, 1, 'Baú Europeu do Século XIX', 1880, 1880, 5200.00, 'Baú de viagem com detalhes em couro e metal trabalhado.', 'Artesanal', 15.000, 'EM_LEILAO'),
(26, 2, 1, 1, 2, 1, 'Skin Digital de Evento Especial', 2018, 2018, 1200.00, 'Código não resgatado para skin cosmética rara de jogo online.', 'Desenvolvedora Game', 0.000, 'EM_LEILAO'),
(27, 2, 1, 2, 4, 1, 'Console de Desenvolvimento - Unidade de Pré-Produção', 2000, 2000, 16000.00, 'Kit de desenvolvimento enviado a estúdios de jogos.', 'Hardware Dev', 3.800, 'EM_LEILAO'),
(28, 2, 1, 2, 3, 1, 'Protótipo de Controle de Videogame', 1994, 1994, 3900.00, 'Controle conceitual de testes de pré-lançamento.', 'Hardware Dev', 0.300, 'EM_LEILAO'),
(29, 4, 8, 2, 4, 1, 'Relógio Astronômico de Mesa Europeu do Século XVIII', 1785, 1785, 48000.00, 'Mecanismo complexo em latão que indica fases da lua e constelações.', 'Relojoaria Europeia', 4.500, 'EM_LEILAO'),
(30, 4, 8, 4, 3, 1, 'Secrétaire Francesa de Madeira e Marchetaria de 1780', 1780, 1780, 29000.00, 'Móvel clássico com segredos ocultos e acabamento refinado.', 'Marcenaria Francesa', 32.000, 'EM_LEILAO'),
(31, 4, 8, 3, 4, 1, 'Astrolábio Náutico Português do Século XVII', 1650, 1650, 75000.00, 'Instrumento de navegação náutica em bronze maciço.', 'Navegação Histórica', 2.100, 'EM_LEILAO'),
(32, 4, 8, 2, 3, 1, 'Máscara Cerimonial Africana do Século XIX', 1890, 1890, 13500.00, 'Peça de arte em madeira entalhada com pigmentos naturais.', 'Arte Tribal', 1.800, 'EM_LEILAO'),
(33, 4, 8, 3, 4, 1, 'Página de Manuscrito Iluminado Europeu do Século XV', 1450, 1450, 21000.00, 'Folha em pergaminho com gravuras e letras capitais folheadas a ouro.', 'Monastério Europeu', 0.080, 'EM_LEILAO'),
(34, 4, 8, 2, 3, 1, 'Espada Cerimonial Europeia do Século XVIII', 1750, 1750, 19500.00, 'Lâmina em aço trabalhado com empunhadura ornamentada.', 'Armaria Real', 1.600, 'EM_LEILAO'),
(35, 4, 8, 2, 3, 1, 'Painel de Vitral Art Nouveau Original de 1905', 1905, 1905, 15800.00, 'Painel decorativo em vidro colorido e chumbo.', 'Ateliê Art Nouveau', 8.200, 'EM_LEILAO'),
(36, 2, 7, 3, 2, 1, 'Máquina de Escrever Experimental de 1900', 1900, 1900, 4700.00, 'Modelo mecânico precursor do padrão comercial moderno.', 'Mecânica Antiga', 9.500, 'EM_LEILAO'),
(37, 4, 8, 2, 4, 1, 'Ovo Decorativo Russo de Luxo do Início do Século XX', 1910, 1910, 62000.00, 'Peça em esmalte e gemas preciosas inspirada na joalheria imperial.', 'Joalheria Imperial', 0.650, 'EM_LEILAO'),
(38, 4, 8, 2, 3, 1, 'Caixa de Música Mecânica Suíça do Século XIX', 1875, 1875, 12500.00, 'Caixa em madeira de lei com cilindro de metal executando 8 melodias.', 'Relojoaria Suíça', 6.000, 'EM_LEILAO');

-- Mapeamento das imagens com as URLs exigidas
INSERT INTO produto_imagem (id_produto, url, ordem) VALUES
(1, 'https://lh3.googleusercontent.com/gg/ACRwjasQqE2ZMAQbtEIKm8jiRqIR2UOO6n5OZ7N_TQRCfIe9qEqQu0Ind47RUA…', 0),
(2, 'https://lh3.googleusercontent.com/gg/ACRwjav4Akvd9AGg7yl7tw1NfadRk1fA2XCUf91cGhrpzCoIseMUBkJyruwkB6…', 0),
(3, 'https://lh3.googleusercontent.com/gg/ACRwjaszZURkBTaPxS59drfVW64MFxz1rV8VlfoTr7hcuMS1GKaLjVbaMbw6QT…', 0),
(4, 'https://lh3.googleusercontent.com/gg/ACRwjavcELXTnTcLfWRYWiGFBSXpyswbpXbDrSV4ZtC4OibSotfm4yFbN0sEw-…', 0),
(5, 'https://lh3.googleusercontent.com/gg/ACRwjavuKruNDGGEG5-a4jfeitnU7dIOUnNUiDo1akNWlqgr8ItW0NQP7LcIip…', 0),
(6, 'https://lh3.googleusercontent.com/gg/ACRwjaseU2rJiKNPkEr3QM0QCAcifvHpne2boouWbi8_PQKaHhb8wa4paz91G1…', 0),
(7, 'https://lh3.googleusercontent.com/gg/ACRwjau0ssMCH5jqzQY19dHFzwp8VbYTp3KVUnCpkTT4BwVmZ0ENjFprevSL2x…', 0),
(8, 'https://lh3.googleusercontent.com/gg/ACRwjavL41-79oCtNSG-6p46XFADSmg6lx3LWOUOLEuQJ1ldUy8Uo7-ZxGlICo…', 0),
(9, 'https://lh3.googleusercontent.com/gg/ACRwjasOOCxosoRt7PjPF-6bSqUbYUzzRRENMqYWw2U6z7uKpwFpAFfpsScwSW…', 0),
(10, 'https://lh3.googleusercontent.com/gg/ACRwjascEEylj_LaYl8unQbGC9zz1PgxTfw1GeOfMVSl46hjYhlFninJRjWjXI…', 0),
(11, 'https://lh3.googleusercontent.com/gg/ACRwjauO97sWKv0rm3svYcVsiPiXR9FktIenH9NxLwJDC8deoqat4shIFyKfU_…', 0),
(12, 'https://lh3.googleusercontent.com/gg/ACRwjau7IMaQ3KfwJtLAVysvpJb4FLqN1d8jWQYNUxLvIGG1B0S00XxqeGZanV…', 0),
(13, 'https://lh3.googleusercontent.com/gg/ACRwjattw_D_5wKk3GktYLXl3EIMF7E6r2Pldu1lrBtkQcrtX4fonRvkwLfcKc…', 0),
(14, 'https://lh3.googleusercontent.com/gg/ACRwjau3_pAdG0H2risKfmy93rNVtxviYdAOuV3FqFozRY4zNEkaIvLcc0k5Yk…', 0),
(15, 'https://lh3.googleusercontent.com/gg/ACRwjasBdQyGoCC0uG6fqBLN7hH_9x1H3GQNCnusKOd70QK1fuMNEDTG8FGBoD…', 0),
(16, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHgjG8RpkRJY4SgKC-D5CfMQ38zMf70OFXQHUH93dD6pTrtDQ9SeEx…', 0),
(17, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbEmNOuh9X5q6ubxlAbN52tgtsZN-WpvvIuOslNYRd2hQChwXzrBiip…', 0),
(18, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFfZvnPPgL9QeADl9vkI5sjiJOoEU7nnpM-5-LxtmrRZk6XzlB1eVK…', 0),
(19, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbF3jQnNtkZxCvLQnBAcXJkV2rHzCCRVh6zQKTdKE6hX9PWI9yVNaad…', 0),
(20, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbGNsp6QkRpbDfD4NJJy-Z8IvyL1hNAfDVH7_8m1CmuROpp324uCDlj…', 0),
(21, 'https://lh3.googleusercontent.com/gg/ACRwjas3nuZu7jTiHlUEnqLfKHtEB8nYj_8MnTVUUr65ERtgBEHqv9FfYhUcmH…', 0),
(22, 'https://lh3.googleusercontent.com/gg/ACRwjauUtOgByXWp29Vm3rEdkl9s_tzafZnENF3bMKbcRshCfxHTat1wBzN0_H…', 0),
(23, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHB6uMnDOZZFYxb0x1mMGH1RKa-jpqF0T3QFWNWoqNOEQ9hiRkSdlR…', 0),
(24, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbE0yPgFZ2fRI4sZ1_hm-4zn3gC18KZ3gKg7yluwPeLkuUK11Rd3cmD…', 0),
(25, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFq2HTllHAXwVl4jy-JeQ4fSJVtOEd41dNILx78EP1n0p-Gub-TcYk…', 0),
(26, 'https://lh3.googleusercontent.com/gg/ACRwjauzUzHpAGkaSYpOShd8M2hob_JO9pzMQldNWG9aq978lMvPozAG9u1p2F…', 0),
(27, 'https://lh3.googleusercontent.com/gg/ACRwjauSWZ7_LDGxNqmDusqtrJULtfBPgQ589bO2sUJu3to_4qL-Bf521y0Rjl…', 0),
(28, 'https://lh3.googleusercontent.com/gg/ACRwjassCv_1xIDuur_BQ_uKmyY83FtQrMDZDp0QkZveQriXoVb1oHrA_XKZY1…', 0),
(29, 'https://lh3.googleusercontent.com/gg/ACRwjas9_iS7_cYSf-r7KH-sG8mJse62d2zMTwGSv7N27ql83y936jbRc2ncbw…', 0),
(30, 'https://lh3.googleusercontent.com/gg/ACRwjavp5y48QT0xIlEzm6Fjqor2w_i-VgmBd1MujEcqV6UxPDpDxapCdKZiRk…', 0),
(31, 'https://lh3.googleusercontent.com/gg/ACRwjasyfkFNmMcbktypdCLb81NXTyCn07PbJ2qs667M_GcyIfKtLiA528Whsy…', 0),
(32, 'https://lh3.googleusercontent.com/gg/ACRwjasNPgIw2Qqw1gLhJtW_1gfPLK4t9aD77dceqRTx8brusTECzq24VWfQoG…', 0),
(33, 'https://lh3.googleusercontent.com/gg/ACRwjavFMon4SKud9vKRp4gQcxSdu1KjgNp-UMj-XqTe6GOYuijqEFotAKdWZ8…', 0),
(34, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFZSbmIqGPC-CkVChfYni37Rv0wnVUfTSVeUnZa7vMO0r3pX22ljx8…', 0),
(35, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHh4WpwC3vZPVm1WsBfDlhJY9QFmy-SUb7aBf_8CLzIRJaGPlkZm9t…', 0),
(36, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbG_kadAVMXjFeAM_LioNBlv6XZ3CRoqKMH8eoDEuiSfKPF7GPFvDL1…', 0),
(37, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbFxyFU5WabYSDBCPpw65WNp3uZ-4swKN3xFgkKlKH-7z9acDrwCrBE…', 0),
(38, 'https://lh3.googleusercontent.com/gg-dl/AAQ_wbHVXPTKctD4loMcZDyVgNi7HG_Yz4APzRJBBsaWiLS89igF7DrszAa…', 0);

SELECT setval('produto_id_seq', (SELECT MAX(id) FROM produto));
SELECT setval('produto_imagem_id_seq', (SELECT MAX(id) FROM produto_imagem));


-- ------------------------------------------------------------------------------
-- 4. LEILÕES
-- ------------------------------------------------------------------------------

INSERT INTO leilao (id, id_produto, data_inicio, data_fim, status, tipo_compra, valor_compra_imediata) VALUES
(1, 1, NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 'ATIVO', 'LEILAO', 25000.00),
(2, 2, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'ATIVO', 'LEILAO', 35000.00),
(3, 3, NOW() - INTERVAL '1 day', NOW() + INTERVAL '4 days', 'ATIVO', 'LEILAO', 12000.00),
(4, 5, NOW() - INTERVAL '3 days', NOW() + INTERVAL '3 days', 'ATIVO', 'LEILAO', 40000.00),
(5, 15, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days', 'ATIVO', 'LEILAO', 600000.00),
(6, 21, NOW() - INTERVAL '12 hours', NOW() + INTERVAL '7 days', 'ATIVO', 'COMPRA_IMEDIATA', 45000.00);

SELECT setval('leilao_id_seq', (SELECT MAX(id) FROM leilao));


-- ------------------------------------------------------------------------------
-- 5. LANCES E FAVORITOS
-- ------------------------------------------------------------------------------

INSERT INTO lance (id_leilao, id_usuario, valor, data) VALUES
(1, 3, 15500.00, NOW() - INTERVAL '20 hours'),
(1, 4, 16000.00, NOW() - INTERVAL '10 hours'),
(2, 4, 21000.00, NOW() - INTERVAL '1 day'),
(4, 2, 26000.00, NOW() - INTERVAL '2 days'),
(4, 4, 27500.00, NOW() - INTERVAL '1 day');

INSERT INTO favorito (id_usuario, id_leilao) VALUES
(3, 1),
(3, 4),
(4, 2),
(4, 5);

SELECT setval('lance_id_seq', (SELECT MAX(id) FROM lance));
SELECT setval('favorito_id_seq', (SELECT MAX(id) FROM favorito));


-- ------------------------------------------------------------------------------
-- 6. PRODUTOS DA LOJA
-- ------------------------------------------------------------------------------

INSERT INTO produto_loja (id, nome, preco, descricao) VALUES
(1, 'E-book: Guia de Colecionismo Raro', 49.90, 'Guia completo para identificação e validação de relíquias e colecionáveis.'),
(2, 'Expositor Acrílico Premium para Cards', 89.00, 'Proteção UV e selagem hermética para preservar cartas valiosas.'),
(3, 'Kit de Limpeza para Relógios Vintage', 129.90, 'Flanelas de microfibra, solventes neutros e pinças para colecionadores de ponta.');

SELECT setval('produto_loja_id_seq', (SELECT MAX(id) FROM produto_loja));


-- ------------------------------------------------------------------------------
-- 7. CARRINHO, PEDIDOS E PAGAMENTOS
-- ------------------------------------------------------------------------------

INSERT INTO carrinho (id, id_usuario, qtd_itens, total) VALUES
(1, 3, 1, 89.00),
(2, 4, 0, 0.00);

INSERT INTO carrinho_item (id_carrinho, id_produto_loja, quantidade) VALUES
(1, 2, 1);

INSERT INTO pedido (id, id_usuario, status, valor_total) VALUES
(1, 3, 'PAGO', 129.90);

INSERT INTO pedido_item (id_pedido, id_produto_loja, id_leilao, quantidade, preco_unitario, subtotal) VALUES
(1, 3, NULL, 1, 129.90, 129.90);

INSERT INTO pagamento (id_pedido, id_pagador, id_recebedor, meio_pagamento, valor_total, status, txid_pix, data_pagamento) VALUES
(1, 3, NULL, 'PIX', 129.90, 'APROVADO', 'pix_midas_transacao_9876543210', NOW() - INTERVAL '2 days');

SELECT setval('carrinho_id_seq', (SELECT MAX(id) FROM carrinho));
SELECT setval('carrinho_item_id_seq', (SELECT MAX(id) FROM carrinho_item));
SELECT setval('pedido_id_seq', (SELECT MAX(id) FROM pedido));
SELECT setval('pedido_item_id_seq', (SELECT MAX(id) FROM pedido_item));
SELECT setval('pagamento_id_seq', (SELECT MAX(id) FROM pagamento));

COMMIT;

-- ==============================================================================
-- FIM DO SCRIPT DE CARGA DE DADOS
-- ==============================================================================