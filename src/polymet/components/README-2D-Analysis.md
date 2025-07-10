# 2D Analysis Component Structure

This document describes the component structure for the 2D technical drawing analysis feature.

## Overview

The 2D analysis feature provides automated extraction of part information from technical drawings using a three-step process:
1. **S3 Upload** - Upload drawing files to cloud storage
2. **OCR Processing** - Extract text from drawings using OCR Space API
3. **AI Analysis** - Process extracted text with AI assistant for structured analysis

## Component Architecture

### Services Layer (`src/polymet/services/`)

#### `s3-upload-service.ts`
- Handles file uploads to AWS S3
- Uses presigned URLs for secure direct uploads
- Returns file URLs for downstream processing

#### `ocr-service.ts`
- Interfaces with OCR Space API
- Extracts text from PDF and image files
- Returns structured OCR results with confidence scores

#### `assistant-service.ts`
- Sends OCR results to AI assistant
- Provides structured analysis prompts
- Returns formatted part analysis data

### Hooks Layer (`src/polymet/hooks/`)

#### `use-2d-analysis.ts`
- Manages entire 2D analysis workflow
- Coordinates between all three services
- Provides state management and error handling
- Returns analysis state and actions

### Components Layer (`src/polymet/components/`)

#### `two-d-analysis-upload.tsx`
- Main component integrating the entire workflow
- Handles file upload, progress tracking, and result display
- Provides user interface for the complete process

#### `two-d-analysis-progress.tsx`
- Visual progress indicator for the three-step process
- Shows current step, progress percentage, and error states
- Provides real-time feedback during analysis

#### `two-d-analysis-result.tsx`
- Displays structured analysis results
- Shows part details, dimensions, tolerances, and instructions
- Provides formatted output for manufacturing use

## Data Flow

```
User Upload → S3 Service → OCR Service → Assistant Service → Results Display
     ↓              ↓            ↓              ↓              ↓
FileUploadZone → S3Upload → OCRProcessing → AIAnalysis → TwoDAnalysisResult
```

## Usage

### Basic Implementation

```tsx
import TwoDAnalysisUpload from "@/polymet/components/two-d-analysis-upload";

function MyPage() {
  return (
    <div>
      <h1>2D Drawing Analysis</h1>
      <TwoDAnalysisUpload />
    </div>
  );
}
```

### Advanced Usage with Custom Hook

```tsx
import { use2DAnalysis } from "@/polymet/hooks/use-2d-analysis";

function CustomAnalysis() {
  const {
    file,
    isProcessing,
    currentStep,
    progress,
    error,
    analysisResult,
    setFile,
    startAnalysis,
    reset,
  } = use2DAnalysis();

  // Custom implementation
}
```

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_OCR_SPACE_API_KEY=your_ocr_space_api_key
```

### API Endpoints

The system expects these backend endpoints:

- `POST /api/s3/presigned-url` - Get S3 presigned URL
- `POST /api/assistant/analyze-2d` - AI analysis endpoint

## File Types Supported

- **PDF**: Technical drawings in PDF format
- **Images**: PNG, JPG, JPEG, TIFF, BMP formats

## Analysis Output

The system extracts and structures:

- **Part Information**: Name, part number, dimensions
- **Material Details**: Raw material, weight, surface finish
- **Tolerances**: General and critical tolerances
- **Instructions**: Machining instructions and requirements
- **Complexity Assessment**: Low/Medium/High complexity rating
- **Notes**: Important manufacturing notes

## Error Handling

The system provides comprehensive error handling:

- **Upload Errors**: Network issues, file validation
- **OCR Errors**: API failures, unsupported formats
- **Analysis Errors**: AI processing failures
- **User Feedback**: Clear error messages and retry options

## Performance Considerations

- **File Size**: Recommended max 10MB for optimal processing
- **Processing Time**: Typically 30-60 seconds for complete analysis
- **Caching**: Results can be cached for repeated access
- **Progress Tracking**: Real-time progress updates for user feedback

## Future Enhancements

- **Batch Processing**: Multiple file analysis
- **Custom Templates**: Industry-specific analysis templates
- **Export Options**: PDF reports, CAD integration
- **Advanced OCR**: Hand-drawn sketch recognition
- **3D Integration**: Combine with 3D model analysis 