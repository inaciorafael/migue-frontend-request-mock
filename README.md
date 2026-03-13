# 🧉 MIGUÉ

**M.I.G.U.E — Mock Inteligente Gerador de URLs e Experiências**

O MIGUÉ é uma ferramenta inovadora para desenvolvimento frontend, permitindo que você trabalhe como se a API estivesse pronta. Ele intercepta requisições HTTP e retorna mocks definidos em JSON ou TypeScript, com suporte a hot-reload automático, templates dinâmicos usando Faker.js, funções utilitárias e contexto da requisição. Opcionalmente, faz proxy para um backend real quando não há mock correspondente, e inclui um modo resiliente para armazenar respostas.

## 🚀 Funcionalidades Principais

- **Simulação Completa de APIs**: Suporte a todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD).
- **Hot-Reload**: Atualiza mocks em tempo real sem reiniciar o servidor.
- **Templates Dinâmicos**: Gera dados dinâmicos com helpers como `faker`, `uuid`, estado global, etc.
- **Proxy Fallback**: Redireciona para backend real se necessário.
- **Modo Resiliente**: Armazena respostas para simular cache ou offline.
- **Tipagem Forte**: Usa TypeScript para definir mocks com segurança de tipos.
- **Fácil de Usar**: Não requer build; roda direto com `tsx`.

## 📦 Instalação

Este projeto usa pnpm. No diretório raiz do monorepo:

```bash
pnpm install
```

**Nota**: O MIGUÉ não precisa ser buildado. Ele roda diretamente via TypeScript com `tsx`.

## 🚀 Como Usar

### Iniciando o Servidor

Para executar o servidor de mocks:

```bash
tsx apps/cli/src/index.ts --mocks mocks/all.mock.ts --port 4321
```

### Opções da Linha de Comando

- `--mocks <path>`: Caminho para o arquivo ou pasta dos mocks (padrão: `../../../mocks`).
- `--backend <url>`: URL do backend real para proxy fallback (opcional).
- `--port <number>`: Porta do servidor (padrão: 4321).
- `--resilient`: Ativa o modo resiliente para armazenar respostas.

### Crie a pasta mocks na raiz do projeto.
> Dentro crie um arquivo mocks/nome_arquivo.mock.ts

### Exemplos de Execução

**Apenas com Mocks:**

```bash
tsx apps/cli/src/index.ts --mocks mocks/mocks.json --port 4321
```

**Com Proxy para Backend Real:**

```bash
tsx apps/cli/src/index.ts --mocks mocks/all.mock.ts --backend https://api.exemplo.com --port 4321
```

**Modo Resiliente:**

```bash
tsx apps/cli/src/index.ts --mocks mocks/mocks.json --resilient --port 4321
```

Ao iniciar, o servidor exibe logs como:

```
🧉 MIGUÉ rodando em http://localhost:4321
🎯 Backend: https://api.exemplo.com
📂 Mocks: mocks/all.mock.ts
```

## 🧱 Definindo Mocks

### Estrutura Básica de um Mock

Cada mock segue o schema `MockRule`:

```typescript
interface MockRule {
  id?: string; // ID único (auto-gerado se omitido)
  enabled?: boolean; // Ativo (padrão: true)
  triggerError?: boolean; // Força erro (padrão: false)
  delay?: number; // Atraso em ms (padrão: 0)

  match: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
    path: string; // Caminho, ex: '/users/:id'
    query?: Record<string, any>; // Parâmetros de query
    body?: any; // Corpo para match
  };

  error?: {
    status: number;
    body?: any;
  };

  response: {
    status: number;
    body: any;
  };
}
```

### Usando `defineMock` para Tipagem

Para mocks com tipagem forte em TypeScript:

```typescript
import { defineMock } from './packages/schema/src/defineMock';

const userMock = defineMock({
  match: {
    method: 'GET',
    path: '/users/:id',
    query: { details: 'boolean' }, // Tipagem opcional
  },
  response: ({ params, query, faker }) => ({
    status: 200,
    body: {
      id: params.id,
      name: faker.person.fullName(),
      details: query.details ? 'Mais info' : null,
    },
  }),
});
```

Para múltiplos mocks:

```typescript
import { defineMocks } from './packages/schema/src/defineMock';

export default defineMocks([
  // mock1,
  // mock2,
]);
```

## 🛠️ Helpers para Templates

Os templates permitem gerar respostas dinâmicas. O contexto inclui `params`, `query`, `body` e helpers.

### Funções Disponíveis

- **`uuid()`**: Gera UUID único.
- **`randomInt(min, max)`**: Número inteiro aleatório.
- **`randomBool()`**: Booleano aleatório.
- **`choice(array)`**: Escolhe item aleatório do array.
- **`arrayFrom(length, fn)`**: Cria array aplicando função.
- **`pickWithProbability(options)`**: Escolhe baseado em probabilidades (ex: `[{ value: 'A', chance: 70 }, { value: 'B', chance: 30 }]`).
- **`setState(key, value)`**: Armazena no estado global.
- **`getState(key, defaultValue?)`**: Recupera do estado global.
- **`faker`**: Biblioteca Faker.js completa (ex: `faker.internet.email()`).

## 📚 Exemplos Práticos

### Mock Simples (JSON)

```json
{
  "match": {
    "method": "GET",
    "path": "/users"
  },
  "response": {
    "status": 200,
    "body": [
      { "id": 1, "name": "João" },
      { "id": 2, "name": "Maria" }
    ]
  }
}
```

### Mock com Templates

```typescript
{
  match: { method: 'GET', path: '/users/:id' },
  response: ({ params, faker, uuid }) => ({
    status: 200,
    body: {
      id: params.id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      token: uuid(),
    },
  }),
}
```

### Mock com Estado

```typescript
{
  match: { method: 'POST', path: '/login' },
  response: ({ body, setState, uuid }) => {
    const token = uuid();
    setState('authToken', token);
    return {
      status: 200,
      body: { token, user: body.username },
    };
  },
}
```

### Mock com Erro

```typescript
{
  triggerError: true,
  match: { method: 'GET', path: '/error' },
  error: ({ params }) => ({
    status: 404,
    body: { message: `Usuário ${params.id} não encontrado` },
  }),
  response: {
    status: 200,
    body: { success: true },
  },
}
```

## 🔧 Arquitetura Interna

- **MigueEngine**: Motor principal com middlewares.
- **MockStore**: Carrega e gerencia mocks.
- **ResilientStore**: Armazena respostas no modo resiliente.
- **Middlewares**: Logger, Mock Processor, Proxy.

## 🤝 Contribuição

Contribuições são bem-vindas! Abra issues ou PRs no repositório.

## 📄 Licença

MIT License.

---

**Feito com ❤️ para acelerar o desenvolvimento frontend.**
