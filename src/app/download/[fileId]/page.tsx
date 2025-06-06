import { getFileMetadataFromStore } from '@/lib/file-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileJson, AlertTriangle, ArrowLeft } from 'lucide-react'; // Changed FileText to FileJson
import Link from 'next/link';
// import { format } from 'date-fns'; // No longer needed directly here
import { ClientDateTime } from '@/components/client-datetime';


interface DownloadPageProps {
  params: {
    fileId: string;
  };
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const fileMetadata = getFileMetadataFromStore(params.fileId);

  if (!fileMetadata) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center text-destructive mb-3">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl">Session File Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The session file you are looking for does not exist or may have been removed.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Homepage
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const fileSizeKB = (fileMetadata.size / 1024).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center bg-secondary/30 rounded-t-lg py-8">
          <div className="flex justify-center items-center mb-4 text-primary">
            <FileJson className="h-12 w-12" /> {/* Changed Icon */}
          </div>
          <CardTitle className="text-2xl font-semibold">{fileMetadata.fileName}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Ready for download
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="text-sm">
            <p><strong>File Name:</strong> {fileMetadata.fileName}</p>
            <p><strong>File Size:</strong> {fileSizeKB} KB</p>
            <p><strong>Uploaded:</strong> <ClientDateTime date={fileMetadata.uploadedAt} /></p>
          </div>
          <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <a href={`/api/download/${params.fileId}`} download={fileMetadata.fileName}>
              <Download className="mr-2 h-4 w-4" />
              Download Session File
            </a>
          </Button>
        </CardContent>
         <CardFooter className="flex justify-center pt-0 pb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Share Another Session File {/* Updated Text */}
              </Link>
            </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
