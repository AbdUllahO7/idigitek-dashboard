
// Base interface for WebSite model
export interface WebSiteProps {
  _id?: string;
  name: string;
  description?: string;
  logo?: string;
  sector?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for WebSiteUser join model
export interface WebSiteUserProps {
  _id?: string;
  userId: string ;
  WebSiteId: string ;
  role: 'owner' | 'user' | 'superAdmin' | 'Admin'| 'idigitekAdmin';
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended interface that includes user data for frontend display
export interface WebSiteUserWithDetailsProps extends WebSiteUserProps {
  user?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Interface for WebSite with its users for frontend display
export interface WebSiteWithUsersProps extends WebSiteProps {
  users: WebSiteUserWithDetailsProps[];
}

// Interface for API response structure
export interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  message?: string;
}

// Common response types
export interface WebSiteResponse {
  website: WebSiteProps;
}

export interface WebSitesResponse {
  websites: WebSiteProps[];
}

export interface WebSiteUsersResponse {
  users: WebSiteUserWithDetailsProps[];
}

export interface WebSiteUserResponse {
  websiteUser: WebSiteUserProps;
}