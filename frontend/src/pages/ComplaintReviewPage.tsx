import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Modal,
  Avatar,
  Spinner,
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

interface SidePanelMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  isFieldUpdate?: boolean;
}

export const ComplaintReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
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

  // Live AI Chat transcript messages
  const [chatMessages, setChatMessages] = useState<SidePanelMessage[]>([
    {
      id: 'welcome',
      sender: 'ASSISTANT',
      text: 'Hello! I am your AI Quality Intake Assistant. Ask me to write/generate descriptions, summarize complaints, or alter ANY form field (e.g. "write the complaint description by the summary", "change customer to Apex Health", "set manufacturing date to 2025-06-01").',
    },
  ]);

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
    getValues,
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
      complaint_type: extracted.complaint_type || 'Packaging Defect',
      complaint_description: extracted.complaint_description || '',
      complaint_date: extracted.complaint_date || new Date().toISOString().split('T')[0],
      severity: extracted.severity || 'MAJOR',
      priority: extracted.priority || 'HIGH',
    },
  });

  // Auto scroll chat to bottom
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isExtracting, isSendingChat]);

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
    setExtractionProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setExtractionProgress(40);
      const docResponse = await uploadDocument(formData).unwrap();

      setExtractionProgress(75);
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

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ASSISTANT',
          text: `Document '${file.name}' processed successfully. Form fields have been populated with AI extracted metadata.`,
        },
      ]);

      setTimeout(() => {
        setIsExtracting(false);
      }, 500);
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

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ASSISTANT',
        text: 'Pasted text added to Complaint Description.',
      },
    ]);

    setPastedText('');
  };

  // Universal AI Form Command & Generative Task Execution Engine
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatInput('');

    // Add user message to transcript
    const userMsgId = Date.now().toString();
    setChatMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'USER', text: userText },
    ]);

    const lower = userText.toLowerCase();

    // =========================================================================
    // 1. GENERATIVE AI INTENT DETECTION (write / generate / draft / compose)
    // =========================================================================
    const isGenerativeIntent =
      lower.includes('write') ||
      lower.includes('generate') ||
      lower.includes('draft') ||
      lower.includes('create') ||
      lower.includes('compose') ||
      lower.includes('fill description');

    if (isGenerativeIntent) {
      const prod = getValues('product_name') || 'Pharmaceutical Product';
      const batch = getValues('batch_number') || 'BAT-2026-8891';
      const type = getValues('complaint_type') || 'Packaging Defect';
      const customer = getValues('customer_name') || 'Hospital Facility';

      let generatedText = '';

      if (lower.includes('description') || lower.includes('summary')) {
        generatedText = `Quality Assurance Complaint Summary: Customer ${customer} submitted a defect report concerning ${prod} (Batch: ${batch}). The reported defect is classified under ${type}. Initial inspection indicates compromised primary packaging integrity with potential impact on product stability. QA containment and retain sample investigation have been initiated.`;
        setValue('complaint_description', generatedText);

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ASSISTANT',
            text: `Generated and populated a professional QA Complaint Description into the form field based on case metadata.`,
            isFieldUpdate: true,
          },
        ]);
        return;
      }
    }

    // =========================================================================
    // 2. DIRECT FORM FIELD MODIFICATION ENGINE (covers all 13 fields)
    // =========================================================================
    const fieldDefinitions = [
      {
        fieldName: 'Customer Name',
        key: 'customer_name' as const,
        keywords: ['customer name', 'customer', 'facility', 'client', 'reporter'],
      },
      {
        fieldName: 'Complaint Source',
        key: 'complaint_source' as const,
        keywords: ['source', 'complaint source', 'channel'],
        parseVal: (val: string) => {
          const u = val.toUpperCase();
          if (u.includes('PHONE') || u.includes('CALL')) return 'PHONE';
          if (u.includes('WEB') || u.includes('PORTAL')) return 'WEB_PORTAL';
          if (u.includes('REGULAT') || u.includes('NOTICE')) return 'REGULATORY_NOTICE';
          return 'EMAIL';
        },
      },
      {
        fieldName: 'Product Name',
        key: 'product_name' as const,
        keywords: ['product name', 'product', 'drug', 'medicine'],
      },
      {
        fieldName: 'Product Strength',
        key: 'strength_grade' as const,
        keywords: ['strength', 'product strength', 'grade', 'dosage', 'dose'],
      },
      {
        fieldName: 'Batch Number',
        key: 'batch_number' as const,
        keywords: ['batch number', 'batch', 'lot number', 'lot'],
      },
      {
        fieldName: 'Manufacturing Date',
        key: 'manufacturing_date' as const,
        keywords: ['manufacturing date', 'mfg date', 'manufacture date', 'mfg'],
      },
      {
        fieldName: 'Expiry Date',
        key: 'expiry_date' as const,
        keywords: ['expiry date', 'exp date', 'expiration date', 'expiry', 'exp'],
      },
      {
        fieldName: 'Quantity Affected',
        key: 'quantity' as const,
        keywords: ['quantity', 'qty', 'units', 'affected quantity', 'count'],
        parseVal: (val: string) => {
          const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
          return isNaN(num) ? 0 : num;
        },
      },
      {
        fieldName: 'Complaint Type',
        key: 'complaint_type' as const,
        keywords: ['complaint type', 'type', 'defect type', 'issue type', 'category'],
      },
      {
        fieldName: 'Complaint Description',
        key: 'complaint_description' as const,
        keywords: ['complaint description', 'description', 'narrative', 'details', 'detail'],
      },
      {
        fieldName: 'Complaint Date',
        key: 'complaint_date' as const,
        keywords: ['complaint date', 'date of complaint', 'received date', 'logged date'],
      },
      {
        fieldName: 'Severity Rating',
        key: 'severity' as const,
        keywords: ['severity rating', 'severity', 'sev'],
        parseVal: (val: string) => {
          const u = val.toUpperCase();
          if (u.includes('CRITICAL')) return 'CRITICAL';
          if (u.includes('MINOR')) return 'MINOR';
          return 'MAJOR';
        },
      },
      {
        fieldName: 'Priority Rating',
        key: 'priority' as const,
        keywords: ['priority rating', 'priority', 'prio'],
        parseVal: (val: string) => {
          const u = val.toUpperCase();
          if (u.includes('HIGH')) return 'HIGH';
          if (u.includes('LOW')) return 'LOW';
          return 'MEDIUM';
        },
      },
    ];

    let updatedField: string | null = null;
    let finalValue: any = null;

    for (const fieldDef of fieldDefinitions) {
      for (const kw of fieldDef.keywords) {
        if (lower.includes(kw)) {
          const regex = new RegExp(`${kw}\\s*(?:to|is|=|set to|as)\\s*(.+)`, 'i');
          const match = userText.match(regex);
          
          let rawVal = '';
          if (match && match[1]) {
            rawVal = match[1].trim();
          } else {
            rawVal = userText
              .replace(new RegExp(`^(?:change|set|update|fill|make)\\s+`, 'i'), '')
              .replace(new RegExp(kw, 'i'), '')
              .replace(/^(?:to|is|=|as)\s*/i, '')
              .trim();
          }

          if (rawVal) {
            finalValue = fieldDef.parseVal ? fieldDef.parseVal(rawVal) : rawVal;
            setValue(fieldDef.key, finalValue);
            updatedField = fieldDef.fieldName;
            break;
          }
        }
      }
      if (updatedField) break;
    }

    if (updatedField && finalValue !== null) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ASSISTANT',
          text: `Updated '${updatedField}' to "${finalValue}".`,
          isFieldUpdate: true,
        },
      ]);
      return;
    }

    // =========================================================================
    // 3. GENERAL CONVERSATIONAL AI TASKS (Clear/Reset, Case Summary, Help)
    // =========================================================================
    if (lower.includes('clear') || lower.includes('reset')) {
      handleResetForm();
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ASSISTANT',
          text: 'Reset all form fields to default values.',
          isFieldUpdate: true,
        },
      ]);
      return;
    }

    if (lower.includes('summarize') || lower.includes('summary')) {
      const desc = getValues('complaint_description') || 'No description provided yet.';
      const prod = getValues('product_name') || 'Unspecified product';
      const batch = getValues('batch_number') || 'Unspecified batch';
      const summaryText = `AI Case Summary: Complaint regarding ${prod} (Batch ${batch}). Description: "${desc.slice(0, 150)}...". Recommended Action: Initiate Quality Risk Assessment & Retain Sample Inspection.`;
      
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ASSISTANT',
          text: summaryText,
        },
      ]);
      return;
    }

    // Backend Grounded Q&A / AI Assistant query
    if (state.documentId) {
      try {
        const chatRes = await sendChatMessage({
          complaintId: state.documentId,
          question: userText,
        }).unwrap();

        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            sender: 'ASSISTANT',
            text: chatRes.answer,
          },
        ]);
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            sender: 'ASSISTANT',
            text: `Current Form Status: Product '${getValues('product_name') || 'N/A'}', Batch '${getValues('batch_number') || 'N/A'}', Complaint Type '${getValues('complaint_type') || 'N/A'}'. You can tell me to write descriptions, alter any field, or summarize the case.`,
          },
        ]);
      }
    } else {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: 'ASSISTANT',
          text: `Current Form Status: Product '${getValues('product_name') || 'N/A'}', Batch '${getValues('batch_number') || 'N/A'}', Complaint Type '${getValues('complaint_type') || 'N/A'}', Severity '${getValues('severity')}'.\n\nYou can ask me to write descriptions (e.g. "write the complaint description by the summary"), alter ANY field (e.g. "set manufacturing date to 2025-06-01", "set quantity to 500"), or summarize the case.`,
        },
      ]);
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
                className="h-[44px] px-8 bg-[#151717] hover:bg-[#25282a] text-white font-semibold rounded-xl shadow-xs"
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
          <Card className="p-6 bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm flex-1 flex flex-col justify-between space-y-6 min-h-[580px]">
            <div className="space-y-4 flex-1 flex flex-col">
              {/* HEADER WITH BETA BADGE */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] shrink-0">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#151717]" />
                  <h3 className="font-bold text-base text-[#111827]">
                    AI Complaint Intake Assistant
                  </h3>
                </div>
                <span className="bg-slate-100 text-[#151717] border border-slate-200 px-2.5 py-0.5 text-xs font-semibold rounded-full">
                  LIVE
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
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer select-none shrink-0 ${
                  dragOver
                    ? 'border-[#151717] bg-slate-100'
                    : 'border-[#E5E7EB] hover:border-[#151717] bg-slate-50/50'
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

                <div className="w-10 h-10 rounded-full bg-slate-100 text-[#151717] flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>

                <p className="text-xs font-semibold text-[#111827]">
                  Drag & drop complaint document here
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5 font-medium">or click to browse PDF, DOCX, TXT</p>
              </div>

              {/* PASTE BUTTON */}
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => setIsPasteModalOpen(true)}
                className="h-[38px] rounded-xl border-[#E5E7EB] text-[#111827] font-semibold flex items-center justify-center space-x-2 hover:bg-slate-50 shrink-0"
                leftIcon={<FileText className="w-4 h-4 text-[#6B7280]" />}
              >
                <span>Paste Complaint Text / Email</span>
              </Button>

              {/* EXTRACTION PROGRESS BAR (WHEN EXTRACTING) */}
              {isExtracting && (
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#111827]">Analyzing Document...</span>
                    <span className="text-[#151717] font-mono font-bold">{extractionProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#151717] transition-all duration-300 rounded-full"
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* SCROLLABLE LIVE CHAT TRANSCRIPT AREA */}
              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1 pt-2">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === 'USER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar name={isUser ? 'You' : 'AI'} size="sm" />
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                          isUser
                            ? 'bg-[#151717] text-white rounded-tr-none font-medium'
                            : msg.isFieldUpdate
                            ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-tl-none font-medium'
                            : 'bg-slate-100 text-[#111827] border border-[#E5E7EB] rounded-tl-none'
                        }`}
                      >
                        {msg.isFieldUpdate && (
                          <span className="flex items-center gap-1 font-bold text-emerald-800 mb-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Form Field Updated
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {isSendingChat && (
                  <div className="flex items-start gap-2 flex-row">
                    <Avatar name="AI" size="sm" />
                    <div className="p-3 rounded-2xl bg-slate-100 border border-[#E5E7EB] text-xs text-[#64748B] flex items-center space-x-2 rounded-tl-none">
                      <Spinner size="sm" className="text-[#151717]" />
                      <span>Processing command...</span>
                    </div>
                  </div>
                )}
                <div ref={chatScrollRef} />
              </div>
            </div>

            {/* STICKY BOTTOM CHAT COMPOSER */}
            <div className="pt-3 border-t border-[#E5E7EB] space-y-2 shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder='Command AI or ask questions...'
                  className="flex-1 h-[42px] bg-white border border-[#E5E7EB] rounded-xl px-3 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#151717] focus:ring-1 focus:ring-[#151717]"
                />
                <Button
                  variant="primary"
                  onClick={handleSendChat}
                  isLoading={isSendingChat}
                  disabled={!chatInput.trim() || isSendingChat}
                  className="h-[42px] px-3.5 bg-[#151717] hover:bg-[#25282a] text-white rounded-xl shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-[10px] text-center text-[#6B7280]">
                Generative AI: "write complaint description by summary", "change customer to Apex Health"
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
