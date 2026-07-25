import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  FileText,
  AlertCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Select,
  Badge,
  Button,
  Divider,
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
      <div className="space-y-8 animate-fadeIn">
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
    if (r === 'HIGH' || r === 'CRITICAL') return <Badge variant="danger">HIGH RISK</Badge>;
    if (r === 'MEDIUM') return <Badge variant="warning">MEDIUM RISK</Badge>;
    return <Badge variant="success">LOW RISK</Badge>;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* PAGE HEADER */}
      <PageHeader
        title="Review AI Extracted Complaint"
        subtitle="Verify, correct, and finalize the extracted complaint fields before submission."
      />

      {/* TWO COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: AI SUMMARY & METRICS (4 cols desktop) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-base text-[#0F172A]">AI Extraction Summary</h3>
              </div>
              {getRiskBadge(state.riskLevel)}
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Executive AI Summary
              </span>
              <p className="text-sm text-[#0F172A] leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-[#E2E8F0]">
                {state.aiSummary || 'No automated summary generated.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  AI Confidence
                </span>
                <span className="text-xl font-bold text-[#2563EB] mt-0.5 block">
                  {((state.confidenceScore || 0.92) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Missing Fields
                </span>
                <span className="text-xl font-bold text-[#0F172A] mt-0.5 block">
                  {missingFields.length}
                </span>
              </div>
            </div>

            {state.documentId && (
              <div className="text-xs text-[#64748B] pt-3 border-t border-[#E2E8F0]">
                <span className="font-medium text-[#0F172A]">Linked Document ID:</span>
                <p className="font-mono text-[11px] text-[#2563EB] truncate mt-0.5">
                  {state.documentId}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: COMPLAINT REVIEW FORM (8 cols desktop) */}
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm">
            {/* SERVER ERROR ALERT */}
            {apiError && (
              <div
                role="alert"
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800"
              >
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium">{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* SECTION: GENERAL & CUSTOMER INFO */}
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E2E8F0]">
                  General & Customer Metadata
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      {isMissing('customer_name') && <Badge variant="warning">Required</Badge>}
                    </div>
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
              </div>

              {/* SECTION: PRODUCT & BATCH DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E2E8F0]">
                  Product & Batch Parameters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      {isMissing('product_name') && <Badge variant="warning">Required</Badge>}
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      {isMissing('batch_number') && <Badge variant="warning">Required</Badge>}
                    </div>
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
              </div>

              {/* SECTION: COMPLAINT TYPE & DESCRIPTION */}
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E2E8F0]">
                  Defect & Event Description
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Complaint Type / Defect Category"
                        placeholder="e.g. Discoloration, Packaging Seal Damage"
                        error={errors.complaint_type?.message}
                        {...register('complaint_type')}
                      />
                    </div>

                    <div>
                      <Input
                        label="Quantity Affected"
                        type="number"
                        placeholder="0"
                        error={errors.quantity?.message}
                        {...register('quantity')}
                      />
                    </div>
                  </div>

                  <Textarea
                    label="Detailed Complaint Description"
                    rows={4}
                    placeholder="Enter comprehensive complaint narrative..."
                    error={errors.complaint_description?.message}
                    {...register('complaint_description')}
                  />
                </div>
              </div>

              {/* SECTION: RISK & SEVERITY RATINGS */}
              <div>
                <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4 pb-2 border-b border-[#E2E8F0]">
                  Triage & Severity Classification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Complaint Date"
                      type="date"
                      error={errors.complaint_date?.message}
                      {...register('complaint_date')}
                    />
                  </div>

                  <div>
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
                  </div>

                  <div>
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
              </div>

              <Divider />

              {/* SUBMIT BUTTON */}
              <div className="flex justify-end gap-3">
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
                  Submit Final Complaint
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
