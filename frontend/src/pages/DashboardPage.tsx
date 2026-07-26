import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { PageHeader, Section, Card, Badge, Button } from '@/components/ui';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Premium KPI Cards Data with Mini Sparklines
  const kpiData = [
    {
      title: 'Total Complaints',
      value: '1,284',
      trend: '+12.4%',
      trendUp: true,
      comparison: 'vs. last month',
      badgeText: 'All Time',
      badgeVariant: 'info' as const,
      icon: Activity,
      iconBg: 'bg-blue-50 text-[#2563EB]',
      sparkline: (
        <svg className="w-20 h-8 stroke-blue-500 fill-blue-500/10" viewBox="0 0 100 30">
          <path
            d="M0,25 Q15,18 30,22 T60,10 T90,15 T100,5 L100,30 L0,30 Z"
            strokeWidth="0"
          />
          <path
            d="M0,25 Q15,18 30,22 T60,10 T90,15 T100,5"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      title: 'Open Complaints',
      value: '86',
      trend: '+4 today',
      trendUp: true,
      comparison: 'pending QA triage',
      badgeText: 'Active',
      badgeVariant: 'warning' as const,
      icon: FileText,
      iconBg: 'bg-amber-50 text-[#D97706]',
      sparkline: (
        <svg className="w-20 h-8 stroke-amber-500 fill-amber-500/10" viewBox="0 0 100 30">
          <path
            d="M0,20 Q20,28 40,15 T80,22 T100,12 L100,30 L0,30 Z"
            strokeWidth="0"
          />
          <path
            d="M0,20 Q20,28 40,15 T80,22 T100,12"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      title: 'Critical Risk Cases',
      value: '12',
      trend: '-2 this week',
      trendUp: false,
      comparison: 'urgent recall review',
      badgeText: 'High Priority',
      badgeVariant: 'danger' as const,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-[#EF4444]',
      sparkline: (
        <svg className="w-20 h-8 stroke-rose-500 fill-rose-500/10" viewBox="0 0 100 30">
          <path
            d="M0,10 Q25,25 50,12 T75,26 T100,18 L100,30 L0,30 Z"
            strokeWidth="0"
          />
          <path
            d="M0,10 Q25,25 50,12 T75,26 T100,18"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      title: 'AI Ingestion Accuracy',
      value: '97.4%',
      trend: '+0.8%',
      trendUp: true,
      comparison: 'automated extraction',
      badgeText: 'Optimal',
      badgeVariant: 'success' as const,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-[#16A34A]',
      sparkline: (
        <svg className="w-20 h-8 stroke-emerald-500 fill-emerald-500/10" viewBox="0 0 100 30">
          <path
            d="M0,22 Q30,12 60,18 T90,8 T100,4 L100,30 L0,30 Z"
            strokeWidth="0"
          />
          <path
            d="M0,22 Q30,12 60,18 T90,8 T100,4"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      ),
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
      buttonText: 'Upload Document',
      action: () => navigate('/upload'),
      variant: 'primary' as const,
    },
    {
      title: 'Review Complaints Queue',
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
    <div className="space-y-8 pb-8">
      {/* PAGE HEADER */}
      <PageHeader
        title="Quality Assurance Dashboard"
        subtitle="Real-time pharmaceutical complaint analytics, risk metrics, and triage pipeline."
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

      {/* SECTION 1: FOUR PREMIUM KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 h-full flex flex-col justify-between hover:shadow-hover border-[#E2E8F0] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${kpi.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant={kpi.badgeVariant}>{kpi.badgeText}</Badge>
                  </div>

                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                    {kpi.title}
                  </span>

                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-[#0F172A] tracking-tight">
                      {kpi.value}
                    </span>
                    <div className="shrink-0">{kpi.sparkline}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 mt-4 pt-3 border-t border-[#F1F5F9] text-xs">
                  {kpi.trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
                  )}
                  <span className={`font-semibold ${kpi.trendUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-[#64748B] truncate">{kpi.comparison}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* SECTION 2: RECENT COMPLAINTS TABLE */}
      <Section
        title="Recent Complaint Ingestions"
        subtitle="Latest customer complaints logged into the quality management system"
        action={
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/complaints')}
          >
            View All Complaints
          </Button>
        }
      >
        <Card className="overflow-hidden border-[#E2E8F0] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-4 px-6">Complaint ID</th>
                  <th className="py-4 px-6">Product Description</th>
                  <th className="py-4 px-6">Severity Rating</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Risk Assessment</th>
                  <th className="py-4 px-6">Logged Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A]">
                {recentComplaints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/complaints/${item.id}`)}
                  >
                    <td className="py-4 px-6 font-mono font-semibold text-[#2563EB]">
                      {item.id}
                    </td>
                    <td className="py-4 px-6 font-medium max-w-xs truncate text-[#0F172A]">
                      {item.product}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.severityVariant}>{item.severity}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.statusVariant}>{item.status}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.riskVariant} dot>{item.risk}</Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#64748B]">
                      {item.createdDate}
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4 text-[#64748B] group-hover:text-[#2563EB]" />}
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

      {/* SECTION 3: QUICK ACTION WORKFLOW CARDS */}
      <Section title="Quick Actions" subtitle="Frequently used pharmaceutical quality assurance operations">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div key={idx} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="p-6 flex flex-col justify-between h-full hover:shadow-hover transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4 border border-blue-100/60 shadow-xs">
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
              </motion.div>
            );
          })}
        </div>
      </Section>
    </div>
  );
};
