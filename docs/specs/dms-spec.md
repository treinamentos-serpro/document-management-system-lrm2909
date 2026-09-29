# Especificação - Document Management System

Esta especificação define o comportamento esperado do Document Management
System (DMS) para a primeira versão funcional. Ela orienta a implementação
guiada por especificação e não substitui os testes automatizados.

## 1. Objetivo

Entregar uma aplicação web que permita a um usuário enviar, listar e baixar
documentos, mantendo os arquivos no filesystem local e seus metadados em
memória.

## 2. Escopo

### Dentro do escopo

- Receber um documento por upload HTTP usando `multipart/form-data`.
- Validar a presença, o nome, o tipo e o tamanho do arquivo conforme
  configurações da aplicação.
- Gravar o arquivo em `backend/storage` usando `multer` com `diskStorage`.
- Gerar um identificador único para cada documento.
- Registrar e exibir metadados do documento.
- Associar cada documento a um identificador simples de usuário (`owner`).
- Listar os documentos disponíveis para o contexto do usuário.
- Baixar o conteúdo original de um documento pelo identificador.
- Exibir estados de carregamento, sucesso e erro no frontend.
- Disponibilizar um endpoint de health check para verificar a aplicação.

### Fora do escopo

- Armazenamento externo, em nuvem ou em serviços de terceiros.
- Banco de dados ou persistência durável dos metadados nesta fase.
- Versionamento, histórico ou restauração de documentos.
- Login, cadastro, sessão, autenticação ou autorização completa.
- Compartilhamento entre usuários, permissões granulares ou grupos.
- Busca avançada, ordenação configurável, pastas e tags.
- Edição, conversão, visualização ou processamento do conteúdo do arquivo.
- Exclusão de documentos, caso não seja adicionada a uma especificação futura.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve disponibilizar `GET /health`, retornando o estado operacional da aplicação. |
| RF-02 | O usuário deve poder enviar um documento pelo campo multipart `file`. |
| RF-03 | O sistema deve rejeitar uploads sem arquivo, com arquivo vazio, acima do limite configurado ou com tipo não permitido. |
| RF-04 | O sistema deve preservar o nome original em `originalName`, sem usá-lo diretamente como nome físico do arquivo. |
| RF-05 | O sistema deve gerar um `id` único e seguro para o documento no momento do upload. |
| RF-06 | O sistema deve gravar o arquivo aprovado em `backend/storage` por meio do `multer` configurado com `diskStorage`. |
| RF-07 | O sistema deve registrar os metadados `id`, `originalName`, `size`, `uploadedAt` e `owner` em memória. |
| RF-08 | O campo `uploadedAt` deve registrar a data e hora do upload em formato ISO 8601. |
| RF-09 | O usuário deve poder listar os documentos disponíveis por meio de `GET /documents`. |
| RF-10 | A listagem deve retornar somente metadados, nunca o conteúdo binário dos arquivos. |
| RF-11 | O usuário deve poder baixar um documento por meio de `GET /documents/:id/download`. |
| RF-12 | O download deve devolver o arquivo correspondente ao registro em memória e sugerir o nome original no header `Content-Disposition`. |
| RF-13 | O sistema deve retornar `404` quando o `id` não existir ou quando o arquivo físico associado não puder ser encontrado. |
| RF-14 | O sistema deve retornar respostas JSON consistentes para erros de validação e de processamento, sem expor stack traces ao cliente. |
| RF-15 | O frontend deve permitir selecionar e enviar um arquivo, visualizar a lista de documentos e iniciar o download de um item. |
| RF-16 | O frontend deve apresentar mensagens compreensíveis para sucesso, falha de upload, lista vazia e documento indisponível. |
| RF-17 | O sistema deve aceitar o identificador de usuário definido pelo contexto da aplicação para preencher `owner`, sem implementar autenticação nesta fase. |

### Regras de negócio

- Cada upload aprovado cria um único registro de documento.
- O `id` é imutável e não pode ser reutilizado por outro registro durante a
  execução do processo.
- `size` representa o tamanho em bytes do arquivo efetivamente gravado.
- A listagem deve ser determinística, preferencialmente na ordem decrescente
  de `uploadedAt`, sem alterar os metadados armazenados.
- O arquivo físico e seu registro em memória devem ser criados como parte do
  mesmo fluxo de sucesso. Falhas no registro não devem deixar um documento
  publicamente disponível sem metadados.
