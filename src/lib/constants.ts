export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MENTORING_RECAP: '/mentoring/recap',
  LEADERBOARD: '/leaderboard',
  TEAMS: '/teams',
  CAMPUSES: '/master/campuses',
  ADMINS: '/master/admins',
  PROFILE: '/profile',
};

export const API_ROUTES = {
  LOGIN: '/api/v1/auth/admin/login',
  CAMPUSES: '/api/v1/campuses',
  CAMPUS_DETAIL: (id: number | string) => `/api/v1/campuses/${id}`,
  
  LEADERBOARD_GLOBAL: '/api/v1/leaderboard/global',
  LEADERBOARD_ACTIVITY: (activityId: number | string) => `/api/v1/leaderboard/activity/${activityId}`,
  LEADERBOARD_GENERATE: '/api/v1/leaderboard/generate',
  
  DEED_ACTIVITIES: '/api/v1/deed-activities',
  DEED_ACTIVITY_DETAIL: (id: number | string) => `/api/v1/deed-activities/${id}`,
  
  WEEKS_CURRENT: '/api/v1/weeks/current',
  WEEK_DETAIL: (id: number | string) => `/api/v1/weeks/${id}`,
  WEEKS: '/api/v1/weeks',
  
  ADMIN_PROFILE: '/api/v1/admins/profile',
  ADMINS: '/api/v1/admins',
  ADMIN_DETAIL: (id: number | string) => `/api/v1/admins/${id}`,
  ADMIN_DEACTIVATE: (id: number | string) => `/api/v1/admins/${id}/deactivate`,
  ADMIN_TRANSFER_CAMPUS: (id: number | string) => `/api/v1/admins/${id}/transfer-campus`,
  
  CUSTOMERS: '/api/v1/customers',
  CUSTOMERS_COUNT: '/api/v1/customers/count',
  CUSTOMERS_TRANSFER_TEAM: '/api/v1/customers/transfer-team',
  
  TEAMS: '/api/v1/teams',
  TEAM_DETAIL: (id: number | string) => `/api/v1/teams/${id}`,
  TEAMS_BY_CAMPUS: (campusId: number | string) => `/api/v1/teams/campus/${campusId}`,
  
  MENTORING_RECAP: '/api/v1/mentoring/recap',
};

export const GENDER_OPTIONS = [
  { value: 'PRIA', label: 'Ikhwan (Pria)' },
  { value: 'WANITA', label: 'Akhwat (Wanita)' },
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA', label: 'SMA / Sederajat' },
  { value: 'D1', label: 'D1' },
  { value: 'D2', label: 'D2' },
  { value: 'D3', label: 'D3' },
  { value: 'S1', label: 'S1 / Sarjana' },
  { value: 'S2', label: 'S2 / Magister' },
  { value: 'S3', label: 'S3 / Doktor' },
  { value: 'OTHER', label: 'Lainnya' },
] as const;
