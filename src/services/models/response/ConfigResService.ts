export interface Config {
  id?: number;
  key?: string;
  value?: any;
  [key: string]: any;
}

export interface ConfigResponse {
  configs?: Config[];
  [key: string]: any;
}
