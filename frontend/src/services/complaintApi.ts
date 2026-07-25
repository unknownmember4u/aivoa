import { baseApi } from './baseApi';
import { Complaint } from '@/types';

export interface ComplaintCreatePayload {
  customer_name: string;
  complaint_source: string;
  product_name: string;
  strength_grade?: string;
  batch_number: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity?: number;
  complaint_type: string;
  complaint_description: string;
  complaint_date: string;
  severity: string;
  priority: string;
  risk_level?: string;
  ai_summary?: string;
}

export interface ComplaintQueryParams {
  page?: number;
  page_size?: number;
  status?: string;
  severity?: string;
  risk_level?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface PaginatedComplaintsResponse {
  items: Complaint[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const complaintApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplaints: builder.query<PaginatedComplaintsResponse, ComplaintQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.page_size) queryParams.append('page_size', params.page_size.toString());
        if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
        if (params.severity && params.severity !== 'ALL') queryParams.append('severity', params.severity);
        if (params.risk_level && params.risk_level !== 'ALL') queryParams.append('risk_level', params.risk_level);
        if (params.search) queryParams.append('search', params.search);
        if (params.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params.sort_order) queryParams.append('sort_order', params.sort_order);

        return `/complaints?${queryParams.toString()}`;
      },
      providesTags: ['Complaint'],
    }),

    getComplaintById: builder.query<Complaint, string>({
      query: (id) => `/complaints/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Complaint', id }],
    }),

    submitComplaint: builder.mutation<
      Complaint,
      { complaintData: ComplaintCreatePayload; documentId?: string }
    >({
      query: ({ complaintData, documentId }) => ({
        url: `/complaints/submit${documentId ? `?document_id=${documentId}` : ''}`,
        method: 'POST',
        body: complaintData,
      }),
      invalidatesTags: ['Complaint'],
    }),
  }),
});

export const {
  useGetComplaintsQuery,
  useGetComplaintByIdQuery,
  useSubmitComplaintMutation,
} = complaintApi;
