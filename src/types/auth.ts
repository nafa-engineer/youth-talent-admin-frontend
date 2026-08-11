export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  COACH = 'COACH',
}

export interface AuthUser {
  email: string;
  name: string;
  type: UserRole;
  campusId: number | null;
  campusName: string | null;
  accessToken: string;
  refreshToken: string;
  // Coach-only fields
  gender?: string;
  isInternal?: boolean;
  teamIds?: number[];
}
