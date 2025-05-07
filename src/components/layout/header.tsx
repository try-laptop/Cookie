// src/components/layout/header.tsx
'use client'; 

import Link from 'next/link';
import { FileJson, Package, Download as DownloadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExtensionManager from '@/components/extension-manager';
import { useEffect, useState } from 'react';
import { getExtensionFileMetadataAction, type StoredExtensionFile } from '@/app/actions';

export default function Header() {
  const [isExtensionManagerOpen, setIsExtensionManagerOpen] = useState(false);
  const [extensionFile, setExtensionFile] = useState<Omit<StoredExtensionFile, 'content'> | null>(null);
  const [isLoadingExtensionMeta, setIsLoadingExtensionMeta] = useState(true);

  const fetchExtensionMetadata = async () => {
    setIsLoadingExtensionMeta(true);
    try {
      const result = await getExtensionFileMetadataAction();
      if (result.file) {
        setExtensionFile(result.file);
      } else {
        setExtensionFile(null);
      }
    } catch (error) {
      console.error("Failed to fetch extension metadata:", error);
      setExtensionFile(null);
    }
    setIsLoadingExtensionMeta(false);
  };

  useEffect(() => {
    fetchExtensionMetadata();
  }, []);
  
  useEffect(() => {
    if (isExtensionManagerOpen) {
      fetchExtensionMetadata();
    }
  }, [isExtensionManagerOpen]);


  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileJson className="h-7 w-7" />
            SessionShare
          </Link>
          <div className="flex items-center gap-2">
            {!isLoadingExtensionMeta && extensionFile && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="bg-primary-foreground text-primary" // Removed hover:bg-primary-foreground/90
              >
                <a href="/api/download-extension" download={extensionFile.fileName}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Extension
                </a>
              </Button>
            )}
             <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExtensionManagerOpen(true)}
              className="bg-background text-foreground" // Override default outline hover
            >
              <Package className="mr-2 h-4 w-4" />
              Manage Extension
            </Button>
          </div>
        </div>
      </div>
      <ExtensionManager open={isExtensionManagerOpen} onOpenChange={setIsExtensionManagerOpen} />
    </header>
  );
}

