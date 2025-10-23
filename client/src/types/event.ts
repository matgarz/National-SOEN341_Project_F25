// client/src/types/event.ts
export type Organizer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  department?: string | null;
};

export type Organization = {
  id: number;
  name: string;
};

export type Creator = {
  id: number;
  name: string;
  email: string;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  ticketType: 'FREE' | 'PAID';
  ticketPrice?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  organization: Organization;
  creator: Creator;
  organizer?: Organizer | null;
  _count?: { tickets: number };
};
