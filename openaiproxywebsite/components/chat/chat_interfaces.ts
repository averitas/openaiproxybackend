// Common interfaces for SSE responses

export interface SSEBaseEvent {
  type: string;
  message_id: string;
  payload: any;
}

export interface SSEQuoteInfo {
    index: number;
    position: number;
}

export interface ReplyPayload {
  content: string;
  session_id: string;
  request_id: string;
  record_id: string;
  timestamp: number;
  is_final: boolean;
  from_name?: string;
  is_evil?: boolean;
  is_llm_generated?: boolean;
  is_from_self?: boolean;
  quote_infos?: SSEQuoteInfo[] | any;
}

export interface ThoughtPayload {
  session_id: string;
  request_id: string;
  record_id: string;
  trace_id: string;
  procedures: ThoughtProcedure[];
  elapsed: number;
  is_workflow: boolean;
  workflow_name?: string;
}

export type ThoughtStatus = 'processing' | 'success' | 'failed'

export interface ThoughtProcedure {
  debugging?: {
    content: string;
  };
  name: string;
  index: number;
  status: ThoughtStatus;
  title: string;
  elapsed: number;
  icon?: string;
  plugin_type?: number;
  reply_index?: number;
  switch?: string;
  workflow_name?: string;
  node_name?: string;
}

export interface TokenStatPayload {
  session_id: string;
  request_id: string;
  token_count: number;
  used_count: number;
  free_count: number;
  order_count: number;
  status_summary: string;
  status_summary_title: string;
  elapsed: number;
  record_id: string;
  trace_id: string;
  procedures: TokenStatProcedure[];
}

export interface TokenStatProcedure {
  name: string;
  status: string;
  title: string;
  count: number;
  input_count: number;
  output_count: number;
  resource_status: number;
  debugging?: any;
}

export interface ReferenceItem {
    id?: string;
    name?: string;
    url?: string;
    type?: number;
    doc_id?: string;
    doc_name?: string;
    doc_biz_id?: string;
}

export interface ReferencePayload {
    record_id: string;
    references: ReferenceItem[];
    trace_id: string;
}

export interface SSEReplyEvent extends SSEBaseEvent {
  type: 'reply';
  payload: ReplyPayload;
}

export interface SSEUnauthorizeEvent extends SSEBaseEvent {
  type: 'unauthorize';
  payload: ReplyPayload;
}

export interface SSEThoughtEvent extends SSEBaseEvent {
  type: 'thought';
  payload: ThoughtPayload;
}

export interface SSETokenStatEvent extends SSEBaseEvent {
  type: 'token_stat';
  payload: TokenStatPayload;
}

export interface SSEReferenceEvent extends SSEBaseEvent {
    type: 'reference';
    payload: ReferencePayload;
}

// Union type for all possible SSE events
export type SSEEvent = SSEReferenceEvent | SSEReplyEvent | SSEThoughtEvent | SSETokenStatEvent | SSEUnauthorizeEvent;
