import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/documentApi.js';
import './App.css';

export default function App() {
  const [ownerId, setOwnerId] = useState('demo-user');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    if (!ownerId.trim()) {
      setDocuments([]);
      setIsLoading(false);
      setListError('Informe um identificador de usuário para consultar documentos.');
      return () => controller.abort();
    }

    setIsLoading(true);
    setListError('');

    listDocuments(ownerId, { signal: controller.signal })
      .then(setDocuments)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setListError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [ownerId, refreshVersion]);

  function handleUploaded() {
    setRefreshVersion((version) => version + 1);
  }

  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href="#home" aria-label="DMS, início">
            <span className="brand-mark" aria-hidden="true">D</span>
            <span>DMS<span className="brand-period">.</span></span>
          </a>
          <label className="identity-field">
            <span>Usuário</span>
            <input
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              autoComplete="off"
              aria-label="Identificador do usuário"
            />
          </label>
        </div>
      </header>

      <main id="home" className="workspace">
        <section className="page-heading" aria-labelledby="page-title">
          <p className="eyebrow">ARQUIVO PESSOAL</p>
          <h1 id="page-title">Seus documentos,<br />em ordem.</h1>
          <p className="heading-copy">Envie um arquivo ou encontre algo que já guardou.</p>
        </section>

        <section className="upload-section" aria-labelledby="upload-title">
          <div className="section-heading">
            <span className="section-index">01</span>
            <h2 id="upload-title">Adicionar documento</h2>
          </div>
          <UploadComponent ownerId={ownerId} onUploaded={handleUploaded} />
        </section>

        <section className="documents-section" aria-labelledby="documents-title">
          <div className="section-heading documents-heading">
            <div className="section-title-group">
              <span className="section-index">02</span>
              <h2 id="documents-title">Documentos</h2>
              <span className="document-count">{documents.length}</span>
            </div>
            <button
              className="refresh-button"
              type="button"
              onClick={() => setRefreshVersion((version) => version + 1)}
              disabled={isLoading || !ownerId.trim()}
            >
              Atualizar lista
            </button>
          </div>
          <DocumentList
            documents={documents}
            ownerId={ownerId}
            isLoading={isLoading}
            error={listError}
          />
        </section>
      </main>
      <footer className="page-footer">
        <span>DOCUMENT MANAGEMENT SYSTEM</span>
        <span>ARMAZENAMENTO LOCAL</span>
      </footer>
    </div>
  );
}
