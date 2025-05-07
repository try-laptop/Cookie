// src/app/actions.ts
'use server';

import { z } from 'zod';
import { addFileToStore, deleteFileFromStore, getLatestFileMetadataFromStore, type StoredFile } from '@/lib/file-store';
import { 
  addExtensionFileToStore, 
  deleteExtensionFileFromStore, 
  getExtensionFileMetadataFromStore,
  type StoredExtensionFile
} from '@/lib/extension-store';
import { revalidatePath } from 'next/cache';

const MAX_SESSION_FILE_SIZE = 5 * 1024 * 1024; // 5MB for session files
const ACCEPTED_SESSION_FILE_EXTENSIONS = ['.json'];

const MAX_EXTENSION_ZIP_SIZE = 10 * 1024 * 1024; // 10MB for extension ZIP files
const ACCEPTED_EXTENSION_MIME_TYPES = ['application/zip', 'application/x-zip-compressed'];


// --- Session File Actions ---

const UploadSessionResponseSchema = z.object({
  success: z.boolean(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  error: z.string().optional(),
});
export type UploadSessionResponse = z.infer<typeof UploadSessionResponseSchema>;

export async function uploadSessionFileAction(
  prevState: UploadSessionResponse,
  formData: FormData
): Promise<UploadSessionResponse> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file selected. Please choose a .json file.' };
  }

  if (file.size === 0) {
    return { success: false, error: 'The selected file is empty.' };
  }

  if (file.size > MAX_SESSION_FILE_SIZE) {
    return { success: false, error: `File size exceeds ${MAX_SESSION_FILE_SIZE / (1024 * 1024)}MB limit.` };
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !ACCEPTED_SESSION_FILE_EXTENSIONS.includes(fileExtension)) {
    return { success: false, error: 'Invalid file type. Only .json files are allowed.' };
  }

  try {
    const content = await file.text();
    const mimeType = 'application/json';
    
    const storedFile = addFileToStore({
      fileName: file.name,
      content: content,
      mimeType: mimeType,
      size: file.size,
    });
    
    revalidatePath('/');
    revalidatePath(`/download/${storedFile.id}`);
    revalidatePath('/api/download-extension'); // Revalidate paths that might show extension info
    return { success: true, fileId: storedFile.id, fileName: storedFile.fileName };
  } catch (e) {
    console.error('Session file upload processing error:', e);
    return { success: false, error: 'An unexpected error occurred while processing the session file.' };
  }
}

const DeleteSessionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type DeleteSessionResponse = z.infer<typeof DeleteSessionResponseSchema>;

export async function deleteSessionFileAction(
  prevState: DeleteSessionResponse,
  formData: FormData
): Promise<DeleteSessionResponse> {
  const fileId = formData.get('fileId') as string | null;

  if (!fileId) {
    return { success: false, error: 'Session File ID is missing.' };
  }

  try {
    const deleted = deleteFileFromStore(fileId);
    if (deleted) {
      revalidatePath('/');
      revalidatePath(`/download/${fileId}`);
      revalidatePath('/api/download-extension');
      return { success: true, message: 'Session file deleted successfully.' };
    } else {
      return { success: false, error: 'Session file not found or already deleted.' };
    }
  } catch (e) {
    console.error('Session file deletion error:', e);
    return { success: false, error: 'An unexpected error occurred while deleting the session file.' };
  }
}

const SessionFileMetadataResponseSchema = z.object({
    file: z.custom<Omit<StoredFile, 'content'>>().nullable(),
    error: z.string().optional(),
});
export type SessionFileMetadataResponse = z.infer<typeof SessionFileMetadataResponseSchema>;

export async function getLatestSharedFileMetadataAction(): Promise<SessionFileMetadataResponse> {
  try {
    const fileMetadata = getLatestFileMetadataFromStore();
    return { file: fileMetadata || null };
  } catch (e) {
    console.error('Error fetching latest session file metadata:', e);
    return { file: null, error: 'Failed to fetch latest session file information.' };
  }
}


// --- Extension File Actions ---

const UploadExtensionResponseSchema = z.object({
  success: z.boolean(),
  fileName: z.string().optional(),
  error: z.string().optional(),
});
export type UploadExtensionResponse = z.infer<typeof UploadExtensionResponseSchema>;

export async function uploadExtensionAction(
  prevState: UploadExtensionResponse,
  formData: FormData
): Promise<UploadExtensionResponse> {
  const file = formData.get('extensionFile') as File | null;

  if (!file) {
    return { success: false, error: 'No file selected. Please choose a .zip extension file.' };
  }

  if (file.size === 0) {
    return { success: false, error: 'The selected file is empty.' };
  }

  if (file.size > MAX_EXTENSION_ZIP_SIZE) {
    return { success: false, error: `File size exceeds ${MAX_EXTENSION_ZIP_SIZE / (1024 * 1024)}MB limit.` };
  }
  
  if (!ACCEPTED_EXTENSION_MIME_TYPES.includes(file.type)) {
     return { success: false, error: `Invalid file type. Only .zip files are allowed. Detected: ${file.type}` };
  }

  try {
    const content = await file.arrayBuffer(); // Read as ArrayBuffer
    
    addExtensionFileToStore({
      fileName: file.name,
      content: content,
      mimeType: file.type,
      size: file.size,
    });
    
    revalidatePath('/'); // Revalidate relevant paths
    revalidatePath('/api/download-extension');
    return { success: true, fileName: file.name };
  } catch (e) {
    console.error('Extension file upload processing error:', e);
    return { success: false, error: 'An unexpected error occurred while processing the extension file.' };
  }
}

const DeleteExtensionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type DeleteExtensionResponse = z.infer<typeof DeleteExtensionResponseSchema>;

export async function deleteExtensionAction(
  prevState: DeleteExtensionResponse,
  formData: FormData // formData might not be needed if we only ever delete the single stored extension
): Promise<DeleteExtensionResponse> {
  try {
    const deleted = deleteExtensionFileFromStore();
    if (deleted) {
      revalidatePath('/');
      revalidatePath('/api/download-extension');
      return { success: true, message: 'Extension file deleted successfully.' };
    } else {
      return { success: false, error: 'Extension file not found or already deleted.' };
    }
  } catch (e) {
    console.error('Extension file deletion error:', e);
    return { success: false, error: 'An unexpected error occurred while deleting the extension file.' };
  }
}

const ExtensionMetadataResponseSchema = z.object({
    file: z.custom<Omit<StoredExtensionFile, 'content'>>().nullable(),
    error: z.string().optional(),
});
export type ExtensionMetadataResponse = z.infer<typeof ExtensionMetadataResponseSchema>;

export async function getExtensionFileMetadataAction(): Promise<ExtensionMetadataResponse> {
  try {
    const fileMetadata = getExtensionFileMetadataFromStore();
    return { file: fileMetadata || null };
  } catch (e) {
    console.error('Error fetching extension file metadata:', e);
    return { file: null, error: 'Failed to fetch extension file information.' };
  }
}
