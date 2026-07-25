import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/types';

interface AIAssistantState {
  isOpen: boolean;
  activeComplaintId: string | null;
  messages: ChatMessage[];
  isGenerating: boolean;
  error: string | null;
}

const initialState: AIAssistantState = {
  isOpen: false,
  activeComplaintId: null,
  messages: [],
  isGenerating: false,
  error: null,
};

export const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    setAssistantOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setActiveComplaintId: (state, action: PayloadAction<string | null>) => {
      state.activeComplaintId = action.payload;
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setIsGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setAssistantError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isGenerating = false;
    },
    resetAssistantState: () => initialState,
  },
});

export const {
  setAssistantOpen,
  setActiveComplaintId,
  setMessages,
  addMessage,
  setIsGenerating,
  setAssistantError,
  resetAssistantState,
} = aiAssistantSlice.actions;

export default aiAssistantSlice.reducer;
