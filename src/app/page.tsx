import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Share2, FileJson } from 'lucide-react'; // Added FileJson for better icon
import HomeTabs from '@/components/home-tabs';
import { getLatestSharedFileMetadataAction } from '@/app/actions';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export default async function HomePage() {
  const latestFileResult = await getLatestSharedFileMetadataAction();
  const initialLatestFile = latestFileResult.file; 

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-secondary/30 rounded-t-lg py-8">
          <div className="flex justify-center items-center mb-4">
            <FileJson className="h-12 w-12 text-primary" /> {/* Changed Icon */}
          </div>
          <CardTitle className="text-3xl font-bold">SessionShare</CardTitle> {/* Changed Title */}
          <CardDescription className="text-md text-muted-foreground pt-1">
            Share .json session files quickly and securely. {/* Changed Description */}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <HomeTabs initialLatestFile={initialLatestFile} />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-8">
        SessionShare: Simple, fast, and secure session file sharing. {/* Changed Text */}
        <br />
        Remember: Shared files are temporary and stored in memory on the server.
      </p>
    </div>
  );
}
