import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  File,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader, Card, Button, Spinner } from '@/components/ui';
import { useUploadDocumentMutation, useProcessComplaintMutation } from '@/services/uploadApi';

type ProcessingState = 'IDLE' | 'UPLOADING' | 'PARSING' | 'EXTRACTING' | 'VALIDATING' | 'ASSESSING' | 'COMPLETE' | 'ERROR';

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

  const pipelineSteps = [
    { id: 'UPLOADING', label: 'Upload', desc: 'Secure S3 transmission' },
    { id: 'PARSING', label: 'Parsing', desc: 'Magic-byte & text OCR' },
    { id: 'EXTRACTING', label: 'AI Extraction', desc: 'Groq LLM field identification' },
    { id: 'VALIDATING', label: 'Validation', desc: 'Grounded schema check' },
    { id: 'ASSESSING', label: 'Risk Assessment', desc: '21 CFR risk scoring' },
    { id: 'COMPLETE', label: 'Ready', desc: 'Finalized for review' },
  ];

  const getCurrentStepIndex = () => {
    switch (processingState) {
      case 'UPLOADING': return 0;
      case 'PARSING': return 1;
      case 'EXTRACTING': return 2;
      case 'VALIDATING': return 3;
      case 'ASSESSING': return 4;
      case 'COMPLETE': return 5;
      default: return -1;
    }
  };

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

      // Step 2: Transition through pipeline steps for visual feedback
      setProcessingState('PARSING');
      await new Promise((r) => setTimeout(r, 400));
      
      setProcessingState('EXTRACTING');
      const processResponse = await processComplaint(docResponse.id).unwrap();

      setProcessingState('VALIDATING');
      await new Promise((r) => setTimeout(r, 300));

      setProcessingState('ASSESSING');
      await new Promise((r) => setTimeout(r, 300));

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
      }, 1000);
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

  const activeStepIdx = getCurrentStepIndex();

  return (
    <div className="space-y-8 max-w-[840px] mx-auto pb-10">
      {/* PAGE HEADER */}
      <PageHeader
        title="Upload Complaint Document"
        subtitle="Ingest PDF, DOCX, TXT, or EML complaint documents for AI automated extraction."
      />

      {/* CENTERED UPLOAD & PIPELINE CARD */}
      <Card className="p-8 sm:p-10 border-[#E2E8F0] shadow-sm">
        {/* INLINE ERROR BANNER */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800"
          >
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Upload Error</span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PROCESSING PIPELINE VISUALIZATION */}
        {processingState !== 'IDLE' && processingState !== 'ERROR' ? (
          <div className="py-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#2563EB] shadow-xs">
                {processingState === 'COMPLETE' ? (
                  <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
                ) : (
                  <Spinner size="lg" />
                )}
              </div>

              <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                {processingState === 'UPLOADING' && 'Uploading Complaint File...'}
                {processingState === 'PARSING' && 'Parsing Document Layout...'}
                {processingState === 'EXTRACTING' && 'Running Groq AI Extraction...'}
                {processingState === 'VALIDATING' && 'Validating Schema & Fields...'}
                {processingState === 'ASSESSING' && 'Evaluating Regulatory Risk...'}
                {processingState === 'COMPLETE' && 'Extraction Finalized! Redirecting...'}
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Automatic pharmaceutical complaint ingestion pipeline. Please wait while AI extracts structured fields.
              </p>
            </div>

            {/* Step-by-Step Progress Pipeline */}
            <div className="bg-slate-50 border border-[#E2E8F0] p-6 rounded-2xl space-y-4">
              <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider block">
                Ingestion Pipeline Status
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {pipelineSteps.map((step, idx) => {
                  const isDone = activeStepIdx > idx;
                  const isCurrent = activeStepIdx === idx;
                  return (
                    <div
                      key={step.id}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isDone
                          ? 'bg-emerald-50/80 border-emerald-200 text-[#16A34A]'
                          : isCurrent
                          ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-xs ring-2 ring-[#2563EB]/20'
                          : 'bg-white border-[#E2E8F0] text-[#94A3B8]'
                      }`}
                    >
                      <span className="font-mono text-[10px] block mb-1 font-semibold">
                        Step 0{idx + 1}
                      </span>
                      <span className="font-bold text-xs block truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-[#2563EB] h-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: `${((activeStepIdx + 1) / pipelineSteps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
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
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer select-none ${
                isDragOver
                  ? 'border-[#2563EB] bg-blue-50/50 shadow-md'
                  : selectedFile
                  ? 'border-[#22C55E] bg-emerald-50/20'
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

              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center mx-auto mb-4 text-[#2563EB]">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                {selectedFile ? selectedFile.name : 'Drag & drop complaint file here'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction`
                  : 'or click anywhere to browse from your computer'}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {['PDF', 'DOCX', 'TXT', 'EML'].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-[11px] font-semibold text-[#475569] bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg shadow-xs"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected File Details Bar */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-[#E2E8F0] rounded-2xl text-xs text-[#0F172A]">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg shrink-0">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold block truncate">{selectedFile.name}</span>
                    <span className="text-[11px] text-[#64748B]">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Validated
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-[#64748B] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Specification Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0] gap-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                21 CFR Part 11 Audit Trail Enabled
              </span>
              <span>Max size: 20 MB</span>
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
  );
};
