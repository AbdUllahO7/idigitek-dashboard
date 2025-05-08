// src/types/user.ts

// User status enum
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
  }
  
  // User interface
  export interface User {
    id?: string;
    _id?: string; // Some APIs use _id instead of id
    firstName?: string;
    lastName?: string;
    email: string;
    role?: Roles;
    status: UserStatus;
    isEmailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Form data for creating/updating a user
  export interface UserFormData extends Omit<User, '_id' | 'id'> {
    id?: string; // Make id optional
    password?: string;
    confirmPassword?: string;
  }

  export enum Roles {
    OWNER = 'owner',
    SUPERADMIN = 'superAdmin',
    ADMIN = 'admin',
    USER = 'user'
  
  
  }