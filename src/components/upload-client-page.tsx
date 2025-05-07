'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useActionState } from 'react';
import { uploadFile, type UploadResponse, deleteFileAction, type DeleteResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UploadCloud, AlertCircle, CheckCircle, Copy, ExternalLink, Trash2, RotateCcw, FileJson } from 'lucide-react';
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
  const [isTransitionPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (uploadFormState.error) {
      // Error is handled by the Alert component below
    } else if (uploadFormState.success && uploadFormState.fileId && uploadFormState.fileName) {
      toast({
        title: 'Upload Successful!',
        description: `${uploadFormState.fileName} has been shared.`,
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
        title: 'Session File Deleted',
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
  
  useEffect(() => {
    setCurrentFileId(initialLatestFileId || null);
    setCurrentFileName(initialLatestFileName || null);
  }, [initialLatestFileId, initialLatestFileName]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName(null);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
        uploadFormAction(formData);
    });
  };
  
  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => {
        deleteFormAction(formData);
    });
  };


  const isActionPending = isUploadPending || isDeletePending || isTransitionPending;

  const handleResetForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFileName(null);
    // Visually, this is enough. The form state will be overridden on next submit.
    toast({ title: 'Form Cleared', description: 'You can now select a new .json file.'});
  };

  return (
    <div className="space-y-6">
      {!currentFileId && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">
              Choose a .json session file to share
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="file-upload"
                name="file"
                type="file"
                accept=".json" // Changed from .txt
                required
                onChange={handleFileChange}
                ref={fileInputRef}
                className="flex-grow"
                disabled={isActionPending}
              />
               {selectedFileName && (
                <Button type="button" variant="ghost" size="icon" onClick={handleResetForm} disabled={isActionPending} aria-label="Clear selection">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedFileName && !isActionPending && (
              <p className="mt-2 text-sm text-muted-foreground">Selected: {selectedFileName}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isActionPending || !selectedFileName}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isUploadPending || isTransitionPending && !isDeletePending ? 'Sharing...' : 'Share Session File'}
          </Button>
        </form>
      )}

      {uploadFormState.error && !isActionPending && !currentFileId && (
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
              <FileJson className="h-5 w-5 mr-2" />
              <p className="font-semibold">Session file shared: <span className="font-bold">{currentFileName}</span></p>
            </div>
            
            <div>
              <Label htmlFor="share-link" className="text-xs font-medium">Shareable Download Link</Label>
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
                  onClick={() => copyToClipboard(`${window.location.origin}/download/${currentFileId}`, toast)}
                  aria-label="Copy link"
                  disabled={isActionPending}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" asChild aria-label="Open link" disabled={isActionPending}>
                  <Link href={`/download/${currentFileId}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
             <form onSubmit={handleDeleteSubmit} className="pt-2">
                <input type="hidden" name="fileId" value={currentFileId} />
                <Button type="submit" variant="destructive" className="w-full" disabled={isActionPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeletePending || (isTransitionPending && !isUploadPending) ? 'Deleting...' : 'Delete This Session File'}
                </Button>
              </form>
              {deleteFormState.error && !isActionPending && ( // Show only if not pending and error exists
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

function copyToClipboard(text: string, toast: (options: any) => void) {
  navigator.clipboard.writeText(text).then(() => {
    toast({ title: 'Link Copied!', description: 'Shareable link copied to clipboard.' });
  }).catch(err => {
    toast({ title: 'Copy Failed', description: 'Could not copy link to clipboard.', variant: 'destructive' });
    console.error('Failed to copy text: ', err);
  });
}
