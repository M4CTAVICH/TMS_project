export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  locationId?: string; // Required for non-MANAGER roles
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: string;
  locationId?: string;
  isActive?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}
