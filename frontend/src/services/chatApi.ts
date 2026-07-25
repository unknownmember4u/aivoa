import { baseApi } from './baseApi';
import { ChatMessage } from '@/types';

export interface SendMessageRequest {
  complaintId: string;
  question: string;
}

export interface SendMessageResponse {
  answer: string;
  complaint_id: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query<ChatMessage[], string>({
      query: (complaintId) => `/complaints/${complaintId}/chat`,
      providesTags: (_result, _error, complaintId) => [
        { type: 'Chat', id: complaintId },
      ],
    }),

    sendChatMessage: builder.mutation<SendMessageResponse, SendMessageRequest>({
      query: ({ complaintId, question }) => ({
        url: `/complaints/${complaintId}/chat`,
        method: 'POST',
        body: { question },
      }),
      invalidatesTags: (_result, _error, { complaintId }) => [
        { type: 'Chat', id: complaintId },
      ],
    }),
  }),
});

export const { useGetChatHistoryQuery, useSendChatMessageMutation } = chatApi;
