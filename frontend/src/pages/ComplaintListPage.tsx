import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  RotateCcw,
  Eye,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Input,
  Select,
  Spinner,
  EmptyState,
} from '@/components/ui';
import { useGetComplaintsQuery } from '@/services/complaintApi';

export const ComplaintListPage: React.FC = () => {
  const navigate = useNavigate();

  // Query state parameters
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('ALL');
  const [severity, setSeverity] = useState<string>('ALL');
  const [riskLevel, setRiskLevel] = useState<string>('ALL');

  const { data, isLoading, isError, error, refetch } = useGetComplaintsQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status !== 'ALL' ? status : undefined,
    severity: severity !== 'ALL' ? severity : undefined,
    risk_level: riskLevel !== 'ALL' ? riskLevel : undefined,
  });

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setSeverity('ALL');
    setRiskLevel('ALL');
    setPage(1);
  };

  const getSeverityBadge = (sev: string) => {
    const s = sev?.toUpperCase();
    if (s === 'CRITICAL') return <Badge variant="danger">CRITICAL</Badge>;
    if (s === 'MAJOR') return <Badge variant="warning">MAJOR</Badge>;
    return <Badge variant="info">MINOR</Badge>;
  };

  const getRiskBadge = (risk?: string) => {
    const r = (risk || 'MEDIUM').toUpperCase();
    if (r === 'HIGH' || r === 'CRITICAL') return <Badge variant="danger">HIGH</Badge>;
    if (r === 'MEDIUM') return <Badge variant="warning">MEDIUM</Badge>;
    return <Badge variant="success">LOW</Badge>;
  };

  const getStatusBadge = (st: string) => {
    const s = st?.toUpperCase();
    if (s === 'SUBMITTED') return <Badge variant="info">SUBMITTED</Badge>;
    if (s === 'UNDER_INVESTIGATION') return <Badge variant="warning">INVESTIGATING</Badge>;
    if (s === 'CLOSED') return <Badge variant="success">CLOSED</Badge>;
    return <Badge variant="neutral">DRAFT</Badge>;
  };

  const items = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* PAGE HEADER */}
      <PageHeader
        title="Complaints"
        subtitle="Manage, review, and track pharmaceutical customer complaints."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/upload')}
          >
            New Complaint
          </Button>
        }
      />

      {/* FILTER TOOLBAR */}
      <Card className="p-5 border-[#E2E8F0] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Search Input (4 cols) */}
          <div className="lg:col-span-4">
            <Input
              label="Search Complaints"
              placeholder="Product, batch, customer name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-[#64748B]" />}
            />
          </div>

          {/* Status Filter (2 cols) */}
          <div className="lg:col-span-2">
            <Select
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'UNDER_INVESTIGATION', label: 'Investigating' },
                { value: 'CLOSED', label: 'Closed' },
                { value: 'DRAFT', label: 'Draft' },
              ]}
            />
          </div>

          {/* Severity Filter (2 cols) */}
          <div className="lg:col-span-2">
            <Select
              label="Severity"
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Severities' },
                { value: 'CRITICAL', label: 'Critical' },
                { value: 'MAJOR', label: 'Major' },
                { value: 'MINOR', label: 'Minor' },
              ]}
            />
          </div>

          {/* Risk Filter (2 cols) */}
          <div className="lg:col-span-2">
            <Select
              label="Risk Level"
              value={riskLevel}
              onChange={(e) => {
                setRiskLevel(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Risk Levels' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'MEDIUM', label: 'Medium Risk' },
                { value: 'LOW', label: 'Low Risk' },
              ]}
            />
          </div>

          {/* Reset Filters (2 cols) */}
          <div className="lg:col-span-2">
            <Button
              variant="outline"
              fullWidth
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* ERROR BANNER STATE */}
      {isError && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Failed to load complaints</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  {(error as any)?.data?.detail || 'Network error occurred while fetching complaint records.'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* LOADING STATE */}
      {isLoading && (
        <Card className="p-16 text-center">
          <Spinner size="lg" className="text-[#2563EB] mb-4" />
          <p className="text-sm font-medium text-[#64748B]">Loading complaint records...</p>
        </Card>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-[#64748B]" />}
          title="No Complaints Found"
          description="No customer complaints match your current search and filter criteria."
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          }
        />
      )}

      {/* MAIN DATA TABLE & MOBILE CARDS */}
      {!isLoading && !isError && items.length > 0 && (
        <Card className="overflow-hidden border-[#E2E8F0] shadow-sm">
          {/* DESKTOP / TABLET TABLE VIEW */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Complaint ID</th>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Severity</th>
                  <th className="py-3.5 px-6">Risk</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-sm text-[#0F172A]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/complaints/${item.id}`)}
                  >
                    <td className="py-4 px-6 font-mono font-semibold text-[#2563EB] text-xs">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="py-4 px-6 font-medium max-w-xs truncate">
                      {item.product_name}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#475569]">
                      {item.customer_name}
                    </td>
                    <td className="py-4 px-6">{getSeverityBadge(item.severity)}</td>
                    <td className="py-4 px-6">{getRiskBadge(item.risk_level)}</td>
                    <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-6 text-xs text-[#64748B]">
                      {item.complaint_date}
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

          {/* MOBILE CARDS VIEW */}
          <div className="sm:hidden divide-y divide-[#E2E8F0]">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 space-y-3 hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/complaints/${item.id}`)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#2563EB]">
                    {item.id.slice(0, 8)}...
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">{item.product_name}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Customer: {item.customer_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getSeverityBadge(item.severity)}
                  {getRiskBadge(item.risk_level)}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[#64748B]">{item.complaint_date}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/complaints/${item.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION FOOTER */}
          <div className="px-6 py-4 bg-slate-50 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div className="flex items-center space-x-3">
              <span>Items per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-[#E2E8F0] rounded-md px-2 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing <strong className="text-[#0F172A]">{items.length}</strong> of{' '}
                <strong className="text-[#0F172A]">{totalItems}</strong> complaints
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <span className="px-3 font-semibold text-[#0F172A]">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
