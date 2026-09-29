import {
  User,
  Faculty,
  Direction,
  Course,
  Group,
  Student,
  PracticePlace,
  PracticeDepartment,
  Supervisor,
  ClinicResponsible,
  Practice,
  PracticeAssignment,
  Attendance,
  AttendanceStatus,
  AttendanceSession,
  DailyJournal,
  Skill,
  StudentSkill,
  SkillLogEntry,
  Task,
  Assessment,
  DocumentRecord,
  AppNotification,
  AuditLog,
  AuditAction
} from '../types';

const STORAGE_KEY_V2 = 'tma_amaliyot_cloud_db_v2';
const APP_MODE_KEY = 'tma_amaliyot_environment_mode';

export type AppEnvironmentMode = 'DEVELOPMENT' | 'PRODUCTION';

export interface DatabaseStateV2 {
  mode: AppEnvironmentMode;
  users: User[];
  students: Student[];
  faculties: Faculty[];
  directions: Direction[];
  courses: Course[];
  groups: Group[];
  practicePlaces: PracticePlace[];
  practiceDepartments: PracticeDepartment[];
  supervisors: Supervisor[];
  clinicResponsibles: ClinicResponsible[];
  practices: Practice[];
  practiceAssignments: PracticeAssignment[];
  attendance: Attendance[];
  attendanceSessions: AttendanceSession[];
  dailyJournals: DailyJournal[];
  skills: Skill[];
  studentSkills: StudentSkill[];
  skillLogs: SkillLogEntry[];
  skillCategories: string[];
  tasks: Task[];
  assessments: Assessment[];
  documents: DocumentRecord[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

const DEFAULT_USERS_V2: User[] = [
  {
    id: 'user-admin',
    uid: 'uid-admin-001',
    login: 'admin',
    username: 'admin',
    password: 'password123',
    fullName: 'Qodirov Jamshid Po\'latovich',
    role: 'SUPER_ADMIN',
    email: 'admin@tma.uz',
    phone: '+998 (71) 214-88-00',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T06:00:00Z'
  },
  {
    id: 'user-head',
    uid: 'uid-head-002',
    login: 'amaliyot_boshliq',
    username: 'amaliyot_boshliq',
    password: 'password123',
    fullName: 'Dr. Erkinov Farrux Mirzayevich',
    role: 'PRACTICE_HEAD',
    email: 'practice_dept@tma.uz',
    phone: '+998 (90) 900-11-22',
    status: 'ACTIVE',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T07:10:00Z'
  },
  {
    id: 'user-staff',
    uid: 'uid-staff-003',
    login: 'xodim',
    username: 'xodim',
    password: 'password123',
    fullName: 'Shamsiyeva Gulnoza Anvarovna',
    role: 'PRACTICE_STAFF',
    email: 'staff.practice@tma.uz',
    phone: '+998 (91) 321-45-67',
    status: 'ACTIVE',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T06:30:00Z'
  },
  {
    id: 'user-dean',
    uid: 'uid-dean-004',
    login: 'dekan_davolash',
    username: 'dekan_davolash',
    password: 'password123',
    fullName: 'Prof. Xusanov Ravshan Karimboyevich',
    role: 'FACULTY_DEAN',
    email: 'davolash1@tma.uz',
    phone: '+998 (71) 214-89-01',
    status: 'ACTIVE',
    facultyId: 'fac-1',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T05:40:00Z'
  },
  {
    id: 'user-sup',
    uid: 'uid-sup-005',
    login: 'rahbar_sobirov',
    username: 'rahbar_sobirov',
    password: 'password123',
    fullName: 'Prof. Sobirov Alisher Tolipovich',
    role: 'PRACTICE_SUPERVISOR',
    email: 'sobirov.a@tma.uz',
    phone: '+998 (90) 811-22-33',
    status: 'ACTIVE',
    supervisorId: 'sup-1',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T06:45:00Z'
  },
  {
    id: 'user-clinic',
    uid: 'uid-clinic-006',
    login: 'klinik_karimov',
    username: 'klinik_karimov',
    password: 'password123',
    fullName: 'Dr. Karimov Rustam Baxtiyorovich',
    role: 'CLINIC_RESPONSIBLE',
    email: 'karimov.rksh1@minzdrav.uz',
    phone: '+998 (90) 123-45-67',
    status: 'ACTIVE',
    practicePlaceId: 'place-1',
    clinicResponsibleId: 'cresp-1',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T07:00:00Z'
  },
  {
    id: 'user-std',
    uid: 'uid-std-007',
    login: 'student_olimov',
    username: 'student_olimov',
    password: 'password123',
    fullName: 'Olimov Sardor Botir o\'g\'li',
    role: 'STUDENT',
    email: 'sardor.olimov@student.tma.uz',
    phone: '+998 (90) 111-22-33',
    status: 'ACTIVE',
    studentId: 'std-1',
    createdAt: '2026-08-01T08:00:00Z',
    lastLoginAt: '2026-09-28T06:55:00Z'
  }
];

const DEFAULT_FACULTIES: Faculty[] = [
  {
    id: 'fac-1',
    name: '1-son Davolash fakulteti',
    code: 'DAV-1',
    deanName: 'Prof. Xusanov Ravshan Karimboyevich',
    phone: '+998 (71) 214-89-01',
    email: 'davolash1@tma.uz',
    directionsCount: 2,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'fac-2',
    name: 'Pediatriya fakulteti',
    code: 'PED',
    deanName: 'Dots. Mirzayeva Ziyoda Erkinovna',
    phone: '+998 (71) 214-89-02',
    email: 'pediatriya@tma.uz',
    directionsCount: 2,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'fac-3',
    name: 'Tibbiy-profilaktika va Jamoat salomatligi',
    code: 'TIB-PROF',
    deanName: 'Prof. Alimov Temur Sanjarovich',
    phone: '+998 (71) 214-89-03',
    email: 'prof@tma.uz',
    directionsCount: 1,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'fac-4',
    name: 'Stomatologiya fakulteti',
    code: 'STOM',
    deanName: 'Dots. Yusupov Bobur Odilovich',
    phone: '+998 (71) 214-89-04',
    email: 'stomatologiya@tma.uz',
    directionsCount: 1,
    createdAt: '2026-08-01T00:00:00Z'
  }
];

const DEFAULT_DIRECTIONS: Direction[] = [
  {
    id: 'dir-1',
    name: 'Davolash ishi',
    code: '60910200',
    facultyId: 'fac-1',
    degree: 'Bakalavr',
    durationYears: 6,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'dir-2',
    name: 'Harbiy tibbiyot',
    code: '60910201',
    facultyId: 'fac-1',
    degree: 'Bakalavr',
    durationYears: 6,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'dir-3',
    name: 'Pediatriya ishi',
    code: '60910300',
    facultyId: 'fac-2',
    degree: 'Bakalavr',
    durationYears: 6,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'dir-4',
    name: 'Bolalar xirurgiyasi',
    code: '70910301',
    facultyId: 'fac-2',
    degree: 'Klinik ordinatura',
    durationYears: 2,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'dir-5',
    name: 'Jamoat salomatligi va sanitariya',
    code: '60910700',
    facultyId: 'fac-3',
    degree: 'Bakalavr',
    durationYears: 5,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'dir-6',
    name: 'Stomatologiya',
    code: '60910400',
    facultyId: 'fac-4',
    degree: 'Bakalavr',
    durationYears: 5,
    createdAt: '2026-08-01T00:00:00Z'
  }
];

const DEFAULT_COURSES: Course[] = [
  { id: 'course-1', level: 1, name: '1-kurs', academicYear: '2025-2026' },
  { id: 'course-2', level: 2, name: '2-kurs', academicYear: '2025-2026' },
  { id: 'course-3', level: 3, name: '3-kurs', academicYear: '2025-2026' },
  { id: 'course-4', level: 4, name: '4-kurs', academicYear: '2025-2026' },
  { id: 'course-5', level: 5, name: '5-kurs', academicYear: '2025-2026' },
  { id: 'course-6', level: 6, name: '6-kurs', academicYear: '2025-2026' }
];

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'grp-401',
    name: '401-A (Davolash)',
    directionId: 'dir-1',
    courseId: 'course-4',
    facultyId: 'fac-1',
    language: "O'zbek",
    studentCount: 22
  },
  {
    id: 'grp-402',
    name: '402-B (Davolash)',
    directionId: 'dir-1',
    courseId: 'course-4',
    facultyId: 'fac-1',
    language: "O'zbek",
    studentCount: 20
  },
  {
    id: 'grp-403',
    name: '403-R (Davolash rus)',
    directionId: 'dir-1',
    courseId: 'course-4',
    facultyId: 'fac-1',
    language: "Rus",
    studentCount: 18
  },
  {
    id: 'grp-301',
    name: '301-P (Pediatriya)',
    directionId: 'dir-3',
    courseId: 'course-3',
    facultyId: 'fac-2',
    language: "O'zbek",
    studentCount: 24
  },
  {
    id: 'grp-501',
    name: '501-A (Davolash)',
    directionId: 'dir-1',
    courseId: 'course-5',
    facultyId: 'fac-1',
    language: "O'zbek",
    studentCount: 21
  }
];

const DEFAULT_PRACTICE_PLACES: PracticePlace[] = [
  {
    id: 'place-1',
    name: '1-son Respublika Klinik Shifoxonasi',
    type: 'Shifoxona',
    city: 'Toshkent shahri',
    address: 'Chilonzor tumani, Maxtumquli ko\'chasi, 103-uy',
    phone: '+998 (71) 230-45-12',
    email: 'rksh1@minzdrav.uz',
    capacity: 60,
    activeStudentsCount: 38,
    contactPerson: 'Dr. Karimov Rustam Baxtiyorovich',
    contactPhone: '+998 (90) 123-45-67',
    departments: ['Terapiya', 'Umumiy xirurgiya', 'Kardiologiya', 'Reanimatsiya', 'Qabul bo\'limi'],
    contractNumber: 'SH-2025/114',
    contractDate: '2025-01-10',
    contractExpiryDate: '2026-12-31',
    latitude: 41.2995,
    longitude: 69.2401,
    allowedRadius: 300,
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: 'place-2',
    name: 'Respublika Shoshilinch Tibbiy Yordam Ilmiy Markazi (RSHTYOIM)',
    type: 'Ilmiy Markaz',
    city: 'Toshkent shahri',
    address: 'Kichik halqa yo\'li, 2-uy',
    phone: '+998 (71) 277-95-00',
    email: 'rshtyom@cardio.uz',
    capacity: 50,
    activeStudentsCount: 30,
    contactPerson: 'Dr. Rahmonova Nargiza Anvarovna',
    contactPhone: '+998 (97) 345-67-89',
    departments: ['Kombustiologiya', 'Neyroxirurgiya', 'Toksikologiya', 'Shoshilinch terapiya', 'Travmatologiya'],
    contractNumber: 'SH-2025/182',
    contractDate: '2025-01-15',
    contractExpiryDate: '2027-01-15',
    latitude: 41.2825,
    longitude: 69.2790,
    allowedRadius: 300,
    createdAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'place-3',
    name: '1-son Bolalar Klinik Shifoxonasi',
    type: 'Shifoxona',
    city: 'Toshkent shahri',
    address: 'Olmazor tumani, Bobur ko\'chasi, 45-uy',
    phone: '+998 (71) 244-12-33',
    email: 'pediatriya_clinic@tashkent.uz',
    capacity: 40,
    activeStudentsCount: 22,
    contactPerson: 'Dr. Qodirova Gulchehra Ilhomovna',
    contactPhone: '+998 (93) 555-44-33',
    departments: ['Chaqaloqlar patologiyasi', 'Pediatriya', 'Bolalar xirurgiyasi', 'Allergologiya'],
    contractNumber: 'SH-2025/089',
    contractDate: '2025-02-01',
    contractExpiryDate: '2026-12-31',
    latitude: 41.3415,
    longitude: 69.2150,
    allowedRadius: 250,
    createdAt: '2025-02-01T00:00:00Z'
  },
  {
    id: 'place-4',
    name: '14-son Markaziy Ko\'p Tarmoqli Poliklinika',
    type: 'Poliklinika',
    city: 'Toshkent shahri',
    address: 'Yakkasaroy tumani, Shota Rustaveli ko\'chasi, 78-uy',
    phone: '+998 (71) 255-09-18',
    email: 'poliklinika14@tashmed.uz',
    capacity: 30,
    activeStudentsCount: 16,
    contactPerson: 'Dr. Ahmedov Sherzod Mansurovich',
    contactPhone: '+998 (91) 987-65-43',
    departments: ['Umumiy amaliyot shifokori', 'Kardiologiya', 'Nevrologiya', 'Profilaktika xonasi'],
    contractNumber: 'SH-2025/067',
    contractDate: '2025-01-20',
    contractExpiryDate: '2026-12-31',
    latitude: 41.2910,
    longitude: 69.2610,
    allowedRadius: 200,
    createdAt: '2025-01-20T00:00:00Z'
  }
];

const DEFAULT_PRACTICE_DEPARTMENTS: PracticeDepartment[] = [
  { id: 'pdept-1', practicePlaceId: 'place-1', name: 'Terapiya bo\'limi', headDoctor: 'Dr. Yusupov A.', bedCapacity: 50, activeStudentQuota: 15 },
  { id: 'pdept-2', practicePlaceId: 'place-1', name: 'Umumiy xirurgiya', headDoctor: 'Dr. Mahmudov B.', bedCapacity: 40, activeStudentQuota: 12 },
  { id: 'pdept-3', practicePlaceId: 'place-1', name: 'Kardiologiya', headDoctor: 'Dr. Ergashev N.', bedCapacity: 35, activeStudentQuota: 10 },
  { id: 'pdept-4', practicePlaceId: 'place-2', name: 'Shoshilinch terapiya', headDoctor: 'Dr. Rahmonova N.', bedCapacity: 60, activeStudentQuota: 18 },
  { id: 'pdept-5', practicePlaceId: 'place-3', name: 'Pediatriya', headDoctor: 'Dr. Qodirova G.', bedCapacity: 45, activeStudentQuota: 20 }
];

const DEFAULT_SUPERVISORS: Supervisor[] = [
  {
    id: 'sup-1',
    userId: 'user-sup',
    fullName: 'Prof. Sobirov Alisher Tolipovich',
    department: 'Gospital terapiya kafedrasi',
    academicDegree: 't.f.d., professor',
    phone: '+998 (90) 811-22-33',
    email: 'sobirov.a@tma.uz',
    type: 'university',
    assignedStudentsCount: 22,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'sup-2',
    fullName: 'Dots. Ismoilova Shahnoza Baxtiyorovna',
    department: 'Fakultet va gospital xirurgiya kafedrasi',
    academicDegree: 't.f.n., dotsent',
    phone: '+998 (91) 404-55-66',
    email: 'ismoilova.sh@tma.uz',
    type: 'university',
    assignedStudentsCount: 20,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'sup-3',
    fullName: 'Dots. Abdullayev Jasur Ergashevich',
    department: 'Gospital pediatriya va neonatologiya kafedrasi',
    academicDegree: 'PhD, dotsent',
    phone: '+998 (93) 712-33-44',
    email: 'abdullayev.j@tma.uz',
    type: 'university',
    assignedStudentsCount: 24,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'sup-4',
    fullName: 'Dr. Ergashev Nodir Komilovich',
    department: 'Kardioreanimatsiya bo\'limi',
    academicDegree: 'Oliy toifali vrach-kardiolog',
    phone: '+998 (94) 600-70-80',
    email: 'ergashev.cardio@gmail.com',
    type: 'clinic',
    practicePlaceId: 'place-1',
    assignedStudentsCount: 18,
    createdAt: '2026-08-01T00:00:00Z'
  }
];

const DEFAULT_CLINIC_RESPONSIBLES: ClinicResponsible[] = [
  {
    id: 'cresp-1',
    userId: 'user-clinic',
    fullName: 'Dr. Karimov Rustam Baxtiyorovich',
    practicePlaceId: 'place-1',
    position: 'Bosh shifokor davolash ishlari bo\'yicha o\'rinbosari',
    department: 'Ma\'muriyat',
    phone: '+998 (90) 123-45-67',
    email: 'karimov.rksh1@minzdrav.uz',
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cresp-2',
    fullName: 'Dr. Rahmonova Nargiza Anvarovna',
    practicePlaceId: 'place-2',
    position: 'Ilmiy-amaliy tayyorgarlik bo\'limi mudiri',
    department: 'O\'quv bo\'limi',
    phone: '+998 (97) 345-67-89',
    email: 'rahmonova.rshtyom@gmail.com',
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'cresp-3',
    fullName: 'Dr. Qodirova Gulchehra Ilhomovna',
    practicePlaceId: 'place-3',
    position: 'Bosh vrach muovini',
    department: 'Pediatriya xizmati',
    phone: '+998 (93) 555-44-33',
    email: 'qodirova.ped@tashkent.uz',
    createdAt: '2026-08-01T00:00:00Z'
  }
];

