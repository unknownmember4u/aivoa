import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Complaint, ComplaintStatus, Severity, RiskLevel } from '@/types';

interface ComplaintState {
  activeComplaint: Partial<Complaint> | null;
  isDirty: boolean;
  filterStatus: ComplaintStatus | 'ALL';
  filterSeverity: Severity | 'ALL';
  filterRiskLevel: RiskLevel | 'ALL';
  searchQuery: string;
}

const initialState: ComplaintState = {
  activeComplaint: null,
  isDirty: false,
  filterStatus: 'ALL',
  filterSeverity: 'ALL',
  filterRiskLevel: 'ALL',
  searchQuery: '',
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    setActiveComplaint: (state, action: PayloadAction<Partial<Complaint> | null>) => {
      state.activeComplaint = action.payload;
      state.isDirty = false;
    },
    updateActiveComplaintField: (state, action: PayloadAction<{ field: string; value: unknown }>) => {
      if (state.activeComplaint) {
        state.activeComplaint = {
          ...state.activeComplaint,
          [action.payload.field]: action.payload.value,
        };
        state.isDirty = true;
      }
    },
    setFilterStatus: (state, action: PayloadAction<ComplaintStatus | 'ALL'>) => {
      state.filterStatus = action.payload;
    },
    setFilterSeverity: (state, action: PayloadAction<Severity | 'ALL'>) => {
      state.filterSeverity = action.payload;
    },
    setFilterRiskLevel: (state, action: PayloadAction<RiskLevel | 'ALL'>) => {
      state.filterRiskLevel = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetComplaintState: () => initialState,
  },
});

export const {
  setActiveComplaint,
  updateActiveComplaintField,
  setFilterStatus,
  setFilterSeverity,
  setFilterRiskLevel,
  setSearchQuery,
  resetComplaintState,
} = complaintSlice.actions;

export default complaintSlice.reducer;
