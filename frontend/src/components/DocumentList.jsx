import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export default function DocumentList({ documents, ownerId, isLoading, error }) {
  if (isLoading) {
    return <p className="list-state" role="status">Carregando documentos...</p>;
  }

  if (error) {
    return <p className="list-state error-message" role="alert">{error}</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-mark" aria-hidden="true">0</span>
        <p>Nenhum documento por aqui.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="document-table">
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="document-name">
                <span className="document-file-mark" aria-hidden="true">DOC</span>
                <span title={document.originalName}>{document.originalName}</span>
              </td>
              <td className="muted-cell">{formatSize(document.size)}</td>
              <td className="muted-cell">{formatDate(document.uploadedAt)}</td>
              <td className="action-cell">
                <DownloadButton document={document} ownerId={ownerId} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}