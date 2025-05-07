import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import HomeTabs from '@/components/home-tabs';
import { getLatestSharedFileMetadataAction } from '@/app/actions';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function HomePage() {
  const latestFileResult = await getLatestSharedFileMetadataAction();
  // We don't typically handle errors from server actions directly in page rendering this way,
  // but for initial data, it's okay. The client components will handle their own error states for actions.
  const initialLatestFile = latestFileResult.file; 

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-secondary/30 rounded-t-lg py-8">
          <div className="flex justify-center items-center mb-4">
            <Share2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">FileShare</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            Share .txt files quickly and securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <HomeTabs initialLatestFile={initialLatestFile} />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-8">
        FileShare: Simple, fast, and secure text file sharing.
        <br />
        Remember: Uploaded files are temporary and stored in memory on the server.
      </p>
    </div>
  );
}