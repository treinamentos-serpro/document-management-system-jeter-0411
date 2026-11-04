# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, armazenando os arquivos no filesystem local e mantendo seus metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos associados ao usuário da requisição.
- Download de um documento pelo identificador, respeitando o proprietário.
- Armazenamento local de arquivos e metadados em memória.
- Identificação lógica do usuário por `X-User-Id` no MVP.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Versionamento, edição ou exclusão de documentos.
- Cadastro, autenticação e gerenciamento de usuários.
- Persistência durável dos metadados, paginação e busca avançada.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando `multipart/form-data`, no campo `file`. |
| RF-02 | O upload exige o cabeçalho `X-User-Id`; seu valor será registrado como proprietário. |
| RF-03 | O sistema atribui ao documento um identificador único e registra nome original, tamanho e data/hora do upload. |
| RF-04 | O usuário pode listar somente os documentos associados ao seu `X-User-Id`. |
| RF-05 | A listagem retorna os documentos do mais recente para o mais antigo; sem documentos, retorna uma lista vazia. |
| RF-06 | O usuário pode baixar um documento pelo identificador se ele pertencer ao seu `X-User-Id`. |
| RF-07 | Documento inexistente ou pertencente a outro usuário retorna a mesma resposta de não encontrado. |
| RF-08 | Requisições sem arquivo, sem `X-User-Id` ou com arquivo acima do limite são rejeitadas com erro HTTP apropriado. |
| RF-09 | Os erros da API usam uma estrutura JSON consistente, com código e mensagem. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são gravados localmente usando `multer` com `diskStorage`; não usar provedores externos. |
| RNF-02 | Os metadados ficam em memória e podem ser perdidos ao reiniciar o processo. |
| RNF-03 | Porta, diretório de armazenamento e limite de upload são configuráveis por variáveis de ambiente. |
| RNF-04 | O limite padrão de upload é 10 MiB, configurável por `MAX_FILE_SIZE_BYTES`. |
| RNF-05 | O diretório padrão é `backend/storage`, configurável por `DMS_STORAGE_DIR`. |
| RNF-06 | O nome físico do arquivo é gerado pelo sistema; o nome enviado pelo usuário não define o caminho de armazenamento. |
| RNF-07 | O MVP não restringe tipos de arquivo; valida tamanho e presença do arquivo. |
| RNF-08 | Falhas após a gravação do arquivo devem evitar deixar arquivos órfãos sempre que possível. |

## 5. Modelo de dados

### Metadados expostos pela API

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único, gerado pelo sistema. |
| `originalName` | string | Nome original fornecido no upload. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data/hora do upload em ISO 8601. |
| `owner` | string | Valor de `X-User-Id` associado ao documento. |

### Dado interno de persistência

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `storageName` | string | Nome gerado pelo sistema para localizar o arquivo no diretório local; não é exposto pela API. |

O caminho físico deve ser resolvido dentro do diretório de armazenamento configurado. O nome original nunca deve ser usado para construir esse caminho.

## 6. Contratos de API

Todas as rotas abaixo são relativas à origem da API. As requisições que operam sobre documentos exigem `X-User-Id`, um identificador lógico, não um mecanismo de autenticação.

### `POST /upload`

- Entrada: `multipart/form-data`, campo `file`; cabeçalho `X-User-Id`.
- Sucesso: `201 Created`, corpo com os metadados do documento.
- Erros: `400` para arquivo ausente ou usuário não informado; `413` para arquivo acima do limite; `500` para falha inesperada de armazenamento.

### `GET /documents`

- Entrada: cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, array de metadados pertencentes ao usuário; retorna `[]` se vazio.
- Erro: `400` se o usuário não for informado.

### `GET /documents/:id/download`

- Entrada: parâmetro `id` e cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário como anexo, com o nome original no `Content-Disposition`.
- Erros: `400` se o usuário não for informado; `404` se o documento não existir, não pertencer ao usuário ou não estiver disponível no filesystem.

### Formato de erro

`{"error":{"code":"DOCUMENT_NOT_FOUND","message":"Documento não encontrado."}}`

Os códigos e mensagens devem refletir o erro específico; não devem revelar a existência de documentos de outros usuários.

## 7. Decisões arquiteturais e riscos

- Fluxo do backend: `routes -> controllers -> services -> repositories`.
- Rotas declaram endpoints e encaminham as requisições; controllers tratam HTTP e validação básica; services aplicam regras de negócio; repositories lidam com metadados em memória e arquivos locais.
- `multer` com `diskStorage` grava os arquivos no diretório local configurado.
- O frontend será baseado em React e consumirá a API via prefixo `/api`.
- `X-User-Id` permite separar logicamente documentos no MVP, mas não autentica o solicitante e pode ser falsificado. Não deve ser considerado uma fronteira de segurança para produção.
- Como os metadados são voláteis, após reiniciar o backend os arquivos podem permanecer no disco, mas não estarão disponíveis pela API. Persistência durável exige uma decisão futura.

## 8. Plano de execução

As etapas são futuras; esta especificação não executa alterações de implementação.

1. Definir e validar configuração, identidade lógica do usuário, limite de upload e comportamento de erros. **Aceite:** decisões e variáveis de ambiente documentadas.
2. Implementar armazenamento local com `multer` e repositórios para arquivos e metadados em memória. **Aceite:** uploads gravados localmente, metadados associados ao proprietário e validação do limite aplicada.
3. Implementar os contratos de upload, listagem e download pelas camadas de rotas, controllers e services. **Aceite:** respostas e códigos HTTP correspondem a esta especificação, incluindo isolamento por proprietário.
4. Implementar a interface React para enviar, listar e baixar documentos. **Aceite:** os fluxos da interface usam a API e apresentam estados de sucesso e erro.
5. Validar o fluxo integrado e atualizar a documentação operacional. **Aceite:** build e testes passam; configuração local e limitação de persistência estão documentadas.