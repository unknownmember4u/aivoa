import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Section,
  Spinner,
  Divider,
} from '@/components/ui';
import { ComplaintDocument, ComplaintAuditLog } from '@/types';
import { useGetComplaintByIdQuery } from '@/services/complaintApi';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: complaint, isLoading, isError, error, refetch } = useGetComplaintByIdQuery(
    id || '',
    { skip: !id }
  );

  const getSeverityBadge = (sev: string) => {
    const s = sev?.toUpperCase();
    if (s === 'CRITICAL') return <Badge variant="danger">CRITICAL</Badge>;
    if (s === 'MAJOR') return <Badge variant="warning">MAJOR</Badge>;
    return <Badge variant="info">MINOR</Badge>;
  };

  const getRiskBadge = (risk?: string) => {
    const r = (risk || 'MEDIUM').toUpperCase();
    if (r === 'HIGH' || r === 'CRITICAL') return <Badge variant="danger">HIGH RISK</Badge>;
    if (r === 'MEDIUM') return <Badge variant="warning">MEDIUM RISK</Badge>;
    return <Badge variant="success">LOW RISK</Badge>;
  };

  const getStatusBadge = (st: string) => {
    const s = st?.toUpperCase();
    if (s === 'SUBMITTED') return <Badge variant="info">SUBMITTED</Badge>;
    if (s === 'UNDER_INVESTIGATION') return <Badge variant="warning">INVESTIGATING</Badge>;
    if (s === 'CLOSED') return <Badge variant="success">CLOSED</Badge>;
    return <Badge variant="neutral">DRAFT</Badge>;
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Spinner size="lg" className="text-[#2563EB]" />
        <p className="text-sm font-medium text-[#64748B]">
          Fetching complaint details for ID: {id}...
        </p>
      </div>
    );
  }

  // ERROR STATE
  if (isError || !complaint) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <PageHeader
          title="Complaint Details"
          subtitle={`Complaint ID: ${id || 'Unknown'}`}
          actions={
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/complaints')}
            >
              Back to Complaints
            </Button>
          }
        />

        <Card className="p-8 bg-red-50 border-red-200 text-red-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Failed to Load Complaint Details</h3>
            <p className="text-xs text-red-700 mt-1">
              {(error as any)?.data?.detail ||
                'The requested complaint record could not be found or retrieved from the server.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Loading
          </Button>
        </Card>
      </div>
    );
  }

  const documents = complaint.documents || [];
  const missingFields = complaint.missing_fields || [];
  const auditLogs = complaint.audit_logs || [];

  const confidenceDisplay =
    complaint.confidence_score !== undefined && complaint.confidence_score !== null
      ? `${(complaint.confidence_score * 100).toFixed(1)}%`
      : 'N/A';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* PAGE HEADER */}
      <PageHeader
        title="Complaint Details"
        subtitle={`Complaint ID: ${complaint.id}`}
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/complaints')}
            >
              Back
            </Button>
            <Button
              variant="primary"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => navigate(`/complaints/${complaint.id}/chat`)}
            >
              AI Assistant
            </Button>
          </>
        }
      />

      {/* TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SUMMARY & DOCUMENTS (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* SECTION 1: COMPLAINT SUMMARY CARD */}
          <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="space-y-1">
                <span className="font-mono text-xs font-semibold text-[#2563EB]">
                  {complaint.id}
                </span>
                <h2 className="text-xl font-bold text-[#0F172A]">{complaint.product_name}</h2>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(complaint.status)}
                {getRiskBadge(complaint.risk_level)}
              </div>
            </div>

            {/* Grid Attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Customer Name
                </span>
                <span className="font-medium text-[#0F172A]">{complaint.customer_name}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Complaint Source
                </span>
                <span className="font-medium text-[#0F172A]">{complaint.complaint_source}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Batch Number
                </span>
                <span className="font-mono font-semibold text-[#0F172A]">
                  {complaint.batch_number}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Strength / Grade
                </span>
                <span className="font-medium text-[#0F172A]">
                  {complaint.strength_grade || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Complaint Date
                </span>
                <span className="font-medium text-[#0F172A]">{complaint.complaint_date}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Defect Category
                </span>
                <span className="font-medium text-[#0F172A]">{complaint.complaint_type}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Severity Rating
                </span>
                <div>{getSeverityBadge(complaint.severity)}</div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                  Priority Rating
                </span>
                <Badge variant="neutral">{complaint.priority}</Badge>
              </div>
            </div>

            <Divider />

            {/* Narrative Description */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Detailed Narrative Description
              </span>
              <p className="text-sm text-[#0F172A] leading-relaxed bg-slate-50 p-4 rounded-xl border border-[#E2E8F0]">
                {complaint.complaint_description}
              </p>
            </div>

            {/* Timestamps */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0] gap-2">
              <span>Created: {new Date(complaint.created_at).toLocaleString()}</span>
              <span>Last Updated: {new Date(complaint.updated_at).toLocaleString()}</span>
            </div>
          </Card>

          {/* SECTION 3: UPLOADED DOCUMENTS */}
          <Section title="Uploaded Documents" subtitle="Attached file artifacts and compliance records">
            <Card className="p-6 border-[#E2E8F0] shadow-sm">
              {documents.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-4">
                  No document artifacts attached to this complaint record.
                </p>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {documents.map((doc: ComplaintDocument) => (
                    <div key={doc.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-sm text-[#0F172A] block truncate">
                            {doc.file_name}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            {(doc.file_size / 1024).toFixed(1)} KB • {doc.mime_type} • Uploaded{' '}
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="w-3.5 h-3.5" />}
                        onClick={() => window.open(doc.file_path, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Section>
        </div>

        {/* RIGHT COLUMN: AI ANALYSIS & AUDIT TIMELINE (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* SECTION 2: AI ANALYSIS CARD */}
          <Card className="p-6 border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E8F0]">
              <Sparkles className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-bold text-base text-[#0F172A]">AI Complaint Analysis</h3>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Executive AI Summary
              </span>
              <p className="text-xs text-[#0F172A] leading-relaxed bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                {complaint.ai_summary || 'No summary generated.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  AI Confidence
                </span>
                <span className="text-lg font-bold text-[#2563EB] mt-0.5 block">
                  {confidenceDisplay}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Risk Assessment
                </span>
                <div className="mt-1">{getRiskBadge(complaint.risk_level)}</div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Missing Field Flags
              </span>
              {missingFields.length === 0 ? (
                <div className="flex items-center space-x-2 text-xs text-[#16A34A] bg-green-50 p-3 rounded-xl border border-green-100 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>No missing fields detected</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {missingFields.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="font-mono font-medium text-amber-900">{field}</span>
                      <Badge variant="warning">Missing</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* SECTION 4: AUDIT TIMELINE (Backend Dynamic Logs) */}
          <Section title="Audit Timeline" subtitle="21 CFR Part 11 compliant audit trail log">
            <Card className="p-6 border-[#E2E8F0] shadow-sm">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-4">
                  No audit trail entries recorded yet for this complaint.
                </p>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E2E8F0]">
                  {auditLogs.map((log: ComplaintAuditLog) => (
                    <div key={log.id} className="relative flex items-start space-x-4 pl-8">
                      <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-[#2563EB] flex items-center justify-center text-[#2563EB] z-10">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-[#0F172A] tracking-wider uppercase">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          User ID: {log.user_id}
                        </span>
                        {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                          <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-md border border-[#E2E8F0] font-mono text-slate-700">
                            Changed: {JSON.stringify(log.changed_fields)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
};
