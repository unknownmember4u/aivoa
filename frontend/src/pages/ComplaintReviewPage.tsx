import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Sparkles,
  Send,
  X,
} from 'lucide-react';
import {
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Modal,
} from '@/components/ui';
import { useSubmitComplaintMutation } from '@/services/complaintApi';
import { useUploadDocumentMutation, useProcessComplaintMutation } from '@/services/uploadApi';
import { useSendChatMessageMutation } from '@/services/chatApi';

// Zod Validation Schema matching backend rules
const reviewSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  complaint_source: z.string().min(1, 'Complaint source is required'),
  product_name: z.string().min(1, 'Product name is required'),
  strength_grade: z.string().optional(),
  batch_number: z.string().min(1, 'Batch number is required'),
  manufacturing_date: z.string().optional(),
  expiry_date: z.string().optional(),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative').optional(),
  complaint_type: z.string().min(1, 'Complaint type is required'),
  complaint_description: z.string().min(1, 'Complaint description is required'),
  complaint_date: z.string().min(1, 'Complaint date is required'),
  severity: z.string().min(1, 'Severity is required'),
  priority: z.string().min(1, 'Priority is required'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface NavigationState {
  documentId?: string;
  extractedData?: Record<string, any>;
  aiSummary?: string;
  riskLevel?: string;
}

export const ComplaintReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const state = (location.state as NavigationState) || {};

  // RTK Query hooks
  const [submitComplaint, { isLoading: isSubmitting }] = useSubmitComplaintMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const [processComplaint] = useProcessComplaintMutation();

  const [sendChatMessage, { isLoading: isSendingChat }] = useSendChatMessageMutation();

  // Local component states
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [extractionProgress, setExtractionProgress] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const extracted = state.extractedData || {};

  // Custom Zod Resolver
  const zodResolver = (data: Record<string, unknown>) => {
    const result = reviewSchema.safeParse(data);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0] as string] = { type: 'validation', message: err.message };
      }
    });
    return { values: {}, errors };
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver,
    defaultValues: {
      customer_name: extracted.customer_name || '',
      complaint_source: extracted.complaint_source || 'EMAIL',
      product_name: extracted.product_name || '',
      strength_grade: extracted.strength_grade || '',
      batch_number: extracted.batch_number || '',
      manufacturing_date: extracted.manufacturing_date || '',
      expiry_date: extracted.expiry_date || '',
      quantity: extracted.quantity || 0,
      complaint_type: extracted.complaint_type || 'Discoloration / Particle Defect',
      complaint_description: extracted.complaint_description || '',
      complaint_date: extracted.complaint_date || new Date().toISOString().split('T')[0],
      severity: extracted.severity || 'MAJOR',
      priority: extracted.priority || 'MEDIUM',
    },
  });

  // Reset form handler
  const handleResetForm = () => {
    reset({
      customer_name: '',
      complaint_source: 'EMAIL',
      product_name: '',
      strength_grade: '',
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      quantity: 0,
      complaint_type: '',
      complaint_description: '',
      complaint_date: new Date().toISOString().split('T')[0],
      severity: 'MAJOR',
      priority: 'MEDIUM',
    });
  };

  // Submit Handler
  const onSubmit = async (data: ReviewFormData) => {
    setApiError(null);
    try {
      await submitComplaint({
        complaintData: {
          ...data,
          risk_level: state.riskLevel || 'MEDIUM',
          ai_summary: state.aiSummary || '',
        },
        documentId: state.documentId,
      }).unwrap();

      navigate('/complaints');
    } catch (err: unknown) {
      const errorObj = err as { status?: number | string; data?: { detail?: string } };
      setApiError(
        errorObj?.data?.detail || 'Failed to submit complaint. Please check form validation errors.'
      );
    }
  };

  // Document Upload & AI Processing Handler
  const handleFileUpload = async (file: File) => {
    setApiError(null);
    setIsExtracting(true);
    setExtractionProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setExtractionProgress(35);
      const docResponse = await uploadDocument(formData).unwrap();

      setExtractionProgress(65);
      const processResponse = await processComplaint(docResponse.id).unwrap();

      setExtractionProgress(100);

      // Populate extracted fields into form
      if (processResponse.extracted_data) {
        const ext = processResponse.extracted_data as Record<string, any>;
        if (ext.customer_name) setValue('customer_name', String(ext.customer_name));
        if (ext.complaint_source) setValue('complaint_source', String(ext.complaint_source));
        if (ext.product_name) setValue('product_name', String(ext.product_name));
        if (ext.strength_grade) setValue('strength_grade', String(ext.strength_grade));
        if (ext.batch_number) setValue('batch_number', String(ext.batch_number));
        if (ext.manufacturing_date) setValue('manufacturing_date', String(ext.manufacturing_date));
        if (ext.expiry_date) setValue('expiry_date', String(ext.expiry_date));
        if (ext.quantity) setValue('quantity', Number(ext.quantity) || 0);
        if (ext.complaint_type) setValue('complaint_type', String(ext.complaint_type));
        if (ext.complaint_description) setValue('complaint_description', String(ext.complaint_description));
        if (ext.severity) setValue('severity', String(ext.severity));
        if (ext.priority) setValue('priority', String(ext.priority));
      }

      setTimeout(() => {
        setIsExtracting(false);
      }, 800);
    } catch (err: unknown) {
      setIsExtracting(false);
      const errorObj = err as { data?: { detail?: string } };
      setApiError(errorObj?.data?.detail || 'AI Extraction failed. Please verify document contents.');
    }
  };

  // Paste Text Extractor
  const handlePastedTextExtraction = () => {
    if (!pastedText.trim()) return;
    setValue('complaint_description', pastedText.trim());
    setIsPasteModalOpen(false);
    setPastedText('');
  };

  // Chat message send handler
  const handleSendChat = async () => {
    if (!chatInput.trim() || !state.documentId || isSendingChat) return;
    const msg = chatInput.trim();
    setChatInput('');
    try {
      await sendChatMessage({
        complaintId: state.documentId,
        question: msg,
      }).unwrap();
    } catch (err) {
      // Ignore chat error in UI
    }
  };

  return (
    <div className="bg-[#F5F7FB] min-h-screen p-4 sm:p-6 lg:p-8 font-sans pb-16">
      {/* GLOBAL TOP ERROR ALERT */}
      {apiError && (
        <div
          role="alert"
          className="mb-6 max-w-7xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800"
        >
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Form Action Error</span>
            <span>{apiError}</span>
          </div>
          <button onClick={() => setApiError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN 2-PANEL LAYOUT CONTAINER */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ========================================================= */}
        {/* LEFT PANEL (≈65% WIDTH / 8 COLS DESKTOP) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="p-6 sm:p-8 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm flex-1 flex flex-col justify-between">
            <div>
              {/* HEADER SECTION */}
              <div className="flex items-start justify-between pb-6 border-b border-[#E5E7EB] mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
                    Log Customer Complaint
                  </h1>
                  <p className="text-sm text-[#6B7280] mt-1 font-normal">
                    API & FDF Quality Assurance Module
                  </p>
                </div>

                {/* Top Right Orange Pill Badge */}
                <span className="bg-amber-50 text-[#D97706] border border-amber-200 px-3.5 py-1 text-xs font-semibold rounded-full shrink-0">
                  Pending Triage
                </span>
              </div>

              {/* FORM WRAPPER */}
              <form id="complaintForm" onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
                
                {/* SECTION 1: ORIGIN & CUSTOMER DETAILS */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E7EB]">
                    <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      1. ORIGIN & CUSTOMER DETAILS
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                      label="Complaint Source"
                      options={[
                        { value: 'EMAIL', label: 'Email Communication' },
                        { value: 'PHONE', label: 'Phone Call / Customer Care' },
                        { value: 'WEB_PORTAL', label: 'Web Portal Submission' },
                        { value: 'REGULATORY_NOTICE', label: 'Regulatory Authority Notice' },
                      ]}
                      error={errors.complaint_source?.message}
                      {...register('complaint_source')}
                    />

                    <Input
                      label="Customer Name"
                      placeholder="Enter customer or facility name..."
                      error={errors.customer_name?.message}
                      {...register('customer_name')}
                    />
                  </div>
                </div>

                {/* SECTION 2: PRODUCT & BATCH IDENTIFICATION */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E7EB]">
                    <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      2. PRODUCT & BATCH IDENTIFICATION
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Product Name"
                      placeholder="e.g. Amoxicillin Trihydrate"
                      error={errors.product_name?.message}
                      {...register('product_name')}
                    />

                    <Input
                      label="Product Strength"
                      placeholder="e.g. 500mg Capsule"
                      error={errors.strength_grade?.message}
                      {...register('strength_grade')}
                    />

                    <Input
                      label="Batch Number"
                      placeholder="e.g. BATCH-99821"
                      error={errors.batch_number?.message}
                      {...register('batch_number')}
                    />

                    <Input
                      label="Manufacturing Date"
                      type="date"
                      error={errors.manufacturing_date?.message}
                      {...register('manufacturing_date')}
                    />

                    <Input
                      label="Expiry Date"
                      type="date"
                      error={errors.expiry_date?.message}
                      {...register('expiry_date')}
                    />

                    <Input
                      label="Quantity Affected"
                      type="number"
                      placeholder="0"
                      error={errors.quantity?.message}
                      {...register('quantity')}
                    />
                  </div>
                </div>

                {/* SECTION 3: COMPLAINT DETAILS */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E7EB]">
                    <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      3. COMPLAINT DETAILS
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Complaint Type"
                      placeholder="e.g. Packaging Seal Defect"
                      error={errors.complaint_type?.message}
                      {...register('complaint_type')}
                    />

                    <Input
                      label="Complaint Date"
                      type="date"
                      error={errors.complaint_date?.message}
                      {...register('complaint_date')}
                    />
                  </div>

                  <div className="pt-1">
                    <Textarea
                      label="Complaint Description"
                      rows={4}
                      placeholder="Provide thorough details regarding the quality issue..."
                      error={errors.complaint_description?.message}
                      {...register('complaint_description')}
                    />
                  </div>
                </div>

                {/* SECTION 4: INITIAL ASSESSMENT & PRIORITY */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-[#E5E7EB]">
                    <h2 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      4. INITIAL ASSESSMENT & PRIORITY
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                      label="Severity Rating"
                      options={[
                        { value: 'CRITICAL', label: 'CRITICAL (Recall / Patient Risk)' },
                        { value: 'MAJOR', label: 'MAJOR (Quality / Efficacy Impact)' },
                        { value: 'MINOR', label: 'MINOR (Cosmetic / Packaging Label)' },
                      ]}
                      error={errors.severity?.message}
                      {...register('severity')}
                    />

                    <Select
                      label="Priority Rating"
                      options={[
                        { value: 'HIGH', label: 'HIGH' },
                        { value: 'MEDIUM', label: 'MEDIUM' },
                        { value: 'LOW', label: 'LOW' },
                      ]}
                      error={errors.priority?.message}
                      {...register('priority')}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* BOTTOM ACTION BUTTONS */}
            <div className="pt-8 mt-8 border-t border-[#E5E7EB] flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                className="h-[44px] px-6 rounded-xl border-[#E5E7EB] text-[#4B5563] font-semibold"
              >
                Reset Form
              </Button>

              <Button
                type="submit"
                form="complaintForm"
                variant="primary"
                isLoading={isSubmitting}
                className="h-[44px] px-8 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Save Complaint
              </Button>
            </div>
          </Card>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL (≈35% WIDTH / 4 COLS DESKTOP) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <Card className="p-6 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* HEADER WITH BETA BADGE */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="font-bold text-base text-[#111827]">
                    AI Complaint Intake Assistant
                  </h3>
                </div>
                <span className="bg-blue-50 text-[#2563EB] border border-blue-200 px-2.5 py-0.5 text-xs font-semibold rounded-full">
                  BETA
                </span>
              </div>

              {/* DASHED UPLOAD BOX */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none ${
                  dragOver
                    ? 'border-[#2563EB] bg-blue-50/50'
                    : 'border-[#E5E7EB] hover:border-[#2563EB] bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.eml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <p className="text-sm font-semibold text-[#111827]">
                  Drag & drop complaint document here
                </p>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">or click to browse</p>
              </div>

              {/* CENTERED OR DIVIDER */}
              <div className="relative text-center my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E7EB]" />
                </div>
                <span className="relative text-xs font-semibold text-[#9CA3AF] bg-white px-3 uppercase tracking-wider">
                  OR
                </span>
              </div>

              {/* LARGE OUTLINED PASTE BUTTON */}
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsPasteModalOpen(true)}
                className="h-[44px] rounded-xl border-[#E5E7EB] text-[#111827] font-semibold flex items-center justify-center space-x-2 hover:bg-slate-50"
                leftIcon={<FileText className="w-4 h-4 text-[#6B7280]" />}
              >
                <span>Paste Complaint Text / Email</span>
              </Button>

              {/* GREEN SUPPORTED FORMATS CARD */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-2">
                <span className="font-semibold block text-emerald-900">Supported formats:</span>
                <div className="flex items-center space-x-2">
                  <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                    PDF
                  </span>
                  <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                    DOCX
                  </span>
                  <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                    TXT
                  </span>
                  <span className="bg-white border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                    EML
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 pt-0.5">Maximum file size: 20 MB</p>
              </div>

              {/* EXTRACTION PROGRESS SECTION */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#111827]">Extraction Progress</span>
                  <span className="text-[#2563EB] font-mono font-bold">
                    {isExtracting ? `${extractionProgress}%` : '10%'}
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] transition-all duration-300 rounded-full"
                    style={{ width: isExtracting ? `${extractionProgress}%` : '10%' }}
                  />
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed pt-1">
                  Analyzing document content and extracting key details... Please wait. This may take a few moments.
                </p>
              </div>

              {/* LIGHT BLUE AI HELPER CARD */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Upload a complaint document or paste text above. AI will automatically extract the details and populate the form for you.
                </p>
              </div>
            </div>

            {/* STICKY BOTTOM CHAT SECTION */}
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask me anything about this complaint..."
                  className="flex-1 h-[44px] bg-white border border-[#E5E7EB] rounded-xl px-3.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <Button
                  variant="primary"
                  onClick={handleSendChat}
                  isLoading={isSendingChat}
                  disabled={!chatInput.trim() || isSendingChat}
                  className="h-[44px] px-3.5 bg-[#2563EB] text-white rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-[11px] text-center text-[#6B7280]">
                AI responses may contain errors. Please verify information.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* PASTE TEXT MODAL */}
      <Modal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        title="Paste Complaint Text / Email"
        description="Paste raw customer email or document text for AI processing."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPasteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePastedTextExtraction}
              disabled={!pastedText.trim()}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Extract & Fill Form
            </Button>
          </>
        }
      >
        <Textarea
          rows={6}
          placeholder="Paste raw email header, complaint body, or batch inspection report text..."
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
        />
      </Modal>
    </div>
  );
};
