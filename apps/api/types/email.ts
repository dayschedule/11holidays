export interface Attachment {
    filename: string;
    content: string; // Base64 encoded
    content_type: string;
    size?: number;
}

export interface Email {
    to: string | string[];
    subject: string;
    html: string;
    attachments?: Attachment[];
    replyTo?: string;
    headers?: Record<string, string>;
}

export interface EmailResponse {
    success: boolean;
    id?: string;
    error?: string;
}
