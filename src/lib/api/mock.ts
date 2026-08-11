import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { API_ROUTES } from '../constants';
import { UserRole } from '../../types/auth';
import { 
  CampusDto, 
  WeekDto, 
  DeedActivityDto, 
  TeamDto, 
  CustomerDto, 
  DeedLeaderboardResponseDto,
  AdminDto
} from '../../types/api';

// ----------------------------------------------------
// Mutable Mock Data Store
// ----------------------------------------------------
const campuses: CampusDto[] = [
  { id: 1, name: "Kampus Jakarta Selatan" },
  { id: 2, name: "Kampus Bandung" },
  { id: 3, name: "Kampus Surabaya" },
];

const mockAdmins: AdminDto[] = [
  {
    id: 1,
    name: "Super Admin Budi",
    email: "super.budi@gmail.com",
    adminGroupCode: "SUPER_ADMIN",
    adminGroupName: "Super Admin",
    campusId: null,
    campusName: null,
    isActive: true,
    expiredAt: null,
    createdAt: "2026-01-01T08:00:00Z"
  },
  {
    id: 2,
    name: "Admin Jakarta",
    email: "admin.jkt@gmail.com",
    adminGroupCode: "ADMIN",
    adminGroupName: "Admin Kampus",
    campusId: 1,
    campusName: "Kampus Jakarta Selatan",
    isActive: true,
    expiredAt: null,
    createdAt: "2026-01-02T09:00:00Z"
  },
  {
    id: 3,
    name: "Admin Bandung",
    email: "admin.bdg@gmail.com",
    adminGroupCode: "ADMIN",
    adminGroupName: "Admin Kampus",
    campusId: 2,
    campusName: "Kampus Bandung",
    isActive: true,
    expiredAt: null,
    createdAt: "2026-01-03T10:00:00Z"
  },
  {
    id: 4,
    name: "Admin Surabaya (Inactive)",
    email: "admin.sub.inactive@gmail.com",
    adminGroupCode: "ADMIN",
    adminGroupName: "Admin Kampus",
    campusId: 3,
    campusName: "Kampus Surabaya",
    isActive: false,
    expiredAt: "2026-06-01T00:00:00Z",
    createdAt: "2026-01-04T11:00:00Z"
  }
];

const mockWeeks: WeekDto[] = [
  { id: 1, year: 2026, weekNumber: 23, startDate: '2026-06-08', endDate: '2026-06-14' },
  { id: 2, year: 2026, weekNumber: 24, startDate: '2026-06-15', endDate: '2026-06-21' },
  { id: 3, year: 2026, weekNumber: 25, startDate: '2026-06-22', endDate: '2026-06-28' },
];

const mockDeedActivities: DeedActivityDto[] = [
  { id: 1, name: 'Shalat Jamaah 5 Waktu', code: 'SHALAT', unit: 'kali', maxValue: 5, allowDecimal: false, sequence: 1, isActive: true },
  { id: 2, name: 'Tilawah Qur\'an', code: 'TILAWAH', unit: 'halaman', maxValue: 50, allowDecimal: true, sequence: 2, isActive: true },
  { id: 3, name: 'Shaum Sunnah', code: 'SHAUM', unit: 'hari', maxValue: 1, allowDecimal: false, sequence: 3, isActive: true },
  { id: 4, name: 'Sedekah Harian', code: 'SEDEKAH', unit: 'rupiah', maxValue: 100000, allowDecimal: false, sequence: 4, isActive: true },
];

const mockTeams: TeamDto[] = [
  { id: 1, name: 'Tim Fatih JKT', code: 'TF-JKT', grade: 1, campusId: 1, campusName: 'Kampus Jakarta Selatan', gender: 'PRIA' },
  { id: 2, name: 'Tim Umar JKT', code: 'TU-JKT', grade: 2, campusId: 1, campusName: 'Kampus Jakarta Selatan', gender: 'PRIA' },
  { id: 3, name: 'Tim Aisyah JKT', code: 'TA-JKT', grade: 1, campusId: 1, campusName: 'Kampus Jakarta Selatan', gender: 'WANITA' },
  { id: 4, name: 'Tim Salahuddin BDG', code: 'TS-BDG', grade: 1, campusId: 2, campusName: 'Kampus Bandung', gender: 'PRIA' },
  { id: 5, name: 'Tim Khadijah BDG', code: 'TK-BDG', grade: 2, campusId: 2, campusName: 'Kampus Bandung', gender: 'WANITA' },
  { id: 6, name: 'Tim Khalid SUB', code: 'TK-SUB', grade: 1, campusId: 3, campusName: 'Kampus Surabaya', gender: 'PRIA' },
];

