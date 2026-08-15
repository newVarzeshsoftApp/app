export interface QueueConsumer {
  consumerTag: string;
  connectionName: string;
  ipAddress?: string;
  [key: string]: any;
}

export interface QueueConsumersResponse {
  queueName: string;
  consumers: QueueConsumer[];
  [key: string]: any;
}

export interface DuplicateCheckResponse {
  queueName: string;
  hasDuplicates: boolean;
  consumers: QueueConsumer[];
  [key: string]: any;
}

export interface OrganizationConsumersResponse {
  orgKey: string;
  queueName: string;
  consumers: QueueConsumer[];
  [key: string]: any;
}

