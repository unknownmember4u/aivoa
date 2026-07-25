import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UploadState {
  file: { name: string; size: number; type: string } | null;
  uploadedDocumentId: string | null;
  uploadProgress: number;
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
}

const initialState: UploadState = {
  file: null,
  uploadedDocumentId: null,
  uploadProgress: 0,
  isUploading: false,
  isProcessing: false,
  error: null,
};

export const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setUploadFile: (state, action: PayloadAction<{ name: string; size: number; type: string } | null>) => {
      state.file = action.payload;
      state.error = null;
      state.uploadProgress = 0;
    },
    setUploadedDocumentId: (state, action: PayloadAction<string | null>) => {
      state.uploadedDocumentId = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    setIsProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setUploadError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isUploading = false;
      state.isProcessing = false;
    },
    resetUploadState: () => initialState,
  },
});

export const {
  setUploadFile,
  setUploadedDocumentId,
  setUploadProgress,
  setIsUploading,
  setIsProcessing,
  setUploadError,
  resetUploadState,
} = uploadSlice.actions;

export default uploadSlice.reducer;
