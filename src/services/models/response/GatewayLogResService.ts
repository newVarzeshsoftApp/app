export interface GatewayLog {
  id?: number;
  status?: 'connected' | 'disconnected' | 'error' | 'success';
  type?: 'message' | 'connection';
  user?: number;
  pattern?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface GatewayLogResponse {
  content?: GatewayLog[];
  total?: number;
  [key: string]: any;
}
