// src/app/api/download-extension/route.ts
import { getExtensionFileFromStore } from '@/lib/extension-store';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[API /api/download-extension] GET request received.');
  const fileData = getExtensionFileFromStore();

  if (!fileData) {
    console.error('[API /api/download-extension] Extension file not found in store. It might not have been uploaded or the server may have restarted.');
    return new NextResponse('Extension file not found. Please upload it again.', { status: 404 });
  }

  console.log(`[API /api/download-extension] File found: ${fileData.fileName}, size: ${fileData.size}, mimeType: ${fileData.mimeType}`);

  try {
    const blob = new Blob([fileData.content], { type: fileData.mimeType });
    
    const headers = new Headers();
    headers.set('Content-Type', fileData.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${fileData.fileName}"`);
    headers.set('Content-Length', String(blob.size));

    console.log('[API /api/download-extension] Sending file to client.');
    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error('[API /api/download-extension] Error creating or sending blob:', error);
    return new NextResponse('Error processing file for download. Check server logs.', { status: 500 });
  }
}

// Ensure the route is dynamically evaluated
export const dynamic = 'force-dynamic';
