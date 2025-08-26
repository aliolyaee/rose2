
export interface User {
  id: string;
  fullName: string;
  username: string;
  role: 'admin' | 'staff' | string;
  password?: string;
  confirm_password?: string;
  createdAt?: string;
}

export interface Table {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  photo?: string;
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance' | string;
  createdAt?: string;
}

export interface Reservation {
  id: string;
  tableId: string;
  tableName?: string;
  date: string; // Format: YYYY-MM-DD from API
  hour: string; // Format: HH:MM from API
  duration: number; // in minutes from API
  people: number; // from API
  phone: string; // from API
  description?: string; // from API (might include customer name)
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | string;
  createdAt?: string;

  // UI specific fields, not directly sent/received unless mapped
  customerName?: string;
  dateTime?: string | Date;
}

// Corresponds to API: image (URL), title, description, fee (price), available (boolean), categoryId
export interface MenuItem {
  id: string;
  image?: string; // URL for the item's image
  title: string;
  description: string;
  fee: number; // Price of the item
  available: boolean; // Availability status
  categoryId: string;
  categoryName?: string; // To be populated client-side
  createdAt?: string; // API might provide this
}

// Corresponds to API: name, icon (URL)
export interface Category {
  id: string;
  name: string;
  icon?: string; // URL to icon image
  createdAt?: string; // API might provide this
  // description field removed as it's not in API spec
}

// Corresponds to API: name, alt, image (URL or base64 data)
export interface ManagedImage {
  id: string;
  name: string; // This will be the filename or a user-defined name
  alt?: string; // Alt text for the image
  image: string; // URL of the image
  uploadedAt?: string; // Provided by API on GET
}

// API Auth Types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
    role: string;
  };
}