const DEFAULT_STUDENTS_V2: Student[] = [
  {
    id: 'std-1',
    userId: 'uid-std-007',
    studentId: 'MED-2022-1084',
    pinfl: '31405991230045',
    fullName: 'Olimov Sardor Botir o\'g\'li',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-401',
    phone: '+998 (90) 111-22-33',
    telegram: '@sardor_olimov_med',
    email: 'sardor.olimov@student.tma.uz',
    status: 'in_practice',
    currentPracticeId: 'prac-1',
    currentPracticePlaceId: 'place-1',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-2',
    userId: 'uid-std-008',
    studentId: 'MED-2022-1092',
    pinfl: '32007011450089',
    fullName: 'Madrahimova Nilufar Ilhom qizi',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-401',
    phone: '+998 (93) 222-33-44',
    telegram: '@nilufar_meddoc',
    email: 'nilufar.m@student.tma.uz',
    status: 'in_practice',
    currentPracticeId: 'prac-1',
    currentPracticePlaceId: 'place-1',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-3',
    userId: 'uid-std-009',
    studentId: 'MED-2022-1105',
    pinfl: '31508982340012',
    fullName: 'Jumayev Jasur Otabek o\'g\'li',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-401',
    phone: '+998 (97) 333-44-55',
    telegram: '@jasur_jumayev_tma',
    email: 'jasur.j@student.tma.uz',
    status: 'in_practice',
    currentPracticeId: 'prac-1',
    currentPracticePlaceId: 'place-2',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-4',
    userId: 'uid-std-010',
    studentId: 'MED-2022-1118',
    pinfl: '32904003450098',
    fullName: 'Karimova Dilnoza Sanjar qizi',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-402',
    phone: '+998 (99) 444-55-66',
    telegram: '@dilnoza_karimova',
    email: 'dilnoza.k@student.tma.uz',
    status: 'in_practice',
    currentPracticeId: 'prac-1',
    currentPracticePlaceId: 'place-1',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-5',
    userId: 'uid-std-011',
    studentId: 'PED-2023-0854',
    pinfl: '32201024560067',
    fullName: 'Toirov Bobur Dilshod o\'g\'li',
    facultyId: 'fac-2',
    directionId: 'dir-3',
    courseId: 'course-3',
    groupId: 'grp-301',
    phone: '+998 (91) 555-66-77',
    telegram: '@bobur_pediatr',
    email: 'bobur.toirov@student.tma.uz',
    status: 'in_practice',
    currentPracticeId: 'prac-2',
    currentPracticePlaceId: 'place-3',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-6',
    userId: 'uid-std-012',
    studentId: 'MED-2022-1130',
    pinfl: '31109995670023',
    fullName: 'Xolmatov Sanjar Rustam o\'g\'li',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-402',
    phone: '+998 (94) 666-77-88',
    telegram: '@sanjar_xolmatov',
    email: 'sanjar.x@student.tma.uz',
    status: 'in_practice',
    currentPracticeId: 'prac-1',
    currentPracticePlaceId: 'place-2',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-7',
    userId: 'uid-std-013',
    studentId: 'MED-2021-0941',
    pinfl: '31206986780034',
    fullName: 'Yusupova Madina Jamshid qizi',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-5',
    groupId: 'grp-501',
    phone: '+998 (95) 777-88-99',
    telegram: '@madina_yusupova_tma',
    email: 'madina.y@student.tma.uz',
    status: 'active',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'std-8',
    userId: 'uid-std-014',
    studentId: 'MED-2022-1144',
    pinfl: '31703997890045',
    fullName: 'Bekmurodov Eldor Fayzullo o\'g\'li',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-403',
    phone: '+998 (98) 888-99-00',
    telegram: '@eldor_bekmurodov',
    email: 'eldor.b@student.tma.uz',
    status: 'suspended',
    currentPracticeId: 'prac-1',
    currentPracticePlaceId: 'place-1',
    createdAt: '2026-08-15T09:00:00Z'
  }
];

const DEFAULT_PRACTICES_V2: Practice[] = [
  {
    id: 'prac-1',
    name: '4-kurs Davolash ishi "Terapevtik va jarrohlik yordami" klinik amaliyoti',
    type: 'Klinik ishlab chiqarish amaliyoti',
    code: 'PRAC-2025-MED4',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    academicYear: '2025-2026',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseLevel: 4,
    groupIds: ['grp-401', 'grp-402'],
    practicePlaceIds: ['place-1', 'place-2'],
    supervisorIds: ['sup-1', 'sup-2'],
    clinicResponsibleIds: ['cresp-1', 'cresp-2'],
    status: 'active',
    orderNumber: 'BUYRUQ-№142/A',
    orderDate: '2026-08-25',
    description: 'Bemorlarni kuratsiya qilish, kasallik tarixi yuritish, shoshilinch yordam ko\'rsatish.',
    totalHours: 180,
    credits: 6,
    createdAt: '2026-08-25T00:00:00Z'
  },
  {
    id: 'prac-2',
    name: '3-kurs Pediatriya "Hamshiralik malakaviy amaliyoti"',
    type: 'Hamshiralik malakaviy amaliyoti',
    code: 'PRAC-2025-PED3',
    startDate: '2026-09-10',
    endDate: '2026-10-05',
    academicYear: '2025-2026',
    facultyId: 'fac-2',
    directionId: 'dir-3',
    courseLevel: 3,
    groupIds: ['grp-301'],
    practicePlaceIds: ['place-3'],
    supervisorIds: ['sup-3'],
    clinicResponsibleIds: ['cresp-3'],
    status: 'active',
    orderNumber: 'BUYRUQ-№155/P',
    orderDate: '2026-08-28',
    description: 'Bolalar parvarishi, parenteral muolajalar va antropometriya amaliyoti.',
    totalHours: 120,
    credits: 4,
    createdAt: '2026-08-28T00:00:00Z'
  },
  {
    id: 'prac-3',
    name: '5-kurs Davolash ishi "Shoshilinch tibbiy yordam va reanimatsiya"',
    type: 'Klinik ishlab chiqarish amaliyoti',
    code: 'PRAC-2025-MED5',
    startDate: '2026-10-20',
    endDate: '2026-12-05',
    academicYear: '2025-2026',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseLevel: 5,
    groupIds: ['grp-501'],
    practicePlaceIds: ['place-2'],
    supervisorIds: ['sup-2'],
    clinicResponsibleIds: ['cresp-2'],
    status: 'draft',
    orderNumber: 'BUYRUQ-№188/S',
    orderDate: '2026-09-20',
    description: 'Kritik holatlarni barqarorlashtirish, intensiv terapiya va monitoring.',
    totalHours: 210,
    credits: 7,
    createdAt: '2026-09-20T00:00:00Z'
  }
];

const DEFAULT_ASSIGNMENTS_V2: PracticeAssignment[] = [
  {
    id: 'asg-1',
    practiceId: 'prac-1',
    studentId: 'std-1',
    practicePlaceId: 'place-1',
    department: 'Terapiya',
    departmentId: 'pdept-1',
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-2',
    practiceId: 'prac-1',
    studentId: 'std-2',
    practicePlaceId: 'place-1',
    department: 'Kardiologiya',
    departmentId: 'pdept-3',
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-3',
    practiceId: 'prac-1',
    studentId: 'std-3',
    practicePlaceId: 'place-2',
    department: 'Shoshilinch terapiya',
    departmentId: 'pdept-4',
    supervisorId: 'sup-2',
    clinicResponsibleId: 'cresp-2',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-4',
    practiceId: 'prac-1',
    studentId: 'std-4',
    practicePlaceId: 'place-1',
    department: 'Umumiy xirurgiya',
    departmentId: 'pdept-2',
    supervisorId: 'sup-2',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-5',
    practiceId: 'prac-2',
    studentId: 'std-5',
    practicePlaceId: 'place-3',
    department: 'Pediatriya',
    departmentId: 'pdept-5',
    supervisorId: 'sup-3',
    clinicResponsibleId: 'cresp-3',
    startDate: '2026-09-10',
    endDate: '2026-10-05',
    status: 'in_progress',
    createdAt: '2026-09-05T10:00:00Z'
  }
];

const DEFAULT_ATTENDANCE_SESSIONS_V2: AttendanceSession[] = [
  {
    id: 'sess-active-01',
    practiceId: 'prac-1',
    practicePlaceId: 'place-1',
    departmentId: 'pdept-1',
    departmentName: 'Terapiya',
    createdBy: 'uid-clinic-006',
    creatorName: 'Dr. Karimov Rustam (Klinika mas\'uli)',
    createdAt: '2026-09-28T07:45:00Z',
    expiresAt: '2026-09-28T09:45:00Z',
    status: 'ACTIVE',
    token: 'TMA-QR-RKSH1-20260928-8921',
    durationMinutes: 15,
    practiceStartTime: '08:00',
    lateThresholdMinutes: 15,
    allowedRadius: 300,
    latitude: 41.2995,
    longitude: 69.2401
  },
  {
    id: 'sess-active-02',
    practiceId: 'prac-1',
    practicePlaceId: 'place-2',
    departmentId: 'pdept-4',
    departmentName: 'Shoshilinch terapiya',
    createdBy: 'uid-sup-005',
    creatorName: 'Prof. Sobirov Alisher (Rahbar)',
    createdAt: '2026-09-28T07:50:00Z',
    expiresAt: '2026-09-28T09:50:00Z',
    status: 'ACTIVE',
    token: 'TMA-QR-RSHT-20260928-3314',
    durationMinutes: 10,
    practiceStartTime: '08:00',
    lateThresholdMinutes: 15,
    allowedRadius: 300,
    latitude: 41.2825,
    longitude: 69.2790
  }
];

