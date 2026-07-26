import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '@/store/slices/authSlice';
import complaintReducer from '@/store/slices/complaintSlice';
import uploadReducer from '@/store/slices/uploadSlice';
import aiAssistantReducer from '@/store/slices/aiAssistantSlice';
import { baseApi } from '@/services/baseApi';

const debugLoggerMiddleware = () => (next: any) => (action: any) => {
  if (
    action.type?.startsWith('auth/') ||
    action.type?.startsWith('complaint/') ||
    action.type?.startsWith('upload/') ||
    action.type?.startsWith('aiAssistant/')
  ) {
    console.log(`[DEBUG REDUX DISPATCH] [${new Date().toISOString()}] Action: ${action.type}`, action.payload);
  }
  if (action.type?.startsWith('api/')) {
    console.log(`[DEBUG RTK QUERY ACTION] [${new Date().toISOString()}] Action: ${action.type}`, {
      endpoint: action.meta?.arg?.endpointName,
      queryCacheKey: action.meta?.arg?.queryCacheKey,
      payload: action.payload,
    });
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaint: complaintReducer,
    upload: uploadReducer,
    aiAssistant: aiAssistantReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, debugLoggerMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
