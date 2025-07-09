# 2D & 3D Analysis Components

This document describes the analysis components for both 2D drawings and 3D models, each with integrated S3 upload functionality.

## Overview

The analysis system provides two main components:
- **2D Analysis**: Processes technical drawings using OCR and AI
- **3D Analysis**: Analyzes 3D CAD models for geometry and manufacturing insights

Both components use a shared S3 upload system for secure file handling.

## Component Architecture

### Shared Components

#### `s3-upload-zone.tsx`
- **Purpose**: Reusable S3 upload component with drag-and-drop functionality
- **Features**:
  - File validation (type and size)
  - Progress tracking
  - Error handling
  - Success feedback
  - Presigned URL upload to S3

#### `two-d-analysis.tsx`
- **Purpose**: Complete 2D drawing analysis workflow
- **Features**:
  - S3 upload integration
  - OCR processing
  - AI analysis
  - Results display
  - Export functionality

#### `three-d-analysis.tsx`
- **Purpose**: Complete 3D model analysis workflow
- **Features**:
  - S3 upload integration
  - Geometry analysis
  - Feature detection
  - Cost estimation
  - Machining strategy generation

## File Support

### 2D Analysis Supported Formats
- **PDF**: Technical drawings
- **Images**: PNG, JPG, JPEG, TIFF, BMP
- **Max Size**: 15MB

### 3D Analysis Supported Formats
- **STEP**: .stp, .step
- **STL**: .stl
- **OBJ**: .obj
- **IGES**: .iges, .igs
- **Parasolid**: .x_t, .x_b
- **Max Size**: 50MB

## Usage Examples

### Basic 2D Analysis Implementation

```tsx
import TwoDAnalysis from "@/polymet/components/two-d-analysis";

function MyPage() {
  return (
    <div className="container mx-auto py-6">
      <TwoDAnalysis />
    </div>
  );
}
```

### Basic 3D Analysis Implementation

```tsx
import ThreeDAnalysis from "@/polymet/components/three-d-analysis";

function MyPage() {
  return (
    <div className="container mx-auto py-6">
      <ThreeDAnalysis />
    </div>
  );
}
```

### Combined Analysis Page

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TwoDAnalysis from "@/polymet/components/two-d-analysis";
import ThreeDAnalysis from "@/polymet/components/three-d-analysis";

function AnalysisPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Technical Analysis</h1>
      
      <Tabs defaultValue="2d" className="space-y-4">
        <TabsList>
          <TabsTrigger value="2d">2D Drawing Analysis</TabsTrigger>
          <TabsTrigger value="3d">3D Model Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="2d">
          <TwoDAnalysis />
        </TabsContent>
        
        <TabsContent value="3d">
          <ThreeDAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## API Endpoints Required

### S3 Upload
```typescript
POST /api/s3/presigned-url
{
  fileName: string;
  fileType: string;
  bucket: string;
}
// Returns: { presignedUrl: string }
```

### 2D Analysis
```typescript
POST /api/ocr/process
{
  fileUrl: string;
  language: string;
  engine: string;
}
// Returns: { text: string; confidence: number }

POST /api/assistant/analyze-2d
{
  ocrText: string;
  fileUrl: string;
  analysisType: string;
}
// Returns: { analysis: TwoDAnalysisResult }
```

### 3D Analysis
```typescript
POST /api/3d/analyze
{
  fileUrl: string;
  analysisType: string;
  includeFeatures: boolean;
  includeCosting: boolean;
}
// Returns: { analysis: ThreeDAnalysisResult }
```

## Data Structures

### 2D Analysis Result
```typescript
interface TwoDAnalysisResult {
  partName: string;
  partNumber: string;
  dimensions: {
    height: number;
    width: number;
    length: number;
    unit: string;
  };
  weight?: number;
  weightUnit?: string;
  rawMaterial?: string;
  instructions: string[];
  surfaceFinish?: string;
  summary: string;
  complexity: 'Low' | 'Medium' | 'High';
  tolerances: {
    general: string;
    critical: string[];
  };
  notes: string[];
}
```

### 3D Analysis Result
```typescript
interface ThreeDAnalysisResult {
  partName: string;
  partNumber: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  volume: number;
  surfaceArea: number;
  weight: number;
  weightUnit: string;
  material: string;
  complexity: 'Low' | 'Medium' | 'High';
  features: {
    holes: number;
    threads: number;
    pockets: number;
    fillets: number;
    chamfers: number;
  };
  machiningStrategy: {
    approach: string;
    tooling: string[];
    fixturing: string;
    estimatedTime: number;
  };
  costEstimation: {
    materialCost: number;
    machiningCost: number;
    totalCost: number;
    currency: string;
  };
  recommendations: string[];
}
```

## Configuration

### Environment Variables
```env
# S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=polymet-uploads

# OCR Configuration
NEXT_PUBLIC_OCR_SPACE_API_KEY=your_ocr_api_key

# AI Assistant Configuration
OPENAI_API_KEY=your_openai_api_key
```

### S3 Bucket Setup
1. Create an S3 bucket for file uploads
2. Configure CORS policy for web uploads
3. Set up IAM permissions for presigned URLs
4. Configure bucket lifecycle for file cleanup

## Error Handling

Both components provide comprehensive error handling:

- **Upload Errors**: Network issues, file validation failures
- **Processing Errors**: API failures, unsupported formats
- **Analysis Errors**: AI processing failures
- **User Feedback**: Clear error messages with retry options

## Performance Considerations

### 2D Analysis
- **Processing Time**: 30-60 seconds
- **File Size Limit**: 15MB
- **OCR Accuracy**: Depends on drawing quality

### 3D Analysis
- **Processing Time**: 60-120 seconds
- **File Size Limit**: 50MB
- **Complexity**: Based on feature count and geometry

## Security Features

- **Presigned URLs**: Secure direct upload to S3
- **File Validation**: Type and size restrictions
- **Temporary URLs**: Time-limited access to uploaded files
- **Bucket Policies**: Restricted access to uploaded content

## Future Enhancements

### 2D Analysis
- **Batch Processing**: Multiple file analysis
- **Drawing Templates**: Industry-specific analysis
- **Advanced OCR**: Hand-drawn sketch recognition
- **CAD Integration**: Direct CAD file processing

### 3D Analysis
- **Assembly Analysis**: Multi-part assemblies
- **Tolerance Analysis**: GD&T interpretation
- **Manufacturing Simulation**: Virtual machining
- **Cost Optimization**: Alternative material suggestions

### Shared Features
- **Progress Persistence**: Resume interrupted analysis
- **Result Caching**: Avoid re-processing
- **Collaboration**: Share analysis results
- **Export Formats**: PDF reports, Excel sheets 