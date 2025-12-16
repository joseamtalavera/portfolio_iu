export type User = {
  name?: string;
  email?: string;
};

export type MailItem = {
  id: number;
  subject: string;
  message: string;
  timestamp: string;
  pdfUrl?: string;
};

