'use server';

import { z } from 'zod';
import { addFileToStore } from '@/lib/file-store';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_EXTENSIONS = ['.txt'];

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
    return { success: false, error: 'No file selected. Please choose a .txt file.' };
  }

  if (file.size === 0) {
    return { success: false, error: 'The selected file is empty.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.` };
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
    return { success: false, error: 'Invalid file type. Only .txt files are allowed.' };
  }

  try {
    const content = await file.text();
    // Ensure mimeType is 'text/plain' for .txt files, even if browser reports something else
    const mimeType = 'text/plain'; 
    
    const storedFile = addFileToStore({
      fileName: file.name,
      content: content,
      mimeType: mimeType,
      size: file.size,
    });

    return { success: true, fileId: storedFile.id, fileName: storedFile.fileName };
  } catch (e) {
    console.error('File upload processing error:', e);
    return { success: false, error: 'An unexpected error occurred while processing the file.' };
  }
}