const DEFAULT_ATTENDANCE_V2: Attendance[] = [
  // Student std-1 (Olimov Sardor) - 22 working days in Sep 2026: 20 present, 1 late, 1 absent = 95%
  { id: 'att-s1-01', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-01', status: 'PRESENT', checkInTime: '08:10', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-02', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-02', status: 'PRESENT', checkInTime: '08:12', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-03', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-03', status: 'PRESENT', checkInTime: '08:05', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-04', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-04', status: 'PRESENT', checkInTime: '08:15', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-05', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-05', status: 'PRESENT', checkInTime: '08:08', checkOutTime: '13:00', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-08', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-08', status: 'PRESENT', checkInTime: '08:14', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-09', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-09', status: 'PRESENT', checkInTime: '08:11', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-10', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-10', status: 'PRESENT', checkInTime: '08:04', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-11', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-11', status: 'PRESENT', checkInTime: '08:10', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-12', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-12', status: 'PRESENT', checkInTime: '08:09', checkOutTime: '13:00', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-15', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-15', status: 'PRESENT', checkInTime: '08:13', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-16', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-16', status: 'PRESENT', checkInTime: '08:07', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-17', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-17', status: 'PRESENT', checkInTime: '08:12', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-18', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-18', status: 'ABSENT', note: 'Sababsiz dars qoldirdi', verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-19', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-19', status: 'PRESENT', checkInTime: '08:11', checkOutTime: '13:00', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-22', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-22', status: 'PRESENT', checkInTime: '08:06', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-23', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-23', status: 'PRESENT', checkInTime: '08:08', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-24', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-24', status: 'LATE', checkInTime: '08:35', checkOutTime: '14:30', note: '20 daqiqa kechikdi (yo\'l tirbandligi)', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-25', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-25', status: 'PRESENT', checkInTime: '08:10', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-26', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-26', status: 'PRESENT', checkInTime: '08:05', checkOutTime: '13:00', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-27', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-27', status: 'PRESENT', checkInTime: '08:12', checkOutTime: '14:30', locationVerified: true, verifiedBy: 'Dr. Karimov R.' },
  { id: 'att-s1-28', practiceId: 'prac-1', studentId: 'std-1', assignmentId: 'asg-1', practicePlaceId: 'place-1', departmentId: 'pdept-1', supervisorId: 'sup-1', date: '2026-09-28', status: 'PRESENT', checkInTime: '08:14', checkOutTime: '14:30', qrSessionId: 'sess-active-01', qrId: 'QR-HOSP-01-ENTRY', latitude: 41.2995, longitude: 69.2401, locationVerified: true, note: 'Bemor kuratsiyasida faol qatnashdi', verifiedBy: 'Dr. Ergashev Nodir Komilovich', verifiedAt: '2026-09-28T09:00:00Z', createdAt: '2026-09-28T08:14:00Z' },

  // Student std-2 (Xoliqov Bobur)
  { id: 'att-2', practiceId: 'prac-1', studentId: 'std-2', assignmentId: 'asg-2', practicePlaceId: 'place-1', departmentId: 'pdept-3', supervisorId: 'sup-1', date: '2026-09-28', status: 'PRESENT', checkInTime: '08:15', checkOutTime: '14:15', qrSessionId: 'sess-active-01', qrId: 'QR-HOSP-01-ENTRY', locationVerified: true, note: 'EKG yozish xonasida navbatchilik qildi', verifiedBy: 'Dr. Ergashev Nodir Komilovich', verifiedAt: '2026-09-28T09:00:00Z', createdAt: '2026-09-28T08:15:00Z' },

  // Student std-3 (Jumayev Jasur) - Problematic student: 3 days absent, 2 times late
  { id: 'att-s3-24', practiceId: 'prac-1', studentId: 'std-3', assignmentId: 'asg-3', practicePlaceId: 'place-2', departmentId: 'pdept-4', supervisorId: 'sup-2', date: '2026-09-24', status: 'LATE', checkInTime: '09:15', checkOutTime: '14:30', note: 'Kechikdi', verifiedBy: 'Dr. Rahmonova N.' },
  { id: 'att-s3-25', practiceId: 'prac-1', studentId: 'std-3', assignmentId: 'asg-3', practicePlaceId: 'place-2', departmentId: 'pdept-4', supervisorId: 'sup-2', date: '2026-09-25', status: 'LATE', checkInTime: '09:20', checkOutTime: '14:30', note: 'Kechikdi', verifiedBy: 'Dr. Rahmonova N.' },
  { id: 'att-s3-26', practiceId: 'prac-1', studentId: 'std-3', assignmentId: 'asg-3', practicePlaceId: 'place-2', departmentId: 'pdept-4', supervisorId: 'sup-2', date: '2026-09-26', status: 'ABSENT', note: 'Kelmagan (1-kun)', verifiedBy: 'Dr. Rahmonova N.' },
  { id: 'att-s3-27', practiceId: 'prac-1', studentId: 'std-3', assignmentId: 'asg-3', practicePlaceId: 'place-2', departmentId: 'pdept-4', supervisorId: 'sup-2', date: '2026-09-27', status: 'ABSENT', note: 'Kelmagan (2-kun)', verifiedBy: 'Dr. Rahmonova N.' },
  { id: 'att-s3-28', practiceId: 'prac-1', studentId: 'std-3', assignmentId: 'asg-3', practicePlaceId: 'place-2', departmentId: 'pdept-4', supervisorId: 'sup-2', date: '2026-09-28', status: 'ABSENT', note: '3 kun kelmagan, telefoniga javob bermadi', verifiedBy: 'Dr. Rahmonova Nargiza Anvarovna', verifiedAt: '2026-09-28T09:30:00Z', createdAt: '2026-09-28T09:30:00Z' },

  // Student std-4 (Karimova Dilnoza) - Late today
  { id: 'att-4', practiceId: 'prac-1', studentId: 'std-4', assignmentId: 'asg-4', practicePlaceId: 'place-1', departmentId: 'pdept-2', supervisorId: 'sup-2', date: '2026-09-28', status: 'LATE', checkInTime: '09:10', checkOutTime: '14:30', note: '30 daqiqa kechikib keldi', verifiedBy: 'Dr. Karimov Rustam Baxtiyorovich', verifiedAt: '2026-09-28T09:15:00Z', createdAt: '2026-09-28T09:10:00Z' },

  // Student std-5 (Toirov Bobur) - Pediatriya
  { id: 'att-5', practiceId: 'prac-2', studentId: 'std-5', assignmentId: 'asg-5', practicePlaceId: 'place-3', departmentId: 'pdept-5', supervisorId: 'sup-3', date: '2026-09-28', status: 'PRESENT', checkInTime: '08:10', checkOutTime: '14:00', locationVerified: true, note: 'Bolalar parvarishi muolajalarini bajardi', verifiedBy: 'Dr. Qodirova G.', verifiedAt: '2026-09-28T08:30:00Z', createdAt: '2026-09-28T08:10:00Z' }
];

const DEFAULT_DAILY_JOURNALS_V2: DailyJournal[] = [
  {
    id: 'dj-1',
    practiceId: 'prac-1',
    studentId: 'std-1',
    assignmentId: 'asg-1',
    practicePlaceId: 'place-1',
    departmentId: 'pdept-1',
    department: 'Terapiya',
    supervisorId: 'sup-1',
    attendanceId: 'att-s1-27',
    date: '2026-09-27',
    attendanceSnapshot: {
      status: 'PRESENT',
      checkInTime: '08:12',
      checkOutTime: '14:30',
      verifiedBy: 'Dr. Karimov Rustam Baxtiyorovich',
      practicePlaceName: 'Respublika 1-son Klinik Shifoxonasi',
      supervisorName: 'Prof. Sobirov Alisher Tolipovich',
      departmentName: 'Terapiya'
    },
    workSummary: 'Ertalabki bo\'lim konferensiyasida va bemorlar topshirish jarayonida qatnashdim. Palatada 4 nafar bemorni kuratsiya qildim: subyektiv shikoyatlarini yig\'dim, o\'pka va yurak auskultatsiyasini o\'tkazdim. 2 nafar bemorga vena ichiga dori yuborishda va 1 nafar bemorga 12 ta ulanishda EKG yozishda mustaqil ishtirok etdim. Kasallik tarixiga kundalik ko\'rik yozuvlarini kiritdim.',
    patientsExaminedCount: 4,
    patientDiagnosesSummary: 'Gipertoniya kasalligi II bosqich (2 nafar), Surunkali obstruktiv o\'pka kasalligi (SOO\'K) zo\'rayishi (1 nafar), Qandli diabet 2-tur asorati bilan (1 nafar).',
    procedures: [
      { id: 'prc-1-1', name: 'Arterial qon bosimini Korotkov usulida o\'lchash', count: 4, participationType: 'Mustaqil', skillId: 'sk-5' },
      { id: 'prc-1-2', name: 'Vena ichiga dori yuborish va tomchi dorilar tizimini ulash', count: 2, participationType: 'Rahbar nazoratida', skillId: 'sk-1' },
      { id: 'prc-1-3', name: '12 ta ulanishda EKG yozish va tahlil qilish', count: 1, participationType: 'Mustaqil', skillId: 'sk-2' },
      { id: 'prc-1-4', name: 'Pulsoksimetriya va tana haroratini monitoring qilish', count: 4, participationType: 'Mustaqil' }
    ],
    proceduresDone: [
      'Arterial qon bosimini o\'lchash (4 nafar bemor)',
      'Vena ichiga tomchi tizimini ulash (2 nafar bemor)',
      '12 ta ulanishli EKG tahlili (1 nafar bemor)'
    ],
    clinicalCases: [
      {
        id: 'cc-1-1',
        caseTitle: 'Gipertoniya kasalligi II bosqich, krizis kechishi',
        patientAgeGender: '58 yosh, Erkak',
        complaints: 'Ensa sohasida qattiq pulsatsiyalovchi og\'riq, bosh aylanishi, ko\'ngil aynishi, ko\'z oldida chaqnashlar va nafas qisishi.',
        anamnesis: '7 yildan beri arterial gipertenziya bilan ro\'yxatda turadi. O\'tgan kechasi spirtli ichimlik va sho\'r taom iste\'molidan so\'ng dori vositalarini ichishni unutgan.',
        examination: 'Holati o\'rtacha og\'irlikda. Qon bosimi: 185/110 mm sim.ust., puls: 88 ta/daq, tarang. O\'pkada vezikulyar nafas, yurak tonlari bo\'g\'iq, aortal nuqtada II ton aksenti.',
        presumptiveDiagnosis: 'Gipertoniya kasalligi II bosqich, 3-darajali arterial gipertenziya, juda yuqori xavf guruhi. Asoratsiz gipertonik kriz.',
        treatmentTactics: 'Tinchlantirish, yotoq rejimi, Kapoten 25 mg sublingual berildi. 40 daqiqadan so\'ng qon bosimi 155/95 mm sim.ust. ga pasaytirildi (ortiqcha keskin tushirmaslik qoidasiga amal qilindi). Doimiy davo uchun Perindopril + Amlodipin kombinatsiyasi tavsiya etildi.',
        learnedAspect: 'Gipertonik krizda qon bosimini birinchi 2 soat ichida dastlabki darajaning faqat 20-25% miqdorida tushirish qoidasini va bosh miya ishemiyasining oldini olish taktikasini amalda o\'rgandim.'
      }
    ],
    clinicalCasesSummary: 'Bemor A. 58 yosh, gipertonik kriz. Kaptopril va moksonidin bilan qon bosimini bosqichma-bosqich pasaytirish o\'rganildi.',
    topicsLearned: 'Arterial gipertenziya va gipertonik krizlarda shoshilinch yordam ko\'rsatishning milliy klinik protokoli. ACE ingibitorlari va kaltsiy antagonistlari farmakodinamikasi.',
    questionsLearned: 'Gipertonik kriz asoratli va asoratsiz turlari farqi, parenteral gipotenziv vositalarni kiritish tartibi.',
    selfReflection: {
      whatLearned: 'Gipertonik krizda asoratlarni tezkor baholash, ko\'z tubi va EKG o\'zgarishlarini bemor shikoyati bilan solishtirishni mukammal o\'rgandim.',
      skillsImproved: 'Korotkov usulida tezkor va xatosiz qon bosimi o\'lchash hamda bemor bilan psixologik xotirjam muloqot o\'rnatish ko\'nikmasi.',
      tomorrowFocus: 'Ertaga EKGda chap qorincha gipertrofiyasi va ishemiya belgilarini aniqroq tahlil qilishga hamda yangi bemorlar anamnezini yig\'ishga e\'tibor qarataman.'
    },
    attachments: [
      {
        id: 'att-file-1',
        name: 'EKG_tahlili_fragment_anonim.png',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        sizeBytes: 284000,
        sizeFormatted: '277 KB',
        uploadedAt: '2026-09-27T17:25:00Z'
      }
    ],
    status: 'APPROVED',
    supervisorRating: 5,
    supervisorFeedback: 'Klinik keys va davolash taktikasi a\'lo darajada tahlil qilingan. Bemor deontologiyasi va kriz shoshilinch yordami to\'g\'ri yoritilgan.',
    reviewedBy: 'Prof. Sobirov Alisher Tolipovich',
    reviewerId: 'uid-sup-005',
    submittedAt: '2026-09-27T17:30:00Z',
    reviewedAt: '2026-09-27T19:15:00Z',
    version: 1
  },
  {
    id: 'dj-2',
    practiceId: 'prac-1',
    studentId: 'std-2',
    assignmentId: 'asg-2',
    practicePlaceId: 'place-1',
    departmentId: 'pdept-3',
    department: 'Kardiologiya',
    supervisorId: 'sup-1',
    attendanceId: 'att-2',
    date: '2026-09-28',
    attendanceSnapshot: {
      status: 'PRESENT',
      checkInTime: '08:15',
      checkOutTime: '14:15',
      verifiedBy: 'Dr. Ergashev Nodir Komilovich',
      practicePlaceName: 'Respublika 1-son Klinik Shifoxonasi',
      supervisorName: 'Prof. Sobirov Alisher Tolipovich',
      departmentName: 'Kardiologiya'
    },
    workSummary: 'Kardiologiya bo\'limida ertalabki obxodda qatnashdim. Intensiv kardiologiya palatasida 3 nafar bemorning EKG dinamikasini ko\'rib chiqdik. Vena ichiga dori yuborishda hamshiraga assistentlik qildim. 1 nafar yangi yotqizilgan bemorning kasallik tarixini to\'ldirdim.',
    patientsExaminedCount: 3,
    patientDiagnosesSummary: 'Nostabil stenokardiya (1 nafar), O\'tkir miokard infarkti keyingi holat (1 nafar), Surunkali yurak yetishmovchiligi II-B bosqich (1 nafar).',
    procedures: [
      { id: 'prc-2-1', name: '12 ta ulanishda EKG yozish va tahlil qilish', count: 3, participationType: 'Rahbar nazoratida', skillId: 'sk-2' },
      { id: 'prc-2-2', name: 'Arterial qon bosimini Korotkov usulida o\'lchash', count: 3, participationType: 'Mustaqil', skillId: 'sk-5' },
      { id: 'prc-2-3', name: 'Yurak chegaralarini perkussiya qilish', count: 2, participationType: 'Mustaqil' }
    ],
    proceduresDone: ['12 ta ulanishda EKG', 'Qon bosimi monitoringi'],
    clinicalCases: [
      {
        id: 'cc-2-1',
        caseTitle: 'Nostabil stenokardiya, progressiv turi',
        patientAgeGender: '62 yosh, Ayol',
        complaints: 'To\'sh ortida bosuvchi va achishtiruvchi og\'riq, chap yelkaga va qo\'lga tarqalishi, jismoniy zo\'riqishda kuchayishi.',
        anamnesis: 'Oxirgi 1 haftada stenokardiya xurujlari tez-tez takrorlanayotganini va nitroglitserin ta\'siri kamayganini aytadi.',
        examination: 'Rangsiz teri, auskultatsiyada I ton bo\'g\'iqligi, qon bosimi 140/90 mm sim.ust. EKGda ST segment depressiyasi.',
        presumptiveDiagnosis: 'Yurak ishemik kasalligi: Nostabil stenokardiya. Arterial gipertenziya II bosqich.',
        treatmentTactics: 'Gospitalizatsiya, qat\'iy yotoq rejimi, geparinoterapiya, aspirin + klopidogrel, beta-blokator, statinlar.',
        learnedAspect: 'Nostabil stenokardiya xurujida o\'tkir koronar sindrom xavfini tezkor aniqlash va troponin testini o\'z vaqtida o\'tkazish muhimligini o\'rgandim.'
      }
    ],
    clinicalCasesSummary: 'Bemor B. 62 yosh, nostabil stenokardiya diagnostikasi va monitoringi.',
    topicsLearned: 'O\'tkir koronar sindromda shoshilinch tekshiruvlar: troponin I/T dinamikasi, EKG mezonlari.',
    questionsLearned: 'Antiagregant va antikoagulyant terapiyani birgalikda qo\'llash xavflari.',
    selfReflection: {
      whatLearned: 'Koronar yetishmovchilikda EKG tahlilining o\'ziga xos jihatlarini o\'rgandim.',
      skillsImproved: 'EKG apparatini mustaqil ulash va to\'sh usti elektrodlarini aniq joylashtirish.',
      tomorrowFocus: 'Ertaga exokardiografiya tekshiruvida qatnashib yurak zarb fraksiyasini baholash.'
    },
    status: 'PENDING',
    submittedAt: '2026-09-28T14:20:00Z',
    version: 1
  },
  {
    id: 'dj-3',
    practiceId: 'prac-1',
    studentId: 'std-4',
    assignmentId: 'asg-4',
    practicePlaceId: 'place-1',
    departmentId: 'pdept-2',
    department: 'Umumiy xirurgiya',
    supervisorId: 'sup-2',
    attendanceId: 'att-4',
    date: '2026-09-27',
    attendanceSnapshot: {
      status: 'PRESENT',
      checkInTime: '08:20',
      checkOutTime: '14:30',
      verifiedBy: 'Dr. Karimov Rustam Baxtiyorovich',
      practicePlaceName: 'Respublika 1-son Klinik Shifoxonasi',
      supervisorName: 'Dr. Rahmonova Nargiza Anvarovna',
      departmentName: 'Umumiy xirurgiya'
    },
    workSummary: 'Xirurgiya bo\'limida navbatchilik qildim. Bog\'lov xonasida ishlash qoidalari bilan tanishdim. Operatsiyadan keyingi bemorlarning operatsiya sohasini ko\'zdan kechirishda qatnashdim.',
    patientsExaminedCount: 2,
    patientDiagnosesSummary: 'Operatsiyadan keyingi holat (o\'tkir appenditsit bo\'yicha).',
    procedures: [
      { id: 'prc-3-1', name: 'Aseptik bog\'lam qo\'yish va almashtirish', count: 2, participationType: 'Kuzatuvchi' }
    ],
    proceduresDone: ['Aseptik bog\'lam'],
    clinicalCases: [
      {
        id: 'cc-3-1',
        caseTitle: 'O\'tkir appenditsit, flegmonoz turi',
        patientAgeGender: '23 yosh, Erkak',
        complaints: 'O\'ng yonbosh sohasida simillovchi og\'riq, tana harorati 37.8C gacha ko\'tarilishi.',
        anamnesis: 'Bir kun oldin og\'riq epigastriyada boshlanib, o\'ng yonbosh sohasiga ko\'chgan (Koxer belgisi).',
        examination: 'Shchetkin-Blyumberg, Sitkovskiy belgilari musbat.',
        presumptiveDiagnosis: 'O\'tkir appenditsit, flegmonoz shakli.',
        treatmentTactics: 'Shoshilinch appendektomiya.',
        learnedAspect: 'Koxer va Sitkovskiy belgilarini to\'g\'ri tekshirish texnikasi.'
      }
    ],
    clinicalCasesSummary: 'Appenditsit klinikasi va differensial diagnostikasi.',
    topicsLearned: 'O\'tkir qorin sindromi va differensial diagnostika.',
    questionsLearned: 'Operatsiyadan keyingi asoratlarning oldini olish.',
    selfReflection: {
      whatLearned: 'Jarrohlikda aseptika va antiseptika qoidalari.',
      skillsImproved: 'Qorin palpatsiyasi va peritonial belgilarni baholash.',
      tomorrowFocus: 'Jarrohlik asboblari va chok materiallari tasnifini chuqur o\'rganish.'
    },
    status: 'REVISION',
    revisionReason: 'Bajarilgan ishlar tavsifi juda qisqa yozilgan. Operatsiyadan keyingi asoratlarni profilaktika qilish va bog\'lov xonasida shaxsan bajargan manipulyatsiyalaringizni batafsil yoritib, qayta topshiring.',
    supervisorFeedback: 'Qayta ishlash zarur. Bajarilgan muolajalar va o\'rganilgan jihatlar to\'liqroq yozilsin.',
    reviewedBy: 'Dr. Rahmonova Nargiza Anvarovna',
    reviewerId: 'uid-sup-006',
    submittedAt: '2026-09-27T16:00:00Z',
    reviewedAt: '2026-09-27T18:30:00Z',
    version: 1
  },
  {
    id: 'dj-4',
    practiceId: 'prac-2',
    studentId: 'std-5',
    assignmentId: 'asg-5',
    practicePlaceId: 'place-3',
    departmentId: 'pdept-5',
    department: 'Pediatriya',
    supervisorId: 'sup-3',
    attendanceId: 'att-5',
    date: '2026-09-28',
    attendanceSnapshot: {
      status: 'PRESENT',
      checkInTime: '08:10',
      checkOutTime: '14:00',
      verifiedBy: 'Dr. Qodirova G.',
      practicePlaceName: 'Toshkent shahar 1-son Bolalar Klinik Shifoxonasi',
      supervisorName: 'Dr. Qodirova Gulchehra Olimovna',
      departmentName: 'Pediatriya'
    },
    workSummary: 'Pediatriya bo\'limida ertalabdan 4 nafar bolani ko\'rikdan o\'tkazishda qatnashdim. Bolalarda tana vazni, bo\'y uzunligi va ko\'krak qafasi aylanasi antropometriyasini o\'lchadim. Bolalarda nafas olish soni va pulsni yoshga nisbatan me\'yori bilan solishtirdik.',
    patientsExaminedCount: 4,
    patientDiagnosesSummary: 'O\'tkir bronxit (2 nafar), Raxit II daraja (1 nafar), O\'tkir respirator virusli infeksiya (1 nafar).',
    procedures: [
      { id: 'prc-4-1', name: 'Bolalarda antropometriya o\'tkazish (vazn, bo\'y, aylanalar)', count: 4, participationType: 'Mustaqil' },
      { id: 'prc-4-2', name: 'Nafas soni va pulsni hisoblash', count: 4, participationType: 'Mustaqil' },
      { id: 'prc-4-3', name: 'Ingalyatsion terapiya (nebulayzer) o\'tkazish', count: 2, participationType: 'Rahbar nazoratida' }
    ],
    proceduresDone: ['Antropometriya', 'Nafas hisoblash', 'Nebulayzer'],
    clinicalCasesSummary: '7 oylik bolada raxit kasalligi va o\'tkir bronxit.',
    questionsLearned: 'Bolalarda dori vositalarini tana vazniga qarab hisoblash.',
    topicsLearned: 'Bolalarda raxit kasalligi profilaktikasi va D vitamini dozalari.',
    selfReflection: {
      whatLearned: 'Chaqaloq va emizikli bolalarda auskultatsiya o\'tkazish nozikliklari.',
      skillsImproved: 'Bolalar bilan tez til topishish va ota-onalar bilan deontologik suhbat.',
      tomorrowFocus: 'Bolalar emlash kalendari bo\'yicha vaksinalar muddatlarini takrorlash.'
    },
    status: 'APPROVED',
    supervisorRating: 5,
    supervisorFeedback: 'Antropometrik hisob-kitoblar va nebulayzer terapiyasi to\'g\'ri bajarilgan.',
    reviewedBy: 'Dr. Qodirova Gulchehra Olimovna',
    reviewerId: 'uid-sup-007',
    submittedAt: '2026-09-28T14:10:00Z',
    reviewedAt: '2026-09-28T14:50:00Z',
    version: 1
  }
];

const DEFAULT_SKILL_CATEGORIES_V2: string[] = [
  'Diagnostika',
  'Muolajalar',
  'Terapiya',
  'Jarrohlik',
  'Pediatriya',
  'Akusherlik va ginekologiya',
  'Reanimatsiya',
  'Tez tibbiy yordam',
  'Laboratoriya',
  'Infeksiya nazorati',
  'Hamshiralik ishi',
  'Boshqa'
];

const DEFAULT_SKILLS_V2: Skill[] = [
  {
    id: 'sk-1',
    name: 'Vena ichiga dori yuborish va tomchi dorilar tizimini ulash',
    category: 'Muolajalar',
    requiredCount: 15,
    recommendedCount: 25,
    description: 'Aseptika va antiseptika qoidalariga rioya qilgan holda periferik vena punksiyasi va infuzion terapiya o\'tkazish.',
    difficulty: 'o\'rta',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-2',
    name: '12 ta ulanishda EKG yozish va tahlil qilish',
    category: 'Diagnostika',
    requiredCount: 20,
    recommendedCount: 30,
    description: 'Elektrodlarni to\'g\'ri joylashtirish, yurak ritmi, o\'tkazuvchanlik buzilishlari va ishemiya belgilarini aniqlash.',
    difficulty: 'o\'rta',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-3',
    name: 'Teri va teri osti choklarini qo\'yish hamda olish',
    category: 'Jarrohlik',
    requiredCount: 8,
    recommendedCount: 15,
    description: 'Jarrohlik asboblari bilan ishlash, tugun bog\'lash texnikasi, yaralarni birlamchi jarrohlik ishlovi va aseptik bog\'lam.',
    difficulty: 'murakkab',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-4',
    name: 'Yurak-o\'pka reanimatsiyasi (BLS / ALS algoritmi)',
    category: 'Reanimatsiya',
    requiredCount: 5,
    recommendedCount: 10,
    description: 'Ko\'krak qafasi kompressiyasi (30:2), sun\'iy nafas berish, Ambu qopi va avtomat tashqi defibrillyatordan (AED) foydalanish.',
    difficulty: 'murakkab',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-5',
    name: 'Arterial qon bosimini Korotkov usulida o\'lchash',
    category: 'Diagnostika',
    requiredCount: 30,
    recommendedCount: 50,
    description: 'Mexanik yoki simobli sfigmomanometr yordamida sistolik va diastolik bosimni aniqlash va xatoliklarni bartaraf etish.',
    difficulty: 'oddiy',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-6',
    name: 'Puls va periferik arterial tomirlarni paypaslash',
    category: 'Diagnostika',
    requiredCount: 25,
    recommendedCount: 40,
    description: 'Bilak, uyqu, son arteriyalarida pulsning chastotasi, ritmi, to\'liqligi va tarangligini tekshirish.',
    difficulty: 'oddiy',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-7',
    name: 'Mushak orasiga (m/o) inyeksiya qilish',
    category: 'Muolajalar',
    requiredCount: 20,
    recommendedCount: 35,
    description: 'Dumg\'aza sohasining yuqori tashqi kvadrantiga inyeksiyani xavfsiz va to\'g\'ri burchak ostida o\'tkazish texnikasi.',
    difficulty: 'oddiy',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-8',
    name: 'Aseptik va antiseptik bog\'lamlar qo\'yish (Desmurgiya)',
    category: 'Jarrohlik',
    requiredCount: 12,
    recommendedCount: 20,
    description: 'Bosh, ko\'krak qafasi, qo\'l-oyoq jarohatlarida Deso, spiral, sakkizsimon va bosuvchi bog\'lamlarni qo\'yish.',
    difficulty: 'oddiy',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-9',
    name: 'Plevral bo\'shliq punksiyasida assistentlik qilish',
    category: 'Terapiya',
    requiredCount: 4,
    recommendedCount: 8,
    description: 'Gidrotoraks yoki plevritda punksiya o\'tkazish asboblari, bemor pozitsiyasi va ekssudat evakuatsiyasida qatnashish.',
    difficulty: 'murakkab',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'RECOMMENDED',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-10',
    name: 'Bolalarda antropometriya (vazn, bo\'y, bosh va ko\'krak aylanasi)',
    category: 'Pediatriya',
    requiredCount: 15,
    recommendedCount: 25,
    description: 'Chaqaloq va yosh bolalarda jismoniy rivojlanish ko\'rsatkichlarini o\'lchash va sentil jadvallari bo\'yicha baholash.',
    difficulty: 'oddiy',
    practiceType: 'Pediatriya amaliyoti',
    course: 3,
    specialty: 'Pediatriya',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-11',
    name: 'Homila yurak urishini akusherlik stetoskopi bilan eshitish',
    category: 'Akusherlik va ginekologiya',
    requiredCount: 10,
    recommendedCount: 15,
    description: 'Leopold usullari orqali homila holatini aniqlash va akusherlik stetoskopi yoki dopler yordamida yurak ritmini sanash.',
    difficulty: 'o\'rta',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-12',
    name: 'Anafilaktik shokda shoshilinch yordam ko\'rsatish',
    category: 'Tez tibbiy yordam',
    requiredCount: 6,
    recommendedCount: 10,
    description: 'Adrenalin (epinefrin) 0.1% ni darhol yuborish, nafas yo\'llari o\'tkazuvchanligini ta\'minlash, glyukokortikoidlar kiritish.',
    difficulty: 'murakkab',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-13',
    name: 'Umumiy qon tahlili uchun kapillyar qon olish',
    category: 'Laboratoriya',
    requiredCount: 10,
    recommendedCount: 20,
    description: 'Barmoq uchidan skarafikator yordamida qon olish, qon surtmasini tayyorlash va qon to\'xtatish qoidalariga rioya qilish.',
    difficulty: 'oddiy',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'RECOMMENDED',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-14',
    name: 'Shaxsiy himoya vositalari (SHHV) kiyish, yechish va utilizatsiya qilish',
    category: 'Infeksiya nazorati',
    requiredCount: 15,
    recommendedCount: 25,
    description: 'Kombinezon, respirator, himoya ko\'zoynagi va qo\'lqoplarni standart protokol bo\'yicha kiyish hamda xavfsiz utilizatsiya.',
    difficulty: 'oddiy',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'MANDATORY',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  },
  {
    id: 'sk-15',
    name: 'Quviqni rezina / Foley kateteri bilan kateterizatsiya qilish',
    category: 'Muolajalar',
    requiredCount: 6,
    recommendedCount: 12,
    description: 'Siydik tutilishida yoki monitoring uchun aseptika qoidalariga amal qilgan holda Foley kateterini kiritish.',
    difficulty: 'o\'rta',
    practiceType: 'Klinik amaliyot',
    course: 4,
    specialty: 'Davolash ishi',
    importance: 'RECOMMENDED',
    isActive: true,
    createdAt: '2026-08-20T08:00:00Z'
  }
];

const DEFAULT_SKILL_LOGS_V2: SkillLogEntry[] = [
  {
    id: 'slog-1',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-5',
    date: '2026-09-27',
    participationType: 'INDEPENDENT',
    count: 4,
    patientInfo: { age: 58, gender: 'Erkak', department: 'Terapiya', clinicalCondition: 'Gipertonik kriz' },
    notes: 'Terapiya bo\'limida 4 nafar arterial gipertenziya bilan og\'rigan bemorda qon bosimi Korotkov usulida o\'lchandi.',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'APPROVED',
    verifiedBy: 'Prof. Sobirov Alisher Tolipovich',
    verifiedAt: '2026-09-27T19:15:00Z',
    supervisorFeedback: 'A\'lo darajada bajarildi. Bosim dinamikasi to\'g\'ri qayd etilgan.',
    supervisorRating: 5,
    dailyJournalId: 'dj-1',
    createdAt: '2026-09-27T17:30:00Z'
  },
  {
    id: 'slog-2',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-1',
    date: '2026-09-27',
    participationType: 'SUPERVISED',
    count: 2,
    patientInfo: { age: 64, gender: 'Ayol', department: 'Terapiya', clinicalCondition: 'Surunkali pnevmoniya' },
    notes: 'Rahbar nazoratida 2 nafar bemorga periferik vena orqali tomchi dorilar tizimi ulandi.',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'APPROVED',
    verifiedBy: 'Prof. Sobirov Alisher Tolipovich',
    verifiedAt: '2026-09-27T19:15:00Z',
    supervisorFeedback: 'Aseptika qoidalariga rioya qilingan holda venaga aniq tushildi.',
    supervisorRating: 5,
    dailyJournalId: 'dj-1',
    createdAt: '2026-09-27T17:30:00Z'
  },
  {
    id: 'slog-3',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-2',
    date: '2026-09-27',
    participationType: 'INDEPENDENT',
    count: 1,
    patientInfo: { age: 58, gender: 'Erkak', department: 'Terapiya', clinicalCondition: 'Gipertoniya II bosqich' },
    notes: '12 ta ulanishli EKG apparati bilan yurak ritmi va chap qorincha gipertrofiyasi belgilari tahlil qilindi.',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'APPROVED',
    verifiedBy: 'Prof. Sobirov Alisher Tolipovich',
    verifiedAt: '2026-09-27T19:15:00Z',
    supervisorFeedback: 'EKG to\'lqinlari va tishchalari to\'g\'ri sharhlangan.',
    supervisorRating: 5,
    dailyJournalId: 'dj-1',
    createdAt: '2026-09-27T17:30:00Z'
  },
  {
    id: 'slog-4',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-5',
    date: '2026-09-28',
    participationType: 'INDEPENDENT',
    count: 6,
    patientInfo: { age: 52, gender: 'Ayol', department: 'Terapiya', clinicalCondition: 'Arterial gipertenziya' },
    notes: 'Ertalabki palata obxodida 6 nafar bemorda qon bosimi va puls o\'lchandi.',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'PENDING',
    createdAt: '2026-09-28T13:30:00Z'
  },
  {
    id: 'slog-5',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-6',
    date: '2026-09-28',
    participationType: 'INDEPENDENT',
    count: 6,
    patientInfo: { age: 60, gender: 'Erkak', department: 'Terapiya', clinicalCondition: 'YIK, stenokardiya' },
    notes: 'Bilak arteriyasida puls tekshirildi (ritm, taranglik, to\'liqlik).',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'PENDING',
    createdAt: '2026-09-28T13:35:00Z'
  },
  {
    id: 'slog-6',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-7',
    date: '2026-09-28',
    participationType: 'SUPERVISED',
    count: 3,
    patientInfo: { age: 48, gender: 'Ayol', department: 'Terapiya', clinicalCondition: 'Radikulit' },
    notes: 'Hamshira nazoratida analgetik va vitamin preparatlari dumba mushagiga yuborildi.',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'PENDING',
    createdAt: '2026-09-28T13:40:00Z'
  },
  {
    id: 'slog-7',
    studentId: 'std-2',
    practiceId: 'prac-1',
    skillId: 'sk-2',
    date: '2026-09-28',
    participationType: 'SUPERVISED',
    count: 3,
    patientInfo: { age: 62, gender: 'Ayol', department: 'Kardiologiya', clinicalCondition: 'Nostabil stenokardiya' },
    notes: 'Kardiologiya bo\'limida 3 nafar bemorga 12 ulanishda EKG olindi.',
    supervisorId: 'sup-1',
    supervisorName: 'Prof. Sobirov Alisher Tolipovich',
    status: 'PENDING',
    dailyJournalId: 'dj-2',
    createdAt: '2026-09-28T14:20:00Z'
  },
  {
    id: 'slog-8',
    studentId: 'std-4',
    practiceId: 'prac-1',
    skillId: 'sk-8',
    date: '2026-09-27',
    participationType: 'OBSERVED',
    count: 2,
    patientInfo: { age: 23, gender: 'Erkak', department: 'Umumiy xirurgiya', clinicalCondition: 'Appenditsit operatsiyasidan keyingi holat' },
    notes: 'Bog\'lov xonasida operatsiyadan keyingi yara aseptik bog\'lamini almashtirish kuzatildi.',
    supervisorId: 'sup-2',
    supervisorName: 'Dr. Rahmonova Nargiza Anvarovna',
    status: 'APPROVED',
    verifiedBy: 'Dr. Rahmonova Nargiza Anvarovna',
    verifiedAt: '2026-09-27T18:30:00Z',
    supervisorFeedback: 'Jarayon to\'g\'ri kuzatilgan va aseptika tushuntirildi.',
    supervisorRating: 4,
    dailyJournalId: 'dj-3',
    createdAt: '2026-09-27T16:00:00Z'
  },
  {
    id: 'slog-9',
    studentId: 'std-5',
    practiceId: 'prac-2',
    skillId: 'sk-10',
    date: '2026-09-28',
    participationType: 'INDEPENDENT',
    count: 4,
    patientInfo: { age: 3, gender: 'Erkak', department: 'Pediatriya', clinicalCondition: 'O\'tkir bronxit' },
    notes: 'Pediatriya bo\'limida 4 nafar bolada tana vazni va bo\'y antropometriyasi o\'tkazildi.',
    supervisorId: 'sup-3',
    supervisorName: 'Dr. Qodirova Gulchehra Olimovna',
    status: 'APPROVED',
    verifiedBy: 'Dr. Qodirova Gulchehra Olimovna',
    verifiedAt: '2026-09-28T14:50:00Z',
    supervisorFeedback: 'Antropometriya va sentil baholash to\'g\'ri bajarilgan.',
    supervisorRating: 5,
    dailyJournalId: 'dj-4',
    createdAt: '2026-09-28T14:10:00Z'
  }
];

const DEFAULT_STUDENT_SKILLS_V2: StudentSkill[] = [
  {
    id: 'ssk-1',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-1',
    performedCount: 12,
    independentCount: 5,
    supervisedCount: 6,
    observedCount: 1,
    verifiedCount: 12,
    targetCount: 15,
    status: 'in_progress',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-27'
  },
  {
    id: 'ssk-2',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-2',
    performedCount: 18,
    independentCount: 10,
    supervisedCount: 6,
    observedCount: 2,
    verifiedCount: 17,
    targetCount: 20,
    status: 'in_progress',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-27'
  },
  {
    id: 'ssk-3',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-5',
    performedCount: 30,
    independentCount: 24,
    supervisedCount: 6,
    observedCount: 0,
    verifiedCount: 30,
    targetCount: 30,
    status: 'mastered',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-28'
  },
  {
    id: 'ssk-4',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-6',
    performedCount: 20,
    independentCount: 15,
    supervisedCount: 5,
    observedCount: 0,
    verifiedCount: 15,
    targetCount: 25,
    status: 'in_progress',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-28'
  },
  {
    id: 'ssk-5',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-7',
    performedCount: 14,
    independentCount: 8,
    supervisedCount: 6,
    observedCount: 0,
    verifiedCount: 12,
    targetCount: 20,
    status: 'in_progress',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-28'
  },
  {
    id: 'ssk-6',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-4',
    performedCount: 5,
    independentCount: 2,
    supervisedCount: 2,
    observedCount: 1,
    verifiedCount: 5,
    targetCount: 5,
    status: 'mastered',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-24'
  },
  {
    id: 'ssk-7',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-8',
    performedCount: 12,
    independentCount: 7,
    supervisedCount: 4,
    observedCount: 1,
    verifiedCount: 12,
    targetCount: 12,
    status: 'mastered',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-26'
  },
  {
    id: 'ssk-8',
    studentId: 'std-1',
    practiceId: 'prac-1',
    skillId: 'sk-14',
    performedCount: 15,
    independentCount: 12,
    supervisedCount: 3,
    observedCount: 0,
    verifiedCount: 15,
    targetCount: 15,
    status: 'mastered',
    verifiedBySupervisor: true,
    lastPerformedDate: '2026-09-26'
  }
];

const DEFAULT_TASKS_V2: Task[] = [
  {
    id: 'task-1',
    practiceId: 'prac-1',
    title: 'Gipertoniya bilan og\'rigan 3 nafar bemorning kasallik tarixini to\'ldirish',
    description: 'Kafedra mudiriga topshirish uchun to\'liq kuratsiya varaqasi.',
    deadline: '2026-10-05',
    status: 'OPEN'
  }
];

const DEFAULT_ASSESSMENTS_V2: Assessment[] = [
  {
    id: 'ass-1',
    practiceId: 'prac-1',
    studentId: 'std-1',
    attendanceScore: 19,
    journalScore: 19,
    skillsScore: 28,
    finalExamScore: 28,
    totalScore: 94,
    grade: '5',
    assessorId: 'sup-1',
    assessorName: 'Prof. Sobirov Alisher Tolipovich',
    assessmentDate: '2026-09-27',
    feedback: 'Amaliy ko\'nikmalarni to\'liq o\'zlashtirgan. Intizomli.',
    status: 'graded'
  }
];

const DEFAULT_DOCUMENTS_V2: DocumentRecord[] = [
  {
    id: 'doc-1',
    title: '4-kurs Davolash ishi talabalari amaliyotini o\'tash to\'g\'risida rektor buyrug\'i',
    type: 'order',
    docNumber: 'BUYRUQ-№142/A',
    issueDate: '2026-08-25',
    practiceId: 'prac-1',
    status: 'active',
    description: 'Talabalarni klinik bazalarga taqsimlash va moddiy javobgarlik.',
    downloadUrl: '#'
  }
];

const DEFAULT_NOTIFICATIONS_V2: AppNotification[] = [
  {
    id: 'notif-1',
    recipientRoles: ['PRACTICE_HEAD', 'PRACTICE_STAFF', 'FACULTY_DEAN'],
    title: 'Yangi amaliyot buyrug\'i tasdiqlandi',
    message: '4-kurs Davolash ishi amaliyoti boshlandi. Taqsimotlar tekshirilsin.',
    type: 'info',
    createdAt: '2026-09-28T04:30:00Z',
    isRead: false,
    linkModule: 'practices'
  }
];

const DEFAULT_AUDIT_LOGS_V2: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'uid-admin-001',
    userRole: 'SUPER_ADMIN',
    action: 'practiceCreated',
    entity: 'practices',
    entityId: 'prac-1',
    timestamp: '2026-08-25T09:12:00Z',
    metadata: JSON.stringify({ code: 'PRAC-2025-MED4', name: '4-kurs Davolash amaliyoti' })
  },
  {
    id: 'log-2',
    userId: 'uid-head-002',
    userRole: 'PRACTICE_HEAD',
    action: 'assignmentCreated',
    entity: 'practiceAssignments',
    entityId: 'asg-1',
    timestamp: '2026-08-30T10:00:00Z',
    metadata: JSON.stringify({ studentId: 'std-1', placeId: 'place-1', department: 'Terapiya' })
  },
  {
    id: 'log-3',
    userId: 'uid-clinic-006',
    userRole: 'CLINIC_RESPONSIBLE',
    action: 'attendanceCreated',
    entity: 'attendance',
    entityId: 'att-1',
    timestamp: '2026-09-28T08:24:00Z',
    metadata: JSON.stringify({ studentId: 'std-1', status: 'present' })
  }
];

