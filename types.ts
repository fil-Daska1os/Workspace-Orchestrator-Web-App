
export enum MessageAuthor {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface ConfirmationPayload {
  toolName: 'send_email' | 'create_calendar_event' | 'create_google_doc';
  toolArgs: any;
}

export interface ChatMessage {
  author: MessageAuthor;
  content: string;
  payload?: ConfirmationPayload;
}

export enum WorkspaceItemType {
  EMAIL = 'email',
  EVENT = 'event',
  DOCUMENT = 'document',
}

export interface WorkspaceItem {
  id: string;
  type: WorkspaceItemType;
  title: string;
  snippet: string;
  context: string;
  timestamp: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface EventPayload {
  title: string;
  date: string;
  time: string;
  attendees: string[];
}

export interface DocPayload {
    title: string;
    content: string;
}
