# API de produtos com cache inteligente

Implementação de referência para a atividade EXA: Node.js + Express + Redis + PostgreSQL + Docker Compose.

## Requisitos

- Docker Desktop (ou Docker Engine) com Docker Compose
- Node.js 18 ou superior
- npm

## Como executar

1. Copie `.env.example` para `.env`.
2. Suba PostgreSQL e Redis:

   ```bash
   docker compose up -d
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie a API:

   ```bash
   npm start
   ```

5. Verifique `http://localhost:3000/health`.

O PostgreSQL cria a tabela e seis produtos de exemplo na primeira inicialização, distribuídos nas categorias **Eletrônicos**, **Papelaria** e **Casa**. Se já existir um volume antigo e você quiser recriar o banco de testes do zero, use `docker compose down -v` (isso apaga os dados persistidos desse ambiente).

### Dados iniciais

| id | nome             | categoria   | preco  |
|----|------------------|-------------|--------|
| 1  | Câmera externa   | Eletrônicos | 389.90 |
| 2  | Teclado mecânico | Eletrônicos | 229.50 |
| 3  | Mouse sem fio    | Eletrônicos | 89.90  |
| 4  | Caderno          | Papelaria   | 19.90  |
| 5  | Caneta azul      | Papelaria   | 4.50   |
| 6  | Garrafa térmica  | Casa        | 79.90  |

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/produtos/:id` | Busca um produto por ID |
| GET | `/produtos?categoria=Eletrônicos` | Lista produtos por categoria |
| GET | `/produtos` | Lista todos os produtos |
| PUT | `/produtos/:id` | Atualiza nome, categoria e preço |

Toda resposta dos endpoints de produtos inclui `X-Cache: HIT` ou `X-Cache: MISS`. Erros de validação e produto inexistente também informam MISS quando a consulta passou pelo service e chegou ao resultado de cache; entradas inválidas são recusadas antes da consulta.

## Testes rápidos com curl

Primeira chamada: normalmente `MISS`; a segunda chamada igual: `HIT`.

```bash
curl -i http://localhost:3000/produtos/1
curl -i http://localhost:3000/produtos/1

curl -i -G "http://localhost:3000/produtos" --data-urlencode "categoria=Eletrônicos"
curl -i -G "http://localhost:3000/produtos" --data-urlencode "categoria=Papelaria"
curl -i http://localhost:3000/produtos

curl -i -X PUT http://localhost:3000/produtos/1 \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Câmera externa atualizada","categoria":"Eletrônicos","preco":399.90}'

# Depois do PUT, o GET do produto e as listas devem voltar a MISS.
curl -i http://localhost:3000/produtos/1
```

> **Dica de encoding:** como as categorias de exemplo contêm acentos, sempre que usar `categoria` com acento na query string prefira `--data-urlencode` ou codifique manualmente (por exemplo, `Eletr%C3%B4nicos`). Sem isso, o servidor pode devolver `400 Bad Request`.

## Como observar o cache

```bash
docker compose exec redis redis-cli MONITOR
```

Para inspecionar chaves:

```bash
docker compose exec redis redis-cli KEYS '*'
```

## Organização

- `routes`: declara as rotas HTTP.
- `controllers`: valida entradas e transforma resultados em respostas HTTP.
- `services`: regra de negócio e cache-aside.
- `repositories`: consultas PostgreSQL parametrizadas.
- `config`: conexões e configuração.
- `utils/cacheKeys.js`: normalização das chaves de cache.

## Decisões e limites

- TTL de 60 segundos, configurável por `CACHE_TTL_SECONDS`.
- A categoria é normalizada com trim e minúsculas; os parâmetros usados na chave são serializados em ordem determinística. Assim, diferenças de caixa e espaços não criam outra chave. A normalização também evita chaves duplicadas por conta de acentos, desde que a entrada chegue corretamente codificada na URL.
- O `PUT` invalida o cache do produto e as listas de produtos para evitar dados desatualizados.
- Inclui validação com Zod, Helmet, CORS restritivo por padrão, limite de corpo JSON, rate limiting e mensagens de erro sem stack trace para o cliente.
- Para simplificar a atividade, a invalidação das listas usa `KEYS`. Em produção, prefira um conjunto de chaves controlado ou `SCAN`/versionamento, pois `KEYS` pode bloquear o Redis em bases grandes.
- `X-Cache` representa HIT/MISS do cache Redis; não é uma medição de latência.
- Credenciais de `.env.example` são apenas locais para teste. Não as use em produção.