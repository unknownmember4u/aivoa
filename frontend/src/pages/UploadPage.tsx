import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  File,
  X,
  Sparkles,
} from 'lucide-react';
import { PageHeader, Card, Button, Spinner, Badge } from '@/components/ui';
import { useUploadDocumentMutation, useProcessComplaintMutation } from '@/services/uploadApi';

type ProcessingState = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETE' | 'ERROR';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadDocument] = useUploadDocumentMutation();
  const [processComplaint] = useProcessComplaintMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.eml'];
  const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format (${ext}). Allowed formats: PDF, DOCX, TXT, EML.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size exceeds the 20MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB.`;
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (processingState !== 'IDLE') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (processingState === 'IDLE') {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const startUploadAndProcessing = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setProcessingState('UPLOADING');

    try {
      // Step 1: Upload document
      const formData = new FormData();
      formData.append('file', selectedFile);
      const docResponse = await uploadDocument(formData).unwrap();

      // Step 2: Automatically process document through LangGraph pipeline
      setProcessingState('PROCESSING');
      const processResponse = await processComplaint(docResponse.id).unwrap();

      setProcessingState('COMPLETE');

      // Step 3: Navigate to complaint review route
      setTimeout(() => {
        navigate('/complaints/review', {
          state: {
            extractedData: processResponse.extracted_data,
            documentId: docResponse.id,
            aiSummary: processResponse.ai_summary,
            riskLevel: processResponse.risk_level,
          },
        });
      }, 1200);
    } catch (err: unknown) {
      setProcessingState('ERROR');
      const errorObj = err as { status?: number | string; data?: { detail?: string } };
      if (errorObj?.status === 413 || errorObj?.status === 400) {
        setErrorMessage(errorObj?.data?.detail || 'File upload failed. Invalid file or size limit exceeded.');
      } else if (errorObj?.status === 422) {
        setErrorMessage(errorObj?.data?.detail || 'AI extraction failed. Unable to parse document fields.');
      } else if (errorObj?.status === 429) {
        setErrorMessage('AI rate limit exceeded. Please wait a moment and try again.');
      } else {
        setErrorMessage(errorObj?.data?.detail || 'An unexpected error occurred during upload or AI processing.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* PAGE HEADER */}
      <PageHeader
        title="Upload Complaint Document"
        subtitle="Upload a pharmaceutical complaint document for AI-assisted extraction and processing."
      />

      {/* CENTERED UPLOAD CONTAINER */}
      <div className="max-w-[720px] mx-auto">
        <Card className="p-8 sm:p-10 border-[#E2E8F0] shadow-sm">
          {/* INLINE ERROR BANNER */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Upload Error</span>
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* UPLOADING & PROCESSING PROGRESS CARD */}
          {processingState !== 'IDLE' && processingState !== 'ERROR' ? (
            <div className="py-10 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#2563EB]">
                {processingState === 'COMPLETE' ? (
                  <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
                ) : (
                  <Spinner size="lg" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                  {processingState === 'UPLOADING' && 'Uploading Document...'}
                  {processingState === 'PROCESSING' && 'Running AI Extraction Pipeline...'}
                  {processingState === 'COMPLETE' && 'Extraction Complete! Redirecting...'}
                </h3>
                <p className="text-xs text-[#64748B] mt-1.5 max-w-sm mx-auto">
                  {processingState === 'UPLOADING' &&
                    'Storing file securely and preparing magic-byte signature checks.'}
                  {processingState === 'PROCESSING' &&
                    'Parsing document text, extracting pharma fields via Groq LLM, and generating risk metrics.'}
                  {processingState === 'COMPLETE' &&
                    'Complaint state finalized. Redirecting to review queue.'}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                {processingState === 'UPLOADING' && <Badge variant="info">Step 1 of 2: Uploading</Badge>}
                {processingState === 'PROCESSING' && (
                  <Badge variant="warning" icon={<Sparkles className="w-3.5 h-3.5" />}>
                    Step 2 of 2: AI Processing
                  </Badge>
                )}
                {processingState === 'COMPLETE' && <Badge variant="success">Complete</Badge>}
              </div>
            </div>
          ) : (
            /* IDLE DROPZONE AREA */
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer select-none ${
                  isDragOver
                    ? 'border-[#2563EB] bg-blue-50/50'
                    : selectedFile
                    ? 'border-[#16A34A] bg-green-50/20'
                    : 'border-[#E2E8F0] hover:border-[#2563EB]/50 bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.eml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center mx-auto mb-4 text-[#2563EB]">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                  {selectedFile ? selectedFile.name : 'Drag & drop complaint file here'}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion`
                    : 'or click to browse from your computer'}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="text-[11px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-md">
                    PDF
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-md">
                    DOCX
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-md">
                    TXT
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-md">
                    EML
                  </span>
                </div>
              </div>

              {/* Selected File Details Bar */}
              {selectedFile && (
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A]">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <File className="w-5 h-5 text-[#2563EB] shrink-0" />
                    <span className="font-medium truncate">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-[#64748B] hover:text-[#DC2626] p-1 rounded-md hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Specification Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0] gap-2">
                <span>Maximum file size: 20 MB</span>
                <span>Server Signature & Validation Enforced</span>
              </div>

              {/* Submit Process Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={!selectedFile || processingState !== 'IDLE'}
                onClick={startUploadAndProcessing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Start AI Complaint Extraction
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
