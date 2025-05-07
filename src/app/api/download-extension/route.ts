// src/app/api/download-extension/route.ts
import { getExtensionFileFromStore } from '@/lib/extension-store';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const fileData = getExtensionFileFromStore();

  if (!fileData) {
    return new NextResponse('Extension file not found', { status: 404 });
  }

  const blob = new Blob([fileData.content], { type: fileData.mimeType });
  
  const headers = new Headers();
  headers.set('Content-Type', fileData.mimeType);
  headers.set('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
  headers.set('Content-Length', String(blob.size));

  return new NextResponse(blob, { status: 200, headers });
}
