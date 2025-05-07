// THIS IS A DEMO STORE AND IS NOT SUITABLE FOR PRODUCTION
// Data will be lost on server restart.

export interface StoredFile {
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
    uploadedAt: new Date(),
  };
  fileStore.set(id, newFile);

  // Basic cleanup: if store gets too big, remove oldest entries
  // This is a very naive implementation. Adjust MAX_FILES as needed.
  const MAX_FILES = 10; // Max number of files to keep
  if (fileStore.size > MAX_FILES) {
    const sortedFiles = Array.from(fileStore.values()).sort(
      (a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime()
    );
    const filesToDelete = fileStore.size - MAX_FILES;
    for (let i = 0; i < filesToDelete; i++) {
      fileStore.delete(sortedFiles[i].id);
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

export function deleteFileFromStore(id: string): boolean {
  return fileStore.delete(id);
}

export function getLatestFileFromStore(): StoredFile | undefined {
  if (fileStore.size === 0) {
    return undefined;
  }
  const latestFile = Array.from(fileStore.values()).reduce((latest, current) => {
    return latest.uploadedAt > current.uploadedAt ? latest : current;
  });
  return latestFile;
}

export function getLatestFileMetadataFromStore(): Omit<StoredFile, 'content'> | undefined {
  const latestFile = getLatestFileFromStore();
  if (latestFile) {
    const { content, ...metadata } = latestFile;
    return metadata;
  }
  return undefined;
}