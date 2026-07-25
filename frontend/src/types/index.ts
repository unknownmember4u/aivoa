export type UserRole = 'QA_ANALYST' | 'QA_MANAGER' | 'ADMIN';
export type ComplaintStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_INVESTIGATION' | 'CLOSED';
export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ComplaintSource = 'EMAIL' | 'PHONE' | 'WEB_PORTAL' | 'REGULATORY_NOTICE';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  customer_name: string;
  complaint_source: ComplaintSource;
  product_name: string;
  strength_grade?: string;
  batch_number: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity?: number;
  complaint_type: string;
  complaint_description: string;
  complaint_date: string;
  severity: Severity;
  priority: Priority;
  status: ComplaintStatus;
  risk_level?: RiskLevel;
  confidence_score?: number;
  missing_fields: string[];
  ai_summary?: string;
  ai_metadata: Record<string, unknown>;
  created_by_id: string;
  updated_by_id?: string;
  documents?: ComplaintDocument[];
  created_at: string;
  updated_at: string;
}

export interface ComplaintDocument {
  id: string;
  complaint_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  complaint_id: string;
  user_id: string;
  sender: 'USER' | 'ASSISTANT';
  message_text: string;
  created_at: string;
}
