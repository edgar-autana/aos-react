import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import S3UploadZone from "./s3-upload-zone";

interface TwoDAnalysisUploadProps {
  onFileChange: (file: File | null) => void;
  onUploadComplete: (fileUrl: string) => void;
  file: File | null;
  isProcessing: boolean;
}

export default function TwoDAnalysisUpload({
  onFileChange,
  onUploadComplete,
  file,
  isProcessing,
}: TwoDAnalysisUploadProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <span className="mr-2">📄</span>
            2D Drawing Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <S3UploadZone
            accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
            label="2D CAD Drawing"
            description="Upload PDF, PNG, JPG, TIFF, or BMP files of technical drawings"
            icon={<span className="text-2xl text-primary">📄</span>}
            onFileChange={onFileChange}
            onUploadComplete={onUploadComplete}
            file={file}
            maxSize={15}
          />
        </CardContent>
      </Card>

      {file && !isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📤</span>
                <div>
                  <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                  <p className="text-sm text-muted-foreground">
                    {file.name} ({Math.round(file.size / 1024 / 1024 * 100) / 100} MB)
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => onUploadComplete('dummy-url')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="mr-2">🔍</span>
                Start Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl animate-spin">⚙️</span>
              <div>
                <h3 className="text-lg font-semibold">Processing...</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing your 2D drawing. This may take a few moments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 