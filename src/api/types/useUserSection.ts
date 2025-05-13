// Add these interfaces to your types.ts file

// User Section relationship
export interface IUserSection {
  _id: string;
  userId: string;
  sectionId: string | ISection;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

// You might also want to extend your existing User interface
export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // You might want to add this field if you want to eagerly load active sections
  activeSections?: ISection[];
}

// Make sure your Section interface has all necessary fields
export interface ISection {
  _id: string;
  name: string;
  description: string;
  image: string | null;
  isActive: boolean;
  order: number;
  WebSiteId: string;
  sectionItems?: string[] | any[]; // Depends on your actual type
  createdAt: string;
  updatedAt: string;
}