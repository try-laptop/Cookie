import UploadClientPage from '@/components/upload-client-page';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Share2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-secondary/30 rounded-t-lg py-8">
          <div className="flex justify-center items-center mb-4">
            <Share2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Share Your Text Files</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            Upload a .txt file and get a unique link to share it instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <UploadClientPage />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-8">
        FileShare: Simple, fast, and secure text file sharing.
      </p>
    </div>
  );
}
