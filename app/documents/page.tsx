'use client';

import { useState, useEffect } from 'react';

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  interface IDoc {
  _id: string;
  filename: string;
  version: number;
  uploadedBy?: { name: string };
}

const [documents, setDocuments] = useState<IDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch documents', error);
    }
    setLoadingDocs(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    setUploading(true);
    setMessage('');

    // Convert file to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];

      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            data: base64Data,
          }),
        });

        const result = await response.json();
        if (response.ok) {
          setMessage(`Éxito: ${result.message}`);
          fetchDocuments(); // Refresh the list after upload
        } else {
          setMessage(`Error: ${result.error}`);
        }
      } catch (err) {
        setMessage('Error de red al subir el archivo.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setMessage('Error al leer el archivo.');
      setUploading(false);
    };
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Gestión de Documentos</h1>
      <form onSubmit={handleSubmit} className="mt-6 p-6 border rounded-lg">
        <h2 className="text-xl">Subir Nuevo Documento</h2>
        <div className="mt-4">
          <input type="file" onChange={handleFileChange} required />
        </div>
        <button type="submit" disabled={uploading} className="mt-4 px-4 py-2 text-white bg-blue-600 rounded disabled:bg-gray-400">
          {uploading ? 'Subiendo...' : 'Subir Documento'}
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </form>

      <div className="mt-8">
        <h2 className="text-xl">Documentos Almacenados</h2>
        {loadingDocs ? <p>Cargando documentos...</p> : (
          <div className="mt-4 space-y-4">
            {Object.entries(
              documents.reduce((acc, doc) => {
                const key = doc.filename;
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(doc);
                return acc;
              }, {} as Record<string, IDoc[]>)
            ).map(([filename, versions]: [string, IDoc[]]) => (
              <div key={filename} className="p-4 border rounded-lg">
                <h3 className="font-bold">{filename}</h3>
                <ul className="mt-2 space-y-1 pl-4">
                  {versions.sort((a: IDoc, b: IDoc) => b.version - a.version).map((doc: IDoc) => (
                    <li key={doc._id} className="flex justify-between items-center">
                      <span>Versión {doc.version} (subido por {doc.uploadedBy?.name || 'Desconocido'})</span>
                      <a href={`/api/documents?id=${doc._id}`} download className="text-blue-500 hover:underline">Descargar</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
