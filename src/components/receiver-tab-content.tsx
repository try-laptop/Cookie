'use client';

import type { StoredFile } from '@/lib/file-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Info, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEffect, useState, useTransition } from 'react';
import { getLatestSharedFileMetadataAction, type FileMetadataResponse } from '@/app/actions';
import { Skeleton } from './ui/skeleton';

interface ReceiverTabContentProps {
  initialFileMetadata: Omit<StoredFile, 'content'> | null;
}

export default function ReceiverTabContent({ initialFileMetadata }: ReceiverTabContentProps) {
  const [fileMetadata, setFileMetadata] = useState<Omit<StoredFile, 'content'> | null>(initialFileMetadata);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fetchLatestFile = () => {
    startTransition(async () => {
      setError(null);
      const response = await getLatestSharedFileMetadataAction();
      if (response.error) {
        setError(response.error);
        setFileMetadata(null);
      } else {
        setFileMetadata(response.file);
      }
    });
  };

  // Effect to re-fetch when the component might have become visible or needs refresh
  // This is a simple example; a more robust solution might use polling, WebSockets, or a library like SWR/React Query
  useEffect(() => {
     // If initial data is stale or user wants to refresh
     // For now, we rely on initial prop and manual refresh.
     // If you want periodic refresh:
     // const intervalId = setInterval(fetchLatestFile, 30000); // Refresh every 30 seconds
     // return () => clearInterval(intervalId);
  }, []);
  
  // Update state if initial prop changes (e.g., parent component re-fetched and passed new prop)
  useEffect(() => {
    setFileMetadata(initialFileMetadata);
  }, [initialFileMetadata]);


  if (isPending && !fileMetadata) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full mt-2" />
        </CardContent>
        <CardFooter className="flex justify-end p-4">
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="flex justify-center text-destructive mb-3">
            <Info className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button onClick={fetchLatestFile} variant="outline" disabled={isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> Try Again
            </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!fileMetadata) {
    return (
      <Card className="shadow-lg text-center">
        <CardHeader>
          <div className="flex justify-center text-primary mb-3">
            <Info className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">No File Shared</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The sender has not shared any file yet, or the previously shared file has been removed.
          </p>
        </CardContent>
         <CardFooter className="flex justify-center">
            <Button onClick={fetchLatestFile} variant="outline" disabled={isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> Check for New File
            </Button>
        </CardFooter>
      </Card>
    );
  }

  const fileSizeKB = (fileMetadata.size / 1024).toFixed(2);

  return (
    <div className="w-full">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-secondary/30 rounded-t-lg py-8">
          <div className="flex justify-center items-center mb-4 text-primary">
            <FileText className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-semibold">{fileMetadata.fileName}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            A file has been shared with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-sm space-y-1">
            <p><strong>File Name:</strong> {fileMetadata.fileName}</p>
            <p><strong>File Size:</strong> {fileSizeKB} KB</p>
            <p><strong>Shared:</strong> {format(new Date(fileMetadata.uploadedAt), "MMMM d, yyyy 'at' h:mm a")}</p>
          </div>
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <a href={`/api/download/${fileMetadata.id}`} download={fileMetadata.fileName}>
              <Download className="mr-2 h-4 w-4" />
              Download File
            </a>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0">
             <Button onClick={fetchLatestFile} variant="outline" size="sm" disabled={isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} /> Refresh
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}