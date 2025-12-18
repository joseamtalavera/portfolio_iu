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

export type Booking = {
  id: number;
  product: string;
  date: string;
  startHour: string;
  endHour: string;
  attendees: number;
};


export type TimeSlot = {
  label : string;
  value : string;
};

export type RoomAvailability = {
  room: string;
  booked : string[];
}
