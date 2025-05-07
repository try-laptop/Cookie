// src/components/extension-manager.tsx
'use client';

import React, { useState, useEffect, useRef, useTransition, useActionState as useReactActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { UploadCloud, AlertCircle, Download, Trash2, Info, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  uploadExtensionAction, type UploadExtensionResponse, 
  deleteExtensionAction, type DeleteExtensionResponse,
  getExtensionFileMetadataAction, type ExtensionMetadataResponse,
  type StoredExtensionFile
} from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { ClientDateTime } from './client-datetime';

const initialUploadState: UploadExtensionResponse = { success: false };
const initialDeleteState: DeleteExtensionResponse = { success: false };

interface ExtensionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExtensionManager({ open, onOpenChange }: ExtensionManagerProps) {
  const [uploadFormState, uploadFormAction, isUploadPending] = useReactActionState(uploadExtensionAction, initialUploadState);
  const [deleteFormState, deleteFormAction, isDeletePending] = useReactActionState(deleteExtensionAction, initialDeleteState);
  
  const [extensionMetadata, setExtensionMetadata] = useState<Omit<StoredExtensionFile, 'content'> | null>(null);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isTransitionPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchMetadata = async () => {
    setIsFetchingMetadata(true);
    const result = await getExtensionFileMetadataAction();
    if (result.file) {
      setExtensionMetadata(result.file);
    } else {
      setExtensionMetadata(null);
    }
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsFetchingMetadata(false);
  };

  useEffect(() => {
    if (open) {
      fetchMetadata();
    }
  }, [open]);

  useEffect(() => {
    if (uploadFormState.error) {
      toast({ title: 'Upload Failed', description: uploadFormState.error, variant: 'destructive' });
    } else if (uploadFormState.success && uploadFormState.fileName) {
      toast({ title: 'Upload Successful!', description: `${uploadFormState.fileName} has been uploaded.` });
      setSelectedFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMetadata(); // Refresh metadata
    }
  }, [uploadFormState, toast]);

  useEffect(() => {
    if (deleteFormState.error) {
      toast({ title: 'Delete Failed', description: deleteFormState.error, variant: 'destructive' });
    } else if (deleteFormState.success) {
      toast({ title: 'Extension Deleted', description: deleteFormState.message });
      setExtensionMetadata(null);
      fetchMetadata(); // Refresh metadata
    }
  }, [deleteFormState, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file ? file.name : null);
  };

  const handleUploadSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => uploadFormAction(formData));
  };

  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); // Though formData is not used for delete, keep for consistency
    startTransition(() => deleteFormAction(formData));
  };

  const isActionPending = isUploadPending || isDeletePending || isTransitionPending;
  const fileSizeKB = extensionMetadata ? (extensionMetadata.size / 1024).toFixed(2) : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center"><Package className="mr-2 h-5 w-5" />Manage Extension</DialogTitle>
          <DialogDescription>
            Upload, download, or delete the Chrome extension ZIP file. Only one extension can be stored at a time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {isFetchingMetadata && (
            <div className="space-y-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          )}

          {!isFetchingMetadata && extensionMetadata && (
            <div className="p-4 border rounded-md bg-secondary/30 space-y-3">
              <h3 className="font-semibold text-lg">{extensionMetadata.fileName}</h3>
              <p className="text-sm text-muted-foreground">
                Size: {fileSizeKB} KB
              </p>
              <p className="text-sm text-muted-foreground">
                Uploaded: <ClientDateTime date={extensionMetadata.uploadedAt} />
              </p>
              <div className="flex space-x-2 mt-2">
                <Button asChild className="flex-1">
                  <a href="/api/download-extension" download={extensionMetadata.fileName}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
                <form onSubmit={handleDeleteSubmit} className="flex-1">
                  <Button type="submit" variant="destructive" className="w-full" disabled={isActionPending}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </form>
              </div>
               {deleteFormState.error && !isActionPending && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Delete Failed</AlertTitle>
                  <AlertDescription>{deleteFormState.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!isFetchingMetadata && !extensionMetadata && (
            <div className="p-4 border rounded-md text-center">
              <Info className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No extension file has been uploaded yet.</p>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4 border-t">
            <div>
              <Label htmlFor="extension-file-upload" className="text-sm font-medium">
                {extensionMetadata ? 'Replace Extension File (.zip)' : 'Upload Extension File (.zip)'}
              </Label>
              <Input
                id="extension-file-upload"
                name="extensionFile"
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                required
                onChange={handleFileChange}
                ref={fileInputRef}
                className="mt-1"
                disabled={isActionPending}
              />
              {selectedFileName && (
                <p className="mt-1 text-xs text-muted-foreground">Selected: {selectedFileName}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isActionPending || !selectedFileName}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {isUploadPending || (isTransitionPending && !isDeletePending) ? 'Uploading...' : 'Upload Extension'}
            </Button>
             {uploadFormState.error && !isActionPending && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{uploadFormState.error}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