class StorageServiceV2 {
  private initDatabase(): DatabaseStateV2 {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.students && parsed.practices && parsed.practicePlaces && parsed.auditLogs) {
          if (!parsed.attendanceSessions || parsed.attendanceSessions.length === 0) {
            parsed.attendanceSessions = DEFAULT_ATTENDANCE_SESSIONS_V2;
          }
          if (!parsed.attendance || parsed.attendance.length < 5) {
            parsed.attendance = DEFAULT_ATTENDANCE_V2;
          }
          if (!parsed.dailyJournals || parsed.dailyJournals.length < 4 || !parsed.dailyJournals[0].attendanceId) {
            parsed.dailyJournals = DEFAULT_DAILY_JOURNALS_V2;
          }
          if (!parsed.skillLogs || parsed.skillLogs.length === 0) {
            parsed.skillLogs = DEFAULT_SKILL_LOGS_V2;
          }
          if (!parsed.skills || parsed.skills.length < 8) {
            parsed.skills = DEFAULT_SKILLS_V2;
          }
          if (!parsed.studentSkills || parsed.studentSkills.length < 5) {
            parsed.studentSkills = DEFAULT_STUDENT_SKILLS_V2;
          }
          if (!parsed.skillCategories || parsed.skillCategories.length === 0) {
            parsed.skillCategories = DEFAULT_SKILL_CATEGORIES_V2;
          }
          return parsed;
        }
      } catch (err) {
        console.error('Error parsing stored database v2, resetting defaults', err);
      }
    }

    const defaultState: DatabaseStateV2 = {
      mode: 'DEVELOPMENT',
      users: DEFAULT_USERS_V2,
      faculties: DEFAULT_FACULTIES,
      directions: DEFAULT_DIRECTIONS,
      courses: DEFAULT_COURSES,
      groups: DEFAULT_GROUPS,
      students: DEFAULT_STUDENTS_V2,
      practicePlaces: DEFAULT_PRACTICE_PLACES,
      practiceDepartments: DEFAULT_PRACTICE_DEPARTMENTS,
      supervisors: DEFAULT_SUPERVISORS,
      clinicResponsibles: DEFAULT_CLINIC_RESPONSIBLES,
      practices: DEFAULT_PRACTICES_V2,
      practiceAssignments: DEFAULT_ASSIGNMENTS_V2,
      attendance: DEFAULT_ATTENDANCE_V2,
      attendanceSessions: DEFAULT_ATTENDANCE_SESSIONS_V2,
      dailyJournals: DEFAULT_DAILY_JOURNALS_V2,
      skills: DEFAULT_SKILLS_V2,
      studentSkills: DEFAULT_STUDENT_SKILLS_V2,
      skillLogs: DEFAULT_SKILL_LOGS_V2,
      skillCategories: DEFAULT_SKILL_CATEGORIES_V2,
      tasks: DEFAULT_TASKS_V2,
      assessments: DEFAULT_ASSESSMENTS_V2,
      documents: DEFAULT_DOCUMENTS_V2,
      notifications: DEFAULT_NOTIFICATIONS_V2,
      auditLogs: DEFAULT_AUDIT_LOGS_V2
    };

    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(defaultState));
    return defaultState;
  }

  private getState(): DatabaseStateV2 {
    return this.initDatabase();
  }

  private saveState(state: DatabaseStateV2): void {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  }

  public getEnvironmentMode(): AppEnvironmentMode {
    return this.getState().mode || 'DEVELOPMENT';
  }

  public setEnvironmentMode(mode: AppEnvironmentMode): void {
    const state = this.getState();
    state.mode = mode;
    this.saveState(state);
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEY_V2);
    this.initDatabase();
    this.recordAuditLog({
      userId: 'system',
      userRole: 'SUPER_ADMIN',
      action: 'systemReset',
      entity: 'database',
      entityId: 'all',
      metadata: 'Database re-seeded to factory defaults'
    });
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.getState().auditLogs || [];
  }

  public recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const state = this.getState();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    if (!state.auditLogs) state.auditLogs = [];
    state.auditLogs.unshift(newLog);
    // Keep max 500 audit logs in local store
    if (state.auditLogs.length > 500) {
      state.auditLogs = state.auditLogs.slice(0, 500);
    }
    this.saveState(state);
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    return this.getState().users;
  }

  public authenticate(usernameOrEmail: string, password?: string): User | null {
    const users = this.getUsers();
    const q = usernameOrEmail.toLowerCase().trim();
    const user = users.find(u => 
      (u.login && u.login.toLowerCase() === q) || 
      (u.username && u.username.toLowerCase() === q) || 
      (u.email && u.email.toLowerCase() === q)
    );
    if (!user) return null;
    if (password && user.password && user.password !== password) {
      return null;
    }
    return user;
  }

  public saveUser(user: User): void {
    const state = this.getState();
    const idx = state.users.findIndex(u => u.id === user.id || u.uid === user.uid);
    if (idx >= 0) {
      state.users[idx] = { ...user, updatedAt: new Date().toISOString() };
    } else {
      state.users.unshift(user);
    }
    this.saveState(state);
  }

  // --- FACULTIES ---
  public getFaculties(): Faculty[] {
    return this.getState().faculties;
  }

  public saveFaculty(faculty: Faculty): void {
    const state = this.getState();
    const idx = state.faculties.findIndex(f => f.id === faculty.id);
    if (idx >= 0) {
      state.faculties[idx] = faculty;
    } else {
      state.faculties.push(faculty);
    }
    this.saveState(state);
  }

  public deleteFaculty(id: string): void {
    const state = this.getState();
    state.faculties = state.faculties.filter(f => f.id !== id);
    this.saveState(state);
  }

  // --- DIRECTIONS ---
  public getDirections(): Direction[] {
    return this.getState().directions;
  }

  public saveDirection(direction: Direction): void {
    const state = this.getState();
    const idx = state.directions.findIndex(d => d.id === direction.id);
    if (idx >= 0) {
      state.directions[idx] = direction;
    } else {
      state.directions.push(direction);
    }
    this.saveState(state);
  }

  public deleteDirection(id: string): void {
    const state = this.getState();
    state.directions = state.directions.filter(d => d.id !== id);
    this.saveState(state);
  }

  // --- COURSES ---
  public getCourses(): Course[] {
    return this.getState().courses;
  }

  // --- GROUPS ---
  public getGroups(): Group[] {
    return this.getState().groups;
  }

  public saveGroup(group: Group): void {
    const state = this.getState();
    const idx = state.groups.findIndex(g => g.id === group.id);
    if (idx >= 0) {
      state.groups[idx] = group;
    } else {
      state.groups.push(group);
    }
    this.saveState(state);
  }

  public deleteGroup(id: string): void {
    const state = this.getState();
    state.groups = state.groups.filter(g => g.id !== id);
    this.saveState(state);
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getState().students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  public saveStudent(student: Student, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    const state = this.getState();
    const idx = state.students.findIndex(s => s.id === student.id);
    const isNew = idx < 0;

    const payload: Student = {
      ...student,
      updatedAt: new Date().toISOString()
    };
    if (isNew) {
      payload.createdAt = payload.createdAt || new Date().toISOString();
      state.students.unshift(payload);
    } else {
      state.students[idx] = payload;
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: isNew ? 'studentCreated' : 'studentUpdated',
      entity: 'students',
      entityId: student.id,
      metadata: JSON.stringify({ fullName: student.fullName, studentId: student.studentId })
    });

    this.saveState(state);
  }

  public deleteStudent(id: string, actorUserId = 'system', actorRole = 'PRACTICE_HEAD'): void {
    const state = this.getState();
    const student = state.students.find(s => s.id === id);
    state.students = state.students.filter(s => s.id !== id);
    state.practiceAssignments = state.practiceAssignments.filter(a => a.studentId !== id);
    state.attendance = state.attendance.filter(a => a.studentId !== id);
    state.dailyJournals = state.dailyJournals.filter(dj => dj.studentId !== id);
    state.studentSkills = state.studentSkills.filter(sk => sk.studentId !== id);
    state.assessments = state.assessments.filter(ass => ass.studentId !== id);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'studentDeleted',
      entity: 'students',
      entityId: id,
      metadata: student ? JSON.stringify({ fullName: student.fullName }) : undefined
    });

    this.saveState(state);
  }

  // --- PRACTICES ---
  public getPractices(): Practice[] {
    return this.getState().practices;
  }

  public getPracticeById(id: string): Practice | undefined {
    return this.getPractices().find(p => p.id === id);
  }

  public savePractice(practice: Practice, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    const state = this.getState();
    const idx = state.practices.findIndex(p => p.id === practice.id);
    const isNew = idx < 0;

    const payload: Practice = {
      ...practice,
      updatedAt: new Date().toISOString()
    };
    if (isNew) {
      payload.createdAt = payload.createdAt || new Date().toISOString();
      state.practices.unshift(payload);
    } else {
      state.practices[idx] = payload;
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: isNew ? 'practiceCreated' : 'practiceUpdated',
      entity: 'practices',
      entityId: practice.id,
      metadata: JSON.stringify({ name: practice.name, code: practice.code, status: practice.status })
    });

    this.saveState(state);
  }

  public setPracticeStatus(id: string, status: Practice['status'], actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    const state = this.getState();
    const practice = state.practices.find(p => p.id === id);
    if (practice) {
      practice.status = status;
      practice.updatedAt = new Date().toISOString();
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'practiceStatusChanged',
        entity: 'practices',
        entityId: id,
        metadata: JSON.stringify({ status })
      });
      this.saveState(state);
    }
  }

  public deletePractice(id: string): void {
    const state = this.getState();
    state.practices = state.practices.filter(p => p.id !== id);
    state.practiceAssignments = state.practiceAssignments.filter(a => a.practiceId !== id);
    state.attendance = state.attendance.filter(a => a.practiceId !== id);
    this.saveState(state);
  }

  public duplicatePractice(id: string, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): Practice | null {
    const state = this.getState();
    const source = state.practices.find(p => p.id === id);
    if (!source) return null;

    const newPracticeId = `prac-${Date.now()}`;
    const copySuffix = `(Nusxa - ${new Date().toLocaleDateString('uz-UZ')})`;
    const duplicated: Practice = {
      ...source,
      id: newPracticeId,
      name: `${source.name} ${copySuffix}`,
      code: `${source.code}-COPY`,
      status: 'DRAFT',
      orderNumber: `${source.orderNumber}-NUSXA`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.practices.unshift(duplicated);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'practiceCreated',
      entity: 'practices',
      entityId: newPracticeId,
      metadata: JSON.stringify({ name: duplicated.name, sourcePracticeId: id })
    });

    this.saveState(state);
    return duplicated;
  }

  public archivePractice(id: string, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    this.setPracticeStatus(id, 'ARCHIVED', actorUserId, actorRole);
  }

  // --- PRACTICE PLACES & DEPARTMENTS ---
  public getPracticePlaces(): PracticePlace[] {
    return this.getState().practicePlaces;
  }

  public savePracticePlace(place: PracticePlace): void {
    const state = this.getState();
    const idx = state.practicePlaces.findIndex(p => p.id === place.id);
    if (idx >= 0) {
      state.practicePlaces[idx] = place;
    } else {
      state.practicePlaces.unshift(place);
    }
    this.saveState(state);
  }

  public deletePracticePlace(id: string): void {
    const state = this.getState();
    state.practicePlaces = state.practicePlaces.filter(p => p.id !== id);
    this.saveState(state);
  }

  public getPracticeDepartments(): PracticeDepartment[] {
    return this.getState().practiceDepartments || [];
  }

  // --- SUPERVISORS & CLINIC RESPONSIBLES ---
  public getSupervisors(): Supervisor[] {
    return this.getState().supervisors;
  }

  public saveSupervisor(supervisor: Supervisor): void {
    const state = this.getState();
    const idx = state.supervisors.findIndex(s => s.id === supervisor.id);
    if (idx >= 0) {
      state.supervisors[idx] = supervisor;
    } else {
      state.supervisors.unshift(supervisor);
    }
    this.saveState(state);
  }

  public deleteSupervisor(id: string): void {
    const state = this.getState();
    state.supervisors = state.supervisors.filter(s => s.id !== id);
    this.saveState(state);
  }

  public getClinicResponsibles(): ClinicResponsible[] {
    return this.getState().clinicResponsibles;
  }

  // --- ASSIGNMENTS & ALLOCATION ---
  public getAssignments(): PracticeAssignment[] {
    return this.getState().practiceAssignments;
  }

  public getPracticeAssignments(): PracticeAssignment[] {
    return this.getState().practiceAssignments;
  }

  public assignStudent(assignment: PracticeAssignment, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    const state = this.getState();
    state.practiceAssignments = state.practiceAssignments.filter(
      a => !(a.studentId === assignment.studentId && a.practiceId === assignment.practiceId)
    );
    assignment.createdAt = assignment.createdAt || new Date().toISOString();
    state.practiceAssignments.unshift(assignment);

    const student = state.students.find(s => s.id === assignment.studentId);
    if (student) {
      student.status = 'in_practice';
      student.currentPracticeId = assignment.practiceId;
      student.currentPracticePlaceId = assignment.practicePlaceId;
    }

    this.recalculatePlaceStudentCounts(state);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assignmentCreated',
      entity: 'practiceAssignments',
      entityId: assignment.id,
      metadata: JSON.stringify({ studentId: assignment.studentId, placeId: assignment.practicePlaceId, dept: assignment.department })
    });

    this.saveState(state);
  }

  public bulkAssignStudents(assignments: PracticeAssignment[], actorUserId = 'system', actorRole = 'PRACTICE_HEAD'): { assignedCount: number } {
    const state = this.getState();
    let count = 0;
    assignments.forEach(asg => {
      state.practiceAssignments = state.practiceAssignments.filter(
        a => !(a.studentId === asg.studentId && a.practiceId === asg.practiceId)
      );
      asg.createdAt = asg.createdAt || new Date().toISOString();
      state.practiceAssignments.unshift(asg);

      const student = state.students.find(s => s.id === asg.studentId);
      if (student) {
        student.status = 'in_practice';
        student.currentPracticeId = asg.practiceId;
        student.currentPracticePlaceId = asg.practicePlaceId;
      }
      count++;
    });

    this.recalculatePlaceStudentCounts(state);

    if (assignments.length > 0) {
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'assignmentCreated',
        entity: 'practiceAssignments',
        entityId: `bulk-${Date.now()}`,
        metadata: JSON.stringify({ count, practiceId: assignments[0]?.practiceId })
      });
    }

    this.saveState(state);
    return { assignedCount: count };
  }

  public removeAssignment(id: string, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    const state = this.getState();
    const asg = state.practiceAssignments.find(a => a.id === id);
    if (asg) {
      const student = state.students.find(s => s.id === asg.studentId);
      if (student && student.currentPracticeId === asg.practiceId) {
        student.currentPracticeId = undefined;
        student.currentPracticePlaceId = undefined;
        student.status = 'active';
      }
      state.practiceAssignments = state.practiceAssignments.filter(a => a.id !== id);
      this.recalculatePlaceStudentCounts(state);

      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'assignmentRemoved',
        entity: 'practiceAssignments',
        entityId: id,
        metadata: JSON.stringify({ studentId: asg.studentId, placeId: asg.practicePlaceId })
      });

      this.saveState(state);
    }
  }

  public autoDistributeStudents(
    practiceId: string, 
    placeIds: string[], 
    supervisorIds: string[],
    department: string = 'Terapiya',
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): { assignedCount: number } {
    const state = this.getState();
    const practice = state.practices.find(p => p.id === practiceId);
    if (!practice || placeIds.length === 0) return { assignedCount: 0 };

    const candidateStudents = state.students.filter(s => 
      practice.groupIds.includes(s.groupId) &&
      !state.practiceAssignments.some(a => a.practiceId === practiceId && a.studentId === s.id)
    );

    let assignedCount = 0;
    candidateStudents.forEach((student, index) => {
      const targetPlaceId = placeIds[index % placeIds.length];
      const targetSupervisorId = supervisorIds.length > 0 ? supervisorIds[index % supervisorIds.length] : (practice.supervisorIds[0] || 'sup-1');

      const newAssignment: PracticeAssignment = {
        id: `asg-auto-${Date.now()}-${index}`,
        practiceId,
        studentId: student.id,
        practicePlaceId: targetPlaceId,
        department,
        supervisorId: targetSupervisorId,
        startDate: practice.startDate,
        endDate: practice.endDate,
        status: 'in_progress',
        createdAt: new Date().toISOString()
      };

      state.practiceAssignments.push(newAssignment);
      student.status = 'in_practice';
      student.currentPracticeId = practiceId;
      student.currentPracticePlaceId = targetPlaceId;
      assignedCount++;
    });

    this.recalculatePlaceStudentCounts(state);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assignmentCreated',
      entity: 'practiceAssignments',
      entityId: `batch-${Date.now()}`,
      metadata: JSON.stringify({ practiceId, assignedCount, placeIds })
    });

    this.saveState(state);
    return { assignedCount };
  }

  private recalculatePlaceStudentCounts(state: DatabaseStateV2): void {
    const activeAssignments = state.practiceAssignments.filter(a => a.status === 'in_progress' || a.status === 'assigned');
    state.practicePlaces.forEach(place => {
      place.activeStudentsCount = activeAssignments.filter(a => a.practicePlaceId === place.id).length;
    });
  }

  // --- ATTENDANCE & QR SESSIONS ---
  public getAttendance(): Attendance[] {
    return this.getState().attendance;
  }

  public getAttendanceSessions(): AttendanceSession[] {
    const state = this.getState();
    const now = new Date();
    // Auto mark expired sessions
    let modified = false;
    state.attendanceSessions.forEach(s => {
      if (s.status === 'ACTIVE' && new Date(s.expiresAt) < now) {
        s.status = 'EXPIRED';
        modified = true;
      }
    });
    if (modified) {
      this.saveState(state);
    }
    return state.attendanceSessions;
  }

  public getActiveAttendanceSession(practicePlaceId?: string, practiceId?: string): AttendanceSession | null {
    const sessions = this.getAttendanceSessions();
    const now = new Date();
    return sessions.find(s => 
      s.status === 'ACTIVE' &&
      new Date(s.expiresAt) > now &&
      (!practicePlaceId || s.practicePlaceId === practicePlaceId) &&
      (!practiceId || s.practiceId === practiceId)
    ) || null;
  }

  public createAttendanceSession(params: {
    practiceId: string;
    practicePlaceId: string;
    departmentId?: string;
    departmentName?: string;
    durationMinutes: number; // 5, 10, 15
    practiceStartTime?: string;
    lateThresholdMinutes?: number;
    allowedRadius?: number;
    latitude?: number;
    longitude?: number;
  }, actorUser: User): AttendanceSession {
    const state = this.getState();
    const now = new Date();
    const duration = params.durationMinutes || 5;
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000).toISOString();

    // Cancel any previous active sessions for the same place/department
    state.attendanceSessions.forEach(s => {
      if (s.practicePlaceId === params.practicePlaceId && s.status === 'ACTIVE') {
        s.status = 'CANCELLED';
      }
    });

    const token = `TMA-QR-${params.practicePlaceId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Inherit coordinates from practicePlace if not passed
    const place = state.practicePlaces.find(p => p.id === params.practicePlaceId);
    const sessionLat = params.latitude ?? place?.latitude;
    const sessionLng = params.longitude ?? place?.longitude;
    const allowedRadius = params.allowedRadius ?? place?.allowedRadius ?? 200;

    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}`,
      practiceId: params.practiceId,
      practicePlaceId: params.practicePlaceId,
      departmentId: params.departmentId || '',
      departmentName: params.departmentName || '',
      createdBy: actorUser.uid || actorUser.id,
      creatorName: actorUser.fullName,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'ACTIVE',
      token,
      durationMinutes: duration,
      practiceStartTime: params.practiceStartTime || '08:00',
      lateThresholdMinutes: params.lateThresholdMinutes || 15,
      allowedRadius,
      latitude: sessionLat,
      longitude: sessionLng
    };

    state.attendanceSessions.unshift(newSession);

    this.recordAuditLog({
      userId: actorUser.uid || actorUser.id,
      userRole: actorUser.role,
      action: 'attendanceSessionCreated',
      entity: 'attendanceSessions',
      entityId: newSession.id,
      metadata: JSON.stringify({
        token: newSession.token,
        durationMinutes: duration,
        expiresAt,
        practicePlaceId: params.practicePlaceId
      })
    });

    this.saveState(state);
    return newSession;
  }

  public expireAttendanceSession(sessionId: string, actorUserId = 'system', actorRole = 'CLINIC_RESPONSIBLE'): void {
    const state = this.getState();
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    if (session && session.status === 'ACTIVE') {
      session.status = 'EXPIRED';
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'attendanceSessionExpired',
        entity: 'attendanceSessions',
        entityId: sessionId,
        metadata: JSON.stringify({ token: session.token })
      });
      this.saveState(state);
    }
  }

  public cancelAttendanceSession(sessionId: string, actorUserId = 'system', actorRole = 'CLINIC_RESPONSIBLE'): void {
    const state = this.getState();
    const session = state.attendanceSessions.find(s => s.id === sessionId);
    if (session && session.status === 'ACTIVE') {
      session.status = 'CANCELLED';
      this.saveState(state);
    }
  }

  // --- HA日內 Distance calculation ---
  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Section 4, 5, 6, 7, 10, 21, 23: Complete Validation & QR Attendance Recording
   */
  public validateAndRecordQRAttendance(params: {
    studentId: string;
    qrPayload: string;
    latitude?: number;
    longitude?: number;
    deviceInfo?: string;
    overrideDate?: string;
    overrideTime?: string;
  }): {
    success: boolean;
    error?: string;
    message?: string;
    attendance?: Attendance;
    alreadyRecorded?: boolean;
    details?: Record<string, unknown>;
  } {
    const state = this.getState();
    const now = new Date();
    const todayStr = params.overrideDate || now.toISOString().split('T')[0];
    const nowHHMM = params.overrideTime || now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    // 1. Extract Token from qrPayload (JSON, URL, or raw token)
    let token = params.qrPayload.trim();
    try {
      if (token.startsWith('{') && token.endsWith('}')) {
        const parsed = JSON.parse(token);
        if (parsed.token) token = parsed.token;
      } else if (token.includes('token=')) {
        const url = new URL(token, 'http://localhost');
        const qToken = url.searchParams.get('token');
        if (qToken) token = qToken;
      }
    } catch {
      // use raw token
    }

    // 2. Find Attendance Session
    const session = state.attendanceSessions.find(s => s.token === token || s.id === token);
    if (!session) {
      return { success: false, error: 'QR kod yaroqsiz.' };
    }

    // 3. Check Session Status & Expiration
    if (session.status !== 'ACTIVE' || new Date(session.expiresAt) < now) {
      if (session.status === 'ACTIVE') {
        session.status = 'EXPIRED';
        this.saveState(state);
      }
      return { success: false, error: 'QR kodi muddati tugagan.' };
    }

    // 4. Check Practice Exists and Status
    const practice = state.practices.find(p => p.id === session.practiceId);
    if (!practice) {
      return { success: false, error: 'Amaliyot topilmadi.' };
    }
    const practiceStatus = (practice.status || '').toLowerCase();
    if (practiceStatus === 'completed' || practiceStatus === 'archived') {
      return { success: false, error: 'Ushbu amaliyot yakunlangan.' };
    }

    // 5. Check Student Assignment (Talaba faqat o'z amaliyotida va o'z amaliyot joyida davomat qilsin)
    const assignment = state.practiceAssignments.find(
      a => a.studentId === params.studentId &&
           a.practiceId === session.practiceId &&
           a.practicePlaceId === session.practicePlaceId
    );

    if (!assignment) {
      return { success: false, error: 'Siz ushbu amaliyot joyiga biriktirilmagansiz.' };
    }

    // 6. Check Duplicate Check-in Today
    const existing = state.attendance.find(
      a => a.studentId === params.studentId &&
           a.practiceId === session.practiceId &&
           a.date === todayStr
    );

    if (existing && existing.checkInTime) {
      return {
        success: false,
        error: 'Bugungi davomat allaqachon qayd etilgan.',
        alreadyRecorded: true,
        attendance: existing
      };
    }

    // 7. Check Geolocation if available
    let locationVerified = false;
    const place = state.practicePlaces.find(p => p.id === session.practicePlaceId);
    const targetLat = session.latitude ?? place?.latitude;
    const targetLng = session.longitude ?? place?.longitude;
    const allowedRadius = session.allowedRadius ?? place?.allowedRadius ?? 200;

    if (params.latitude !== undefined && params.longitude !== undefined && targetLat !== undefined && targetLng !== undefined) {
      const distance = this.calculateDistanceMeters(params.latitude, params.longitude, targetLat, targetLng);
      if (distance > allowedRadius) {
        return {
          success: false,
          error: 'Siz belgilangan amaliyot hududidan tashqaridasiz.',
          details: { distanceMeters: Math.round(distance), allowedRadius }
        };
      }
      locationVerified = true;
    }

    // 8. Determine Status: PRESENT vs LATE based on practiceStartTime and lateThreshold
    // Default: 08:00 + 15 min = 08:15 cutoff
    const startParts = (session.practiceStartTime || '08:00').split(':').map(Number);
    const lateThresholdMin = session.lateThresholdMinutes || 15;
    const cutoffMinutes = (startParts[0] || 8) * 60 + (startParts[1] || 0) + lateThresholdMin;

    const [currentHour, currentMin] = nowHHMM.split(':').map(Number);
    const currentTotalMin = (currentHour || 0) * 60 + (currentMin || 0);

    const calculatedStatus: AttendanceStatus = currentTotalMin > cutoffMinutes ? 'LATE' : 'PRESENT';

    // 9. Create Attendance Record
    const newRecord: Attendance = {
      id: existing?.id || `att-${Date.now()}-${params.studentId}`,
      practiceId: session.practiceId,
      studentId: params.studentId,
      assignmentId: assignment.id,
      practicePlaceId: session.practicePlaceId,
      departmentId: assignment.departmentId || session.departmentId || '',
      supervisorId: assignment.supervisorId,
      date: todayStr,
      checkInTime: nowHHMM,
      checkOutTime: undefined,
      status: calculatedStatus,
      qrSessionId: session.id,
      qrTokenHash: `tok_hash_${session.token.substring(0, 10)}`,
      latitude: params.latitude,
      longitude: params.longitude,
      locationVerified,
      deviceInfo: params.deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile App Web'),
      note: calculatedStatus === 'LATE' ? 'Kechikib keldi (QR Davomat)' : 'QR orqali tasdiqlangan',
      verifiedBy: session.creatorName || 'QR Davomat tizimi',
      verifiedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    if (existing) {
      const idx = state.attendance.findIndex(a => a.id === existing.id);
      if (idx >= 0) state.attendance[idx] = newRecord;
    } else {
      state.attendance.unshift(newRecord);
    }

    // 10. Audit Log: attendanceCheckIn
    this.recordAuditLog({
      userId: params.studentId,
      userRole: 'STUDENT',
      action: 'attendanceCheckIn',
      entity: 'attendance',
      entityId: newRecord.id,
      metadata: JSON.stringify({
        date: todayStr,
        checkInTime: nowHHMM,
        status: calculatedStatus,
        locationVerified,
        practicePlaceId: session.practicePlaceId
      })
    });

    this.saveState(state);

    return {
      success: true,
      message: 'BUGUNGI DAVOMATINGIZ MUVAFFAQIYATLI QAYD ETILDI',
      attendance: newRecord
    };
  }

  /**
   * Check-Out recording
   */
  public recordCheckOut(attendanceId: string, actorUserId: string, actorRole = 'STUDENT'): { success: boolean; attendance?: Attendance; error?: string } {
    const state = this.getState();
    const record = state.attendance.find(a => a.id === attendanceId);
    if (!record) {
      return { success: false, error: 'Davomat yozuvi topilmadi.' };
    }

    const now = new Date();
    const nowHHMM = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    record.checkOutTime = nowHHMM;
    record.updatedAt = now.toISOString();

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'attendanceCheckOut',
      entity: 'attendance',
      entityId: attendanceId,
      metadata: JSON.stringify({ checkOutTime: nowHHMM, date: record.date })
    });

    this.saveState(state);
    return { success: true, attendance: record };
  }

  /**
   * Manual Attendance creation/edit with audit logging (Section 11)
   */
  public manualUpdateAttendance(params: {
    attendanceId?: string;
    studentId: string;
    practiceId: string;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    note?: string;
    reason: string;
    actorUserId: string;
    actorRole: string;
    actorName: string;
  }): Attendance {
    const state = this.getState();
    const existing = params.attendanceId 
      ? state.attendance.find(a => a.id === params.attendanceId)
      : state.attendance.find(a => a.studentId === params.studentId && a.practiceId === params.practiceId && a.date === params.date);

    const isNew = !existing;
    const oldStatus = existing?.status || 'NONE';

    // Find assignment to link
    const assignment = state.practiceAssignments.find(
      a => a.studentId === params.studentId && a.practiceId === params.practiceId
    );

    const now = new Date().toISOString();

    const record: Attendance = {
      id: existing?.id || `att-man-${Date.now()}-${params.studentId}`,
      practiceId: params.practiceId,
      studentId: params.studentId,
      assignmentId: assignment?.id,
      practicePlaceId: assignment?.practicePlaceId,
      departmentId: assignment?.departmentId,
      supervisorId: assignment?.supervisorId,
      date: params.date,
      status: params.status,
      checkInTime: params.checkInTime || (params.status === 'PRESENT' || params.status === 'present' ? '08:30' : params.status === 'LATE' || params.status === 'late' ? '09:15' : undefined),
      checkOutTime: params.checkOutTime || (params.status === 'PRESENT' || params.status === 'present' ? '14:30' : undefined),
      note: params.note || (params.status === 'EXCUSED' || params.status === 'excused' ? `Uzrli: ${params.reason}` : params.reason),
      notes: params.note || params.reason,
      verifiedBy: params.actorName,
      verifiedAt: now,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    if (existing) {
      const idx = state.attendance.findIndex(a => a.id === existing.id);
      if (idx >= 0) state.attendance[idx] = record;
    } else {
      state.attendance.unshift(record);
    }

    const actionType: AuditAction = isNew 
      ? 'attendanceManualCreated' 
      : (params.status.toUpperCase() === 'EXCUSED' ? 'attendanceExcused' : 'attendanceManualUpdated');

    this.recordAuditLog({
      userId: params.actorUserId,
      userRole: params.actorRole,
      action: actionType,
      entity: 'attendance',
      entityId: record.id,
      metadata: JSON.stringify({
        oldStatus,
        newStatus: params.status,
        reason: params.reason,
        changedBy: params.actorName,
        studentId: params.studentId,
        date: params.date
      })
    });

    this.saveState(state);
    return record;
  }

  public deleteAttendance(id: string, reason: string, actorUserId: string, actorRole = 'PRACTICE_HEAD'): void {
    const state = this.getState();
    const record = state.attendance.find(a => a.id === id);
    if (record) {
      state.attendance = state.attendance.filter(a => a.id !== id);
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'attendanceDeleted',
        entity: 'attendance',
        entityId: id,
        metadata: JSON.stringify({ reason, studentId: record.studentId, date: record.date })
      });
      this.saveState(state);
    }
  }

  public recordAttendance(attendance: Attendance, actorUserId = 'system', actorRole = 'CLINIC_RESPONSIBLE'): void {
    const state = this.getState();
    const existingIdx = state.attendance.findIndex(
      a => a.practiceId === attendance.practiceId &&
           a.studentId === attendance.studentId &&
           a.date === attendance.date
    );

    const isNew = existingIdx < 0;
    attendance.createdAt = attendance.createdAt || new Date().toISOString();
    attendance.updatedAt = new Date().toISOString();

    if (!isNew) {
      state.attendance[existingIdx] = attendance;
    } else {
      state.attendance.unshift(attendance);
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: isNew ? 'attendanceCreated' : 'attendanceUpdated',
      entity: 'attendance',
      entityId: attendance.id,
      metadata: JSON.stringify({ studentId: attendance.studentId, date: attendance.date, status: attendance.status })
    });

    this.saveState(state);
  }

  // --- DAILY JOURNALS ---
  public getDailyJournals(): DailyJournal[] {
    return this.getState().dailyJournals;
  }

  public getDailyJournalById(id: string): DailyJournal | undefined {
    return this.getState().dailyJournals.find(j => j.id === id);
  }

  public getStudentDailyJournals(studentId: string): DailyJournal[] {
    return this.getState().dailyJournals.filter(j => j.studentId === studentId);
  }

  /**
   * Section 3 & 4: Check if student is eligible to create/fill a journal for a specific date
   */
  public validateJournalEligibility(
    studentId: string,
    practiceId: string,
    date: string,
    excludeJournalId?: string
  ): {
    eligible: boolean;
    reason?: string;
    attendance?: Attendance;
    assignment?: PracticeAssignment;
    existingJournal?: DailyJournal;
  } {
    const state = this.getState();

    // 1. Check for future date
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return {
        eligible: false,
        reason: 'Kelajakdagi sana uchun kundalik yaratishga yo\'l qo\'yilmaydi.'
      };
    }

    // 2. Check assignment
    const assignment = state.practiceAssignments.find(
      a => a.studentId === studentId && a.practiceId === practiceId
    );
    if (!assignment) {
      return {
        eligible: false,
        reason: 'Siz ushbu amaliyotga biriktirilmagansiz.'
      };
    }

    // 3. Check attendance record for the date
    const attendance = state.attendance.find(
      a => a.studentId === studentId && a.practiceId === practiceId && a.date === date
    );

    if (!attendance) {
      return {
        eligible: false,
        reason: 'Ushbu kun uchun davomat mavjud emas. Kundalik to\'ldirish uchun avval QR davomatdan o\'tishingiz lozim.',
        assignment
      };
    }

    const statusUpper = attendance.status.toUpperCase();

    // Section 3 rule: ABSENT -> "Ushbu kun uchun davomat mavjud emas. Kundalik to'ldirish mumkin emas."
    if (statusUpper === 'ABSENT') {
      return {
        eligible: false,
        reason: 'Ushbu kun uchun davomat mavjud emas. Kundalik to\'ldirish mumkin emas.',
        attendance,
        assignment
      };
    }

    // Section 3 rule: EXCUSED -> "Ushbu kun uzrli sabab bilan yopilgan. Kundalik holati amaliyot bo'limi tomonidan belgilanadi."
    if (statusUpper === 'EXCUSED') {
      return {
        eligible: false,
        reason: 'Ushbu kun uzrli sabab bilan yopilgan. Kundalik holati amaliyot bo\'limi tomonidan belgilanadi.',
        attendance,
        assignment
      };
    }

    // Only PRESENT or LATE allowed
    if (statusUpper !== 'PRESENT' && statusUpper !== 'LATE') {
      return {
        eligible: false,
        reason: 'Kundalikni faqat amaliyotga kelgan (PRESENT) yoki kechikkan (LATE) kunlarda to\'ldirish mumkin.',
        attendance,
        assignment
      };
    }

    // 4. Check for existing journal on this date
    const existing = state.dailyJournals.find(
      j => j.studentId === studentId && j.practiceId === practiceId && j.date === date && j.id !== excludeJournalId
    );

    if (existing) {
      const isRevision = existing.status === 'REVISION' || existing.status === 'revision';
      if (!isRevision) {
        return {
          eligible: false,
          reason: 'Ushbu kun uchun kundalik allaqachon to\'ldirilgan va tizimga yuborilgan.',
          attendance,
          assignment,
          existingJournal: existing
        };
      }
    }

    return {
      eligible: true,
      attendance,
      assignment,
      existingJournal: existing
    };
  }

  /**
   * Save / Submit Daily Journal with complete linkages and validations
   */
  public submitDailyJournal(
    journalData: DailyJournal,
    actorUserId = 'system',
    actorRole = 'STUDENT'
  ): { success: boolean; journal?: DailyJournal; error?: string } {
    const state = this.getState();

    // Meaningful text validation (minimum 25-30 chars)
    const summary = (journalData.workSummary || '').trim();
    if (summary.length < 25) {
      return {
        success: false,
        error: 'Bugun bajargan ishlaringiz mazmuni kamida 25 ta belgidan iborat bo\'lishi kerak ("Amaliyot o\'tadim" kabi qisqa soxta yozuvlar qabul qilinmaydi).'
      };
    }

    // Check eligibility
    const check = this.validateJournalEligibility(
      journalData.studentId,
      journalData.practiceId,
      journalData.date,
      journalData.id
    );

    if (!check.eligible && !state.dailyJournals.some(j => j.id === journalData.id && (j.status === 'REVISION' || j.status === 'revision'))) {
      return {
        success: false,
        error: check.reason || 'Kundalik to\'ldirish talablariga mos kelmadi.'
      };
    }

    const attendance = check.attendance || state.attendance.find(a => a.id === journalData.attendanceId);
    const assignment = check.assignment || state.practiceAssignments.find(a => a.studentId === journalData.studentId && a.practiceId === journalData.practiceId);
    const practicePlace = state.practicePlaces.find(p => p.id === (assignment?.practicePlaceId || journalData.practicePlaceId));
    const supervisor = state.supervisors.find(s => s.id === (assignment?.supervisorId || journalData.supervisorId));
    const student = state.students.find(s => s.id === journalData.studentId);

    // Prepare robust linked journal object
    const existingIdx = state.dailyJournals.findIndex(j => j.id === journalData.id);
    const isNew = existingIdx < 0;
    const existing = existingIdx >= 0 ? state.dailyJournals[existingIdx] : null;
    const isResubmit = existing && (existing.status === 'REVISION' || existing.status === 'revision');

    const linkedJournal: DailyJournal = {
      ...journalData,
      id: journalData.id || `dj-${Date.now()}-${journalData.studentId}`,
      assignmentId: assignment?.id || journalData.assignmentId,
      practicePlaceId: practicePlace?.id || journalData.practicePlaceId,
      departmentId: assignment?.departmentId || journalData.departmentId,
      department: journalData.department || assignment?.department || 'Klinik bo\'lim',
      supervisorId: supervisor?.id || journalData.supervisorId,
      attendanceId: attendance?.id || journalData.attendanceId,
      date: journalData.date,
      attendanceSnapshot: {
        status: attendance?.status || 'PRESENT',
        checkInTime: attendance?.checkInTime || '08:15',
        checkOutTime: attendance?.checkOutTime || '14:30',
        verifiedBy: attendance?.verifiedBy || 'Dr. Karimov Rustam Baxtiyorovich',
        practicePlaceName: practicePlace?.name || 'Klinik baza',
        supervisorName: supervisor?.fullName || 'Amaliyot rahbari',
        departmentName: journalData.department || assignment?.department
      },
      workSummary: summary,
      patientsExaminedCount: Number(journalData.patientsExaminedCount) || 0,
      patientDiagnosesSummary: journalData.patientDiagnosesSummary || '',
      procedures: journalData.procedures || [],
      proceduresDone: (journalData.procedures && journalData.procedures.length > 0)
        ? journalData.procedures.map(p => `${p.name} (${p.count} ta, ${p.participationType})`)
        : journalData.proceduresDone || [],
      clinicalCases: journalData.clinicalCases || [],
      clinicalCasesSummary: journalData.clinicalCasesSummary || (journalData.clinicalCases && journalData.clinicalCases.length > 0 ? journalData.clinicalCases[0].caseTitle : ''),
      topicsLearned: journalData.topicsLearned || journalData.questionsLearned || '',
      questionsLearned: journalData.questionsLearned || journalData.topicsLearned || '',
      selfReflection: journalData.selfReflection || {
        whatLearned: '',
        skillsImproved: '',
        tomorrowFocus: ''
      },
      attachments: journalData.attachments || [],
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      version: (existing?.version || 0) + (isResubmit ? 1 : 1),
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      state.dailyJournals.unshift(linkedJournal);
    } else {
      state.dailyJournals[existingIdx] = linkedJournal;
    }

    // Add notification to supervisor / clinic responsible
    this.addNotification({
      recipientRoles: ['PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE', 'PRACTICE_HEAD'],
      title: isResubmit ? 'Kundalik qayta topshirildi' : 'Yangi amaliyot kundaligi topshirildi',
      message: `${student?.fullName || 'Talaba'} ${linkedJournal.date} kungi amaliyot kundaligini ${isResubmit ? 'tahrirlab qayta topshirdi' : 'tekshiruvga topshirdi'} (${linkedJournal.department}).`,
      type: 'info',
      linkModule: 'daily_journal'
    });

    // Record audit log
    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: isResubmit ? 'journalResubmitted' : (isNew ? 'journalSubmitted' : 'journalUpdated'),
      entity: 'dailyJournals',
      entityId: linkedJournal.id,
      metadata: JSON.stringify({
        studentId: linkedJournal.studentId,
        studentName: student?.fullName,
        date: linkedJournal.date,
        department: linkedJournal.department,
        version: linkedJournal.version
      })
    });

    this.saveState(state);

    return {
      success: true,
      journal: linkedJournal
    };
  }

  /**
   * Section 7: Supervisor Review & Grading
   */
  public reviewDailyJournal(params: {
    journalId: string;
    status: 'APPROVED' | 'REVISION' | 'REJECTED';
    rating?: number; // 1 to 5
    feedback: string;
    revisionReason?: string;
    reviewerName: string;
    reviewerId?: string;
    actorUserId: string;
    actorRole: string;
  }): { success: boolean; journal?: DailyJournal; error?: string } {
    const state = this.getState();
    const journal = state.dailyJournals.find(j => j.id === params.journalId);
    if (!journal) {
      return { success: false, error: 'Kundalik topilmadi.' };
    }

    const now = new Date().toISOString();
    journal.status = params.status;
    journal.supervisorRating = params.status === 'APPROVED' ? (params.rating || 5) : undefined;
    journal.supervisorFeedback = params.feedback;
    if (params.status === 'REVISION' || params.status === 'REJECTED') {
      journal.revisionReason = params.revisionReason || params.feedback;
    } else {
      journal.revisionReason = undefined;
    }
    journal.reviewedAt = now;
    journal.reviewedBy = params.reviewerName;
    journal.reviewerId = params.reviewerId || params.actorUserId;
    journal.updatedAt = now;

    // Send notification to the student
    const student = state.students.find(s => s.id === journal.studentId);
    if (params.status === 'APPROVED') {
      this.addNotification({
        recipientUserId: student?.userId,
        recipientRoles: ['STUDENT'],
        title: 'Kundaligingiz tasdiqlandi',
        message: `Sizning ${journal.date} kungi amaliyot kundaligingiz tasdiqlandi. Baho: ${params.rating || 5}/5. Taqriz: "${params.feedback || 'A\'lo darajada'}"`,
        type: 'success',
        linkModule: 'daily_journal'
      });

      // Stage 6 Integration: auto-credit procedures into student skills
      if (journal.procedures && journal.procedures.length > 0) {
        journal.procedures.forEach(proc => {
          const matchingSkill = state.skills.find(
            sk => (proc.skillId && sk.id === proc.skillId) || sk.name.toLowerCase().includes(proc.name.toLowerCase()) || proc.name.toLowerCase().includes(sk.name.toLowerCase())
          );
          if (matchingSkill) {
            // Synchronize with state.skillLogs
            if (!state.skillLogs) state.skillLogs = [];
            const existingLog = state.skillLogs.find(
              l => l.dailyJournalId === journal.id && l.skillId === matchingSkill.id
            );
            const partType = proc.participationType === 'Mustaqil'
              ? 'INDEPENDENT'
              : proc.participationType === 'Rahbar nazoratida'
              ? 'SUPERVISED'
              : 'OBSERVED';

            if (!existingLog) {
              state.skillLogs.unshift({
                id: `slog-j-${journal.id}-${matchingSkill.id}`,
                studentId: journal.studentId,
                practiceId: journal.practiceId,
                skillId: matchingSkill.id,
                date: journal.date,
                participationType: partType,
                count: proc.count,
                notes: `Kundalik orqali tasdiqlangan: ${proc.name}`,
                status: 'APPROVED',
                verifiedBy: params.reviewerName,
                verifiedAt: now,
                supervisorFeedback: params.feedback,
                supervisorRating: params.rating,
                dailyJournalId: journal.id,
                createdAt: now
              });
            }

            let ssk = state.studentSkills.find(
              s => s.studentId === journal.studentId && s.practiceId === journal.practiceId && s.skillId === matchingSkill.id
            );
            if (!ssk) {
              ssk = {
                id: `ssk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                studentId: journal.studentId,
                practiceId: journal.practiceId,
                skillId: matchingSkill.id,
                performedCount: 0,
                targetCount: matchingSkill.requiredCount,
                status: 'in_progress',
                verifiedBySupervisor: true,
                lastPerformedDate: journal.date
              };
              state.studentSkills.push(ssk);
            }
            ssk.performedCount = Math.min(ssk.targetCount, ssk.performedCount + proc.count);
            ssk.verifiedCount = (ssk.verifiedCount || 0) + proc.count;
            if (partType === 'INDEPENDENT') ssk.independentCount = (ssk.independentCount || 0) + proc.count;
            else if (partType === 'SUPERVISED') ssk.supervisedCount = (ssk.supervisedCount || 0) + proc.count;
            else ssk.observedCount = (ssk.observedCount || 0) + proc.count;
            ssk.lastPerformedDate = journal.date;
            ssk.verifiedBySupervisor = true;
            if (ssk.performedCount >= ssk.targetCount) {
              ssk.status = 'mastered';
            }
          }
        });
      }
    } else {
      this.addNotification({
        recipientUserId: student?.userId,
        recipientRoles: ['STUDENT'],
        title: 'Kundalik qayta ishlashga yuborildi',
        message: `Sizning ${journal.date} kungi kundaligingiz qayta ishlashga qaytarildi. Sabab: "${params.revisionReason || params.feedback}". Iltimos, kamchiliklarni to'g'rilab qayta topshiring.`,
        type: 'warning',
        linkModule: 'daily_journal'
      });
    }

    // Audit log
    this.recordAuditLog({
      userId: params.actorUserId,
      userRole: params.actorRole,
      action: params.status === 'APPROVED' ? 'journalReviewed' : 'journalRevisionRequested',
      entity: 'dailyJournals',
      entityId: journal.id,
      metadata: JSON.stringify({
        status: params.status,
        rating: params.rating,
        reviewerName: params.reviewerName,
        studentId: journal.studentId,
        date: journal.date
      })
    });

    this.saveState(state);
    return { success: true, journal };
  }

  public deleteDailyJournal(id: string, actorUserId: string, actorRole = 'PRACTICE_HEAD'): void {
    const state = this.getState();
    const journal = state.dailyJournals.find(j => j.id === id);
    if (journal) {
      state.dailyJournals = state.dailyJournals.filter(j => j.id !== id);
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'systemReset',
        entity: 'dailyJournals',
        entityId: id,
        metadata: JSON.stringify({ deletedStudentId: journal.studentId, date: journal.date })
      });
      this.saveState(state);
    }
  }

  // Backward compatibility alias
  public saveDailyJournal(journal: DailyJournal, actorUserId = 'system', actorRole = 'STUDENT'): void {
    this.submitDailyJournal(journal, actorUserId, actorRole);
  }

  // Backward compatibility alias
  public reviewJournal(
    id: string, 
    status: 'approved' | 'rejected', 
    rating: number, 
    feedback: string, 
    reviewerName: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): void {
    this.reviewDailyJournal({
      journalId: id,
      status: status === 'approved' ? 'APPROVED' : 'REVISION',
      rating,
      feedback,
      reviewerName,
      actorUserId,
      actorRole
    });
  }

  // --- SKILLS CATALOG & LOGBOOK (STAGE 6) ---
  public getSkills(): Skill[] {
    return this.getState().skills || [];
  }

  public getSkillById(id: string): Skill | undefined {
    return this.getState().skills.find(s => s.id === id);
  }

  public createSkill(skillData: Omit<Skill, 'id'>, actorUserId = 'system', actorRole = 'SUPER_ADMIN'): Skill {
    const state = this.getState();
    const newSkill: Skill = {
      ...skillData,
      id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isActive: skillData.isActive !== undefined ? skillData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!state.skills) state.skills = [];
    state.skills.push(newSkill);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'skillCreated',
      entity: 'skills',
      entityId: newSkill.id,
      metadata: JSON.stringify({ name: newSkill.name, category: newSkill.category, requiredCount: newSkill.requiredCount })
    });

    this.saveState(state);
    return newSkill;
  }

  public updateSkill(id: string, updates: Partial<Skill>, actorUserId = 'system', actorRole = 'SUPER_ADMIN'): Skill | undefined {
    const state = this.getState();
    const skill = state.skills.find(s => s.id === id);
    if (!skill) return undefined;

    Object.assign(skill, updates, { updatedAt: new Date().toISOString() });

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'skillUpdated',
      entity: 'skills',
      entityId: id,
      metadata: JSON.stringify({ name: skill.name, updates: Object.keys(updates) })
    });

    this.saveState(state);
    return skill;
  }

  public deleteSkill(id: string, actorUserId = 'system', actorRole = 'SUPER_ADMIN'): boolean {
    const state = this.getState();
    const initialLen = state.skills.length;
    const skill = state.skills.find(s => s.id === id);
    state.skills = state.skills.filter(s => s.id !== id);
    if (state.skills.length < initialLen) {
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'skillDeleted',
        entity: 'skills',
        entityId: id,
        metadata: JSON.stringify({ name: skill?.name })
      });
      this.saveState(state);
      return true;
    }
    return false;
  }

  public getSkillCategories(): string[] {
    const state = this.getState();
    const defaultCats = DEFAULT_SKILL_CATEGORIES_V2;
    const fromState = state.skillCategories || [];
    const merged = Array.from(new Set([...defaultCats, ...fromState]));
    return merged;
  }

  public addSkillCategory(category: string, actorUserId = 'system', actorRole = 'SUPER_ADMIN'): boolean {
    const trimmed = category.trim();
    if (!trimmed) return false;
    const state = this.getState();
    if (!state.skillCategories) state.skillCategories = [...DEFAULT_SKILL_CATEGORIES_V2];
    if (state.skillCategories.includes(trimmed)) return false;

    state.skillCategories.push(trimmed);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'skillCategoryCreated',
      entity: 'skillCategories',
      entityId: trimmed,
      metadata: JSON.stringify({ category: trimmed })
    });

    this.saveState(state);
    return true;
  }

  public getSkillLogs(filters?: {
    studentId?: string;
    practiceId?: string;
    status?: string;
    supervisorId?: string;
  }): SkillLogEntry[] {
    let logs = this.getState().skillLogs || [];
    if (!filters) return logs;

    if (filters.studentId) {
      logs = logs.filter(l => l.studentId === filters.studentId);
    }
    if (filters.practiceId) {
      logs = logs.filter(l => l.practiceId === filters.practiceId);
    }
    if (filters.status && filters.status !== 'all') {
      logs = logs.filter(l => l.status === filters.status);
    }
    if (filters.supervisorId) {
      logs = logs.filter(l => l.supervisorId === filters.supervisorId);
    }
    return logs;
  }

  public getSkillLogById(id: string): SkillLogEntry | undefined {
    return (this.getState().skillLogs || []).find(l => l.id === id);
  }

  public submitSkillLog(
    logData: Omit<SkillLogEntry, 'id' | 'createdAt' | 'status'>,
    actorUserId = 'system',
    actorRole = 'STUDENT'
  ): { success: boolean; log?: SkillLogEntry; error?: string } {
    const state = this.getState();

    // 1. Validation: student assigned to practice
    const assignment = state.practiceAssignments.find(
      a => a.studentId === logData.studentId && a.practiceId === logData.practiceId
    );
    if (!assignment) {
      return {
        success: false,
        error: 'Siz ushbu amaliyotga biriktirilmagansiz. Ko\'nikma qayd etish faqat rasmiy amaliyot doirasida mumkin.'
      };
    }

    // 2. Validation: valid skill
    const skill = state.skills.find(s => s.id === logData.skillId);
    if (!skill) {
      return {
        success: false,
        error: 'Tanlangan tibbiy ko\'nikma tizimda topilmadi.'
      };
    }

    // 3. Validation: count must be > 0
    const count = Number(logData.count);
    if (!count || count <= 0) {
      return {
        success: false,
        error: 'Ko\'nikma bajarilish soni kamida 1 bo\'lishi shart.'
      };
    }

    // 4. Validation: date check (not future)
    const today = new Date().toISOString().split('T')[0];
    if (logData.date > today) {
      return {
        success: false,
        error: 'Kelajakdagi sana uchun ko\'nikma bajarilishini kiritish mumkin emas.'
      };
    }

    const student = state.students.find(s => s.id === logData.studentId);
    const supervisor = state.supervisors.find(s => s.id === (logData.supervisorId || assignment.supervisorId));

    const newLog: SkillLogEntry = {
      ...logData,
      id: `slog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      count,
      status: 'PENDING',
      supervisorId: supervisor?.id || assignment.supervisorId,
      supervisorName: supervisor?.fullName || 'Mas\'ul rahbar',
      createdAt: new Date().toISOString()
    };

    if (!state.skillLogs) state.skillLogs = [];
    state.skillLogs.unshift(newLog);

    // Send notification to supervisor
    if (supervisor) {
      this.addNotification({
        recipientUserId: supervisor.userId,
        recipientRoles: ['PRACTICE_SUPERVISOR', 'CLINIC_RESPONSIBLE'],
        title: 'Yangi ko\'nikma tekshiruvga topshirildi',
        message: `${student?.fullName || 'Talaba'} "${skill.name}" ko'nikmasini bajarganini qayd etdi (${newLog.count} marta, ${newLog.participationType}). Tasdiqlashingiz kutilmoqda.`,
        type: 'info',
        linkModule: 'skills'
      });
    }

    // Audit log
    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'skillLogSubmitted',
      entity: 'skillLogs',
      entityId: newLog.id,
      metadata: JSON.stringify({
        studentId: newLog.studentId,
        skillId: newLog.skillId,
        skillName: skill.name,
        count: newLog.count,
        participationType: newLog.participationType,
        date: newLog.date
      })
    });

    this.saveState(state);
    return { success: true, log: newLog };
  }

  public reviewSkillLog(params: {
    logId: string;
    status: 'APPROVED' | 'REJECTED';
    feedback?: string;
    rating?: number;
    reviewerName: string;
    reviewerId?: string;
    actorUserId?: string;
    actorRole?: string;
  }): { success: boolean; log?: SkillLogEntry; error?: string } {
    const state = this.getState();
    const log = (state.skillLogs || []).find(l => l.id === params.logId);
    if (!log) {
      return { success: false, error: 'Ko\'nikma yozuvi topilmadi.' };
    }

    const now = new Date().toISOString();
    log.status = params.status;
    log.verifiedBy = params.reviewerName;
    log.verifiedAt = now;
    log.supervisorFeedback = params.feedback;
    log.supervisorRating = params.status === 'APPROVED' ? (params.rating || 5) : undefined;

    const student = state.students.find(s => s.id === log.studentId);
    const skill = state.skills.find(s => s.id === log.skillId);

    // If APPROVED, update studentSkills record
    if (params.status === 'APPROVED') {
      let ssk = state.studentSkills.find(
        s => s.studentId === log.studentId && s.practiceId === log.practiceId && s.skillId === log.skillId
      );

      const targetCount = skill ? skill.requiredCount : 10;
      if (!ssk) {
        ssk = {
          id: `ssk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: log.studentId,
          practiceId: log.practiceId,
          skillId: log.skillId,
          performedCount: 0,
          independentCount: 0,
          supervisedCount: 0,
          observedCount: 0,
          verifiedCount: 0,
          targetCount,
          status: 'in_progress',
          verifiedBySupervisor: true,
          lastPerformedDate: log.date
        };
        state.studentSkills.push(ssk);
      }

      // Recalculate counts based on all approved logs for this skill
      const approvedLogs = state.skillLogs.filter(
        l => l.studentId === log.studentId && l.practiceId === log.practiceId && l.skillId === log.skillId && l.status === 'APPROVED'
      );

      let totalCount = 0;
      let indep = 0;
      let superv = 0;
      let observ = 0;

      approvedLogs.forEach(l => {
        totalCount += l.count;
        if (l.participationType === 'INDEPENDENT' || l.participationType === 'Mustaqil') {
          indep += l.count;
        } else if (l.participationType === 'SUPERVISED' || l.participationType === 'Rahbar nazoratida') {
          superv += l.count;
        } else {
          observ += l.count;
        }
      });

      ssk.performedCount = totalCount;
      ssk.verifiedCount = totalCount;
      ssk.independentCount = indep;
      ssk.supervisedCount = superv;
      ssk.observedCount = observ;
      ssk.lastPerformedDate = log.date;
      ssk.verifiedBySupervisor = true;
      ssk.status = totalCount >= ssk.targetCount ? 'mastered' : totalCount > 0 ? 'in_progress' : 'not_started';

      // Send positive notification to student
      this.addNotification({
        recipientUserId: student?.userId,
        recipientRoles: ['STUDENT'],
        title: 'Ko\'nikma tasdiqlandi',
        message: `Sizning "${skill?.name || 'Tibbiy ko\'nikma'}" bo'yicha kiritgan ${log.count} martalik bajarishingiz tasdiqlandi. Baho: ${params.rating || 5}/5.`,
        type: 'success',
        linkModule: 'skills'
      });
    } else {
      // Send rejection notification to student
      this.addNotification({
        recipientUserId: student?.userId,
        recipientRoles: ['STUDENT'],
        title: 'Ko\'nikma qaytarildi',
        message: `Sizning "${skill?.name || 'Tibbiy ko\'nikma'}" bo'yicha yozuvingiz tasdiqlanmadi. Izoh: "${params.feedback || 'Qayta bajarib topshiring'}".`,
        type: 'warning',
        linkModule: 'skills'
      });
    }

    // Audit log
    this.recordAuditLog({
      userId: params.actorUserId || 'system',
      userRole: params.actorRole || 'PRACTICE_SUPERVISOR',
      action: params.status === 'APPROVED' ? 'skillLogApproved' : 'skillLogRejected',
      entity: 'skillLogs',
      entityId: log.id,
      metadata: JSON.stringify({
        status: params.status,
        studentId: log.studentId,
        skillId: log.skillId,
        rating: params.rating,
        reviewerName: params.reviewerName
      })
    });

    this.saveState(state);
    return { success: true, log };
  }

  public batchReviewSkillLogs(params: {
    logIds: string[];
    status: 'APPROVED' | 'REJECTED';
    feedback?: string;
    rating?: number;
    reviewerName: string;
    reviewerId?: string;
    actorUserId?: string;
    actorRole?: string;
  }): { success: boolean; updatedCount: number } {
    let count = 0;
    for (const logId of params.logIds) {
      const res = this.reviewSkillLog({
        logId,
        status: params.status,
        feedback: params.feedback,
        rating: params.rating,
        reviewerName: params.reviewerName,
        reviewerId: params.reviewerId,
        actorUserId: params.actorUserId,
        actorRole: params.actorRole
      });
      if (res.success) count++;
    }

    if (count > 0 && params.actorUserId) {
      this.recordAuditLog({
        userId: params.actorUserId,
        userRole: params.actorRole || 'PRACTICE_SUPERVISOR',
        action: 'skillLogBatchApproved',
        entity: 'skillLogs',
        entityId: 'batch',
        metadata: JSON.stringify({ count, status: params.status, logIds: params.logIds })
      });
    }

    return { success: true, updatedCount: count };
  }

  public getStudentPassportSummary(studentId: string, practiceId?: string) {
    const state = this.getState();
    const student = state.students.find(s => s.id === studentId);
    const assignment = state.practiceAssignments.find(
      a => a.studentId === studentId && (!practiceId || a.practiceId === practiceId)
    );
    const activePracticeId = practiceId || assignment?.practiceId || 'prac-1';
    const practice = state.practices.find(p => p.id === activePracticeId);
    const practicePlace = state.practicePlaces.find(p => p.id === assignment?.practicePlaceId);
    const supervisor = state.supervisors.find(s => s.id === assignment?.supervisorId);

    const allSkills = state.skills.filter(s => s.isActive);
    const studentLogs = (state.skillLogs || []).filter(
      l => l.studentId === studentId && l.practiceId === activePracticeId
    );
    const studentSkillRecords = (state.studentSkills || []).filter(
      s => s.studentId === studentId && s.practiceId === activePracticeId
    );

    const detailedSkills = allSkills.map((sk, index) => {
      const existingRecord = studentSkillRecords.find(r => r.skillId === sk.id);
      const logsForSkill = studentLogs.filter(l => l.skillId === sk.id);
      const approvedLogs = logsForSkill.filter(l => l.status === 'APPROVED');

      let independent = 0;
      let supervised = 0;
      let observed = 0;
      let approvedCount = 0;
      let performedCount = existingRecord?.performedCount || 0;

      if (approvedLogs.length > 0) {
        approvedLogs.forEach(l => {
          approvedCount += l.count;
          if (l.participationType === 'INDEPENDENT' || l.participationType === 'Mustaqil') {
            independent += l.count;
          } else if (l.participationType === 'SUPERVISED' || l.participationType === 'Rahbar nazoratida') {
            supervised += l.count;
          } else {
            observed += l.count;
          }
        });
        if (approvedCount > performedCount) {
          performedCount = approvedCount;
        }
      } else if (existingRecord) {
        independent = existingRecord.independentCount || Math.round(existingRecord.performedCount * 0.6);
        supervised = existingRecord.supervisedCount || Math.round(existingRecord.performedCount * 0.3);
        observed = existingRecord.observedCount || Math.max(0, existingRecord.performedCount - independent - supervised);
        approvedCount = existingRecord.verifiedCount || existingRecord.performedCount;
      }

      const required = sk.requiredCount || 10;
      const progressPct = Math.min(100, Math.round((performedCount / required) * 100));
      const isMastered = performedCount >= required;

      return {
        number: index + 1,
        skill: sk,
        requiredCount: required,
        recommendedCount: sk.recommendedCount,
        performedCount,
        independentCount: independent,
        supervisedCount: supervised,
        observedCount: observed,
        approvedCount,
        progressPct,
        status: isMastered ? 'BAJARILDI' : performedCount > 0 ? 'JARAYONDA' : 'BAJARILMAGAN',
        isMastered,
        hasPendingLogs: logsForSkill.some(l => l.status === 'PENDING'),
        pendingLogsCount: logsForSkill.filter(l => l.status === 'PENDING').reduce((acc, c) => acc + c.count, 0)
      };
    });

    const totalSkills = detailedSkills.length;
    const completedSkills = detailedSkills.filter(d => d.isMastered).length;
    const inProgressSkills = detailedSkills.filter(d => d.performedCount > 0 && !d.isMastered).length;
    const notStartedSkills = detailedSkills.filter(d => d.performedCount === 0).length;

    const totalRequiredCount = detailedSkills.reduce((sum, d) => sum + d.requiredCount, 0);
    const totalPerformedCount = detailedSkills.reduce((sum, d) => sum + d.performedCount, 0);
    const totalApprovedCount = detailedSkills.reduce((sum, d) => sum + d.approvedCount, 0);
    const totalIndependentCount = detailedSkills.reduce((sum, d) => sum + d.independentCount, 0);
    const totalSupervisedCount = detailedSkills.reduce((sum, d) => sum + d.supervisedCount, 0);
    const totalObservedCount = detailedSkills.reduce((sum, d) => sum + d.observedCount, 0);

    const overallProgressPct = totalRequiredCount > 0 
      ? Math.min(100, Math.round((totalPerformedCount / totalRequiredCount) * 100))
      : 0;

    const minimalQuotaMetPct = totalSkills > 0
      ? Math.round((completedSkills / totalSkills) * 100)
      : 0;

    return {
      student,
      assignment,
      practice,
      practicePlace,
      supervisor,
      totalSkills,
      completedSkills,
      inProgressSkills,
      notStartedSkills,
      totalRequiredCount,
      totalPerformedCount,
      totalApprovedCount,
      totalIndependentCount,
      totalSupervisedCount,
      totalObservedCount,
      overallProgressPct,
      minimalQuotaMetPct,
      detailedSkills,
      recentLogs: studentLogs.slice(0, 10)
    };
  }

  public getStudentSkills(): StudentSkill[] {
    return this.getState().studentSkills || [];
  }

  public recordSkill(studentSkill: StudentSkill): void {
    const state = this.getState();
    const idx = state.studentSkills.findIndex(
      s => s.studentId === studentSkill.studentId &&
           s.practiceId === studentSkill.practiceId &&
           s.skillId === studentSkill.skillId
    );

    if (idx >= 0) {
      state.studentSkills[idx] = studentSkill;
    } else {
      state.studentSkills.push(studentSkill);
    }
    this.saveState(state);
  }

  // --- ASSESSMENTS ---
  public getAssessments(): Assessment[] {
    return this.getState().assessments;
  }

  public saveAssessment(assessment: Assessment, actorUserId = 'system', actorRole = 'PRACTICE_SUPERVISOR'): void {
    const state = this.getState();
    const idx = state.assessments.findIndex(
      a => a.studentId === assessment.studentId && a.practiceId === assessment.practiceId
    );
    if (idx >= 0) {
      state.assessments[idx] = assessment;
    } else {
      state.assessments.unshift(assessment);
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'gradeUpdated',
      entity: 'assessments',
      entityId: assessment.id,
      metadata: JSON.stringify({ studentId: assessment.studentId, totalScore: assessment.totalScore, grade: assessment.grade })
    });

    this.saveState(state);
  }

  // --- DOCUMENTS ---
  public getDocuments(): DocumentRecord[] {
    return this.getState().documents;
  }

  public saveDocument(doc: DocumentRecord, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): void {
    const state = this.getState();
    state.documents.unshift(doc);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'documentCreated',
      entity: 'documents',
      entityId: doc.id,
      metadata: JSON.stringify({ title: doc.title, docNumber: doc.docNumber })
    });

    this.saveState(state);
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): AppNotification[] {
    return this.getState().notifications;
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): AppNotification {
    const state = this.getState();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notif
    };
    if (!state.notifications) state.notifications = [];
    state.notifications.unshift(newNotif);
    this.saveState(state);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const state = this.getState();
    const notif = state.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveState(state);
    }
  }

  public markAllNotificationsAsRead(): void {
    const state = this.getState();
    state.notifications.forEach(n => { n.isRead = true; });
    this.saveState(state);
  }
}

export const storageService = new StorageServiceV2();
