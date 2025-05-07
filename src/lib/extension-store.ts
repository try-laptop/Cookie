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

const EXTENSION_STORE_KEY = 'chrome-extension-zip';

// Ensure a single instance of the store, especially in dev with HMR
declare global {
  // eslint-disable-next-line no-var
  var __extensionStore__: Map<string, StoredExtensionFile> | undefined;
}

let extensionStore: Map<string, StoredExtensionFile>;

if (process.env.NODE_ENV === 'production') {
  extensionStore = new Map<string, StoredExtensionFile>();
} else {
  if (!globalThis.__extensionStore__) {
    globalThis.__extensionStore__ = new Map<string, StoredExtensionFile>();
  }
  extensionStore = globalThis.__extensionStore__;
}


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
  // Overwrite any existing extension by using .set()
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