- Reiniciar o processo pode apagar os metadados em memória. Arquivos físicos
  remanescentes sem registro não devem ser tratados como documentos válidos.

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve usar Node.js, Express e CommonJS, conforme o projeto atual. |
| RNF-02 | O frontend deve usar React com Vite e módulos ESM. |
| RNF-03 | As rotas devem delegar para controllers; controllers devem coordenar services; services devem concentrar regras de negócio; repositories devem encapsular persistência. |
| RNF-04 | Os arquivos devem ser armazenados exclusivamente no filesystem local, em `backend/storage`, usando `multer` com `diskStorage`. |
| RNF-05 | Os metadados devem permanecer em memória nesta fase e não devem depender de banco de dados ou provedor externo. |
| RNF-06 | Porta, diretório de storage, limite de tamanho, tipos MIME permitidos e demais configurações operacionais devem ser obtidos de variáveis de ambiente, com defaults documentados. |
| RNF-07 | O nome físico do arquivo deve ser gerado pela aplicação para impedir colisões, traversal de diretórios e uso inseguro do nome enviado pelo cliente. |
| RNF-08 | O limite de tamanho e os tipos permitidos devem ser aplicados no limite HTTP antes de persistir o arquivo. |
| RNF-09 | Os endpoints devem usar `application/json` nas respostas JSON e códigos HTTP semânticos. Downloads devem usar o content type do arquivo quando disponível. |
| RNF-10 | Erros de entrada, filesystem e registros ausentes devem ser tratados nas fronteiras da aplicação e convertidos em respostas estáveis. |
| RNF-11 | O backend deve possuir testes automatizados com o runner nativo `node:test` para health check, upload, listagem, download e principais erros. |
| RNF-12 | O frontend deve consumir o backend via `fetch` usando o prefixo `/api`, com proxy configurado pelo Vite. |
| RNF-13 | A interface deve funcionar em telas estreitas e não deve bloquear a interação durante upload, listagem ou download. |
| RNF-14 | A API não deve expor caminhos absolutos, stack traces, dados internos do multer ou informações sensíveis nas respostas. |

## 5. Modelo de dados (metadados do documento)

O binário é armazenado no filesystem. O registro abaixo é o único objeto
exposto pela API de metadados.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único do documento, gerado pelo servidor. |
| `originalName` | string | Sim | Nome original informado pelo cliente, normalizado para exibição segura. |
| `size` | number | Sim | Tamanho do arquivo em bytes. Deve ser inteiro não negativo. |
| `uploadedAt` | string | Sim | Data e hora da criação do registro em ISO 8601. |
| `owner` | string | Sim | Identificador do usuário associado ao documento no contexto atual. |

### Dados internos de persistência

O repository pode manter, além dos campos públicos, uma referência interna ao
arquivo físico, por exemplo um `storagePath` calculado pelo servidor. Esse
campo não deve ser retornado nos endpoints de metadados. O caminho deve ser
resolvido dentro de `backend/storage` e nunca derivado sem validação de um
valor fornecido diretamente pelo cliente.

### Invariantes

- `id` deve ser único durante o ciclo de vida do processo.
- `originalName` não deve conter um caminho utilizável para atravessar
  diretórios.
- `uploadedAt` deve ser uma data válida serializada em ISO 8601.
- `owner` deve ser uma string não vazia quando houver contexto de usuário.
- O objeto público não deve conter o buffer nem o conteúdo binário.
- A perda do mapa de metadados após reinicialização deve ser considerada uma
  limitação conhecida desta versão, não uma promessa de persistência.

## 6. Contratos de API

Todas as rotas de negócio são expostas pelo backend e consumidas pelo
frontend com o prefixo `/api` por meio do proxy do Vite. A tabela abaixo usa
as rotas internas do backend; no frontend elas correspondem a `/api/health`,
`/api/upload`, `/api/documents` e `/api/documents/:id/download`.

### GET /health

Verifica se o processo HTTP está ativo.

- Entrada: nenhuma.
- Resposta de sucesso: `200 application/json`.
- Corpo de sucesso:

  ```json
  { "status": "ok" }
  ```

### POST /upload

Cria um documento a partir de um upload multipart.

- Entrada: `multipart/form-data`.
- Campo obrigatório: `file`, contendo um único arquivo.
- Contexto do usuário: o identificador disponível para a aplicação deve ser
  convertido em `owner`; o contrato não cria um mecanismo de login.
- O servidor deve aplicar limite de tamanho e filtro de tipo antes de aceitar o
  upload.
- Resposta de sucesso: `201 application/json`.
- Corpo de sucesso:

  ```json
  {
    "id": "document-id",
    "originalName": "relatorio.pdf",
    "size": 2048,
    "uploadedAt": "2026-09-29T12:00:00.000Z",
    "owner": "user-id"
  }
  ```

- Erros esperados:
  - `400` quando o campo `file` estiver ausente, inválido ou vazio.
  - `413` quando o arquivo exceder o limite configurado.
  - `415` quando o tipo de arquivo não for permitido.
  - `500` quando houver falha inesperada ao gravar o arquivo ou registrar os
    metadados.

### GET /documents

Lista os documentos conhecidos pelo processo.

- Entrada: nenhuma obrigatória; o contexto do usuário pode filtrar a lista
  quando essa informação estiver disponível.
- Resposta de sucesso: `200 application/json`.
- Corpo de sucesso:

  ```json
  {
    "documents": [
      {
        "id": "document-id",
        "originalName": "relatorio.pdf",
        "size": 2048,
        "uploadedAt": "2026-09-29T12:00:00.000Z",
        "owner": "user-id"
      }
    ]
  }
  ```