const mockCustomers: CustomerDto[] = [
  { id: 101, name: 'Ahmad Faisal', email: 'ahmad@gmail.com', gender: 'PRIA', educationLevel: 'S1', entryYear: 2022, institutionName: 'UI', origin: 'Jakarta', domicile: 'Depok', birthDate: '2001-05-12', teamId: 1, teamName: 'Tim Fatih JKT', campusId: 1, campusName: 'Kampus Jakarta Selatan', createdAt: '2026-01-10T10:00:00Z' },
  { id: 102, name: 'Umar Syarif', email: 'umar@gmail.com', gender: 'PRIA', educationLevel: 'S1', entryYear: 2021, institutionName: 'UI', origin: 'Depok', domicile: 'Depok', birthDate: '2000-08-20', teamId: 1, teamName: 'Tim Fatih JKT', campusId: 1, campusName: 'Kampus Jakarta Selatan', createdAt: '2026-01-10T10:00:00Z' },
  { id: 103, name: 'Ali bin Abi Thalib', email: 'ali@gmail.com', gender: 'PRIA', educationLevel: 'SMA', entryYear: 2024, institutionName: 'MAN 1 JKT', origin: 'Jakarta', domicile: 'Jakarta', birthDate: '2006-03-15', teamId: 2, teamName: 'Tim Umar JKT', campusId: 1, campusName: 'Kampus Jakarta Selatan', createdAt: '2026-01-10T10:00:00Z' },
  { id: 104, name: 'Hamzah Fansuri', email: 'hamzah@gmail.com', gender: 'PRIA', educationLevel: 'S1', entryYear: 2023, institutionName: 'UPN', origin: 'Medan', domicile: 'Jakarta', birthDate: '2002-11-30', teamId: 2, teamName: 'Tim Umar JKT', campusId: 1, campusName: 'Kampus Jakarta Selatan', createdAt: '2026-01-10T10:00:00Z' },
  { id: 105, name: 'Fatimah Az-Zahra', email: 'fatimah@gmail.com', gender: 'WANITA', educationLevel: 'S1', entryYear: 2022, institutionName: 'UIN Jakarta', origin: 'Tangerang', domicile: 'Ciputat', birthDate: '2002-09-09', teamId: 3, teamName: 'Tim Aisyah JKT', campusId: 1, campusName: 'Kampus Jakarta Selatan', createdAt: '2026-01-10T10:00:00Z' },
  { id: 106, name: 'Aisyah Humaira', email: 'aisyah@gmail.com', gender: 'WANITA', educationLevel: 'S1', entryYear: 2023, institutionName: 'UI', origin: 'Bogor', domicile: 'Depok', birthDate: '2003-02-14', teamId: 3, teamName: 'Tim Aisyah JKT', campusId: 1, campusName: 'Kampus Jakarta Selatan', createdAt: '2026-01-10T10:00:00Z' },
  { id: 107, name: 'Salahuddin Al-Ayyubi', email: 'salahuddin@gmail.com', gender: 'PRIA', educationLevel: 'S1', entryYear: 2020, institutionName: 'ITB', origin: 'Surabaya', domicile: 'Bandung', birthDate: '1999-12-25', teamId: 4, teamName: 'Tim Salahuddin BDG', campusId: 2, campusName: 'Kampus Bandung', createdAt: '2026-01-10T10:00:00Z' },
  { id: 108, name: 'Thariq bin Ziyad', email: 'thariq@gmail.com', gender: 'PRIA', educationLevel: 'S1', entryYear: 2022, institutionName: 'UNPAD', origin: 'Bandung', domicile: 'Jatinangor', birthDate: '2001-07-07', teamId: 4, teamName: 'Tim Salahuddin BDG', campusId: 2, campusName: 'Kampus Bandung', createdAt: '2026-01-10T10:00:00Z' },
  { id: 109, name: 'Khadijah Al-Kubra', email: 'khadijah@gmail.com', gender: 'WANITA', educationLevel: 'S2', entryYear: 2023, institutionName: 'ITB', origin: 'Bandung', domicile: 'Bandung', birthDate: '1998-04-18', teamId: 5, teamName: 'Tim Khadijah BDG', campusId: 2, campusName: 'Kampus Bandung', createdAt: '2026-01-10T10:00:00Z' },
  { id: 110, name: 'Sumayyah binti Khayyat', email: 'sumayyah@gmail.com', gender: 'WANITA', educationLevel: 'S1', entryYear: 2024, institutionName: 'UNPAD', origin: 'Cirebon', domicile: 'Bandung', birthDate: '2004-10-02', teamId: 5, teamName: 'Tim Khadijah BDG', campusId: 2, campusName: 'Kampus Bandung', createdAt: '2026-01-10T10:00:00Z' },
  { id: 111, name: 'Khalid bin Walid', email: 'khalid@gmail.com', gender: 'PRIA', educationLevel: 'S1', entryYear: 2021, institutionName: 'ITS', origin: 'Malang', domicile: 'Surabaya', birthDate: '2000-01-01', teamId: 6, teamName: 'Tim Khalid SUB', campusId: 3, campusName: 'Kampus Surabaya', createdAt: '2026-01-10T10:00:00Z' },
  { id: 112, name: 'Sa\'ad bin Abi Waqqas', email: 'saad@gmail.com', gender: 'PRIA', educationLevel: 'SMA', entryYear: 2023, institutionName: 'SMAN 2 SUB', origin: 'Surabaya', domicile: 'Sidoarjo', birthDate: '2005-06-18', teamId: 6, teamName: 'Tim Khalid SUB', campusId: 3, campusName: 'Kampus Surabaya', createdAt: '2026-01-10T10:00:00Z' },
];

