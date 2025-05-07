import { getFileFromStore } from '@/lib/file-store';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;
  const fileData = getFileFromStore(fileId);

  if (!fileData) {
    return new NextResponse('File not found', { status: 404 });
  }

  // Ensure content is a string for Blob constructor
  const content = typeof fileData.content === 'string' ? fileData.content : String(fileData.content);

  const blob = new Blob([content], { type: fileData.mimeType });
  
  const headers = new Headers();
  headers.set('Content-Type', fileData.mimeType);
  headers.set('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
  headers.set('Content-Length', String(blob.size));

  return new NextResponse(blob, { status: 200, headers });
}
