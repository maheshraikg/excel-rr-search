// API client for Excel data search application

export interface UploadedFile {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: string;
  sheets: string[];
}

export interface SearchFilters {
  rrNumber: string;
  sheet?: string;
  dateRange?: string;
}

export interface SearchResult {
  fileName: string;
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  matchingRows: number[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
}

const API_BASE = '/api';

export const api = {
  // File operations
  uploadFiles: async (files: FileList): Promise<{ files: UploadedFile[] }> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  getFiles: async (): Promise<UploadedFile[]> => {
    const response = await fetch(`${API_BASE}/files`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  },

  deleteFile: async (fileId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }
  },

  // Search operations
  search: async (filters: SearchFilters): Promise<SearchResponse> => {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }

    return response.json();
  },

  getAvailableSheets: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE}/sheets`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sheets');
    }

    return response.json();
  },
};