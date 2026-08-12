from app.database import conectar


def buscar_produto(produto_id: int):

    conexao = conectar()

    try:
        with conexao.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    nome,
                    imagem_url
                FROM produto
                WHERE id = %s
                """,
                (produto_id,)
            )

            resultado = cursor.fetchone()

            if not resultado:
                return None

            return {
                "id": resultado[0],
                "nome": resultado[1],
                "imagem_url": resultado[2]
            }

    finally:
        conexao.close()


def buscar_identidade_visual(produto_id: int):

    conexao = conectar()

    try:
        with conexao.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    cor_primaria,
                    cor_secundaria,
                    descricao_paleta,
                    formato,
                    descricao_formato,
                    descricao_geral
                FROM identidade_visual
                WHERE produto_id = %s
                """,
                (produto_id,)
            )

            resultado = cursor.fetchone()

            if not resultado:
                return None

            return {
                "cor_primaria": resultado[0],
                "cor_secundaria": resultado[1],
                "descricao_paleta": resultado[2],
                "formato": resultado[3],
                "descricao_formato": resultado[4],
                "descricao_geral": resultado[5]
            }
    
    finally:
        conexao.close()