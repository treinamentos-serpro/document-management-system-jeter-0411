import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ ownerId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    const form = event.currentTarget;
    setIsUploading(true);
    try {
      const document = await uploadDocument(file, ownerId);
      setSuccess(`“${document.originalName}” foi enviado.`);
      setFile(null);
      form.reset();
      onUploaded();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-picker">
        <span className="file-picker-icon" aria-hidden="true">+</span>
        <span className="file-picker-text">
          <strong>{file ? file.name : 'Escolher arquivo'}</strong>
          <small>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Qualquer formato · até 10 MB'}</small>
        </span>
        <input
          type="file"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setError('');
            setSuccess('');
          }}
          disabled={isUploading}
        />
      </label>
      <button
        className="primary-button"
        type="submit"
        disabled={isUploading || !ownerId.trim()}
      >
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p className="form-message error-message" role="alert">{error}</p>}
      {success && <p className="form-message success-message" role="status">{success}</p>}
    </form>
  );
}