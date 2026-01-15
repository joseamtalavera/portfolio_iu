/**
 * User profile data returned by the backend.
 */
/**
 * Shared frontend TypeScript types.
 */
export type User = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  subscriptionStatus?: string;
};

/**
 * Mailbox item payload from the API.
 */
export type MailItem = {
  id: number;
  subject: string;
  message: string;
  timestamp: string;
  pdfUrl?: string;
};

/**
 * Booking payload from the API.
 */
export type Booking = {
  id: number;
  product: string;
  date: string;
  startHour: string;
  endHour: string;
  attendees: number;
};


/**
 * Time slot label/value pair.
 */
export type TimeSlot = {
  label : string;
  value : string;
};

/**
 * Booked time slots for a room.
 */
export type RoomAvailability = {
  room: string;
  booked : string[];
}
