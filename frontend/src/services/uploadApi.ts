import { baseApi } from './baseApi';
import { ComplaintDocument } from '@/types';

export interface ProcessComplaintResponse {
  extracted_data: Record<string, unknown>;
  confidence_score: number;
  missing_fields: string[];
  ai_summary?: string;
  risk_level?: string;
  processing_status?: string;
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadDocument: builder.mutation<ComplaintDocument, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    processComplaint: builder.mutation<ProcessComplaintResponse, string>({
      query: (documentId) => ({
        url: `/complaints/process/${documentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Complaint'],
    }),
  }),
});

export const { useUploadDocumentMutation, useProcessComplaintMutation } = uploadApi;
