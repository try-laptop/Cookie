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
  
  const defaultTabValue = initialLatestFile ? "receiver" : "sender";
  const [activeTab, setActiveTab] = useState<string>(defaultTabValue);

  useEffect(() => {
    setLatestFile(initialLatestFile);
    // Keep current tab if user selected it, otherwise default based on file presence
    if (!initialLatestFile && activeTab === "receiver") {
      setActiveTab("sender");
    } else if (initialLatestFile && activeTab === "sender" && !latestFile) {
       // If a file was just uploaded (latestFile is null before this update)
       // and user was on sender tab, stay on sender.
       // If a file becomes available and user was on sender, but it's not from *this* user's immediate action,
       // then switch to receiver might be an option, but current logic is simpler.
       // Sticking to: if a file exists, default to receiver, else sender.
       // User can override by clicking tabs.
       setActiveTab("receiver");
    } else {
       setActiveTab(initialLatestFile ? "receiver" : "sender");
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLatestFile]);


  const handleUploadSuccess = (fileId: string, fileName: string) => {
    setLatestFile({ 
        id: fileId, 
        fileName: fileName, 
        mimeType: 'application/json', // Reflecting JSON file type
        size: 0, // Placeholder, actual size known by uploader
        uploadedAt: new Date() 
    });
    // setActiveTab("sender"); // Stay on sender tab as per original logic
    // After upload, the sender might want to see the link or delete option, so sender tab is fine.
    // Or, if we want to immediately show the receiver perspective:
    setActiveTab("receiver"); 
  };

  const handleDeleteSuccess = () => {
    setLatestFile(null);
    setActiveTab("sender"); 
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="sender">Share Session</TabsTrigger>
        <TabsTrigger value="receiver">Get Session</TabsTrigger>
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
