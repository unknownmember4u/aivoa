import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  FileText,
  AlertCircle,
  Sparkles,
  Send,
  ShieldCheck,
  PackageCheck,
  Tag,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Select,
  Badge,
  Button,
  EmptyState,
} from '@/components/ui';
import { useSubmitComplaintMutation } from '@/services/complaintApi';

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
  confidenceScore?: number;
  missingFields?: string[];
}

export const ComplaintReviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as NavigationState) || {};

  const [submitComplaint, { isLoading }] = useSubmitComplaintMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const extracted = state.extractedData || {};
  const missingFields = state.missingFields || [];

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
      complaint_type: extracted.complaint_type || '',
      complaint_description: extracted.complaint_description || '',
      complaint_date: extracted.complaint_date || new Date().toISOString().split('T')[0],
      severity: extracted.severity || 'MAJOR',
      priority: extracted.priority || 'MEDIUM',
    },
  });

  // Empty State Fallback if opened directly without navigation state
  if (!state.extractedData && !state.documentId) {
    return (
      <div className="space-y-8 max-w-[800px] mx-auto pb-10">
        <PageHeader
          title="Review AI Extracted Complaint"
          subtitle="Verify the extracted information before submitting."
        />
        <EmptyState
          icon={<FileText className="w-6 h-6 text-[#2563EB]" />}
          title="No Extracted Complaint Data Found"
          description="Please upload a complaint document to trigger AI extraction before accessing the review page."
          action={
            <Button variant="primary" onClick={() => navigate('/upload')}>
              Go to Document Upload
            </Button>
          }
        />
      </div>
    );
  }

  const isMissing = (fieldName: string) => missingFields.includes(fieldName);

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
        errorObj?.data?.detail || 'Failed to submit reviewed complaint. Please verify form values.'
      );
    }
  };

  const getRiskBadge = (risk?: string) => {
    const r = (risk || 'MEDIUM').toUpperCase();
    if (r === 'HIGH' || r === 'CRITICAL') return <Badge variant="danger" dot>HIGH RISK</Badge>;
    if (r === 'MEDIUM') return <Badge variant="warning" dot>MEDIUM RISK</Badge>;
    return <Badge variant="success" dot>LOW RISK</Badge>;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* PAGE HEADER */}
      <PageHeader
        title="Review AI Extracted Complaint"
        subtitle="Verify, correct, and finalize extracted fields across segmented cards before submission."
      />

      {/* TWO COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: STICKY AI SUMMARY & METRICS (4 cols desktop) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <Card className="p-6 border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-50 text-[#2563EB] rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A]">AI Extraction Summary</h3>
              </div>
              {getRiskBadge(state.riskLevel)}
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Executive AI Narrative
              </span>
              <p className="text-xs text-[#0F172A] leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                {state.aiSummary || 'No automated summary generated.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  AI Confidence
                </span>
                <span className="text-lg font-bold text-[#2563EB] mt-0.5 block">
                  {((state.confidenceScore || 0.94) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Missing Fields
                </span>
                <span className="text-lg font-bold text-[#0F172A] mt-0.5 block">
                  {missingFields.length}
                </span>
              </div>
            </div>

            {state.documentId && (
              <div className="text-xs text-[#64748B] pt-3 border-t border-[#E2E8F0]">
                <span className="font-medium text-[#0F172A]">Source Document ID:</span>
                <p className="font-mono text-[11px] text-[#2563EB] truncate mt-0.5">
                  {state.documentId}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: COMPLAINT REVIEW FORM CARDS (8 cols desktop) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* SERVER ERROR ALERT */}
            {apiError && (
              <div
                role="alert"
                className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800"
              >
                <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <span className="font-medium">{apiError}</span>
              </div>
            )}

            {/* CARD 1: GENERAL & CUSTOMER INFO */}
            <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0]">
                <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">General & Customer Information</h3>
                  <p className="text-xs text-[#64748B]">Complainant details and origin channel</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  {isMissing('customer_name') && (
                    <Badge variant="warning" className="mb-1.5">Missing Flag</Badge>
                  )}
                  <Input
                    label="Customer Name"
                    placeholder="e.g. John Doe / Apex Hospital"
                    error={errors.customer_name?.message}
                    helperText={
                      isMissing('customer_name')
                        ? 'Missing from AI extraction. Please fill in manually.'
                        : undefined
                    }
                    {...register('customer_name')}
                  />
                </div>

                <div>
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
                </div>
              </div>
            </Card>

            {/* CARD 2: PRODUCT & BATCH PARAMETERS */}
            <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0]">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#16A34A]">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Product & Batch Details</h3>
                  <p className="text-xs text-[#64748B]">Pharmaceutical formulation and batch metadata</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  {isMissing('product_name') && (
                    <Badge variant="warning" className="mb-1.5">Missing Flag</Badge>
                  )}
                  <Input
                    label="Product Name"
                    placeholder="e.g. Amoxicillin 500mg Capsule"
                    error={errors.product_name?.message}
                    helperText={
                      isMissing('product_name')
                        ? 'Missing from AI extraction. Please fill in manually.'
                        : undefined
                    }
                    {...register('product_name')}
                  />
                </div>

                <div>
                  <Input
                    label="Strength / Grade"
                    placeholder="e.g. 500mg"
                    error={errors.strength_grade?.message}
                    {...register('strength_grade')}
                  />
                </div>

                <div>
                  {isMissing('batch_number') && (
                    <Badge variant="warning" className="mb-1.5">Missing Flag</Badge>
                  )}
                  <Input
                    label="Batch Number"
                    placeholder="e.g. BATCH-9982"
                    error={errors.batch_number?.message}
                    helperText={
                      isMissing('batch_number')
                        ? 'Missing from AI extraction. Please fill in manually.'
                        : undefined
                    }
                    {...register('batch_number')}
                  />
                </div>

                <div>
                  <Input
                    label="Manufacturing Date"
                    type="date"
                    error={errors.manufacturing_date?.message}
                    {...register('manufacturing_date')}
                  />
                </div>

                <div>
                  <Input
                    label="Expiry Date"
                    type="date"
                    error={errors.expiry_date?.message}
                    {...register('expiry_date')}
                  />
                </div>
              </div>
            </Card>

            {/* CARD 3: COMPLAINT DESCRIPTION & DEFECT */}
            <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0]">
                <div className="p-2 rounded-xl bg-amber-50 text-[#D97706]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Complaint Information & Defect</h3>
                  <p className="text-xs text-[#64748B]">Defect type and narrative event description</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Defect Category / Complaint Type"
                    placeholder="e.g. Discoloration, Packaging Seal Damage"
                    error={errors.complaint_type?.message}
                    {...register('complaint_type')}
                  />

                  <Input
                    label="Quantity Affected"
                    type="number"
                    placeholder="0"
                    error={errors.quantity?.message}
                    {...register('quantity')}
                  />
                </div>

                <Textarea
                  label="Detailed Complaint Narrative"
                  rows={4}
                  placeholder="Enter full narrative event description..."
                  error={errors.complaint_description?.message}
                  {...register('complaint_description')}
                />
              </div>
            </Card>

            {/* CARD 4: TRIAGE & SEVERITY CLASSIFICATION */}
            <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-[#E2E8F0]">
                <div className="p-2 rounded-xl bg-rose-50 text-[#EF4444]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Risk Triage & Severity</h3>
                  <p className="text-xs text-[#64748B]">Regulatory urgency and recall risk classification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label="Complaint Date"
                  type="date"
                  error={errors.complaint_date?.message}
                  {...register('complaint_date')}
                />

                <Select
                  label="Severity Rating"
                  options={[
                    { value: 'CRITICAL', label: 'CRITICAL (Adverse Event / Recall Risk)' },
                    { value: 'MAJOR', label: 'MAJOR (Quality / Efficacy Issue)' },
                    { value: 'MINOR', label: 'MINOR (Packaging / Cosmetic Labeling)' },
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

              {/* ACTION FOOTER */}
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/upload')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Finalized Complaint
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};
