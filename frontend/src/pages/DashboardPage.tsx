import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sparkles,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { PageHeader, Section, Card, Badge, Button } from '@/components/ui';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder KPI Cards Data
  const kpiData = [
    {
      title: 'Total Complaints',
      value: '1,284',
      description: 'All recorded system cases',
      badgeText: 'All Time',
      badgeVariant: 'info' as const,
      icon: Activity,
      iconColor: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Open Complaints',
      value: '86',
      description: 'Pending QA investigation',
      badgeText: '+4 today',
      badgeVariant: 'warning' as const,
      icon: FileText,
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Critical Complaints',
      value: '12',
      description: 'High priority risk level',
      badgeText: 'Urgent',
      badgeVariant: 'danger' as const,
      icon: AlertTriangle,
      iconColor: 'text-red-600 bg-red-50',
    },
    {
      title: 'AI Intake Accuracy',
      value: '97.4%',
      description: 'Automated parsing success',
      badgeText: 'High',
      badgeVariant: 'success' as const,
      icon: CheckCircle2,
      iconColor: 'text-green-600 bg-green-50',
    },
  ];

  // Placeholder Recent Complaints Table Data
  const recentComplaints = [
    {
      id: 'CMP-2026-0891',
      product: 'Amoxicillin 500mg Capsule',
      severity: 'CRITICAL',
      severityVariant: 'danger' as const,
      status: 'SUBMITTED',
      statusVariant: 'info' as const,
      risk: 'HIGH',
      riskVariant: 'danger' as const,
      createdDate: '2026-07-25',
    },
    {
      id: 'CMP-2026-0890',
      product: 'Metformin HCl 850mg Tablet',
      severity: 'MAJOR',
      severityVariant: 'warning' as const,
      status: 'UNDER_INVESTIGATION',
      statusVariant: 'warning' as const,
      risk: 'MEDIUM',
      riskVariant: 'warning' as const,
      createdDate: '2026-07-25',
    },
    {
      id: 'CMP-2026-0889',
      product: 'Lisinopril 10mg Oral Suspension',
      severity: 'MINOR',
      severityVariant: 'info' as const,
      status: 'CLOSED',
      statusVariant: 'success' as const,
      risk: 'LOW',
      riskVariant: 'success' as const,
      createdDate: '2026-07-24',
    },
    {
      id: 'CMP-2026-0888',
      product: 'Atorvastatin 20mg Tablet',
      severity: 'MAJOR',
      severityVariant: 'warning' as const,
      status: 'SUBMITTED',
      statusVariant: 'info' as const,
      risk: 'MEDIUM',
      riskVariant: 'warning' as const,
      createdDate: '2026-07-24',
    },
    {
      id: 'CMP-2026-0887',
      product: 'Omeprazole 40mg Delayed Release',
      severity: 'CRITICAL',
      severityVariant: 'danger' as const,
      status: 'UNDER_INVESTIGATION',
      statusVariant: 'warning' as const,
      risk: 'HIGH',
      riskVariant: 'danger' as const,
      createdDate: '2026-07-23',
    },
  ];

  // Placeholder Quick Action Cards
  const quickActions = [
    {
      title: 'Upload Complaint Document',
      description: 'Ingest PDF, DOCX, TXT or EML complaint files for automated AI extraction.',
      icon: Upload,
      buttonText: 'Upload File',
      action: () => navigate('/upload'),
      variant: 'primary' as const,
    },
    {
      title: 'Review Intake Queue',
      description: 'Inspect AI extracted metadata, fill missing fields, and submit reviewed cases.',
      icon: FileText,
      buttonText: 'View Complaints',
      action: () => navigate('/complaints'),
      variant: 'outline' as const,
    },
    {
      title: 'Grounded AI Assistant',
      description: 'Ask questions grounded on complaint history, batch logs, and document text.',
      icon: Sparkles,
      buttonText: 'Launch Assistant',
      action: () => navigate('/complaints'),
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* PAGE HEADER */}
      <PageHeader
        title="Dashboard"
        subtitle="AI Complaint Management Overview"
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/complaints')}
            >
              New Complaint
            </Button>
            <Button
              variant="primary"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => navigate('/upload')}
            >
              Upload Document
            </Button>
          </>
        }
      />

      {/* SECTION 1: FOUR KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              className="p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  {kpi.title}
                </span>
                <Badge variant={kpi.badgeVariant}>{kpi.badgeText}</Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-[#0F172A] tracking-tight">
                  {kpi.value}
                </span>
                <div className={`p-2.5 rounded-xl ${kpi.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-[#64748B] mt-2">{kpi.description}</p>
            </Card>
          );
        })}
      </div>

      {/* SECTION 2: RECENT COMPLAINTS TABLE */}
      <Section
        title="Recent Complaints"
        subtitle="Latest customer complaint cases and processing status"
        action={
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/complaints')}
          >
            View All
          </Button>
        }
      >
        <Card className="overflow-hidden border-[#E2E8F0]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Complaint ID</th>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Severity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Risk</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A]">
                {recentComplaints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/complaints/${item.id}`)}
                  >
                    <td className="py-4 px-6 font-mono font-semibold text-[#2563EB]">
                      {item.id}
                    </td>
                    <td className="py-4 px-6 font-medium max-w-xs truncate">
                      {item.product}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.severityVariant}>{item.severity}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.statusVariant}>{item.status}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.riskVariant}>{item.risk}</Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#64748B]">
                      {item.createdDate}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4 text-[#64748B]" />}
                        onClick={() => navigate(`/complaints/${item.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* SECTION 3: QUICK ACTIONS */}
      <Section title="Quick Actions" subtitle="Frequently used pharmaceutical quality workflows">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Card key={idx} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1.5">{action.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                    {action.description}
                  </p>
                </div>
                <Button
                  variant={action.variant}
                  fullWidth
                  onClick={action.action}
                >
                  {action.buttonText}
                </Button>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
};