let lastLeaderboardGenerateTimestamp = new Date().toISOString();

// Helper to generate mock leaderboards dynamically
const generateLeaderboardData = (activityId: number | null, campusId?: number | string): DeedLeaderboardResponseDto => {
  const activity = activityId ? mockDeedActivities.find(a => a.id === Number(activityId)) : null;
  
  let filtered = [...mockCustomers];
  if (campusId) {
    filtered = filtered.filter(c => c.campusId === Number(campusId));
  }

  // Assign stable random scores
  const items = filtered.map((c, i) => {
    let score = 0;
    if (activity) {
      // Base score depending on index and activity type
      score = activity.maxValue - (i % activity.maxValue);
    } else {
      // Global score total
      score = 80 - (i * 3) + (c.id % 15);
    }
    return {
      customerName: c.name,
      teamName: c.teamName || 'Belum Ada Tim',
      campusName: c.campusName || 'Umum',
      score: score
    };
  });

  // Sort descending
  items.sort((a, b) => b.score - a.score);

  // Assign ranks
  const rankedItems = items.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  return {
    scope: campusId ? "CAMPUS" : "GLOBAL",
    deedActivityId: activity ? activity.id : null,
    deedActivityName: activity ? activity.name : null,
    generatedAt: lastLeaderboardGenerateTimestamp,
    items: rankedItems
  };
};

