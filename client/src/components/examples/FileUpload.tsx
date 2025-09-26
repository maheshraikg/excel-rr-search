import FileUpload from '../FileUpload';
import { useState } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  sheets?: string[];
}

export default function FileUploadExample() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'Caste survey 24.09.2025.xls',
      size: 2560000,
      type: 'application/vnd.ms-excel',
      uploadDate: new Date(),
      sheets: ['Survey Data', 'Summary']
    },
    {
      id: '2', 
      name: 'LT1 INST KADABA.xlsx',
      size: 1840000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadDate: new Date(),
      sheets: ['Main Data', 'Reference']
    }
  ]);

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <FileUpload 
      onFilesUploaded={handleFilesUploaded}
      uploadedFiles={uploadedFiles}
      onFileRemove={handleFileRemove}
    />
  );
}