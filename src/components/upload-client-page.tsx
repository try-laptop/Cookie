'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { uploadFile, type UploadResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UploadCloud, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const initialState: UploadResponse = {
  success: false,
};

export default function UploadClientPage() {
  const [formState, formAction] = useFormState(uploadFile, initialState);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(false); // Reset loading state when formState changes
    if (formState.error) {
      // Error is handled by the Alert component below
    } else if (formState.success && formState.fileId) {
      toast({
        title: 'Upload Successful!',
        description: `${formState.fileName} has been uploaded.`,
        variant: 'default',
      });
      // Reset file input and selected file name
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFileName(null);
    }
  }, [formState, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName(null);
    }
  };
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    // Default form submission will be handled by formAction
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Link Copied!', description: 'Shareable link copied to clipboard.' });
    }).catch(err => {
      toast({ title: 'Copy Failed', description: 'Could not copy link to clipboard.', variant: 'destructive' });
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="space-y-6">
      <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Choose a .txt file
          </Label>
          <Input
            id="file-upload"
            name="file"
            type="file"
            accept=".txt"
            required
            onChange={handleFileChange}
            ref={fileInputRef}
            className="mt-1"
            disabled={isLoading}
          />
          {selectedFileName && !isLoading && (
            <p className="mt-2 text-sm text-muted-foreground">Selected file: {selectedFileName}</p>
          )}
        </div>
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
          <UploadCloud className="mr-2 h-4 w-4" />
          {isLoading ? 'Uploading...' : 'Upload File'}
        </Button>
      </form>

      {formState.error && !isLoading && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Failed</AlertTitle>
          <AlertDescription>{formState.error}</AlertDescription>
        </Alert>
      )}

      {formState.success && formState.fileId && formState.fileName && !isLoading && (
        <Card className="mt-6 bg-secondary/50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="font-semibold">File uploaded successfully!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your file <span className="font-medium">{formState.fileName}</span> is ready to be shared.
            </p>
            <div>
              <Label htmlFor="share-link" className="text-xs font-medium">Shareable Link</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="share-link"
                  type="text"
                  readOnly
                  value={`${window.location.origin}/download/${formState.fileId}`}
                  className="bg-background"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(`${window.location.origin}/download/${formState.fileId}`)}
                  aria-label="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                 <Button variant="outline" size="icon" asChild aria-label="Open link">
                  <Link href={`/download/${formState.fileId}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