export const setupMockApi = () => {
  console.log('⚠️ MOCK API ENABLED ⚠️');
  const mock = new MockAdapter(apiClient, { delayResponse: 500 });

  // 1. Mock Login
  mock.onPost(API_ROUTES.LOGIN).reply((config) => {
    const { email } = JSON.parse(config.data);
    
    // Simulate Super Admin
    if (email.includes('super')) {
      return [200, {
        status: 200,
        message: "Login successful",
        data: {
          accessToken: "mock-access-token-super",
          refreshToken: "mock-refresh-token",
          email: email,
          name: "Super Admin Budi",
          type: UserRole.SUPER_ADMIN,
          campusId: null,
          campusName: null
        }
      }];
    }
    
    // Simulate Normal Admin
    return [200, {
      status: 200,
      message: "Login successful",
      data: {
        accessToken: "mock-access-token-admin",
        refreshToken: "mock-refresh-token",
        email: email,
        name: "Admin Kampus A",
        type: UserRole.ADMIN,
        campusId: 1,
        campusName: "Kampus Jakarta Selatan"
      }
    }];
  });

  // 2. Mock Campuses
  mock.onGet(API_ROUTES.CAMPUSES).reply(200, {
    status: 200,
    message: "Success",
    data: campuses
  });

  mock.onGet(/\/api\/v1\/campuses\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const campus = campuses.find(c => c.id === id);
    if (!campus) {
      return [404, { status: 404, message: "Kampus tidak ditemukan" }];
    }
    return [200, {
      status: 200,
      message: "Success",
      data: campus
    }];
  });

  mock.onPost(API_ROUTES.CAMPUSES).reply((config) => {
    const { name } = JSON.parse(config.data);
    const newCampus = {
      id: Math.max(...campuses.map(c => c.id), 0) + 1,
      name
    };
    campuses.push(newCampus);
    return [200, {
      status: 200,
      message: "Kampus berhasil dibuat",
      data: newCampus
    }];
  });

  mock.onPut(/\/api\/v1\/campuses\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const { name } = JSON.parse(config.data);
    const campusIndex = campuses.findIndex(c => c.id === id);
    if (campusIndex === -1) {
      return [404, { status: 404, message: "Kampus tidak ditemukan" }];
    }
    campuses[campusIndex].name = name;
    
    // Update campusName in mockTeams
    mockTeams.forEach(t => {
      if (t.campusId === id) {
        t.campusName = name;
      }
    });
    
    // Update campusName in mockCustomers
    mockCustomers.forEach(c => {
      if (c.campusId === id) {
        c.campusName = name;
      }
    });

    // Update campusName in mockAdmins
    mockAdmins.forEach(a => {
      if (a.campusId === id) {
        a.campusName = name;
      }
    });

    return [200, {
      status: 200,
      message: "Kampus berhasil diperbarui",
      data: campuses[campusIndex]
    }];
  });

  mock.onDelete(/\/api\/v1\/campuses\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    
    // Check relations
    const hasTeams = mockTeams.some(t => t.campusId === id);
    const hasCustomers = mockCustomers.some(c => c.campusId === id);
    const hasAdmins = mockAdmins.some(a => a.campusId === id);
    
    if (hasTeams || hasCustomers || hasAdmins) {
      return [400, {
        status: 400,
        message: "Kampus tidak dapat dihapus karena masih memiliki relasi dengan Tim, Peserta, atau Admin."
      }];
    }
    
    const campusIndex = campuses.findIndex(c => c.id === id);
    if (campusIndex === -1) {
      return [404, { status: 404, message: "Kampus tidak ditemukan" }];
    }
    campuses.splice(campusIndex, 1);
    return [200, {
      status: 200,
      message: "Kampus berhasil dihapus"
    }];
  });

  // 3. Mock Customer Counts
  mock.onGet(API_ROUTES.CUSTOMERS_COUNT).reply((config) => {
    const params = config.params || {};
    let baseCount = 1200;
    
    if (params.campusId) {
      const cid = Number(params.campusId);
      if (cid === 1) baseCount = 500;
      if (cid === 2) baseCount = 400;
      if (cid === 3) baseCount = 300;
    }
    
    if (params.gender === 'PRIA') {
      return [200, { status: 200, message: "Success", data: Math.floor(baseCount * 0.45) }];
    }
    if (params.gender === 'WANITA') {
      return [200, { status: 200, message: "Success", data: Math.floor(baseCount * 0.55) }];
    }
    
    return [200, { status: 200, message: "Success", data: baseCount }];
  });

  // 4. Mock Current Weeks & Detail
  mock.onGet(API_ROUTES.WEEKS_CURRENT).reply(200, {
    status: 200,
    message: "Success",
    data: mockWeeks[0]
  });

  mock.onGet(/\/api\/v1\/weeks\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '1', 10);
    const week = mockWeeks.find(w => w.id === id) || mockWeeks[0];
    return [200, { status: 200, message: "Success", data: week }];
  });

  mock.onGet(API_ROUTES.WEEKS).reply(200, {
    status: 200,
    message: "Success",
    data: mockWeeks
  });

  // 5. Mock Deed Activities
  mock.onGet(API_ROUTES.DEED_ACTIVITIES).reply(200, {
    status: 200,
    message: "Success",
    data: mockDeedActivities
  });

  mock.onGet(/\/api\/v1\/deed-activities\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '1', 10);
    const act = mockDeedActivities.find(a => a.id === id);
    if (!act) return [404, { status: 404, message: "Activity not found" }];
    return [200, { status: 200, message: "Success", data: act }];
  });

  // 6. Mock Mentoring Recap
  mock.onGet(API_ROUTES.MENTORING_RECAP).reply((config) => {
    const params = config.params || {};
    let recaps = mockCustomers.map((c) => {
      // Stable total session is 10. Attendance is between 6 and 10.
      const totalAttendance = 6 + (c.id % 5);
      return {
        customerId: c.id,
        customerName: c.name,
        gender: c.gender,
        teamId: c.teamId,
        teamName: c.teamName,
        campusId: c.campusId,
        campusName: c.campusName,
        totalAttendance,
        totalSessions: 10
      };
    });

    if (params.campusId) {
      recaps = recaps.filter(r => r.campusId === Number(params.campusId));
    }
    if (params.gender) {
      recaps = recaps.filter(r => r.gender === params.gender);
    }
    if (params.teamId) {
      recaps = recaps.filter(r => r.teamId === Number(params.teamId));
    }

    return [200, {
      status: 200,
      message: "Success",
      data: recaps
    }];
  });

  // 7. Mock Leaderboards
  mock.onGet(API_ROUTES.LEADERBOARD_GLOBAL).reply((config) => {
    const params = config.params || {};
    const data = generateLeaderboardData(null, params.campusId);
    return [200, {
      status: 200,
      message: "Success",
      data: data
    }];
  });

  mock.onGet(/\/api\/v1\/leaderboard\/activity\/\d+/).reply((config) => {
    const params = config.params || {};
    const urlParts = config.url?.split('/');
    const activityId = parseInt(urlParts?.[urlParts.length - 1] || '1', 10);
    const data = generateLeaderboardData(activityId, params.campusId);
    return [200, {
      status: 200,
      message: "Success",
      data: data
    }];
  });

  mock.onPost(API_ROUTES.LEADERBOARD_GENERATE).reply(() => {
    lastLeaderboardGenerateTimestamp = new Date().toISOString();
    return [200, {
      status: 200,
      message: "Leaderboard generated successfully",
      data: {
        generatedAt: lastLeaderboardGenerateTimestamp,
        count: mockCustomers.length
      }
    }];
  });

  // 8. Mock Customers (list and transfer)
  mock.onGet(API_ROUTES.CUSTOMERS).reply((config) => {
    const params = config.params || {};
    let filtered = [...mockCustomers];

    if (params.campusId) {
      filtered = filtered.filter(c => c.campusId === Number(params.campusId));
    }
    if (params.teamId) {
      filtered = filtered.filter(c => c.teamId === Number(params.teamId));
    }
    if (params.gender) {
      filtered = filtered.filter(c => c.gender === params.gender);
    }
    if (params.hasTeam !== undefined && params.hasTeam !== null && params.hasTeam !== '') {
      const hasTeamBool = String(params.hasTeam) === 'true';
      filtered = filtered.filter(c => hasTeamBool ? c.teamId !== null : c.teamId === null);
    }
    if (params.educationLevel) {
      filtered = filtered.filter(c => c.educationLevel === params.educationLevel);
    }
    if (params.entryYear) {
      filtered = filtered.filter(c => c.entryYear === Number(params.entryYear));
    }

    return [200, {
      status: 200,
      message: "Success",
      data: {
        totalElements: filtered.length,
        totalPages: 1,
        size: 100,
        number: 0,
        numberOfElements: filtered.length,
        first: true,
        last: true,
        empty: filtered.length === 0,
        content: filtered
      }
    }];
  });

  mock.onGet(API_ROUTES.CUSTOMERS_COUNT).reply((config) => {
    const params = config.params || {};
    let filtered = [...mockCustomers];

    if (params.campusId) {
      filtered = filtered.filter(c => c.campusId === Number(params.campusId));
    }
    if (params.teamId) {
      filtered = filtered.filter(c => c.teamId === Number(params.teamId));
    }
    if (params.gender) {
      filtered = filtered.filter(c => c.gender === params.gender);
    }
    if (params.hasTeam !== undefined && params.hasTeam !== null && params.hasTeam !== '') {
      const hasTeamBool = String(params.hasTeam) === 'true';
      filtered = filtered.filter(c => hasTeamBool ? c.teamId !== null : c.teamId === null);
    }
    if (params.educationLevel) {
      filtered = filtered.filter(c => c.educationLevel === params.educationLevel);
    }
    if (params.entryYear) {
      filtered = filtered.filter(c => c.entryYear === Number(params.entryYear));
    }

    return [200, {
      status: 200,
      message: "Success",
      data: filtered.length
    }];
  });

  mock.onPut(API_ROUTES.CUSTOMERS_TRANSFER_TEAM).reply((config) => {
    const { customerId, teamId } = JSON.parse(config.data);
    const customer = mockCustomers.find(c => c.id === Number(customerId));
    const team = mockTeams.find(t => t.id === Number(teamId));

    if (!customer) {
      return [404, { status: 404, message: "Peserta tidak ditemukan" }];
    }
    if (!team) {
      return [404, { status: 404, message: "Tim tujuan tidak ditemukan" }];
    }

    customer.teamId = team.id;
    customer.teamName = team.name;
    // Cross-campus transfer updates the customer's campus to the team's campus
    customer.campusId = team.campusId;
    customer.campusName = team.campusName;

    return [200, {
      status: 200,
      message: "Peserta berhasil dipindahkan",
      data: customer
    }];
  });

  // 9. Mock Teams (CRUD)
  mock.onGet(API_ROUTES.TEAMS).reply((config) => {
    const params = config.params || {};
    let filtered = [...mockTeams];
    
    if (params.campusId) {
      filtered = filtered.filter(t => t.campusId === Number(params.campusId));
    }
    return [200, {
      status: 200,
      message: "Success",
      data: filtered
    }];
  });

  mock.onGet(/\/api\/v1\/teams\/campus\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const campusId = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const filtered = mockTeams.filter(t => t.campusId === campusId);
    return [200, {
      status: 200,
      message: "Success",
      data: filtered
    }];
  });

  mock.onGet(/\/api\/v1\/teams\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const team = mockTeams.find(t => t.id === id);
    if (!team) {
      return [404, { status: 404, message: "Tim tidak ditemukan" }];
    }
    return [200, {
      status: 200,
      message: "Success",
      data: team
    }];
  });

  mock.onPost(API_ROUTES.TEAMS).reply((config) => {
    const { name, code, grade, campusId, gender } = JSON.parse(config.data);
    const campus = campuses.find(c => c.id === Number(campusId));
    if (!campus) {
      return [400, { status: 400, message: "Kampus tidak valid" }];
    }
    const newTeam: TeamDto = {
      id: Math.max(...mockTeams.map(t => t.id), 0) + 1,
      name,
      code,
      grade: Number(grade),
      campusId: Number(campusId),
      campusName: campus.name,
      gender: gender || 'PRIA'
    };
    mockTeams.push(newTeam);
    return [200, {
      status: 200,
      message: "Tim berhasil dibuat",
      data: newTeam
    }];
  });

  mock.onPut(/\/api\/v1\/teams\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const { name, code, grade, campusId, gender } = JSON.parse(config.data);
    const teamIndex = mockTeams.findIndex(t => t.id === id);
    if (teamIndex === -1) {
      return [404, { status: 404, message: "Tim tidak ditemukan" }];
    }
    const campus = campuses.find(c => c.id === Number(campusId));
    if (!campus) {
      return [400, { status: 400, message: "Kampus tidak valid" }];
    }
    
    mockTeams[teamIndex] = {
      ...mockTeams[teamIndex],
      name,
      code,
      grade: Number(grade),
      campusId: Number(campusId),
      campusName: campus.name,
      gender: gender || mockTeams[teamIndex].gender
    };

    // Update customer records that belong to this team to reflect new name
    mockCustomers.forEach(c => {
      if (c.teamId === id) {
        c.teamName = name;
        c.campusId = Number(campusId);
        c.campusName = campus.name;
      }
    });

    return [200, {
      status: 200,
      message: "Tim berhasil diupdate",
      data: mockTeams[teamIndex]
    }];
  });

  mock.onDelete(/\/api\/v1\/teams\/\d+/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const teamIndex = mockTeams.findIndex(t => t.id === id);
    if (teamIndex === -1) {
      return [404, { status: 404, message: "Tim tidak ditemukan" }];
    }
    
    // Clear team associations for customers in this team
    mockCustomers.forEach(c => {
      if (c.teamId === id) {
        c.teamId = null;
        c.teamName = null;
      }
    });

    mockTeams.splice(teamIndex, 1);
    return [200, {
      status: 200,
      message: "Tim berhasil dihapus"
    }];
  });

  // Mock Admins
  mock.onGet(API_ROUTES.ADMIN_PROFILE).reply((config) => {
    const authHeader = config.headers?.Authorization || config.headers?.authorization;
    if (authHeader?.includes('super')) {
      const superAdmin = mockAdmins.find(a => a.adminGroupCode === 'SUPER_ADMIN') || mockAdmins[0];
      return [200, {
        status: 200,
        message: "Success",
        data: superAdmin
      }];
    }
    const normalAdmin = mockAdmins.find(a => a.email === 'admin.jkt@gmail.com') || mockAdmins[1];
    return [200, {
      status: 200,
      message: "Success",
      data: normalAdmin
    }];
  });

  mock.onGet(API_ROUTES.ADMINS).reply(200, {
    status: 200,
    message: "Success",
    data: mockAdmins
  });

  mock.onGet(/\/api\/v1\/admins\/\d+$/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 1] || '0', 10);
    const admin = mockAdmins.find(a => a.id === id);
    if (!admin) {
      return [404, { status: 404, message: "Admin tidak ditemukan" }];
    }
    return [200, {
      status: 200,
      message: "Success",
      data: admin
    }];
  });

  mock.onPost(API_ROUTES.ADMINS).reply((config) => {
    const { name, email, adminGroupId, campusId } = JSON.parse(config.data);
    const campus = campusId ? campuses.find(c => c.id === Number(campusId)) : null;
    
    // User role is ADMIN (id = 2) or SUPER_ADMIN (id = 1)
    const isSuper = adminGroupId === 1;
    const adminGroupCode = isSuper ? "SUPER_ADMIN" : "ADMIN";
    const adminGroupName = isSuper ? "Super Admin" : "Admin Kampus";

    const newAdmin = {
      id: Math.max(...mockAdmins.map(a => a.id), 0) + 1,
      name,
      email,
      adminGroupCode,
      adminGroupName,
      campusId: isSuper ? null : (campus ? campus.id : null),
      campusName: isSuper ? null : (campus ? campus.name : null),
      isActive: true,
      expiredAt: null,
      createdAt: new Date().toISOString()
    };
    mockAdmins.push(newAdmin);
    return [200, {
      status: 200,
      message: "Admin berhasil dibuat",
      data: newAdmin
    }];
  });



  mock.onPut(/\/api\/v1\/admins\/\d+\/deactivate$/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 2] || '0', 10);
    const adminIndex = mockAdmins.findIndex(a => a.id === id);
    if (adminIndex === -1) {
      return [404, { status: 404, message: "Admin tidak ditemukan" }];
    }
    mockAdmins[adminIndex].isActive = false;
    mockAdmins[adminIndex].expiredAt = new Date().toISOString();

    return [200, {
      status: 200,
      message: "Admin berhasil dinonaktifkan",
      data: mockAdmins[adminIndex]
    }];
  });

  mock.onPut(/\/api\/v1\/admins\/\d+\/transfer-campus$/).reply((config) => {
    const urlParts = config.url?.split('/');
    const id = parseInt(urlParts?.[urlParts.length - 2] || '0', 10);
    const { campusId } = JSON.parse(config.data);
    
    const adminIndex = mockAdmins.findIndex(a => a.id === id);
    if (adminIndex === -1) {
      return [404, { status: 404, message: "Admin tidak ditemukan" }];
    }

    const campus = campuses.find(c => c.id === Number(campusId));
    if (!campus) {
      return [400, { status: 400, message: "Kampus tidak valid" }];
    }

    mockAdmins[adminIndex].campusId = campus.id;
    mockAdmins[adminIndex].campusName = campus.name;
    mockAdmins[adminIndex].isActive = true;
    mockAdmins[adminIndex].expiredAt = null;

    return [200, {
      status: 200,
      message: "Kampus Admin berhasil ditransfer",
      data: mockAdmins[adminIndex]
    }];
  });

  // Mock Teams Count
  mock.onGet(API_ROUTES.TEAMS_COUNT).reply((config) => {
    const params = config.params || {};
    let filtered = [...mockTeams];
    if (params.campusId) {
      filtered = filtered.filter(t => t.campusId === Number(params.campusId));
    }
    if (params.gender) {
      filtered = filtered.filter(t => t.gender === params.gender);
    }
    if (params.grade) {
      filtered = filtered.filter(t => t.grade === Number(params.grade));
    }
    return [200, {
      status: 200,
      message: "Success",
      data: filtered.length
    }];
  });

  // Mock Mentoring Recap Summary
  mock.onGet(API_ROUTES.MENTORING_RECAP_SUMMARY).reply((config) => {
    const params = config.params || {};
    // Calculate a mock attendance percentage based on input params to make charts look dynamic
    let attendance = 75.0;
    if (params.gender === 'PRIA') attendance = 82.4;
    if (params.gender === 'WANITA') attendance = 78.6;
    if (params.grade) {
      // Vary by grade
      const gradesVal = [85.5, 78.2, 91.0, 69.4, 88.1];
      attendance = gradesVal[(Number(params.grade) - 1) % 5];
    } else if (params.campusId) {
      // Vary by campus
      const campusVal = [88.5, 74.2, 80.6, 92.1];
      attendance = campusVal[(Number(params.campusId) - 1) % 4];
    }
    return [200, {
      status: 200,
      message: "Success",
      data: {
        campusId: params.campusId ? Number(params.campusId) : null,
        grade: params.grade ? Number(params.grade) : null,
        gender: params.gender || null,
        totalCustomers: 12,
        averageAttendancePercentage: attendance
      }
    }];
  });

  // Mock Deed Score Average
  mock.onGet(API_ROUTES.DEED_SCORE_AVERAGE).reply((config) => {
    const params = config.params || {};
    // Vary based on gender, grade, campus to make charts look dynamic and cool
    let factor = 1.0;
    if (params.gender === 'PRIA') factor = 1.1;
    if (params.gender === 'WANITA') factor = 0.95;
    if (params.grade) factor *= (1 + (Number(params.grade) * 0.05));
    if (params.campusId) factor *= (0.9 + (Number(params.campusId) * 0.03));

    return [200, {
      status: 200,
      message: "Success",
      data: {
        campusId: params.campusId ? Number(params.campusId) : null,
        campusName: null,
        grade: params.grade ? Number(params.grade) : null,
        gender: params.gender || null,
        totalCustomers: 12,
        activities: [
          { deedActivityId: 1, activityName: "Shalat Jamaah", unit: "kali", averageValue: 3.8 * factor },
          { deedActivityId: 2, activityName: "Tilawah Qur'an", unit: "halaman", averageValue: 5.2 * factor },
          { deedActivityId: 3, activityName: "Shaum Sunnah", unit: "hari", averageValue: 0.4 * factor },
          { deedActivityId: 4, activityName: "Sedekah Harian", unit: "rupiah", averageValue: 15000 * factor }
        ]
      }
    }];
  });

  return mock;
};
