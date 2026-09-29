import { useState } from 'react';
import { useUploadFileMutation } from '../features/file/fileApi';
import type { FileDoc } from '../features/file/fileApi';

interface Props {
  todoId?: string;
  onUpload?: (file: FileDoc) => void;
}

export function FileUpload({ todoId, onUpload }: Props) {
  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (todoId) formData.append('todoId', todoId);

    try {
      const result = await uploadFile(formData).unwrap();
      onUpload?.(result.data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
        dragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <p className="text-gray-600 dark:text-gray-400">
          📎 Файл чирж тавих эсвэл сонгох
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, PDF, DOCX (max 10MB)
        </p>
      </label>
      {isLoading && <p className="text-blue-600 mt-2">Хуулж байна...</p>}
    </div>
  );
}