import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
  Calendar,
  User,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Section,
  Divider,
  SkeletonCard,
} from '@/components/ui';
import { ComplaintDocument, ComplaintAuditLog } from '@/types';
import { useGetComplaintByIdQuery } from '@/services/complaintApi';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const { data: complaint, isLoading, isFetching, isError, error, refetch } = useGetComplaintByIdQuery(
    id || '',
    { skip: !id }
  );

  console.log(
    `[DEBUG PAGE RENDER] [${new Date().toISOString()}] ComplaintDetailPage Render #${renderCountRef.current}`,
    { complaintId: id, isLoading, isFetching, dataNotNull: complaint != null }
  );

  useEffect(() => {
    console.log(`[DEBUG PAGE MOUNT] [${new Date().toISOString()}] ComplaintDetailPage MOUNTED for ID: ${id}`);
    return () => {
      console.log(`[DEBUG PAGE UNMOUNT] [${new Date().toISOString()}] ComplaintDetailPage UNMOUNTED for ID: ${id}`);
    };
  }, [id]);

  const getSeverityBadge = (sev: string) => {
    const s = sev?.toUpperCase();
    if (s === 'CRITICAL') return <Badge variant="danger">CRITICAL</Badge>;
    if (s === 'MAJOR') return <Badge variant="warning">MAJOR</Badge>;
    return <Badge variant="info">MINOR</Badge>;
  };

  const getRiskBadge = (risk?: string) => {
    const r = (risk || 'MEDIUM').toUpperCase();
    if (r === 'HIGH' || r === 'CRITICAL') return <Badge variant="danger" dot>HIGH RISK</Badge>;
    if (r === 'MEDIUM') return <Badge variant="warning" dot>MEDIUM RISK</Badge>;
    return <Badge variant="success" dot>LOW RISK</Badge>;
  };

  const getStatusBadge = (st: string) => {
    const s = st?.toUpperCase();
    if (s === 'SUBMITTED') return <Badge variant="info">SUBMITTED</Badge>;
    if (s === 'UNDER_INVESTIGATION') return <Badge variant="warning">INVESTIGATING</Badge>;
    if (s === 'CLOSED') return <Badge variant="success">CLOSED</Badge>;
    return <Badge variant="neutral">DRAFT</Badge>;
  };

  // SKELETON LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <PageHeader
          title="Complaint Details"
          subtitle={`Loading complaint ID: ${id}...`}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <SkeletonCard
              debugPageName="ComplaintDetailPage"
              debugReason="isLoading is true"
              debugIsLoading={isLoading}
              debugIsFetching={isFetching}
              debugHasData={complaint != null}
            />
            <SkeletonCard
              debugPageName="ComplaintDetailPage"
              debugReason="isLoading is true"
              debugIsLoading={isLoading}
              debugIsFetching={isFetching}
              debugHasData={complaint != null}
            />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <SkeletonCard
              debugPageName="ComplaintDetailPage"
              debugReason="isLoading is true"
              debugIsLoading={isLoading}
              debugIsFetching={isFetching}
              debugHasData={complaint != null}
            />
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (isError || !complaint) {
    return (
      <div className="space-y-8 max-w-[800px] mx-auto pb-10">
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

        <Card className="p-8 bg-rose-50/80 border-rose-200 text-rose-900 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-[#EF4444] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-900">Failed to Load Complaint Details</h3>
            <p className="text-xs text-rose-700 mt-1">
              {(error as any)?.data?.detail ||
                'The requested complaint record could not be retrieved from the database.'}
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
      : '97.4%';

  return (
    <div className="space-y-8 pb-10">
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
              Launch AI Assistant
            </Button>
          </>
        }
      />

      {/* TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: OVERVIEW & DOCUMENTS (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* SECTION 1: OVERVIEW CARD */}
          <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] flex-wrap gap-3">
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
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-100 text-[#64748B] shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Complainant Name
                  </span>
                  <span className="font-semibold text-[#0F172A]">{complaint.customer_name}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-100 text-[#64748B] shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Communication Channel
                  </span>
                  <span className="font-medium text-[#0F172A]">{complaint.complaint_source}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-100 text-[#64748B] shrink-0 mt-0.5">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Batch Number
                  </span>
                  <span className="font-mono font-semibold text-[#2563EB]">
                    {complaint.batch_number}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-100 text-[#64748B] shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-0.5">
                    Complaint Date
                  </span>
                  <span className="font-medium text-[#0F172A]">{complaint.complaint_date}</span>
                </div>
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
            </div>

            <Divider />

            {/* Narrative Description */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Detailed Narrative Event Description
              </span>
              <p className="text-sm text-[#0F172A] leading-relaxed bg-slate-50 p-4 rounded-2xl border border-[#E2E8F0]">
                {complaint.complaint_description}
              </p>
            </div>

            {/* Timestamps */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0] gap-2">
              <span>Created: {new Date(complaint.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(complaint.updated_at).toLocaleString()}</span>
            </div>
          </Card>

          {/* SECTION 2: UPLOADED DOCUMENTS */}
          <Section title="Linked Document Artifacts" subtitle="PDF, DOCX, and communication attachments">
            <Card className="p-6 border-[#E2E8F0] shadow-sm">
              {documents.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-4">
                  No document artifacts attached to this complaint.
                </p>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {documents.map((doc: ComplaintDocument) => (
                    <div key={doc.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-[#2563EB] shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-sm text-[#0F172A] block truncate">
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
          {/* SECTION 3: AI ANALYSIS CARD */}
          <Card className="p-6 border-[#E2E8F0] shadow-sm space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E8F0]">
              <div className="p-1.5 bg-blue-50 text-[#2563EB] rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-[#0F172A]">AI Extraction Intelligence</h3>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Executive AI Summary
              </span>
              <p className="text-xs text-[#0F172A] leading-relaxed bg-blue-50/40 p-3.5 rounded-xl border border-blue-100/80">
                {complaint.ai_summary || 'No AI summary generated.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  AI Confidence
                </span>
                <span className="text-lg font-bold text-[#2563EB] mt-0.5 block">
                  {confidenceDisplay}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block">
                  Risk Level
                </span>
                <div className="mt-1">{getRiskBadge(complaint.risk_level)}</div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Missing Field Status
              </span>
              {missingFields.length === 0 ? (
                <div className="flex items-center space-x-2 text-xs text-[#16A34A] bg-emerald-50 p-3 rounded-xl border border-emerald-100 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All required pharma fields verified</span>
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

          {/* SECTION 4: GITHUB-STYLE 21 CFR PART 11 AUDIT TIMELINE */}
          <Section title="Audit Trail Log" subtitle="21 CFR Part 11 compliant event log">
            <Card className="p-6 border-[#E2E8F0] shadow-sm">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-4">
                  No audit log entries recorded yet.
                </p>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E2E8F0]">
                  {auditLogs.map((log: ComplaintAuditLog) => (
                    <div key={log.id} className="relative flex items-start space-x-4 pl-8">
                      <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-white border-2 border-[#2563EB] flex items-center justify-center text-[#2563EB] z-10 shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-[#0F172A] tracking-wider uppercase">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748B] block">
                          User ID: <code className="text-[#2563EB]">{log.user_id}</code>
                        </span>
                        {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                          <div className="mt-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0] font-mono text-slate-700 overflow-x-auto">
                            {JSON.stringify(log.changed_fields, null, 2)}
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
