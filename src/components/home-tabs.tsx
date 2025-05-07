'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadClientPage from '@/components/upload-client-page';
import ReceiverTabContent from '@/components/receiver-tab-content';
import type { StoredFile } from '@/lib/file-store';
import { useState, useEffect } from 'react';

interface HomeTabsProps {
  initialLatestFile: Omit<StoredFile, 'content'> | null;
}

export default function HomeTabs({ initialLatestFile }: HomeTabsProps) {
  const [latestFile, setLatestFile] = useState<Omit<StoredFile, 'content'> | null>(initialLatestFile);
  
  // Determine default tab based on whether a file is initially available
  const defaultTabValue = initialLatestFile ? "receiver" : "sender";
  const [activeTab, setActiveTab] = useState<string>(defaultTabValue);

  useEffect(() => {
    setLatestFile(initialLatestFile);
    setActiveTab(initialLatestFile ? "receiver" : "sender");
  }, [initialLatestFile]);

  const handleUploadSuccess = (fileId: string, fileName: string) => {
    // Simulate fetching new latest file metadata or update directly
    // For simplicity, we'll update local state. A more robust way would be to re-fetch.
    setLatestFile({ 
        id: fileId, 
        fileName: fileName, 
        // These are approximations or could be part of upload response
        mimeType: 'text/plain', 
        size: 0, // Placeholder, actual size known by uploader
        uploadedAt: new Date() 
    });
    setActiveTab("sender"); // Stay on sender tab to see delete option or upload another
  };

  const handleDeleteSuccess = () => {
    setLatestFile(null);
    setActiveTab("sender"); // After deleting, default to sender tab
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="sender">Sender</TabsTrigger>
        <TabsTrigger value="receiver">Receiver</TabsTrigger>
      </TabsList>
      <TabsContent value="sender">
        <UploadClientPage 
          onUploadSuccess={handleUploadSuccess} 
          onDeleteSuccess={handleDeleteSuccess}
          latestFileId={latestFile?.id}
          latestFileName={latestFile?.fileName}
        />
      </TabsContent>
      <TabsContent value="receiver">
        <ReceiverTabContent initialFileMetadata={latestFile} />
      </TabsContent>
    </Tabs>
  );
}