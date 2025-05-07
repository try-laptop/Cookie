'use server';

import { z } from 'zod';
import { addFileToStore, deleteFileFromStore, getLatestFileMetadataFromStore, type StoredFile } from '@/lib/file-store';
import { revalidatePath } from 'next/cache';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_EXTENSIONS = ['.json']; // Changed from .txt to .json

const UploadResponseSchema = z.object({
  success: z.boolean(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  error: z.string().optional(),
});
export type UploadResponse = z.infer<typeof UploadResponseSchema>;

export async function uploadFile(
  prevState: UploadResponse,
  formData: FormData
): Promise<UploadResponse> {
  const file = formData.get('file') as File | null;

  if (!file) {
    return { success: false, error: 'No file selected. Please choose a .json file.' };
  }

  if (file.size === 0) {
    return { success: false, error: 'The selected file is empty.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.` };
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
    return { success: false, error: 'Invalid file type. Only .json files are allowed.' };
  }

  try {
    const content = await file.text(); // JSON content will be a string
    const mimeType = 'application/json'; // Changed from text/plain
    
    const storedFile = addFileToStore({
      fileName: file.name,
      content: content,
      mimeType: mimeType,
      size: file.size,
    });
    
    revalidatePath('/'); // Revalidate home page to update receiver tab
    revalidatePath(`/download/${storedFile.id}`);
    return { success: true, fileId: storedFile.id, fileName: storedFile.fileName };
  } catch (e) {
    console.error('File upload processing error:', e);
    return { success: false, error: 'An unexpected error occurred while processing the file.' };
  }
}

const DeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

export async function deleteFileAction(
  prevState: DeleteResponse,
  formData: FormData
): Promise<DeleteResponse> {
  const fileId = formData.get('fileId') as string | null;

  if (!fileId) {
    return { success: false, error: 'File ID is missing.' };
  }

  try {
    const deleted = deleteFileFromStore(fileId);
    if (deleted) {
      revalidatePath('/'); // Revalidate home page
      revalidatePath(`/download/${fileId}`); // Revalidate download page if it exists
      return { success: true, message: 'Session file deleted successfully.' };
    } else {
      return { success: false, error: 'Session file not found or already deleted.' };
    }
  } catch (e) {
    console.error('File deletion error:', e);
    return { success: false, error: 'An unexpected error occurred while deleting the session file.' };
  }
}

const FileMetadataResponseSchema = z.object({
    file: z.custom<Omit<StoredFile, 'content'>>().nullable(),
    error: z.string().optional(),
});
export type FileMetadataResponse = z.infer<typeof FileMetadataResponseSchema>;

export async function getLatestSharedFileMetadataAction(): Promise<FileMetadataResponse> {
  try {
    const fileMetadata = getLatestFileMetadataFromStore();
    return { file: fileMetadata || null };
  } catch (e) {
    console.error('Error fetching latest file metadata:', e);
    return { file: null, error: 'Failed to fetch latest session file information.' };
  }
}
