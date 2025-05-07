// THIS IS A DEMO STORE AND IS NOT SUITABLE FOR PRODUCTION
// Data will be lost on server restart.

interface StoredFile {
  id: string;
  fileName: string;
  content: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

// Using a global Map to simulate a persistent store for the demo.
// In a real application, use a database or proper file storage.
const fileStore = new Map<string, StoredFile>();

export function addFileToStore(file: {
  fileName: string;
  content: string;
  mimeType: string;
  size: number;
}): StoredFile {
  const id = crypto.randomUUID();
  const newFile: StoredFile = { 
    ...file, 
    id, 
    uploadedAt: new Date() 
  };
  fileStore.set(id, newFile);
  
  // Basic cleanup: if store gets too big, remove oldest entries
  // This is a very naive implementation.
  if (fileStore.size > 100) {
    const oldestEntry = Array.from(fileStore.entries()).sort((a, b) => a[1].uploadedAt.getTime() - b[1].uploadedAt.getTime())[0];
    if (oldestEntry) {
      fileStore.delete(oldestEntry[0]);
    }
  }
  return newFile;
}

export function getFileFromStore(id: string): StoredFile | undefined {
  return fileStore.get(id);
}

export function getFileMetadataFromStore(id: string): Omit<StoredFile, 'content'> | undefined {
  const file = fileStore.get(id);
  if (file) {
    const { content, ...metadata } = file;
    return metadata;
  }
  return undefined;
}
