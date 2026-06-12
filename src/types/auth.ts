export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface AuthUser {
  email: string;
  name: string;
  type: UserRole;
  campusId: number | null;
  campusName: string | null;
  accessToken: string;
  refreshToken: string;
}