- Uma lista vazia deve retornar `200`, com `documents` igual a `[]`.
- Erro esperado: `500` quando não for possível ler a coleção em memória.

### GET /documents/:id/download

Baixa o conteúdo binário de um documento conhecido.

- Parâmetro obrigatório: `id`, correspondente ao identificador do documento.
- Resposta de sucesso: `200`, com o conteúdo binário do arquivo.
- Headers de sucesso:
  - `Content-Type`: tipo do arquivo armazenado, quando conhecido; caso
    contrário, um tipo binário genérico.
  - `Content-Disposition`: `attachment; filename="<originalName>"`, com o nome
    codificado de forma segura.
- O endpoint não deve retornar o objeto de metadados no corpo do download.
- Erros esperados:
  - `400` quando o parâmetro `id` estiver ausente ou inválido.
  - `404` quando não existir registro para o `id` ou o arquivo físico não
    estiver disponível.
  - `500` quando ocorrer erro inesperado durante a leitura do arquivo.

### Formato de erro

As respostas de erro JSON devem seguir um formato estável:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

`code` deve ser estável para consumo programático e `message` deve ser uma
mensagem segura e compreensível. O formato pode ser usado para códigos como
`FILE_REQUIRED`, `FILE_TOO_LARGE`, `FILE_TYPE_NOT_ALLOWED` e
`DOCUMENT_NOT_FOUND`.

## 7. Decisões arquiteturais

### Backend

O backend deve seguir uma Clean Architecture simples, com dependências
apontando para dentro:

```text
routes -> controllers -> services -> repositories
```

- `routes/`: registra os endpoints Express, aplica middleware de upload e
  encaminha a requisição ao controller.
- `controllers/`: lê parâmetros, arquivos e contexto HTTP; valida o mínimo
  necessário na borda; chama o service; traduz o resultado para status,
  headers e JSON HTTP.
- `services/`: implementa regras de negócio, validações de domínio, criação de
  metadados e coordenação entre arquivo e registro.
- `repositories/`: encapsula o mapa de metadados em memória e as operações de
  filesystem necessárias para salvar, localizar e ler documentos.

O service não deve depender de `req`, `res` ou tipos específicos do Express.
O repository não deve conhecer detalhes de rotas. O multer deve ser usado na
borda HTTP com `diskStorage`, mas o restante da aplicação deve receber apenas
os dados necessários do arquivo e do documento.

### Frontend

O frontend deve usar componentes funcionais React e separar responsabilidades
em:

- `services/`: chamadas `fetch`, serialização de multipart, leitura de erros e
  download.
- `components/`: formulário de upload, lista de documentos e ação de download.
- `pages/`: composição da tela principal e estados de carregamento/erro.

O frontend deve acessar a API usando `/api`, deixando o proxy do Vite resolver
o backend durante o desenvolvimento. Não deve duplicar regras de persistência
ou assumir acesso direto ao filesystem.

### Armazenamento

- O diretório `backend/storage` é local à aplicação e deve existir ou ser
  criado antes do primeiro upload.
- `multer.diskStorage` deve gerar nomes físicos que não dependam do nome
  original recebido.
- Não utilizar S3, banco de dados, APIs externas ou serviços de upload.
- Como os metadados são mantidos em memória, reiniciar o processo perde a
  capacidade de localizar documentos pelos endpoints, ainda que arquivos
  antigos permaneçam fisicamente no diretório.

## 8. Plano de execução

As etapas abaixo descrevem a implementação futura. A criação desta
especificação não executa nenhuma delas.

1. **Estrutura e configuração**: criar a organização de camadas, definir o
   ponto de composição do Express e documentar variáveis de ambiente para
   porta, storage, limite e tipos permitidos.
2. **Repository e armazenamento**: implementar o mapa de metadados em memória,
   a criação segura do diretório local e operações para salvar, localizar e
   ler arquivos sem expor caminhos internos.
3. **Service de documentos**: implementar upload, criação do modelo, regras de
   validação, associação ao `owner`, listagem ordenada e resolução para
   download.
4. **Controllers e routes**: registrar `health`, `upload`, `documents` e
   `documents/:id/download`; conectar multer com `diskStorage`; padronizar
   status, headers e erros.
5. **Testes do backend**: cobrir health check, upload válido, validações,
   listagem vazia e populada, download válido, `404`, falhas de filesystem e
   isolamento das camadas quando aplicável.
6. **Serviço do frontend**: criar as funções `fetch` para upload, listagem e
   download usando o prefixo `/api`, incluindo conversão consistente dos erros.
7. **Componentes e página**: implementar formulário de upload, lista de
   documentos, botão de download e estados de carregamento, sucesso, erro e
   lista vazia.
8. **Proxy e integração**: configurar o proxy do Vite, executar backend e
   frontend, validar o fluxo completo e confirmar que nenhum caminho externo é
   utilizado.
9. **Validação final**: executar testes backend, build do frontend, revisar
   tratamento de limites e erros, conferir a persistência exclusivamente local
   e atualizar a documentação caso algum contrato tenha mudado.