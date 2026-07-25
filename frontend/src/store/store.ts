import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/store/slices/authSlice';
import complaintReducer from '@/store/slices/complaintSlice';
import uploadReducer from '@/store/slices/uploadSlice';
import aiAssistantReducer from '@/store/slices/aiAssistantSlice';
import { baseApi } from '@/services/baseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaint: complaintReducer,
    upload: uploadReducer,
    aiAssistant: aiAssistantReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
