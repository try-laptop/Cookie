// src/lib/extension-store.ts
// THIS IS A DEMO STORE AND IS NOT SUITABLE FOR PRODUCTION
// Data will be lost on server restart.

export interface StoredExtensionFile {
  id: string;
  fileName: string;
  content: ArrayBuffer; // Store content as ArrayBuffer for binary data
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

// Using a global Map to simulate a persistent store for the demo.
// Only one extension file will be stored at a time.
const EXTENSION_STORE_KEY = 'chrome-extension-zip';
const extensionStore = new Map<string, StoredExtensionFile>();

export function addExtensionFileToStore(file: {
  fileName: string;
  content: ArrayBuffer;
  mimeType: string;
  size: number;
}): StoredExtensionFile {
  const id = EXTENSION_STORE_KEY; // Use a fixed key to ensure only one extension
  const newFile: StoredExtensionFile = {
    ...file,
    id,
    uploadedAt: new Date(),
  };
  // Remove any existing extension before adding the new one
  if (extensionStore.has(EXTENSION_STORE_KEY)) {
    extensionStore.delete(EXTENSION_STORE_KEY);
  }
  extensionStore.set(id, newFile);
  return newFile;
}

export function getExtensionFileFromStore(): StoredExtensionFile | undefined {
  return extensionStore.get(EXTENSION_STORE_KEY);
}

export function getExtensionFileMetadataFromStore(): Omit<StoredExtensionFile, 'content'> | undefined {
  const file = extensionStore.get(EXTENSION_STORE_KEY);
  if (file) {
    const { content, ...metadata } = file;
    return metadata;
  }
  return undefined;
}

export function deleteExtensionFileFromStore(): boolean {
  if (extensionStore.has(EXTENSION_STORE_KEY)) {
    return extensionStore.delete(EXTENSION_STORE_KEY);
  }
  return false; // No file to delete
}
