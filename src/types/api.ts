export type Gender = 'PRIA' | 'WANITA';

export type EducationLevel = 'SD' | 'SMP' | 'SMA' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3' | 'OTHER';

// Authentication DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AdminLoginResponseDto {
  email: string;
  name: string;
  type: string; // "ADMIN" | "SUPER_ADMIN"
  campusId: number | null;
  campusName: string | null;
  accessToken: string;
  refreshToken: string;
}

// Leaderboard DTOs
export interface DeedLeaderboardItemDto {
  rank: number;
  customerName: string;
  teamName: string;
  campusName: string;
  score: number;
}

export interface DeedLeaderboardResponseDto {
  scope: string;
  deedActivityId: number | null;
  deedActivityName: string | null;
  generatedAt: string; // ISO Date string
  items: DeedLeaderboardItemDto[];
}

// Deed Activity DTOs
export interface DeedActivityDto {
  id: number;
  name: string;
  code: string;
  unit: string;
  maxValue: number;
  allowDecimal: boolean;
  sequence: number;
  isActive: boolean;
}

// Week DTOs
export interface WeekDto {
  id: number;
  year: number;
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// Customer DTOs
export interface CustomerDto {
  id: number;
  name: string;
  email: string;
  gender: Gender;
  educationLevel: EducationLevel;
  entryYear: number;
  institutionName: string;
  origin: string;
  domicile: string;
  birthDate: string; // YYYY-MM-DD
  teamId: number | null;
  teamName: string | null;
  campusId: number | null;
  campusName: string | null;
  createdAt: string; // ISO Date string
}

export interface PageCustomerDto {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  content: CustomerDto[];
}

export interface CustomerTransferTeamRequestDto {
  customerId: number;
  teamId: number;
}

export interface CustomerFilterParams {
  campusId?: number;
  teamId?: number;
  grade?: number;
  entryYear?: number;
  gender?: Gender;
  educationLevel?: EducationLevel;
  hasTeam?: boolean;
  page?: number;
  size?: number;
}

// Team DTOs
export interface TeamDto {
  id: number;
  name: string;
  code: string;
  grade: number;
  campusId: number;
  campusName: string;
  gender?: Gender;
}

export interface TeamRequestDto {
  name: string;
  code: string;
  grade: number;
  campusId: number;
  gender: Gender;
}

// Mentoring DTOs
export interface MentoringAttendanceRecapDto {
  customerId: number;
  customerName: string;
  gender: Gender;
  teamId: number | null;
  teamName: string | null;
  campusId: number | null;
  campusName: string | null;
  totalAttendance: number;
  totalSessions: number;
}

// Campus DTOs
export interface CampusDto {
  id: number;
  name: string;
}

export interface CampusRequestDto {
  name: string;
}

// Admin DTOs
export interface AdminDto {
  id: number;
  name: string;
  email: string;
  adminGroupCode: string; // e.g. "SUPER_ADMIN" | "ADMIN"
  adminGroupName: string;
  campusId: number | null;
  campusName: string | null;
  isActive: boolean;
  expiredAt: string | null; // ISO Date string
  createdAt: string; // ISO Date string
}

export interface AdminRequestDto {
  name: string;
  email: string;
  password?: string;
  adminGroupId: number;
  campusId: number | null;
}

export interface AdminTransferCampusRequestDto {
  campusId: number;
}

// Mentoring Summary DTO
export interface MentoringAttendanceSummaryDto {
  campusId: number | null;
  grade: number | null;
  gender: Gender | null;
  totalCustomers: number;
  averageAttendancePercentage: number;
}

// Deed Score Average DTOs
export interface ActivityAverageDto {
  deedActivityId: number;
  activityName: string;
  unit: string;
  averageValue: number;
}

export interface DeedScoreAverageDto {
  campusId: number | null;
  campusName: string | null;
  grade: number | null;
  gender: Gender | null;
  totalCustomers: number;
  activities: ActivityAverageDto[];
}
