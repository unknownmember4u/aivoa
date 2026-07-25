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

export const complaintApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useSubmitComplaintMutation } = complaintApi;
