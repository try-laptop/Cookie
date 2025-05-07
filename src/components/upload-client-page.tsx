'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { uploadFile, type UploadResponse, deleteFileAction, type DeleteResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UploadCloud, AlertCircle, CheckCircle, Copy, ExternalLink, Trash2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const initialUploadState: UploadResponse = { success: false };
const initialDeleteState: DeleteResponse = { success: false };

interface UploadClientPageProps {
  onUploadSuccess?: (fileId: string, fileName: string) => void;
  onDeleteSuccess?: () => void;
  latestFileId?: string | null;
  latestFileName?: string | null;
}

export default function UploadClientPage({ 
  onUploadSuccess, 
  onDeleteSuccess,
  latestFileId: initialLatestFileId, 
  latestFileName: initialLatestFileName 
}: UploadClientPageProps) {
  const [uploadFormState, uploadFormAction, isUploadPending] = useActionState(uploadFile, initialUploadState);
  const [deleteFormState, deleteFormAction, isDeletePending] = useActionState(deleteFileAction, initialDeleteState);
  
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(initialLatestFileId || null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(initialLatestFileName || null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadFormState.error) {
      // Error is handled by the Alert component below
    } else if (uploadFormState.success && uploadFormState.fileId && uploadFormState.fileName) {
      toast({
        title: 'Upload Successful!',
        description: `${uploadFormState.fileName} has been uploaded.`,
        variant: 'default',
      });
      setCurrentFileId(uploadFormState.fileId);
      setCurrentFileName(uploadFormState.fileName);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFileName(null);
      if (onUploadSuccess) {
        onUploadSuccess(uploadFormState.fileId, uploadFormState.fileName);
      }
    }
  }, [uploadFormState, toast, onUploadSuccess]);

  useEffect(() => {
    if (deleteFormState.error) {
      toast({
        title: 'Delete Failed',
        description: deleteFormState.error,
        variant: 'destructive',
      });
    } else if (deleteFormState.success) {
      toast({
        title: 'File Deleted',
        description: deleteFormState.message,
        variant: 'default',
      });
      setCurrentFileId(null);
      setCurrentFileName(null);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    }
  }, [deleteFormState, toast, onDeleteSuccess]);
  
  // Sync with external props if they change (e.g. parent component re-fetches)
  useEffect(() => {
    setCurrentFileId(initialLatestFileId || null);
    setCurrentFileName(initialLatestFileName || null);
  }, [initialLatestFileId, initialLatestFileName]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
       // Clear previous upload status if a new file is selected
      if (uploadFormState.success || uploadFormState.error) {
        // Resetting by triggering a dummy action isn't standard.
        // Better to clear state variables directly if needed or rely on new form submission to overwrite.
      }
    } else {
      setSelectedFileName(null);
    }
  };

  const isUploadingOrDeleting = isUploadPending || isDeletePending;

  const handleResetForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFileName(null);
    // Reset form states - this is tricky with useActionState as it doesn't provide a reset function directly.
    // For a full reset, one might need to manage a key on the form or component.
    // For this demo, we'll rely on submitting a new file to overwrite previous state.
    // Or, simply clear the visual indicators:
    if (uploadFormState.success || uploadFormState.error) {
      // A more robust way might be to wrap useActionState or manage local display state
    }
     toast({ title: 'Form Cleared', description: 'You can now select a new file.'});
  };

  return (
    <div className="space-y-6">
      {!currentFileId && (
        <form action={uploadFormAction} className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Choose a .txt file to share
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="file-upload"
                name="file"
                type="file"
                accept=".txt"
                required
                onChange={handleFileChange}
                ref={fileInputRef}
                className="flex-grow"
                disabled={isUploadingOrDeleting}
              />
               {selectedFileName && (
                <Button type="button" variant="ghost" size="icon" onClick={handleResetForm} disabled={isUploadingOrDeleting} aria-label="Clear selection">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedFileName && !isUploadingOrDeleting && (
              <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedFileName}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isUploadingOrDeleting || !selectedFileName}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isUploadPending ? 'Uploading...' : 'Upload & Share File'}
          </Button>
        </form>
      )}

      {uploadFormState.error && !isUploadPending && !currentFileId && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>{uploadFormState.error}</AlertDescription>
        </Alert>
      )}

      {currentFileId && currentFileName && (
        <Card className="mt-6 bg-secondary/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="font-semibold">File currently shared: <span className="font-bold">{currentFileName}</span></p>
            </div>
            
            <div>
              <Label htmlFor="share-link" className="text-xs font-medium">Shareable Link</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="share-link"
                  type="text"
                  readOnly
                  value={`${window.location.origin}/download/${currentFileId}`}
                  className="bg-background"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(`${window.location.origin}/download/${currentFileId}`)}
                  aria-label="Copy link"
                  disabled={isUploadingOrDeleting}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" asChild aria-label="Open link" disabled={isUploadingOrDeleting}>
                  <Link href={`/download/${currentFileId}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
             <form action={deleteFormAction} className="pt-2">
                <input type="hidden" name="fileId" value={currentFileId} />
                <Button type="submit" variant="destructive" className="w-full" disabled={isUploadingOrDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeletePending ? 'Deleting...' : 'Delete This File'}
                </Button>
              </form>
              {deleteFormState.error && !isDeletePending && (
                 <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Delete Failed</AlertTitle>
                    <AlertDescription>{deleteFormState.error}</AlertDescription>
                  </Alert>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // toast is available via useToast hook, so this function needs access to it or toast passed as arg
    // For simplicity, assuming toast is accessible or this function is moved/toast instance passed
    // Example: ShowToast({ title: 'Link Copied!', description: 'Shareable link copied to clipboard.' });
    alert('Link copied to clipboard!'); // Placeholder if toast isn't directly accessible here
  }).catch(err => {
    alert('Failed to copy link.');
    console.error('Failed to copy text: ', err);
  });
}