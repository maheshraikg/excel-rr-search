import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { ExcelFile } from '@shared/schema';

interface FileDisplayData extends ExcelFile {
  sheetCount?: number;
  rowCount?: number;
}

interface FileManagementProps {
  files: FileDisplayData[];
  onFilesChanged: () => void;
}

export default function FileManagement({ files, onFilesChanged }: FileManagementProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setError(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (excelFiles.length === 0) {
      setError('Please select Excel files (.xlsx or .xls)');
      return;
    }
    
    setSelectedFiles(excelFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('excelFile', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast({
        title: 'Upload successful',
        description: `${selectedFiles.length} file(s) uploaded successfully.`,
      });

      setSelectedFiles([]);
      onFilesChanged();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast({
        title: 'File deleted',
        description: `${fileName} has been removed.`,
      });

      onFilesChanged();

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete file.',
        variant: 'destructive',
      });
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Excel Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drop Excel files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xlsx and .xls files. Multiple files can be uploaded at once.
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-browse-files"
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-upload"
              />
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedFiles}
                  data-testid="button-clear-selection"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {file.name.endsWith('.xlsx') ? 'XLSX' : 'XLS'}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Upload Controls */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  data-testid="button-upload"
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload {selectedFiles.length} File(s)
                    </>
                  )}
                </Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Uploaded Files ({files.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4" />
              <p>No files uploaded yet.</p>
              <p className="text-sm">Upload Excel files to start searching data.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{file.sheetCount || (file.sheets && file.sheets.length) || 0} sheets</span>
                        <span>{(file.rowCount || 0).toLocaleString()} records</span>
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id, file.fileName)}
                      data-testid={`button-delete-${file.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}