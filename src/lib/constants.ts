export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  MENTORING_RECAP: '/mentoring/recap',
  LEADERBOARD: '/leaderboard',
  TEAMS: '/teams',
  CAMPUSES: '/master/campuses',
  ADMINS: '/master/admins',
  COACHES: '/master/coaches',
  PROFILE: '/profile',
  COACH_LOGIN: '/coach/login',
  COACH_FORGOT_PASSWORD: '/coach/forgot-password',
  COACH_RESET_PASSWORD: '/coach/reset-password',
  COACH_DASHBOARD: '/coach',
  COACH_DEED_SCORE: '/coach/deed-score',
  COACH_MENTORING: '/coach/mentoring',
  COACH_PROFILE: '/coach/profile',
};

export const API_ROUTES = {
  LOGIN: '/api/v1/auth/admin/login',
  LOGIN_COACH: '/api/v1/auth/coach/login',
  FORGOT_PASSWORD_ADMIN: '/api/v1/auth/admin/forgot-password',
  RESET_PASSWORD_ADMIN: '/api/v1/auth/admin/reset-password',
  FORGOT_PASSWORD_COACH: '/api/v1/auth/coach/forgot-password',
  RESET_PASSWORD_COACH: '/api/v1/auth/coach/reset-password',
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
  TEAMS_COUNT: '/api/v1/teams/count',
  
  MENTORING_RECAP: '/api/v1/mentoring/recap',
  MENTORING_RECAP_SUMMARY: '/api/v1/mentoring/recap/summary',
  
  DEED_SCORE_AVERAGE: '/api/v1/deed-score/average',

  COACHES: '/api/v1/coaches',
  COACH_DETAIL: (id: number | string) => `/api/v1/coaches/${id}`,
  COACH_ACTIVATE: (id: number | string) => `/api/v1/coaches/${id}/activate`,
  COACH_DEACTIVATE: (id: number | string) => `/api/v1/coaches/${id}/deactivate`,
  COACH_ASSIGN_TEAM: (id: number | string) => `/api/v1/coaches/${id}/assign-team`,
  COACH_UNASSIGN_TEAM: (id: number | string, teamId: number | string) => `/api/v1/coaches/${id}/teams/${teamId}`,
  COACH_PROFILE_API: '/api/v1/coaches/profile',
  COACH_TEAMS: '/api/v1/coach/teams',
  COACH_CUSTOMERS: '/api/v1/coach/customers',
  COACH_MENTORING_RECAP: '/api/v1/coach/mentoring/recap',
  COACH_DEED_SCORE_AVERAGE: '/api/v1/coach/deed-score/average',
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
