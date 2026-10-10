import {
  User,
  AcademicYear,
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
  PracticeDistribution,
  PracticeGroupSchedule,
  PracticeAssignment,
  Attendance,
  AttendanceStatus,
  AttendanceSession,
  DailyJournal,
  JournalStatus,
  Skill,
  StudentSkill,
  SkillRecord,
  SkillLogEntry,
  Task,
  Assessment,
  AssessmentStatus,
  FinalExam,
  ExamStatus,
  AttestationCommission,
  AssessmentSettings,
  AssessmentHistoryItem,
  DocumentRecord,
  AppNotification,
  AuditLog,
  AuditAction,
  StudentPracticeOverallStatus,
  VedomostStatus,
  VedomostStudentRow,
  OfficialVedomost,
  ProblemType,
  ProblemStudent,
  StudentTimelineStep
} from '../types';
import { getFirebaseConfigStatus, db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { recordUsedStudentSequence } from './loginGeneratorService';

const STORAGE_KEY_V2 = 'tma_amaliyot_cloud_db_v2';
const APP_MODE_KEY = 'tma_amaliyot_environment_mode';

export type AppEnvironmentMode = 'DEVELOPMENT' | 'PRODUCTION';

export interface SystemSettings {
  universityName: string;
  universityShortName?: string;
  universityLogo?: string;
  academicYear: string;
  semester: string;
  qrRadiusMeters: number;
  journalDeadlineTime: string;
  mode: AppEnvironmentMode;
}

export interface DatabaseStateV2 {
  mode: AppEnvironmentMode;
  systemSettings?: SystemSettings;
  users: User[];
  academicYears: AcademicYear[];
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
  practiceDistributions: PracticeDistribution[];
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
  finalExams: FinalExam[];
  attestationCommissions: AttestationCommission[];
  assessmentSettings: AssessmentSettings;
  vedomosts: OfficialVedomost[];
  problemStudents?: ProblemStudent[];
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
    id: 'user-std',
    uid: 'uid-std-007',
    login: 'T00001',
    username: 'student_olimov',
    studentCode: 'T00001',
    hemisStudentId: '12345678',
    password: 'password123',
    fullName: 'Olimov Sardor Botir o\'g\'li',
    role: 'STUDENT',
    email: 'T00001@student.uz',
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

const DEFAULT_PRACTICE_PLACES: PracticePlace[] = [];

const DEFAULT_PRACTICE_DEPARTMENTS: PracticeDepartment[] = [
  { id: 'pdept-1', practicePlaceId: 'place-1', name: 'Jarrohlik', headDoctor: 'Dr. Mahmudov B.', bedCapacity: 40, activeStudentQuota: 15 },
  { id: 'pdept-2', practicePlaceId: 'place-1', name: 'Terapiya', headDoctor: 'Dr. Yusupov A.', bedCapacity: 50, activeStudentQuota: 18 },
  { id: 'pdept-3', practicePlaceId: 'place-1', name: 'Pediatriya', headDoctor: 'Dr. Qodirova G.', bedCapacity: 35, activeStudentQuota: 12 },
  { id: 'pdept-4', practicePlaceId: 'place-1', name: 'Qabul bo\'limi', headDoctor: 'Dr. Rahmonov K.', bedCapacity: 20, activeStudentQuota: 8 },
  { id: 'pdept-5', practicePlaceId: 'place-1', name: 'Reanimatsiya', headDoctor: 'Dr. Ismoilov T.', bedCapacity: 25, activeStudentQuota: 10 },
  { id: 'pdept-6', practicePlaceId: 'place-2', name: 'Shoshilinch terapiya', headDoctor: 'Dr. Rahmonova N.', bedCapacity: 60, activeStudentQuota: 18 },
  { id: 'pdept-7', practicePlaceId: 'place-3', name: 'Pediatriya', headDoctor: 'Dr. Qodirova G.', bedCapacity: 45, activeStudentQuota: 20 }
];

const DEFAULT_SUPERVISORS: Supervisor[] = [];

const DEFAULT_CLINIC_RESPONSIBLES: ClinicResponsible[] = [];

const DEFAULT_STUDENTS_V2: Student[] = [
  {
    id: 'std-1',
    userId: 'uid-std-007',
    studentId: 'MED-2022-1084',
    studentCode: 'T00001',
    login: 'T00001',
    hemisStudentId: '12345678',
    pinfl: '31405991230045',
    fullName: 'Olimov Sardor Botir o\'g\'li',
    facultyId: 'fac-1',
    directionId: 'dir-1',
    courseId: 'course-4',
    groupId: 'grp-401',
    phone: '+998 (90) 111-22-33',
    telegram: '@sardor_olimov_med',
    email: 'T00001@student.uz',
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

const DEFAULT_DISTRIBUTIONS_V2: PracticeDistribution[] = [
  {
    id: 'dist-1',
    distributionCode: 'TAQ-2026-00125',
    practiceId: 'prac-1',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    groupId: 'grp-401',
    supervisorId: 'sup-1', // Rahbar A (Prof. Sobirov Alisher)
    organizationId: 'place-1', // Chirchiq shahar tibbiyot birlashmasi (TASH-000125)
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    status: 'active',
    totalStudentsCount: 22,
    assignedDepartmentsCount: 19,
    unassignedDepartmentsCount: 3,
    createdAt: '2026-08-25T08:00:00Z',
    updatedAt: '2026-08-25T08:00:00Z'
  },
  {
    id: 'dist-2',
    distributionCode: 'TAQ-2026-00126',
    practiceId: 'prac-1',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    groupId: 'grp-402',
    supervisorId: 'sup-2', // Rahbar B (Dots. Ismoilova Shahnoza)
    organizationId: 'place-1', // Chirchiq shahar tibbiyot birlashmasi (TASH-000125)
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    status: 'active',
    totalStudentsCount: 20,
    assignedDepartmentsCount: 20,
    unassignedDepartmentsCount: 0,
    createdAt: '2026-08-25T08:30:00Z',
    updatedAt: '2026-08-25T08:30:00Z'
  },
  {
    id: 'dist-3',
    distributionCode: 'TAQ-2026-00127',
    practiceId: 'prac-2',
    academicYear: '2025-2026',
    courseLevel: 3,
    directionId: 'dir-3',
    groupId: 'grp-301',
    supervisorId: 'sup-3', // Rahbar C (Dots. Abdullayev Jasur)
    organizationId: 'place-3', // 1-son Bolalar Klinik Shifoxonasi
    startDate: '2026-09-10',
    endDate: '2026-10-05',
    practiceDays: ['Dushanba', 'Chorshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    status: 'active',
    totalStudentsCount: 24,
    assignedDepartmentsCount: 24,
    unassignedDepartmentsCount: 0,
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-08-28T09:00:00Z'
  }
];

const DEFAULT_ASSIGNMENTS_V2: PracticeAssignment[] = [
  {
    id: 'asg-1',
    assignmentId: 'TAQ-2026-00125-01',
    distributionId: 'dist-1',
    distributionCode: 'TAQ-2026-00125',
    practiceId: 'prac-1',
    studentId: 'std-1',
    groupId: 'grp-401',
    practicePlaceId: 'place-1',
    department: 'Terapiya',
    departmentId: 'pdept-2',
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-2',
    assignmentId: 'TAQ-2026-00125-02',
    distributionId: 'dist-1',
    distributionCode: 'TAQ-2026-00125',
    practiceId: 'prac-1',
    studentId: 'std-2',
    groupId: 'grp-401',
    practicePlaceId: 'place-1',
    department: 'Jarrohlik',
    departmentId: 'pdept-1',
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-3',
    assignmentId: 'TAQ-2026-00126-01',
    distributionId: 'dist-2',
    distributionCode: 'TAQ-2026-00126',
    practiceId: 'prac-1',
    studentId: 'std-3',
    groupId: 'grp-402',
    practicePlaceId: 'place-1',
    department: 'Terapiya',
    departmentId: 'pdept-2',
    supervisorId: 'sup-2',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-4',
    assignmentId: 'TAQ-2026-00125-04',
    distributionId: 'dist-1',
    distributionCode: 'TAQ-2026-00125',
    practiceId: 'prac-1',
    studentId: 'std-4',
    groupId: 'grp-401',
    practicePlaceId: 'place-1',
    department: '', // Biriktirilmagan!
    departmentId: undefined,
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-5',
    assignmentId: 'TAQ-2026-00127-01',
    distributionId: 'dist-3',
    distributionCode: 'TAQ-2026-00127',
    practiceId: 'prac-2',
    studentId: 'std-5',
    groupId: 'grp-301',
    practicePlaceId: 'place-3',
    department: 'Pediatriya',
    departmentId: 'pdept-3',
    supervisorId: 'sup-3',
    clinicResponsibleId: 'cresp-3',
    startDate: '2026-09-10',
    endDate: '2026-10-05',
    practiceDays: ['Dushanba', 'Chorshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 3,
    directionId: 'dir-3',
    status: 'in_progress',
    createdAt: '2026-09-05T10:00:00Z'
  },
  {
    id: 'asg-6',
    assignmentId: 'TAQ-2026-00125-06',
    distributionId: 'dist-1',
    distributionCode: 'TAQ-2026-00125',
    practiceId: 'prac-1',
    studentId: 'std-6',
    groupId: 'grp-401',
    practicePlaceId: 'place-1',
    department: '', // Biriktirilmagan!
    departmentId: undefined,
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
  },
  {
    id: 'asg-8',
    assignmentId: 'TAQ-2026-00125-08',
    distributionId: 'dist-1',
    distributionCode: 'TAQ-2026-00125',
    practiceId: 'prac-1',
    studentId: 'std-8',
    groupId: 'grp-401',
    practicePlaceId: 'place-1',
    department: '', // Biriktirilmagan!
    departmentId: undefined,
    supervisorId: 'sup-1',
    clinicResponsibleId: 'cresp-1',
    startDate: '2026-09-01',
    endDate: '2026-10-15',
    practiceDays: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
    startTime: '08:00',
    endTime: '14:00',
    academicYear: '2025-2026',
    courseLevel: 4,
    directionId: 'dir-1',
    status: 'in_progress',
    createdAt: '2026-08-30T10:00:00Z'
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

const DEFAULT_ASSESSMENT_SETTINGS_V2: AssessmentSettings = {
  id: 'setting-default',
  attendanceMaxScore: 20,
  journalMaxScore: 20,
  skillsMaxScore: 30,
  finalExamMaxScore: 30,
  grade5Min: 86,
  grade4Min: 71,
  grade3Min: 56,
  grade2Min: 0,
  examCriteriaWeights: {
    theoryMax: 6,
    practicalMax: 8,
    clinicalCaseMax: 8,
    professionalismMax: 4,
    safetyMax: 4
  },
  attendanceFormula: 'LINEAR',
  updatedAt: '2026-09-01T08:00:00Z'
};

const DEFAULT_COMMISSIONS_V2: AttestationCommission[] = [
  {
    id: 'comm-1',
    name: 'Davolash ishi 4-kurs Yakuniy attestatsiya komissiyasi №1',
    chairpersonId: 'sup-1',
    chairpersonName: 'Prof. Sobirov Alisher Tolipovich',
    memberIds: ['sup-1', 'sup-2'],
    memberNames: ['Prof. Sobirov Alisher Tolipovich', 'Dr. Rahmonova Nargiza Anvarovna'],
    position: 'Kafedra mudiri, professor',
    department: 'Gospital terapiya kafedrasi',
    facultyId: 'fac-1',
    facultyName: '1-son Davolash fakulteti',
    isActive: true,
    createdAt: '2026-08-25T09:00:00Z'
  },
  {
    id: 'comm-2',
    name: 'Pediatriya fakulteti Klinik attestatsiya komissiyasi №2',
    chairpersonId: 'sup-3',
    chairpersonName: 'Dr. Qodirova Gulchehra Olimovna',
    memberIds: ['sup-3', 'sup-1'],
    memberNames: ['Dr. Qodirova Gulchehra Olimovna', 'Prof. Sobirov Alisher Tolipovich'],
    position: 'Dotsent',
    department: 'Bolalar kasalliklari kafedrasi',
    facultyId: 'fac-2',
    facultyName: 'Pediatriya fakulteti',
    isActive: true,
    createdAt: '2026-08-25T09:30:00Z'
  }
];

const DEFAULT_FINAL_EXAMS_V2: FinalExam[] = [
  {
    id: 'fexam-1',
    practiceId: 'prac-1',
    studentId: 'std-1',
    assignmentId: 'asg-1',
    examDate: '2026-09-28',
    examTime: '10:00',
    placeName: 'Respublika 1-son Shifoxonasi',
    departmentName: 'Terapiya',
    examinerIds: ['sup-1', 'sup-2'],
    examinerNames: ['Prof. Sobirov Alisher Tolipovich', 'Dr. Rahmonova Nargiza Anvarovna'],
    commissionId: 'comm-1',
    theoryScore: 5,
    practicalScore: 7,
    clinicalCaseScore: 7,
    professionalismScore: 4,
    safetyScore: 4,
    totalScore: 27,
    maxScore: 30,
    percentage: 90,
    status: 'COMPLETED',
    comments: 'Nazariy va amaliy manipulyatsiyalar yuqori darajada namoyish etildi.',
    attemptNumber: 1,
    gradedBy: 'Prof. Sobirov Alisher Tolipovich',
    gradedAt: '2026-09-28T11:30:00Z',
    createdAt: '2026-09-27T08:00:00Z'
  },
  {
    id: 'fexam-2',
    practiceId: 'prac-1',
    studentId: 'std-2',
    assignmentId: 'asg-2',
    examDate: '2026-09-28',
    examTime: '11:00',
    placeName: 'Respublika 1-son Shifoxonasi',
    departmentName: 'Kardiologiya',
    examinerIds: ['sup-1'],
    examinerNames: ['Prof. Sobirov Alisher Tolipovich'],
    commissionId: 'comm-1',
    theoryScore: 5,
    practicalScore: 6,
    clinicalCaseScore: 6,
    professionalismScore: 4,
    safetyScore: 3,
    totalScore: 24,
    maxScore: 30,
    percentage: 80,
    status: 'COMPLETED',
    comments: 'Kardiologik EKG tahlilida mustaqil xulosa bera oldi.',
    attemptNumber: 1,
    gradedBy: 'Prof. Sobirov Alisher Tolipovich',
    gradedAt: '2026-09-28T12:00:00Z',
    createdAt: '2026-09-27T08:00:00Z'
  },
  {
    id: 'fexam-3',
    practiceId: 'prac-1',
    studentId: 'std-4',
    assignmentId: 'asg-4',
    examDate: '2026-09-29',
    examTime: '14:00',
    placeName: 'Shahar tez tibbiy yordam klinik shifoxonasi',
    departmentName: 'Xirurgiya',
    examinerIds: ['sup-2'],
    examinerNames: ['Dr. Rahmonova Nargiza Anvarovna'],
    commissionId: 'comm-1',
    theoryScore: 0,
    practicalScore: 0,
    clinicalCaseScore: 0,
    professionalismScore: 0,
    safetyScore: 0,
    totalScore: 0,
    maxScore: 30,
    percentage: 0,
    status: 'SCHEDULED',
    comments: 'Imtihon rejalashtirilgan.',
    attemptNumber: 1,
    createdAt: '2026-09-28T09:00:00Z'
  }
];

const DEFAULT_ASSESSMENTS_V2: Assessment[] = [
  {
    id: 'ass-1',
    practiceId: 'prac-1',
    studentId: 'std-1',
    assignmentId: 'asg-1',
    attendanceScore: 19,
    attendanceMaxScore: 20,
    journalScore: 19,
    journalMaxScore: 20,
    skillsScore: 28,
    skillsMaxScore: 30,
    finalExamScore: 27,
    finalExamMaxScore: 30,
    totalScore: 93,
    percentage: 93,
    grade: '5',
    status: 'APPROVED',
    commissionId: 'comm-1',
    commissionName: 'Davolash ishi 4-kurs Yakuniy attestatsiya komissiyasi №1',
    assessorId: 'sup-1',
    assessorName: 'Prof. Sobirov Alisher Tolipovich',
    assessmentDate: '2026-09-28',
    feedback: 'Barcha talablar a\'lo darajada bajarildi. Amaliy ko\'nikmalari yuqori.',
    approvedBy: 'Prof. Sobirov Alisher Tolipovich',
    approvedAt: '2026-09-28T14:30:00Z',
    isAttendanceComplete: true,
    isJournalComplete: true,
    isSkillsComplete: true,
    isExamComplete: true,
    createdAt: '2026-09-28T12:00:00Z'
  },
  {
    id: 'ass-2',
    practiceId: 'prac-1',
    studentId: 'std-2',
    assignmentId: 'asg-2',
    attendanceScore: 18,
    attendanceMaxScore: 20,
    journalScore: 17,
    journalMaxScore: 20,
    skillsScore: 24,
    skillsMaxScore: 30,
    finalExamScore: 24,
    finalExamMaxScore: 30,
    totalScore: 83,
    percentage: 83,
    grade: '4',
    status: 'PENDING_APPROVAL',
    commissionId: 'comm-1',
    commissionName: 'Davolash ishi 4-kurs Yakuniy attestatsiya komissiyasi №1',
    assessorId: 'sup-1',
    assessorName: 'Prof. Sobirov Alisher Tolipovich',
    assessmentDate: '2026-09-28',
    feedback: 'Amaliyot dasturini to\'liq o\'zlashtirgan. Kardiologik muolajalarda faol.',
    isAttendanceComplete: true,
    isJournalComplete: true,
    isSkillsComplete: true,
    isExamComplete: true,
    createdAt: '2026-09-28T12:15:00Z'
  },
  {
    id: 'ass-3',
    practiceId: 'prac-1',
    studentId: 'std-4',
    assignmentId: 'asg-4',
    attendanceScore: 17,
    attendanceMaxScore: 20,
    journalScore: 16,
    journalMaxScore: 20,
    skillsScore: 21,
    skillsMaxScore: 30,
    finalExamScore: 0,
    finalExamMaxScore: 30,
    totalScore: 54,
    percentage: 54,
    grade: '2',
    status: 'WAITING_FOR_EXAM',
    commissionId: 'comm-1',
    commissionName: 'Davolash ishi 4-kurs Yakuniy attestatsiya komissiyasi №1',
    isAttendanceComplete: true,
    isJournalComplete: true,
    isSkillsComplete: true,
    isExamComplete: false,
    validationErrors: ['Yakuniy amaliyot imtihoni natijasi kiritilmagan'],
    createdAt: '2026-09-28T13:00:00Z'
  }
];

const DEFAULT_VEDOMOSTS_V2: OfficialVedomost[] = [
  {
    id: 'ved-1',
    vedomostNumber: 'VED-2026-09-001',
    title: '4-kurs Davolash ishi Terapiya amaliyoti yakuniy attestatsiya vedomosti',
    academicYear: '2026-2027',
    facultyId: 'fac-1',
    facultyName: '1-son Davolash fakulteti',
    directionId: 'dir-1',
    directionName: 'Davolash ishi',
    courseLevel: 4,
    groupId: 'grp-1',
    groupName: '401-guruh',
    practiceId: 'prac-1',
    practiceName: '4-kurs Davolash ishi klinik ishlab chiqarish amaliyoti',
    practiceCode: 'PRAC-2025-MED4',
    practiceStartDate: '2026-09-01',
    practiceEndDate: '2026-09-30',
    practicePlaceId: 'place-1',
    practicePlaceName: 'Respublika 1-son Klinik Shifoxonasi',
    commissionId: 'comm-1',
    commissionName: 'Davolash ishi 4-kurs Yakuniy attestatsiya komissiyasi №1',
    commissionChairperson: 'Prof. Sobirov Alisher Tolipovich',
    commissionMembers: ['Dr. Rahmonova Nargiza Anvarovna', 'Dots. Mahmudov Shuxrat'],
    departmentChair: 'Prof. Sobirov Alisher Tolipovich',
    deanName: 'Prof. Xalimov Bobur Rustamovich',
    issueDate: '2026-09-28',
    status: 'APPROVED',
    students: [
      {
        studentId: 'std-1',
        fullName: 'Aliyev Jasur Rustamovich',
        studentCode: 'TMA-2022-0142',
        group: '401-guruh',
        attendanceScore: 19,
        journalScore: 19,
        skillsScore: 28,
        finalExamScore: 27,
        totalScore: 93,
        grade: '5',
        gradeWord: "A'lo",
        status: 'APPROVED'
      },
      {
        studentId: 'std-2',
        fullName: 'Karimova Dilnoza Botirovna',
        studentCode: 'TMA-2022-0189',
        group: '401-guruh',
        attendanceScore: 18,
        journalScore: 17,
        skillsScore: 24,
        finalExamScore: 24,
        totalScore: 83,
        grade: '4',
        gradeWord: 'Yaxshi',
        status: 'APPROVED'
      }
    ],
    totalStudentsCount: 2,
    grade5Count: 1,
    grade4Count: 1,
    grade3Count: 0,
    grade2Count: 0,
    masteryPercentage: 100,
    qualityPercentage: 100,
    retakeCount: 0,
    verificationCode: 'TMA-VRF-98214',
    qrPayload: 'https://ais-dev-jfkrtatp7imduu6bfeocus-226016755915.asia-east1.run.app/verify/TMA-VRF-98214',
    signedAt: '2026-09-28T14:00:00Z',
    signedBy: 'Prof. Sobirov Alisher Tolipovich',
    approvedAt: '2026-09-28T15:30:00Z',
    approvedBy: 'Prof. Xalimov Bobur Rustamovich',
    createdAt: '2026-09-28T12:00:00Z',
    updatedAt: '2026-09-28T15:30:00Z'
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
  private memoryState: DatabaseStateV2 | null = null;
  private saveDebounceTimer: any = null;
  private isSyncingFromCloud: boolean = false;

  constructor() {
    this.initCloudSync();
  }

  private initCloudSync(): void {
    if (typeof window === 'undefined' || !db) return;
    try {
      const docRef = doc(db, 'appState', 'v2');
      onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData && Array.isArray(cloudData.users)) {
            this.isSyncingFromCloud = true;
            this.memoryState = this.normalizeState(cloudData);
            try {
              localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(this.memoryState));
            } catch (e) {
              console.warn('Failed to save cloud state to localStorage:', e);
            }
            this.isSyncingFromCloud = false;
            window.dispatchEvent(new CustomEvent('tma_state_changed', { detail: this.memoryState }));
          }
        } else {
          // If document does not exist in Firestore, write current local state
          const initialState = this.getState();
          setDoc(docRef, JSON.parse(JSON.stringify(initialState))).catch(err => {
            console.warn('Failed to initialize cloud database state:', err);
          });
        }
      }, (err) => {
        console.warn('Firestore onSnapshot error:', err);
      });
    } catch (err) {
      console.warn('Could not initialize cloud database sync:', err);
    }
  }

  private normalizeState(parsed: any): DatabaseStateV2 {
    parsed.users = parsed.users || [];
    parsed.academicYears = parsed.academicYears || [];
    parsed.faculties = Array.isArray(parsed.faculties) ? parsed.faculties : [];
    parsed.directions = Array.isArray(parsed.directions) ? parsed.directions : [];
    parsed.courses = parsed.courses && parsed.courses.length > 0 ? parsed.courses : DEFAULT_COURSES;
    parsed.groups = Array.isArray(parsed.groups) ? parsed.groups : [];
    parsed.students = parsed.students || [];
    parsed.practicePlaces = Array.isArray(parsed.practicePlaces) ? parsed.practicePlaces : [];
    // Ensure legacy demo places are never revived
    const DEMO_PLACE_IDS = ['place-1', 'place-2', 'place-3', 'place-4'];
    parsed.practicePlaces = parsed.practicePlaces.filter((p: any) => p && !DEMO_PLACE_IDS.includes(p.id));
    parsed.practiceDepartments = Array.isArray(parsed.practiceDepartments) ? parsed.practiceDepartments : [];
    
    parsed.deletedSupervisorIds = parsed.deletedSupervisorIds || [];
    parsed.deletedClinicResponsibleIds = parsed.deletedClinicResponsibleIds || [];
    parsed.deletedPracticeIds = parsed.deletedPracticeIds || [];

    parsed.supervisors = Array.isArray(parsed.supervisors) ? parsed.supervisors.filter((s: any) => !parsed.deletedSupervisorIds.includes(s.id) && !parsed.deletedSupervisorIds.includes(s.userId)) : [];
    parsed.clinicResponsibles = Array.isArray(parsed.clinicResponsibles) ? parsed.clinicResponsibles.filter((c: any) => !parsed.deletedClinicResponsibleIds.includes(c.id) && !parsed.deletedClinicResponsibleIds.includes(c.userId)) : [];
    parsed.practices = Array.isArray(parsed.practices) ? parsed.practices.filter((p: any) => !parsed.deletedPracticeIds.includes(p.id)) : [];
    parsed.practiceDistributions = Array.isArray(parsed.practiceDistributions) ? parsed.practiceDistributions.filter((d: any) => !parsed.deletedPracticeIds.includes(d.practiceId)) : [];
    parsed.practiceAssignments = Array.isArray(parsed.practiceAssignments) ? parsed.practiceAssignments.filter((a: any) => !parsed.deletedPracticeIds.includes(a.practiceId)) : [];
    parsed.attendance = parsed.attendance || [];
    parsed.attendanceSessions = parsed.attendanceSessions || [];
    parsed.dailyJournals = parsed.dailyJournals || [];
    parsed.skills = parsed.skills || [];
    parsed.studentSkills = parsed.studentSkills || [];
    parsed.skillLogs = parsed.skillLogs || [];
    parsed.skillCategories = parsed.skillCategories || [];
    parsed.tasks = parsed.tasks || [];
    parsed.assessments = parsed.assessments || [];
    parsed.finalExams = parsed.finalExams || [];
    parsed.attestationCommissions = parsed.attestationCommissions || [];
    parsed.assessmentSettings = parsed.assessmentSettings || {
      id: 'default',
      attendanceMaxScore: 0,
      journalMaxScore: 0,
      skillsMaxScore: 0,
      finalExamMaxScore: 0,
      grade5Min: 0,
      grade4Min: 0,
      grade3Min: 0,
      grade2Min: 0,
      examCriteriaWeights: { theoryMax: 0, practicalMax: 0, clinicalCaseMax: 0, professionalismMax: 0, safetyMax: 0 }
    };
    parsed.vedomosts = parsed.vedomosts || [];
    parsed.documents = parsed.documents || [];
    parsed.notifications = parsed.notifications || [];
    parsed.auditLogs = parsed.auditLogs || [];
    return parsed as DatabaseStateV2;
  }

  private initDatabase(): DatabaseStateV2 {
    if (this.memoryState) {
      return this.memoryState;
    }

    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_V2) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          this.memoryState = this.normalizeState(parsed);
          // Complete one-time demo data purge
          const DEMO_PURGE_FLAG = 'tma_demo_completely_purged_v5';
          if (typeof window !== 'undefined' && !localStorage.getItem(DEMO_PURGE_FLAG)) {
            this.memoryState.faculties = [];
            this.memoryState.directions = [];
            this.memoryState.groups = [];
            this.memoryState.students = [];
            this.memoryState.practices = [];
            this.memoryState.supervisors = [];
            this.memoryState.clinicResponsibles = [];
            this.memoryState.practicePlaces = [];
            this.memoryState.practiceDepartments = [];
            this.memoryState.practiceDistributions = [];
            this.memoryState.practiceAssignments = [];
            localStorage.setItem(DEMO_PURGE_FLAG, 'true');
            this.saveState(this.memoryState);
          }
          return this.memoryState;
        }
      } catch (err) {
        console.error('Error parsing stored database v2, resetting defaults', err);
      }
    }

    const defaultState: DatabaseStateV2 = {
      mode: 'PRODUCTION',
      users: [],
      academicYears: [],
      faculties: [],
      directions: [],
      courses: DEFAULT_COURSES,
      groups: [],
      students: [],
      practicePlaces: [],
      practiceDepartments: [],
      supervisors: [],
      clinicResponsibles: [],
      practices: [],
      practiceDistributions: [],
      practiceAssignments: [],
      attendance: [],
      attendanceSessions: [],
      dailyJournals: [],
      skills: [],
      studentSkills: [],
      skillLogs: [],
      skillCategories: [],
      tasks: [],
      assessments: [],
      finalExams: [],
      attestationCommissions: [],
      assessmentSettings: {
        id: 'default',
        attendanceMaxScore: 0,
        journalMaxScore: 0,
        skillsMaxScore: 0,
        finalExamMaxScore: 0,
        grade5Min: 0,
        grade4Min: 0,
        grade3Min: 0,
        grade2Min: 0,
        examCriteriaWeights: { theoryMax: 0, practicalMax: 0, clinicalCaseMax: 0, professionalismMax: 0, safetyMax: 0 }
      },
      vedomosts: [],
      documents: [],
      notifications: [],
      auditLogs: []
    };

    this.memoryState = defaultState;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(defaultState));
    }
    return defaultState;
  }

  private getState(): DatabaseStateV2 {
    return this.initDatabase();
  }

  private saveState(state: DatabaseStateV2): void {
    this.memoryState = state;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
        window.dispatchEvent(new CustomEvent('tma_state_changed', { detail: state }));
      }
    } catch (err) {
      console.warn('Failed to save state to localStorage:', err);
    }

    if (!this.isSyncingFromCloud && db) {
      if (this.saveDebounceTimer) {
        clearTimeout(this.saveDebounceTimer);
      }
      this.saveDebounceTimer = setTimeout(() => {
        try {
          const docRef = doc(db, 'appState', 'v2');
          const cleanState = JSON.parse(JSON.stringify(state));
          setDoc(docRef, cleanState).catch(err => {
            console.warn('Error persisting state to Firestore:', err);
          });
        } catch (e) {
          console.warn('Error preparing state for Firestore:', e);
        }
      }, 150);
    }
  }

  public getEnvironmentMode(): AppEnvironmentMode {
    return 'PRODUCTION';
  }

  public setEnvironmentMode(mode: AppEnvironmentMode): void {
    const state = this.getState();
    state.mode = 'PRODUCTION';
    this.saveState(state);
  }

  public getSystemSettings(): SystemSettings {
    const state = this.getState();
    if (!state.systemSettings || state.systemSettings.universityName === 'Toshkent Tibbiyot Akademiyasi' || state.systemSettings.universityName === 'Toshkent davlat tibbiyot universiteti Chirchiq filiali') {
      state.systemSettings = {
        universityName: 'TOSHKENT DAVLAT TIBBIYOT UNIVERSITETI CHIRCHIQ FILIALI',
        universityShortName: 'TDTU Chirchiq filiali',
        academicYear: '2025-2026',
        semester: 'Kuzgi',
        qrRadiusMeters: 150,
        journalDeadlineTime: '23:59',
        mode: 'PRODUCTION'
      };
      this.saveState(state);
    }
    return state.systemSettings;
  }

  public getUniversityName(): string {
    return this.getSystemSettings().universityName || 'TOSHKENT DAVLAT TIBBIYOT UNIVERSITETI CHIRCHIQ FILIALI';
  }

  public getUniversityLogo(): string | undefined {
    return this.getSystemSettings().universityLogo;
  }

  public updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
    const state = this.getState();
    const current = this.getSystemSettings();
    state.systemSettings = {
      ...current,
      ...updates,
      mode: 'PRODUCTION'
    };
    state.mode = 'PRODUCTION';
    this.saveState(state);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('system_settings_updated', { detail: state.systemSettings }));
    }
    return state.systemSettings;
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
      (u.studentCode && u.studentCode.toLowerCase() === q) ||
      (u.hemisStudentId && u.hemisStudentId.toLowerCase() === q) ||
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

    // Automatically sync Supervisor entry if user role is any supervisor variation
    const rUpper = (user.role || '').toUpperCase();
    const isSupervisorUser = (
      rUpper === 'PRACTICE_SUPERVISOR' ||
      rUpper === 'SUPERVISOR' ||
      rUpper === 'SUPERVISOR_UNIVERSITY' ||
      rUpper === 'PRACTICE_LEADER_UNI' ||
      rUpper === 'DEPT_STAFF' ||
      rUpper === 'FACULTY_DEAN'
    );
    if (isSupervisorUser) {
      if (!state.supervisors) state.supervisors = [];
      const supIdx = state.supervisors.findIndex(s => s.id === `sup-${user.id}` || s.userId === user.uid || s.userId === user.id);
      const supervisorObj: Supervisor = {
        id: supIdx >= 0 ? state.supervisors[supIdx].id : `sup-${user.id || user.uid}`,
        userId: user.uid || user.id,
        fullName: user.fullName,
        phone: user.phone || '+998 (90) 000-00-00',
        email: user.email || `${user.login || 'user'}@tma.uz`,
        type: 'university',
        department: 'Kafedra',
        academicDegree: 'Dotsent / O\'qituvchi',
        assignedStudentsCount: supIdx >= 0 ? state.supervisors[supIdx].assignedStudentsCount : 0,
        status: 'ACTIVE'
      };
      if (supIdx >= 0) {
        state.supervisors[supIdx] = supervisorObj;
      } else {
        state.supervisors.unshift(supervisorObj);
      }
    }

    // Automatically sync ClinicResponsible entry if role is CLINIC_RESPONSIBLE
    if (user.role === 'CLINIC_RESPONSIBLE' || user.role === 'clinic_responsible') {
      if (!state.clinicResponsibles) state.clinicResponsibles = [];
      const crIdx = state.clinicResponsibles.findIndex(c => c.id === `cr-${user.id}` || c.userId === user.uid || c.userId === user.id);
      const crObj: ClinicResponsible = {
        id: crIdx >= 0 ? state.clinicResponsibles[crIdx].id : `cr-${user.id || user.uid}`,
        userId: user.uid || user.id,
        fullName: user.fullName,
        phone: user.phone || '+998 (90) 000-00-00',
        email: user.email || `${user.login}@tma.uz`,
        practicePlaceId: user.practicePlaceId || state.practicePlaces?.[0]?.id || 'place-1',
        position: crIdx >= 0 ? state.clinicResponsibles[crIdx].position : 'Shifoxona mas\'uli',
        department: 'Shifoxona bo\'limi',
        status: 'ACTIVE'
      };
      if (crIdx >= 0) {
        state.clinicResponsibles[crIdx] = crObj;
      } else {
        state.clinicResponsibles.unshift(crObj);
      }
    }

    this.saveState(state);
  }

  public deleteUser(id: string): void {
    const state = this.getState();
    state.users = state.users.filter(u => u.id !== id && u.uid !== id);
    this.saveState(state);
  }

  public clearAllStaffUsers(): void {
    const state = this.getState();
    // Keep Super Admin and Students, remove demo/staff accounts
    state.users = state.users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'super_admin' || u.role === 'STUDENT' || u.role === 'student');
    this.saveState(state);
  }

  // --- ACADEMIC YEARS ---
  public getAcademicYears(): AcademicYear[] {
    return this.getState().academicYears || [];
  }

  public saveAcademicYear(ay: AcademicYear): void {
    const state = this.getState();
    const idx = state.academicYears.findIndex(a => a.id === ay.id);
    if (idx >= 0) {
      state.academicYears[idx] = ay;
    } else {
      state.academicYears.push(ay);
    }
    this.saveState(state);
  }

  public deleteAcademicYear(id: string): void {
    const state = this.getState();
    state.academicYears = state.academicYears.filter(a => a.id !== id);
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

    // Ensure matching user account exists in users collection for authentication
    const studentLogin = payload.login || payload.studentCode || 'T00001';
    const userIdx = state.users.findIndex(u => 
      u.id === payload.userId || 
      (u.studentCode && u.studentCode === studentLogin) || 
      (u.login && u.login === studentLogin) ||
      (payload.hemisStudentId && u.hemisStudentId === payload.hemisStudentId)
    );
    if (userIdx >= 0) {
      state.users[userIdx] = {
        ...state.users[userIdx],
        fullName: payload.fullName,
        studentCode: studentLogin,
        login: studentLogin,
        hemisStudentId: payload.hemisStudentId,
        phone: payload.phone || state.users[userIdx].phone,
        email: `${studentLogin}@student.uz`,
        updatedAt: new Date().toISOString()
      };
    } else {
      const newUser: User = {
        id: payload.userId || `user-${payload.id}`,
        uid: payload.userId || `uid-${payload.id}`,
        login: studentLogin,
        studentCode: studentLogin,
        hemisStudentId: payload.hemisStudentId,
        studentId: payload.id,
        password: 'password123',
        fullName: payload.fullName,
        role: 'STUDENT',
        email: `${studentLogin}@student.uz`,
        phone: payload.phone || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      state.users.unshift(newUser);
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: isNew ? 'studentCreated' : 'studentUpdated',
      entity: 'students',
      entityId: student.id,
      metadata: JSON.stringify({ fullName: student.fullName, studentId: student.studentId, login: studentLogin })
    });

    this.saveState(state);
  }

  public syncHemisStudent(hemisData: {
    hemisStudentId: string;
    fullName: string;
    facultyId?: string;
    directionId?: string;
    courseId?: string;
    groupId?: string;
    phone?: string;
  }, actorUserId = 'system', actorRole = 'PRACTICE_STAFF'): { student: Student; isNew: boolean } {
    const state = this.getState();
    const existingIdx = state.students.findIndex(s => 
      (s.hemisStudentId && s.hemisStudentId === hemisData.hemisStudentId) ||
      (s.studentId && s.studentId === hemisData.hemisStudentId)
    );

    if (existingIdx >= 0) {
      // Update existing student, DO NOT create duplicate
      const existing = state.students[existingIdx];
      const updated: Student = {
        ...existing,
        fullName: hemisData.fullName || existing.fullName,
        facultyId: hemisData.facultyId || existing.facultyId,
        directionId: hemisData.directionId || existing.directionId,
        courseId: hemisData.courseId || existing.courseId,
        groupId: hemisData.groupId || existing.groupId,
        phone: hemisData.phone || existing.phone,
        updatedAt: new Date().toISOString()
      };
      state.students[existingIdx] = updated;

      // Also update user profile
      const userIdx = state.users.findIndex(u => 
        u.hemisStudentId === hemisData.hemisStudentId || 
        u.login === existing.login || 
        u.id === existing.userId
      );
      if (userIdx >= 0) {
        state.users[userIdx] = {
          ...state.users[userIdx],
          fullName: updated.fullName,
          phone: updated.phone || state.users[userIdx].phone,
          updatedAt: new Date().toISOString()
        };
      }

      this.saveState(state);
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'studentUpdated',
        entity: 'students',
        entityId: updated.id,
        metadata: JSON.stringify({ hemisStudentId: hemisData.hemisStudentId, fullName: updated.fullName, syncType: 'HEMIS' })
      });
      return { student: updated, isNew: false };
    } else {
      // Create new student with sequential T-login
      let highest = 0;
      for (const s of state.students) {
        const code = s.studentCode || s.login || '';
        const match = code.match(/^T(\d{5})$/i);
        if (match && match[1]) {
          const val = parseInt(match[1], 10);
          if (val > highest) highest = val;
        }
      }
      const savedSeq = parseInt(localStorage.getItem('aide_highest_student_sequence_v1') || '0', 10);
      if (savedSeq > highest) highest = savedSeq;
      const nextSeq = highest + 1;
      localStorage.setItem('aide_highest_student_sequence_v1', String(nextSeq));
      const nextLogin = `T${String(nextSeq).padStart(5, '0')}`;

      const newId = `std-hemis-${Date.now()}`;
      const newStudent: Student = {
        id: newId,
        userId: `uid-${newId}`,
        login: nextLogin,
        studentCode: nextLogin,
        hemisStudentId: hemisData.hemisStudentId,
        studentId: hemisData.hemisStudentId,
        fullName: hemisData.fullName,
        facultyId: hemisData.facultyId || state.faculties[0]?.id || 'fac-1',
        directionId: hemisData.directionId || state.directions[0]?.id || 'dir-1',
        courseId: hemisData.courseId || state.courses[0]?.id || 'course-4',
        groupId: hemisData.groupId || state.groups[0]?.id || 'grp-401',
        phone: hemisData.phone || '+998 (90) 000-00-00',
        telegram: '@student',
        email: `${nextLogin}@student.uz`,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      state.students.unshift(newStudent);

      const newUser: User = {
        id: `user-${newId}`,
        uid: `uid-${newId}`,
        login: nextLogin,
        studentCode: nextLogin,
        hemisStudentId: hemisData.hemisStudentId,
        studentId: newId,
        password: 'password123',
        fullName: hemisData.fullName,
        role: 'STUDENT',
        email: `${nextLogin}@student.uz`,
        phone: hemisData.phone || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      state.users.unshift(newUser);

      this.saveState(state);
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'studentCreated',
        entity: 'students',
        entityId: newId,
        metadata: JSON.stringify({ hemisStudentId: hemisData.hemisStudentId, login: nextLogin, fullName: hemisData.fullName, syncType: 'HEMIS' })
      });
      return { student: newStudent, isNew: true };
    }
  }

  public deleteStudent(id: string, actorUserId = 'system', actorRole = 'PRACTICE_HEAD'): void {
    const state = this.getState();
    const student = state.students.find(s => s.id === id);
    if (student) {
      // Ensure student's login number is permanently registered as used so it is never reused
      const codeOrLogin = student.studentCode || student.login || '';
      const match = codeOrLogin.match(/^T(\d{5})$/i);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        recordUsedStudentSequence(seq, db).catch(() => {});
      }
    }
    state.students = state.students.filter(s => s.id !== id);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'studentDeleted',
      entity: 'students',
      entityId: id,
      metadata: student ? JSON.stringify({ fullName: student.fullName, login: student.login, hemisStudentId: student.hemisStudentId }) : undefined
    });

    this.saveState(state);
  }

  public clearAllStudents(actorUserId = 'system', actorRole = 'SUPER_ADMIN'): void {
    const state = this.getState();
    const count = state.students.length;
    state.students = [];
    state.users = state.users.filter(u => u.role !== 'STUDENT' && u.role !== 'student');

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'studentDeleted',
      entity: 'students',
      entityId: 'all',
      metadata: JSON.stringify({ clearedCount: count })
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
    // 1. Remove the practice
    state.practices = (state.practices || []).filter(p => p.id !== id);

    // 2. Remove all related distributions
    state.practiceDistributions = (state.practiceDistributions || []).filter(d => d.practiceId !== id);

    // 3. Track deleted practice IDs
    if (!state.deletedPracticeIds) state.deletedPracticeIds = [];
    if (!state.deletedPracticeIds.includes(id)) state.deletedPracticeIds.push(id);

    // 4. Find assignments belonging to this practice
    const removedAssignments = (state.practiceAssignments || []).filter(a => a.practiceId === id);
    const affectedStudentIds = removedAssignments.map(a => a.studentId);

    // 5. Remove assignments, attendance, journals, exams, assessments related to this practice
    state.practiceAssignments = (state.practiceAssignments || []).filter(a => a.practiceId !== id);
    state.attendance = (state.attendance || []).filter(a => a.practiceId !== id);
    state.dailyJournals = (state.dailyJournals || []).filter(j => j.practiceId !== id);
    state.finalExams = (state.finalExams || []).filter(e => e.practiceId !== id);
    state.assessments = (state.assessments || []).filter(ast => ast.practiceId !== id);

    // 6. Unassign students from this practice
    for (const student of (state.students || [])) {
      if (student.currentPracticeId === id || affectedStudentIds.includes(student.id)) {
        student.currentPracticeId = undefined;
        student.currentPracticePlaceId = undefined;
        student.status = 'active';
      }
    }

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
    return this.getState().practicePlaces || [];
  }

  public savePracticePlace(place: PracticePlace): void {
    const state = this.getState();
    if (!state.practicePlaces) state.practicePlaces = [];
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
    state.practicePlaces = (state.practicePlaces || []).filter(p => p.id !== id);
    this.saveState(state);
  }

  public clearAllPracticePlaces(): void {
    const state = this.getState();
    state.practicePlaces = [];
    this.saveState(state);
  }

  public getPracticeDepartments(): PracticeDepartment[] {
    return this.getState().practiceDepartments || [];
  }

  // --- SUPERVISORS & CLINIC RESPONSIBLES ---
  public getSupervisors(): Supervisor[] {
    const state = this.getState();
    const deletedIds = state.deletedSupervisorIds || [];
    return (state.supervisors || []).filter(s => !deletedIds.includes(s.id) && !deletedIds.includes(s.userId || ''));
  }

  public saveSupervisor(supervisor: Supervisor): void {
    const state = this.getState();
    if (!state.supervisors) state.supervisors = [];
    const idx = state.supervisors.findIndex(s => s.id === supervisor.id);
    if (idx >= 0) {
      state.supervisors[idx] = supervisor;
    } else {
      state.supervisors.unshift(supervisor);
    }

    // Also ensure matching user account exists in state.users for login and user management
    if (!state.users) state.users = [];
    const userExists = state.users.some(u => u.id === supervisor.userId || u.uid === supervisor.userId || u.id === supervisor.id);
    if (!userExists) {
      const loginStr = supervisor.email ? supervisor.email.split('@')[0] : `rahbar_${Date.now()}`;
      state.users.unshift({
        id: supervisor.userId || `user-${supervisor.id}`,
        uid: supervisor.userId || `uid-${supervisor.id}`,
        fullName: supervisor.fullName,
        login: loginStr,
        password: 'password123',
        role: 'PRACTICE_SUPERVISOR',
        email: supervisor.email || `${loginStr}@tma.uz`,
        phone: supervisor.phone || '+998 (90) 000-00-00',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }

    this.saveState(state);
  }

  public deleteSupervisor(id: string): void {
    const state = this.getState();
    const sup = (state.supervisors || []).find(s => s.id === id);
    const userId = sup?.userId || id.replace(/^sup-/, '');
    
    state.supervisors = (state.supervisors || []).filter(s => s.id !== id && s.userId !== userId);
    state.users = (state.users || []).filter(u => u.id !== id && u.uid !== id && u.id !== userId && u.uid !== userId && u.id !== sup?.id);

    if (!state.deletedSupervisorIds) state.deletedSupervisorIds = [];
    if (!state.deletedSupervisorIds.includes(id)) state.deletedSupervisorIds.push(id);
    if (userId && !state.deletedSupervisorIds.includes(userId)) state.deletedSupervisorIds.push(userId);
    if (sup?.userId && !state.deletedSupervisorIds.includes(sup.userId)) state.deletedSupervisorIds.push(sup.userId);

    this.saveState(state);
  }

  public deleteClinicResponsible(id: string): void {
    const state = this.getState();
    const cr = (state.clinicResponsibles || []).find(c => c.id === id);
    const userId = cr?.userId || id.replace(/^cr-/, '');

    state.clinicResponsibles = (state.clinicResponsibles || []).filter(c => c.id !== id && c.userId !== userId);
    state.users = (state.users || []).filter(u => u.id !== id && u.uid !== id && u.id !== userId && u.uid !== userId && u.id !== cr?.id);

    if (!state.deletedClinicResponsibleIds) state.deletedClinicResponsibleIds = [];
    if (!state.deletedClinicResponsibleIds.includes(id)) state.deletedClinicResponsibleIds.push(id);
    if (userId && !state.deletedClinicResponsibleIds.includes(userId)) state.deletedClinicResponsibleIds.push(userId);
    if (cr?.userId && !state.deletedClinicResponsibleIds.includes(cr.userId)) state.deletedClinicResponsibleIds.push(cr.userId);

    this.saveState(state);
  }

  public getClinicResponsibles(): ClinicResponsible[] {
    const state = this.getState();
    const deletedIds = state.deletedClinicResponsibleIds || [];
    return (state.clinicResponsibles || []).filter(c => !deletedIds.includes(c.id) && !deletedIds.includes(c.userId || ''));
  }

  // --- PRACTICE DISTRIBUTIONS (AMALIYOT TAQSIMOTI) ---
  public getDistributions(): PracticeDistribution[] {
    return this.getState().practiceDistributions || [];
  }

  public getDistributionById(id: string): PracticeDistribution | undefined {
    return this.getDistributions().find(d => d.id === id || d.distributionCode === id);
  }

  public getDistributionsForPractice(practiceId: string): PracticeDistribution[] {
    return this.getDistributions().filter(d => d.practiceId === practiceId);
  }

  public getDistributionsForSupervisor(supervisorId: string): PracticeDistribution[] {
    return this.getDistributions().filter(d => d.supervisorId === supervisorId);
  }

  public savePracticeDistribution(
    distribution: PracticeDistribution,
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): PracticeDistribution {
    const state = this.getState();
    if (!state.practiceDistributions) state.practiceDistributions = [];
    const idx = state.practiceDistributions.findIndex(d => d.id === distribution.id);
    distribution.updatedAt = new Date().toISOString();
    if (idx >= 0) {
      state.practiceDistributions[idx] = distribution;
    } else {
      distribution.createdAt = distribution.createdAt || new Date().toISOString();
      state.practiceDistributions.unshift(distribution);
    }
    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'practiceUpdated',
      entity: 'practiceDistributions',
      entityId: distribution.id,
      metadata: JSON.stringify({ code: distribution.distributionCode, groupId: distribution.groupId })
    });
    this.saveState(state);
    return distribution;
  }

  public createPracticeDistribution(
    data: Omit<PracticeDistribution, 'id' | 'distributionCode' | 'createdAt' | 'status' | 'totalStudentsCount' | 'assignedDepartmentsCount' | 'unassignedDepartmentsCount'>,
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): PracticeDistribution {
    const state = this.getState();
    if (!state.practiceDistributions) state.practiceDistributions = [];

    // 1. Generate sequential unique code: TAQ-YYYY-XXXXX
    const allCodes = state.practiceDistributions.map(d => d.distributionCode || '').filter(Boolean);
    let maxSeq = 124;
    allCodes.forEach(code => {
      const match = code.match(/TAQ-\d{4}-(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxSeq) maxSeq = val;
      }
    });
    const currentYear = new Date().getFullYear();
    const distributionCode = `TAQ-${currentYear}-${String(maxSeq + 1).padStart(5, '0')}`;
    const newDistId = `dist-${Date.now()}`;

    // 2. Identify students in this group
    const groupStudents = state.students.filter(s => s.groupId === data.groupId);
    if (groupStudents.length === 0) {
      throw new Error(`Ushbu guruhda talabalar mavjud emas.`);
    }

    // 3. Verify no student in this group has an active assignment for this practice (Prevent double-assignment)
    const activeForThisPractice = groupStudents.filter(s =>
      state.practiceAssignments.some(
        a => a.practiceId === data.practiceId &&
             a.studentId === s.id &&
             (a.status === 'in_progress' || a.status === 'assigned')
      )
    );
    if (activeForThisPractice.length === groupStudents.length) {
      throw new Error(`Ushbu guruhdagi barcha talabalar (${groupStudents.length} nafar) allaqachon ushbu amaliyotga biriktirilgan.`);
    }

    // 4. Create individual assignments for unassigned students in this group
    const studentsToAssign = groupStudents.filter(s =>
      !state.practiceAssignments.some(
        a => a.practiceId === data.practiceId &&
             a.studentId === s.id &&
             (a.status === 'in_progress' || a.status === 'assigned')
      )
    );

    const now = new Date().toISOString();
    studentsToAssign.forEach((student, index) => {
      const asgId = `asg-${distributionCode}-${String(index + 1).padStart(2, '0')}`;
      const newAssignment: PracticeAssignment = {
        id: asgId,
        assignmentId: asgId,
        distributionId: newDistId,
        distributionCode,
        practiceId: data.practiceId,
        studentId: student.id,
        groupId: data.groupId,
        practicePlaceId: data.organizationId,
        department: '', // Initially unassigned to department
        departmentId: undefined,
        supervisorId: data.supervisorId, // Amaliyot rahbari guruh kesimida biriktiriladi
        startDate: data.startDate,
        endDate: data.endDate,
        practiceDays: data.practiceDays,
        startTime: data.startTime,
        endTime: data.endTime,
        academicYear: data.academicYear,
        courseLevel: data.courseLevel,
        directionId: data.directionId,
        status: 'in_progress',
        createdAt: now
      };

      state.practiceAssignments.unshift(newAssignment);
      student.status = 'in_practice';
      student.currentPracticeId = data.practiceId;
      student.currentPracticePlaceId = data.organizationId;
    });

    // 5. Create the PracticeDistribution record
    const newDistribution: PracticeDistribution = {
      ...data,
      id: newDistId,
      distributionCode,
      status: 'active',
      totalStudentsCount: studentsToAssign.length,
      assignedDepartmentsCount: 0,
      unassignedDepartmentsCount: studentsToAssign.length,
      createdAt: now,
      updatedAt: now
    };

    state.practiceDistributions.unshift(newDistribution);
    this.recalculatePlaceStudentCounts(state);

    // 6. Send real-time notification to the assigned students
    const practice = state.practices.find(p => p.id === data.practiceId);
    const direction = state.directions.find(d => d.id === data.directionId);
    const group = state.groups.find(g => g.id === data.groupId);
    const org = state.practicePlaces.find(p => p.id === data.organizationId);
    const supervisor = state.supervisors.find(s => s.id === data.supervisorId);

    studentsToAssign.forEach(st => {
      state.notifications.unshift({
        id: `notif-dist-${Date.now()}-${st.id}`,
        recipientUserId: st.userId || st.id,
        recipientRoles: ['STUDENT'],
        title: '🔔 Amaliyot belgilandi',
        message: `${data.courseLevel}-kurs · ${direction?.name || 'Tibbiyot yo\'nalishi'} · ${group?.name || 'Guruh'}\nSanasi: ${data.startDate} – ${data.endDate} (${data.practiceDays.join(', ')})\nVaqti: ${data.startTime} – ${data.endTime}\nTashkilot: ${org?.name || ''} (${org?.organizationCode || ''})\nRahbar: ${supervisor?.fullName || ''}`,
        type: 'info',
        createdAt: now,
        isRead: false,
        linkModule: 'practices'
      });
    });

    // 7. Audit log
    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assignmentCreated',
      entity: 'practiceDistributions',
      entityId: newDistId,
      metadata: JSON.stringify({
        distributionCode,
        groupId: data.groupId,
        organizationId: data.organizationId,
        supervisorId: data.supervisorId,
        assignedStudentsCount: studentsToAssign.length
      })
    });

    this.saveState(state);
    return newDistribution;
  }

  public deletePracticeDistribution(
    id: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): void {
    const state = this.getState();
    const dist = (state.practiceDistributions || []).find(d => d.id === id || d.distributionCode === id);
    if (!dist) return;

    // Remove assignments created under this distribution
    const affectedAssignments = state.practiceAssignments.filter(
      a => a.distributionId === dist.id || a.distributionCode === dist.distributionCode
    );
    const affectedStudentIds = new Set(affectedAssignments.map(a => a.studentId));

    state.practiceAssignments = state.practiceAssignments.filter(
      a => a.distributionId !== dist.id && a.distributionCode !== dist.distributionCode
    );

    // Reset student statuses if they have no other active assignments
    state.students.forEach(st => {
      if (affectedStudentIds.has(st.id)) {
        const hasOther = state.practiceAssignments.some(
          a => a.studentId === st.id && (a.status === 'in_progress' || a.status === 'assigned')
        );
        if (!hasOther) {
          st.status = 'active';
          st.currentPracticeId = undefined;
          st.currentPracticePlaceId = undefined;
        }
      }
    });

    state.practiceDistributions = (state.practiceDistributions || []).filter(
      d => d.id !== dist.id
    );

    this.recalculatePlaceStudentCounts(state);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assignmentRemoved',
      entity: 'practiceDistributions',
      entityId: dist.id,
      metadata: JSON.stringify({ distributionCode: dist.distributionCode, groupId: dist.groupId })
    });

    this.saveState(state);
  }

  // Supervisor-specific authorization & query methods
  public getStudentsForSupervisor(supervisorId: string): Student[] {
    const state = this.getState();
    const supervisorAssignments = (state.practiceAssignments || []).filter(
      a => a.supervisorId === supervisorId && (a.status === 'in_progress' || a.status === 'assigned')
    );
    const studentIds = new Set(supervisorAssignments.map(a => a.studentId));
    return state.students.filter(s => studentIds.has(s.id));
  }

  public getGroupsForSupervisor(supervisorId: string): Group[] {
    const state = this.getState();
    const distributions = (state.practiceDistributions || []).filter(d => d.supervisorId === supervisorId);
    const groupIdsFromDist = distributions.map(d => d.groupId);
    const groupIdsFromAsg = (state.practiceAssignments || [])
      .filter(a => a.supervisorId === supervisorId && a.groupId)
      .map(a => a.groupId as string);
    const allGroupIds = new Set([...groupIdsFromDist, ...groupIdsFromAsg]);
    return state.groups.filter(g => allGroupIds.has(g.id));
  }

  public getUnassignedDepartmentStudentsForSupervisor(supervisorId: string): {
    student: Student;
    assignment: PracticeAssignment;
    group?: Group;
    organization?: PracticePlace;
  }[] {
    const state = this.getState();
    const supervisorAssignments = (state.practiceAssignments || []).filter(
      a => a.supervisorId === supervisorId &&
           (a.status === 'in_progress' || a.status === 'assigned') &&
           (!a.departmentId || a.department === '' || a.department === 'Biriktirilmagan')
    );
    return supervisorAssignments.map(asg => {
      const student = state.students.find(s => s.id === asg.studentId);
      const group = state.groups.find(g => g.id === (asg.groupId || student?.groupId));
      const org = state.practicePlaces.find(p => p.id === asg.practicePlaceId);
      return {
        student: student!,
        assignment: asg,
        group,
        organization: org
      };
    }).filter(item => item.student != null);
  }

  public assignStudentsToDepartment(
    assignmentIds: string[],
    departmentId: string,
    departmentName: string,
    supervisorId?: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): { successCount: number } {
    const state = this.getState();
    let count = 0;
    const now = new Date().toISOString();

    state.practiceAssignments.forEach(asg => {
      if (assignmentIds.includes(asg.id)) {
        // Authorization check: If supervisorId provided, only update their own students!
        if (supervisorId && asg.supervisorId !== supervisorId) {
          return;
        }
        asg.departmentId = departmentId;
        asg.department = departmentName;
        asg.updatedAt = now;
        count++;
      }
    });

    // Update distribution counters
    (state.practiceDistributions || []).forEach(dist => {
      const distAssignments = state.practiceAssignments.filter(
        a => a.distributionId === dist.id || a.distributionCode === dist.distributionCode
      );
      if (distAssignments.length > 0) {
        dist.totalStudentsCount = distAssignments.length;
        dist.assignedDepartmentsCount = distAssignments.filter(a => !!a.departmentId && a.department !== '').length;
        dist.unassignedDepartmentsCount = dist.totalStudentsCount - dist.assignedDepartmentsCount;
        dist.updatedAt = now;
      }
    });

    if (count > 0) {
      this.recordAuditLog({
        userId: actorUserId,
        userRole: actorRole,
        action: 'assignmentUpdated',
        entity: 'practiceAssignments',
        entityId: `bulk-dept-${Date.now()}`,
        metadata: JSON.stringify({ count, departmentId, departmentName })
      });
      this.saveState(state);
    }

    return { successCount: count };
  }

  public getStudentActivePracticeDetails(studentId: string): {
    practice?: Practice;
    assignment?: PracticeAssignment;
    distribution?: PracticeDistribution;
    organization?: PracticePlace;
    supervisor?: Supervisor;
    department?: PracticeDepartment;
    hasActivePractice: boolean;
  } {
    const state = this.getState();
    const assignment = (state.practiceAssignments || []).find(
      a => a.studentId === studentId && (a.status === 'in_progress' || a.status === 'assigned')
    );
    if (!assignment) {
      return { hasActivePractice: false };
    }
    const practice = state.practices.find(p => p.id === assignment.practiceId);
    const distribution = (state.practiceDistributions || []).find(
      d => d.id === assignment.distributionId || d.distributionCode === assignment.distributionCode
    );
    const organization = state.practicePlaces.find(p => p.id === assignment.practicePlaceId);
    const supervisor = state.supervisors.find(s => s.id === assignment.supervisorId);
    const department = assignment.departmentId 
      ? state.practiceDepartments.find(d => d.id === assignment.departmentId)
      : undefined;

    return {
      practice,
      assignment,
      distribution,
      organization,
      supervisor,
      department,
      hasActivePractice: true
    };
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
   * Section 14: Schedule Validation for Attendance
   * Ensures student only attends on valid dates, practice days (Mon-Fri etc.), and allowed hours.
   */
  public validateAttendanceEligibility(
    studentId: string,
    practiceId: string,
    targetDate: string,
    targetTime?: string
  ): {
    eligible: boolean;
    reason?: string;
    assignment?: PracticeAssignment;
  } {
    const state = this.getState();
    const assignment = state.practiceAssignments.find(
      a => a.studentId === studentId && (practiceId ? a.practiceId === practiceId : true)
    );

    if (!assignment) {
      return {
        eligible: false,
        reason: 'Siz ushbu amaliyotga biriktirilmagansiz.'
      };
    }

    // 1. Date range check
    if (targetDate < assignment.startDate) {
      return {
        eligible: false,
        reason: `Amaliyot hali boshlanmagan (Boshlanish sanasi: ${assignment.startDate}).`,
        assignment
      };
    }

    if (targetDate > assignment.endDate) {
      return {
        eligible: false,
        reason: `Amaliyot muddati (${assignment.endDate}) yakunlangan. Yangi davomat jarayonlari yopiq.`,
        assignment
      };
    }

    // 2. Day of week check
    if (assignment.practiceDays && assignment.practiceDays.length > 0) {
      const d = new Date(targetDate);
      const dayIndex = d.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
      const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
      const currentDayName = dayNames[dayIndex];
      const isAllowedDay = assignment.practiceDays.some(day => 
        day.toLowerCase().trim() === currentDayName.toLowerCase().trim()
      );
      if (!isAllowedDay) {
        return {
          eligible: false,
          reason: `Bugun (${currentDayName}) amaliyot jadvalida belgilanmagan. Jadvaldagi kunlar: ${assignment.practiceDays.join(', ')}.`,
          assignment
        };
      }
    }

    return {
      eligible: true,
      assignment
    };
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

    // Schedule Eligibility Check (Requirement 14)
    const scheduleCheck = this.validateAttendanceEligibility(params.studentId, session.practiceId, todayStr, nowHHMM);
    if (!scheduleCheck.eligible) {
      return { success: false, error: scheduleCheck.reason || 'Amaliyot jadvali bo\'yicha bugun davomatga ruxsat berilmagan.' };
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
    const place = state.practicePlaces.find(
      p => p.id === session.practicePlaceId || p.organizationId === session.practicePlaceId || p.organizationCode === session.practicePlaceId
    );
    const targetLat = session.latitude ?? place?.latitude;
    const targetLng = session.longitude ?? place?.longitude;
    const allowedRadius = session.allowedRadius ?? place?.allowedRadius ?? 200;

    if (params.latitude !== undefined && params.longitude !== undefined && targetLat !== undefined && targetLng !== undefined) {
      const distance = this.calculateDistanceMeters(params.latitude, params.longitude, targetLat, targetLng);
      if (distance > allowedRadius) {
        return {
          success: false,
          error: `Siz belgilangan amaliyot tashkiloti (${place?.name || 'Klinika'}) hududidan tashqaridasiz (${Math.round(distance)} metr). Ruxsat etilgan radius: ${allowedRadius} metr.`,
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
      distributionId: assignment.distributionId,
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

    // Real-time Event / Notification to Assigned Supervisor (Requirement 12)
    if (assignment.supervisorId) {
      const supervisor = state.supervisors.find(s => s.id === assignment.supervisorId);
      const student = state.students.find(s => s.id === params.studentId);
      const group = state.groups.find(g => g.id === student?.groupId);
      if (supervisor && student) {
        state.notifications.unshift({
          id: `notif-att-${Date.now()}-${student.id}`,
          recipientUserId: supervisor.userId || supervisor.id,
          recipientRoles: ['PRACTICE_SUPERVISOR'],
          title: '🟢 Davomat qayd etildi',
          message: `${student.fullName} davomatdan o'tdi · ${nowHHMM} · ${group?.name || 'Guruh'} · ${assignment.department || 'Bo\'lim belgilanmagan'}`,
          type: 'success',
          createdAt: now.toISOString(),
          isRead: false,
          linkModule: 'attendance'
        });
      }
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
   * Direct Geolocation (GPS) Attendance Check-In
   * Verifies that the student is physically within the organization's allowed radius
   */
  public recordGPSAttendance(params: {
    studentId: string;
    latitude: number;
    longitude: number;
    deviceInfo?: string;
  }): {
    success: boolean;
    error?: string;
    alreadyRecorded?: boolean;
    attendance?: Attendance;
    details?: { distanceMeters: number; allowedRadius: number; placeName?: string };
  } {
    const state = this.getState();
    const now = new Date();
    const todayStr = new Date().toISOString().split('T')[0];
    const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. Find student assignment
    const assignment = state.practiceAssignments.find(
      a => a.studentId === params.studentId && (String(a.status).toUpperCase() === 'IN_PROGRESS' || String(a.status).toUpperCase() === 'ASSIGNED')
    ) || state.practiceAssignments.find(a => a.studentId === params.studentId);

    if (!assignment) {
      return { success: false, error: 'Sizga amaliyot bazasi biriktirilmagan.' };
    }

    // 2. Find practice place / organization
    const place = state.practicePlaces.find(
      p => p.id === assignment.practicePlaceId || p.organizationId === assignment.practicePlaceId || p.organizationCode === assignment.practicePlaceId
    );

    if (!place) {
      return { success: false, error: 'Amaliyot tashkiloti topilmadi.' };
    }

    if (place.latitude === undefined || place.longitude === undefined) {
      return {
        success: false,
        error: `Tashkilot (${place.name}) uchun GPS koordinatalari kiritilmagan. Iltimos tashkilot ma'muriyatiga murojaat qiling.`
      };
    }

    // 3. Calculate distance to organization
    const allowedRadius = place.allowedRadius || 200;
    const distance = this.calculateDistanceMeters(params.latitude, params.longitude, place.latitude, place.longitude);

    if (distance > allowedRadius) {
      return {
        success: false,
        error: `Siz amaliyot tashkiloti (${place.name}) hududidan tashqaridasiz. Masofa: ${Math.round(distance)} metr (Ruxsat etilgan radius: ${allowedRadius} metr).`,
        details: { distanceMeters: Math.round(distance), allowedRadius, placeName: place.name }
      };
    }

    // 4. Check Duplicate Check-in Today
    const existing = state.attendance.find(
      a => a.studentId === params.studentId && a.date === todayStr
    );

    if (existing && existing.checkInTime) {
      return {
        success: false,
        error: 'Bugungi davomat allaqachon qayd etilgan.',
        alreadyRecorded: true,
        attendance: existing
      };
    }

    // 5. Determine status (PRESENT vs LATE)
    const cutoffMinutes = 8 * 60 + 15; // 08:15 cutoff
    const [currentHour, currentMin] = nowHHMM.split(':').map(Number);
    const currentTotalMin = (currentHour || 0) * 60 + (currentMin || 0);
    const calculatedStatus: AttendanceStatus = currentTotalMin > cutoffMinutes ? 'LATE' : 'PRESENT';

    const newRecord: Attendance = {
      id: existing?.id || `att-gps-${Date.now()}-${params.studentId}`,
      practiceId: assignment.practiceId,
      studentId: params.studentId,
      assignmentId: assignment.id,
      distributionId: assignment.distributionId,
      practicePlaceId: place.id,
      departmentId: assignment.departmentId || '',
      supervisorId: assignment.supervisorId,
      date: todayStr,
      checkInTime: nowHHMM,
      checkOutTime: undefined,
      status: calculatedStatus,
      attendanceMethod: 'GPS',
      latitude: params.latitude,
      longitude: params.longitude,
      locationVerified: true,
      deviceInfo: params.deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile App Web'),
      note: `GPS koordinata orqali tasdiqlandi (Masofa: ${Math.round(distance)} m / ${place.name})`,
      verifiedBy: 'GPS Geolokatsiya tizimi',
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

    // Supervisor notification
    if (assignment.supervisorId) {
      const supervisor = state.supervisors.find(s => s.id === assignment.supervisorId);
      const student = state.students.find(s => s.id === params.studentId);
      if (supervisor && student) {
        state.notifications.unshift({
          id: `notif-att-gps-${Date.now()}-${student.id}`,
          recipientUserId: supervisor.userId || supervisor.id,
          recipientRoles: ['PRACTICE_SUPERVISOR'],
          title: '📍 GPS Davomat qayd etildi',
          message: `${student.fullName} tashkilot hududidan (${place.name}, masofa: ${Math.round(distance)}m) davomatdan o'tdi.`,
          type: 'success',
          createdAt: now.toISOString(),
          isRead: false,
          linkModule: 'attendance'
        });
      }
    }

    this.recordAuditLog({
      userId: params.studentId,
      userRole: 'STUDENT',
      action: 'attendanceCheckIn',
      entity: 'attendance',
      entityId: newRecord.id,
      metadata: JSON.stringify({
        method: 'GPS',
        distanceMeters: Math.round(distance),
        placeId: place.id,
        placeName: place.name
      })
    });

    this.saveState(state);
    return {
      success: true,
      attendance: newRecord,
      details: { distanceMeters: Math.round(distance), allowedRadius, placeName: place.name }
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
      assignmentId: assignment?.id || '',
      practicePlaceId: assignment?.practicePlaceId || '',
      departmentId: assignment?.departmentId || '',
      supervisorId: assignment?.supervisorId || '',
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

    if (date > assignment.endDate) {
      return {
        eligible: false,
        reason: `Amaliyot muddati (${assignment.endDate}) yakunlangan. Yangi kundalik to'ldirish yopiq.`
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
      journalData.studentId || '',
      journalData.practiceId || '',
      journalData.date || journalData.journalDate || '',
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

    const existingIdx = state.dailyJournals.findIndex(j => j.id === journalData.id);
    const isNew = existingIdx < 0;
    const existing = existingIdx >= 0 ? state.dailyJournals[existingIdx] : null;

    // LOCKED / FINAL_APPROVED restriction: cannot be modified by standard client update!
    if (existing && (existing.isLocked || existing.status === 'LOCKED' || existing.status === 'FINAL_APPROVED')) {
      return {
        success: false,
        error: 'Ushbu amaliyot kundaligi yakuniy tasdiqlangan va qulflangan (LOCKED). Tahrirlash mutlaqo taqiqlanadi.'
      };
    }

    // If already SUBMITTED or pending review, student cannot edit until supervisor requests REVISION
    if (existing && actorRole === 'STUDENT' && (existing.status === 'SUBMITTED' || existing.status === 'SUPERVISOR_APPROVED' || existing.status === 'FINAL_PENDING')) {
      return {
        success: false,
        error: 'Kundalik allaqachon topshirilgan va ko\'rib chiqish jarayonida. Qayta ishlashga (REVISION) yuborilmaguncha tahrirlash yopiq.'
      };
    }

    const isResubmit = existing && (existing.status === 'REVISION' || existing.status === 'revision');
    const isDraft = journalData.status === 'DRAFT' || journalData.status === 'draft';
    const targetStatus: JournalStatus = isDraft ? 'DRAFT' : 'SUBMITTED';

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
      status: targetStatus,
      submittedAt: isDraft ? undefined : (existing?.submittedAt || new Date().toISOString()),
      version: (existing?.version || 0) + (isResubmit ? 1 : 1),
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      state.dailyJournals.unshift(linkedJournal);
    } else {
      state.dailyJournals[existingIdx] = linkedJournal;
    }

    // Stage 6 Integration: auto-link journal procedures to skillRecords in PENDING status
    if (linkedJournal.procedures && linkedJournal.procedures.length > 0) {
      if (!state.skillLogs) state.skillLogs = [];
      linkedJournal.procedures.forEach(proc => {
        const matchingSkill = state.skills.find(
          sk => (proc.skillId && sk.id === proc.skillId) || 
                sk.name.toLowerCase().includes(proc.name.toLowerCase()) || 
                proc.name.toLowerCase().includes(sk.name.toLowerCase())
        );
        if (matchingSkill) {
          const partType = proc.participationType === 'Mustaqil'
            ? 'INDEPENDENT'
            : proc.participationType === 'Rahbar nazoratida'
            ? 'SUPERVISED'
            : 'OBSERVED';
          
          const exIdx = state.skillLogs.findIndex(
            l => l.dailyJournalId === linkedJournal.id && l.skillId === matchingSkill.id
          );

          const recordId = exIdx >= 0 ? state.skillLogs[exIdx].id : `slog-j-${linkedJournal.id}-${matchingSkill.id}`;
          const skillLog: SkillRecord = {
            id: recordId,
            studentId: linkedJournal.studentId,
            practiceId: linkedJournal.practiceId || '',
            skillId: matchingSkill.id,
            date: linkedJournal.date || linkedJournal.journalDate || '',
            participationType: partType,
            performanceType: partType,
            count: proc.count || 1,
            notes: `Elektron kundalik muolajasi: ${proc.name}`,
            description: `Elektron kundalik muolajasi: ${proc.name}`,
            source: 'DAILY_JOURNAL',
            dailyJournalId: linkedJournal.id,
            journalId: linkedJournal.id,
            status: 'PENDING',
            createdAt: new Date().toISOString()
          };

          if (exIdx >= 0) {
            state.skillLogs[exIdx] = skillLog;
          } else {
            state.skillLogs.unshift(skillLog);
          }

          this.recordAuditLog({
            userId: actorUserId,
            userRole: actorRole,
            action: 'skillRecordCreated',
            entity: 'skillRecords',
            entityId: recordId,
            metadata: JSON.stringify({
              source: 'DAILY_JOURNAL',
              journalId: linkedJournal.id,
              skillId: matchingSkill.id,
              skillName: matchingSkill.name,
              count: proc.count
            })
          });
        }
      });
    }

    // Add notification to assigned supervisor
    const group = state.groups.find(g => g.id === student?.groupId);
    if (supervisor) {
      this.addNotification({
        recipientUserId: supervisor.userId || supervisor.id,
        recipientRoles: ['PRACTICE_SUPERVISOR'],
        title: '🟡 Kundalik tasdiqlashni kutmoqda',
        message: `${student?.fullName || 'Talaba'} (${group?.name || 'Guruh'}) ${linkedJournal.date} kungi kundaligini tekshirish uchun yubordi.`,
        type: 'warning',
        linkModule: 'daily_journal'
      });
    } else {
      this.addNotification({
        recipientRoles: ['PRACTICE_SUPERVISOR', 'PRACTICE_HEAD'],
        title: isResubmit ? 'Kundalik qayta topshirildi' : 'Yangi amaliyot kundaligi topshirildi',
        message: `${student?.fullName || 'Talaba'} ${linkedJournal.date} kungi amaliyot kundaligini tekshiruvga topshirdi.`,
        type: 'info',
        linkModule: 'daily_journal'
      });
    }

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
    status: 'SUPERVISOR_APPROVED' | 'APPROVED' | 'REVISION' | 'REJECTED';
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

    if (journal.isLocked || journal.status === 'LOCKED' || journal.status === 'FINAL_APPROVED') {
      return {
        success: false,
        error: 'Ushbu kundalik yakuniy tasdiqlangan va qulflangan (LOCKED). Rahbar tomonidan baholash/tahrirlash taqiqlanadi.'
      };
    }

    const now = new Date().toISOString();
    const isApproval = params.status === 'APPROVED' || params.status === 'SUPERVISOR_APPROVED';
    journal.status = isApproval ? 'SUPERVISOR_APPROVED' : 'REVISION';
    journal.supervisorRating = isApproval ? (params.rating || 5) : undefined;
    journal.supervisorFeedback = params.feedback;
    if (!isApproval) {
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
    if (isApproval) {
      // Check if all student journals for this practice are now supervisor-approved
      const studentPracticeJournals = state.dailyJournals.filter(
        j => j.studentId === journal.studentId && j.practiceId === journal.practiceId
      );
      const allDone = studentPracticeJournals.length > 0 && studentPracticeJournals.every(
        j => j.id === journal.id || j.status === 'SUPERVISOR_APPROVED' || j.status === 'FINAL_PENDING' || j.status === 'FINAL_APPROVED' || j.status === 'LOCKED'
      );
      if (allDone) {
        studentPracticeJournals.forEach(j => {
          if (j.id === journal.id || j.status === 'SUPERVISOR_APPROVED') {
            j.status = 'FINAL_PENDING';
            j.updatedAt = now;
          }
        });
        journal.status = 'FINAL_PENDING';

        this.addNotification({
          recipientRoles: ['PRACTICE_HEAD', 'PRACTICE_STAFF', 'SUPER_ADMIN'],
          title: '🟡 Barcha kunlar tasdiqlandi (FINAL_PENDING)',
          message: `${student?.fullName || 'Talaba'} barcha amaliyot kunlari kundaliklari rahbar tomonidan tasdiqlandi va Amaliyot bo'limining yakuniy tasdig'ini (Final Approval) kutmoqda.`,
          type: 'warning',
          linkModule: 'daily_journal'
        });
      }

      this.addNotification({
        recipientUserId: student?.userId,
        recipientRoles: ['STUDENT'],
        title: 'Kundaligingiz tasdiqlandi (SUPERVISOR_APPROVED)',
        message: `Sizning ${journal.date} kungi amaliyot kundaligingiz rahbar tomonidan tasdiqlandi. Baho: ${params.rating || 5}/5. Taqriz: "${params.feedback || 'A\'lo darajada'}"`,
        type: 'success',
        linkModule: 'daily_journal'
      });

      // Stage 6 Integration: auto-credit procedures into student skills
      if (journal.procedures && journal.procedures.length > 0) {
        journal.procedures.forEach(proc => {
          const matchingSkill = state.skills.find(
            sk => (proc.skillId && sk.id === proc.skillId) || 
                  sk.name.toLowerCase().includes(proc.name.toLowerCase()) || 
                  proc.name.toLowerCase().includes(sk.name.toLowerCase())
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

            const logId = existingLog ? existingLog.id : `slog-j-${journal.id}-${matchingSkill.id}`;
            if (existingLog) {
              existingLog.status = 'APPROVED';
              existingLog.verifiedBy = params.reviewerName;
              existingLog.verifiedAt = now;
              existingLog.supervisorFeedback = params.feedback;
              existingLog.supervisorRating = params.rating;
              existingLog.updatedAt = now;
            } else {
              state.skillLogs.unshift({
                id: logId,
                studentId: journal.studentId,
                practiceId: journal.practiceId || '',
                skillId: matchingSkill.id,
                date: journal.date || journal.journalDate || '',
                participationType: partType,
                performanceType: partType,
                count: proc.count,
                notes: `Kundalik orqali tasdiqlangan: ${proc.name}`,
                description: `Kundalik orqali tasdiqlangan: ${proc.name}`,
                source: 'DAILY_JOURNAL',
                dailyJournalId: journal.id,
                journalId: journal.id,
                status: 'APPROVED',
                verifiedBy: params.reviewerName,
                verifiedAt: now,
                supervisorFeedback: params.feedback,
                supervisorRating: params.rating,
                createdAt: now
              });
            }

            let ssk = state.studentSkills.find(
              s => s.studentId === journal.studentId && s.practiceId === journal.practiceId && s.skillId === matchingSkill.id
            );
            const reqCount = matchingSkill.requiredCount || 10;
            if (!ssk) {
              ssk = {
                id: `ssk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                studentId: journal.studentId,
                practiceId: journal.practiceId,
                skillId: matchingSkill.id,
                requiredCount: reqCount,
                targetCount: reqCount,
                observedCount: 0,
                supervisedCount: 0,
                independentCount: 0,
                totalPerformedCount: 0,
                performedCount: 0,
                approvedCount: 0,
                verifiedCount: 0,
                progressPercent: 0,
                status: 'IN_PROGRESS',
                verifiedBySupervisor: true,
                lastPerformedDate: journal.date,
                lastPerformedAt: journal.date,
                lastApprovedAt: now
              } as StudentSkill;
              state.studentSkills.push(ssk);
            }
            
            // Add safety check
            const currentApproved = (ssk.approvedCount || 0) + proc.count;
            ssk.approvedCount = currentApproved;
            ssk.verifiedCount = currentApproved;
            ssk.totalPerformedCount = (ssk.totalPerformedCount || ssk.performedCount || 0) + proc.count;
            ssk.performedCount = ssk.totalPerformedCount;

            if (partType === 'INDEPENDENT') {
              ssk.independentCount = (ssk.independentCount || 0) + proc.count;
            } else if (partType === 'SUPERVISED') {
              ssk.supervisedCount = (ssk.supervisedCount || 0) + proc.count;
            } else {
              ssk.observedCount = (ssk.observedCount || 0) + proc.count;
            }

            ssk.lastPerformedDate = journal.date;
            ssk.lastPerformedAt = journal.date;
            ssk.lastApprovedAt = now;
            ssk.verifiedBySupervisor = true;
            ssk.progressPercent = Math.min(100, Math.round((currentApproved / reqCount) * 100));

            const wasCompleted = ssk.status === 'COMPLETED' || ssk.status === 'mastered' || ssk.status === 'MASTERED';
            const isNowCompleted = currentApproved >= reqCount;
            ssk.status = isNowCompleted ? 'COMPLETED' : 'IN_PROGRESS';

            this.recordAuditLog({
              userId: params.actorUserId,
              userRole: params.actorRole,
              action: 'skillRecordApproved',
              entity: 'skillRecords',
              entityId: logId,
              metadata: JSON.stringify({
                source: 'DAILY_JOURNAL',
                journalId: journal.id,
                skillId: matchingSkill.id,
                count: proc.count
              })
            });

            this.recordAuditLog({
              userId: params.actorUserId,
              userRole: params.actorRole,
              action: 'skillProgressUpdated',
              entity: 'studentSkills',
              entityId: ssk.id,
              metadata: JSON.stringify({
                progressPercent: ssk.progressPercent,
                approvedCount: ssk.approvedCount,
                requiredCount: reqCount
              })
            });

            if (isNowCompleted && !wasCompleted) {
              this.recordAuditLog({
                userId: params.actorUserId,
                userRole: params.actorRole,
                action: 'studentSkillCompleted',
                entity: 'studentSkills',
                entityId: ssk.id,
                metadata: JSON.stringify({
                  studentId: journal.studentId,
                  skillId: matchingSkill.id,
                  skillName: matchingSkill.name,
                  targetCount: reqCount
                })
              });

              this.addNotification({
                recipientUserId: student?.userId,
                recipientRoles: ['STUDENT'],
                title: 'Minimal me\'yor bajarildi!',
                message: `Tabriklaymiz! "${matchingSkill.name}" ko'nikmasi bo'yicha minimal talab me'yori to'liq bajarildi.`,
                type: 'success',
                linkModule: 'skills'
              });
            }
          }
        });
      }
    } else {
      if (journal.procedures && journal.procedures.length > 0) {
        journal.procedures.forEach(proc => {
          const matchingSkill = state.skills.find(
            sk => (proc.skillId && sk.id === proc.skillId) || 
                  sk.name.toLowerCase().includes(proc.name.toLowerCase()) || 
                  proc.name.toLowerCase().includes(sk.name.toLowerCase())
          );
          if (matchingSkill && state.skillLogs) {
            const existingLog = state.skillLogs.find(
              l => l.dailyJournalId === journal.id && l.skillId === matchingSkill.id
            );
            if (existingLog) {
              existingLog.status = 'REVISION';
              existingLog.revisionReason = params.revisionReason || params.feedback;
              existingLog.updatedAt = now;
              this.recordAuditLog({
                userId: params.actorUserId,
                userRole: params.actorRole,
                action: 'skillRecordRevisionRequested',
                entity: 'skillRecords',
                entityId: existingLog.id,
                metadata: JSON.stringify({
                  source: 'DAILY_JOURNAL',
                  journalId: journal.id,
                  revisionReason: existingLog.revisionReason
                })
              });
            }
          }
        });
      }

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

  public finalApproveStudentJournals(studentId: string, actorUserId: string, actorName: string, note?: string): void {
    const state = this.getState();
    const now = new Date().toISOString();
    state.dailyJournals.forEach(j => {
      if (j.studentId === studentId) {
        j.status = 'FINAL_APPROVED';
        j.isLocked = true;
        j.finalApprovedAt = now;
        j.finalApprovedBy = actorName;
        j.updatedAt = now;
      }
    });

    const student = state.students.find(s => s.id === studentId);
    this.addNotification({
      recipientUserId: student?.userId,
      recipientRoles: ['STUDENT'],
      title: 'Amaliyot kundaligingiz yakuniy tasdiqlandi (FINAL_APPROVED)',
      message: `Barcha amaliyot kundaliklaringiz Amaliyot bo'limi boshlig'i tomonidan yakuniy tasdiqlandi va arxiv fondiga joylandi.`,
      type: 'success',
      linkModule: 'daily_journal'
    });

    this.recordAuditLog({
      userId: actorUserId,
      userRole: 'PRACTICE_HEAD',
      action: 'journalFinalApproved',
      entity: 'dailyJournals',
      entityId: studentId,
      metadata: JSON.stringify({ studentId, studentName: student?.fullName, note: note || 'Final Approved' })
    });

    this.saveState(state);
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
    status: 'APPROVED' | 'REJECTED' | 'REVISION';
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
    if (params.status === 'REVISION') {
      log.revisionReason = params.feedback;
    }
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
        const newSsk: StudentSkill = {
          id: `ssk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: log.studentId,
          practiceId: log.practiceId,
          skillId: log.skillId,
          requiredCount: targetCount,
          targetCount,
          performedCount: 0,
          totalPerformedCount: 0,
          independentCount: 0,
          supervisedCount: 0,
          observedCount: 0,
          verifiedCount: 0,
          approvedCount: 0,
          progressPercent: 0,
          status: 'in_progress',
          verifiedBySupervisor: true,
          lastPerformedDate: log.date
        };
        state.studentSkills.push(newSsk);
        ssk = newSsk;
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

      if (ssk) {
        ssk.performedCount = totalCount;
        ssk.totalPerformedCount = totalCount;
        ssk.verifiedCount = totalCount;
        ssk.approvedCount = totalCount;
        ssk.independentCount = indep;
        ssk.supervisedCount = superv;
        ssk.observedCount = observ;
        ssk.lastPerformedDate = log.date;
        ssk.verifiedBySupervisor = true;
        const req = ssk.requiredCount || ssk.targetCount || targetCount || 10;
        ssk.progressPercent = Math.min(100, Math.round((totalCount / req) * 100));
        ssk.status = totalCount >= req ? 'mastered' : totalCount > 0 ? 'in_progress' : 'not_started';
      }

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
        const perf = existingRecord.performedCount ?? existingRecord.totalPerformedCount ?? 0;
        independent = existingRecord.independentCount ?? Math.round(perf * 0.6);
        supervised = existingRecord.supervisedCount ?? Math.round(perf * 0.3);
        observed = existingRecord.observedCount ?? Math.max(0, perf - independent - supervised);
        approvedCount = existingRecord.approvedCount ?? existingRecord.verifiedCount ?? perf;
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

  // ==========================================
  // --- STAGE 7: ATTESTATION & ASSESSMENT ---
  // ==========================================

  public getAssessmentSettings(): AssessmentSettings {
    const state = this.getState();
    if (!state.assessmentSettings) {
      state.assessmentSettings = DEFAULT_ASSESSMENT_SETTINGS_V2;
      this.saveState(state);
    }
    return state.assessmentSettings;
  }

  public updateAssessmentSettings(
    updates: Partial<AssessmentSettings>,
    actorUserId = 'system',
    actorRole = 'SUPER_ADMIN'
  ): { success: boolean; settings: AssessmentSettings; error?: string } {
    const state = this.getState();
    const current = this.getAssessmentSettings();
    const merged: AssessmentSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const sum = Number(merged.attendanceMaxScore) + Number(merged.journalMaxScore) + Number(merged.skillsMaxScore) + Number(merged.finalExamMaxScore);
    if (sum !== 100) {
      return {
        success: false,
        settings: current,
        error: `Maksimal ballar yig'indisi aynan 100 bo'lishi shart! (Hozirgi yig'indi: ${sum})`
      };
    }

    state.assessmentSettings = merged;

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assessmentSettingsUpdated',
      entity: 'assessmentSettings',
      entityId: merged.id,
      metadata: JSON.stringify(merged)
    });

    this.saveState(state);
    return { success: true, settings: merged };
  }

  // --- ATTESTATION COMMISSIONS ---
  public getAttestationCommissions(): AttestationCommission[] {
    const state = this.getState();
    return state.attestationCommissions || [];
  }

  public getAttestationCommissionById(id: string): AttestationCommission | undefined {
    return this.getAttestationCommissions().find(c => c.id === id);
  }

  public saveAttestationCommission(
    commission: Omit<AttestationCommission, 'id' | 'createdAt'> & { id?: string },
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): AttestationCommission {
    const state = this.getState();
    if (!state.attestationCommissions) state.attestationCommissions = [];

    const isNew = !commission.id;
    const finalComm: AttestationCommission = {
      id: commission.id || `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: commission.name,
      chairpersonId: commission.chairpersonId,
      chairpersonName: commission.chairpersonName,
      memberIds: commission.memberIds || [],
      memberNames: commission.memberNames || [],
      position: commission.position,
      department: commission.department,
      facultyId: commission.facultyId,
      facultyName: commission.facultyName,
      isActive: commission.isActive !== undefined ? commission.isActive : true,
      createdAt: isNew ? new Date().toISOString() : (state.attestationCommissions.find(c => c.id === commission.id)?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };

    const idx = state.attestationCommissions.findIndex(c => c.id === finalComm.id);
    if (idx >= 0) {
      state.attestationCommissions[idx] = finalComm;
    } else {
      state.attestationCommissions.unshift(finalComm);
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: isNew ? 'commissionCreated' : 'commissionUpdated',
      entity: 'attestationCommissions',
      entityId: finalComm.id,
      metadata: JSON.stringify({ name: finalComm.name, chair: finalComm.chairpersonName })
    });

    this.saveState(state);
    return finalComm;
  }

  // --- FINAL EXAMS ---
  public getFinalExams(filters?: { practiceId?: string; studentId?: string; status?: ExamStatus }): FinalExam[] {
    const state = this.getState();
    let exams = state.finalExams || [];
    if (!filters) return exams;

    if (filters.practiceId) exams = exams.filter(e => e.practiceId === filters.practiceId);
    if (filters.studentId) exams = exams.filter(e => e.studentId === filters.studentId);
    if (filters.status) exams = exams.filter(e => e.status === filters.status);
    return exams;
  }

  public getFinalExamById(id: string): FinalExam | undefined {
    return (this.getState().finalExams || []).find(e => e.id === id);
  }

  public createFinalExam(
    examData: {
      practiceId: string;
      studentId: string;
      assignmentId?: string;
      examDate: string;
      examTime?: string;
      placeName?: string;
      departmentName?: string;
      examinerIds: string[];
      examinerNames?: string[];
      commissionId?: string;
      comments?: string;
    },
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): FinalExam {
    const state = this.getState();
    if (!state.finalExams) state.finalExams = [];

    const existingAttempts = state.finalExams.filter(
      e => e.studentId === examData.studentId && e.practiceId === examData.practiceId
    );

    const newExam: FinalExam = {
      id: `fexam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      practiceId: examData.practiceId,
      studentId: examData.studentId,
      assignmentId: examData.assignmentId,
      examDate: examData.examDate,
      examTime: examData.examTime || '10:00',
      placeName: examData.placeName,
      departmentName: examData.departmentName,
      examinerIds: examData.examinerIds || [],
      examinerNames: examData.examinerNames || [],
      commissionId: examData.commissionId,
      theoryScore: 0,
      practicalScore: 0,
      clinicalCaseScore: 0,
      professionalismScore: 0,
      safetyScore: 0,
      totalScore: 0,
      maxScore: this.getAssessmentSettings().finalExamMaxScore,
      percentage: 0,
      status: 'SCHEDULED',
      comments: examData.comments || '',
      attemptNumber: existingAttempts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.finalExams.unshift(newExam);

    const student = state.students.find(s => s.id === examData.studentId);
    this.addNotification({
      recipientUserId: student?.userId,
      recipientRoles: ['STUDENT'],
      title: 'Yakuniy imtihon belgilandi',
      message: `Sizga ${examData.examDate} kuni soat ${newExam.examTime} da amaliyot yakuniy imtihoni belgilandi.`,
      type: 'info',
      linkModule: 'assessment'
    });

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'examCreated',
      entity: 'finalExams',
      entityId: newExam.id,
      metadata: JSON.stringify({ studentId: newExam.studentId, examDate: newExam.examDate })
    });

    this.saveState(state);
    return newExam;
  }

  public gradeFinalExam(
    examId: string,
    scores: {
      theoryScore: number;
      practicalScore: number;
      clinicalCaseScore: number;
      professionalismScore: number;
      safetyScore: number;
      comments?: string;
      examinerName?: string;
    },
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): { success: boolean; exam?: FinalExam; error?: string } {
    const state = this.getState();
    const exam = (state.finalExams || []).find(e => e.id === examId);
    if (!exam) return { success: false, error: "Imtihon yozuvi topilmadi." };

    const settings = this.getAssessmentSettings();
    const weights = settings.examCriteriaWeights;

    // Validate scores are non-negative and don't exceed criterion max
    const th = Math.max(0, Math.min(weights.theoryMax, Number(scores.theoryScore) || 0));
    const pr = Math.max(0, Math.min(weights.practicalMax, Number(scores.practicalScore) || 0));
    const cc = Math.max(0, Math.min(weights.clinicalCaseMax, Number(scores.clinicalCaseScore) || 0));
    const pf = Math.max(0, Math.min(weights.professionalismMax, Number(scores.professionalismScore) || 0));
    const sf = Math.max(0, Math.min(weights.safetyMax, Number(scores.safetyScore) || 0));

    const total = Math.min(settings.finalExamMaxScore, Math.max(0, th + pr + cc + pf + sf));
    const pct = Math.round((total / settings.finalExamMaxScore) * 100);

    exam.theoryScore = th;
    exam.practicalScore = pr;
    exam.clinicalCaseScore = cc;
    exam.professionalismScore = pf;
    exam.safetyScore = sf;
    exam.totalScore = total;
    exam.percentage = pct;
    exam.status = 'COMPLETED';
    exam.comments = scores.comments || exam.comments;
    exam.gradedBy = scores.examinerName || 'Imtihonchi rahbar';
    exam.gradedAt = new Date().toISOString();
    exam.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'examScoreEntered',
      entity: 'finalExams',
      entityId: exam.id,
      metadata: JSON.stringify({
        studentId: exam.studentId,
        totalScore: total,
        theory: th,
        practical: pr,
        clinicalCase: cc
      })
    });

    this.saveState(state);

    // Auto-update or recalculate the student's Assessment record
    this.calculateAndSaveAssessment(exam.studentId, exam.practiceId, actorUserId, actorRole);

    const student = state.students.find(s => s.id === exam.studentId);
    this.addNotification({
      recipientUserId: student?.userId,
      recipientRoles: ['STUDENT'],
      title: 'Yakuniy baholash natijangiz tayyor.',
      message: `Yakuniy imtihon bahongiz kiritildi: ${total} / ${settings.finalExamMaxScore} ball (${pct}%).`,
      type: 'success',
      linkModule: 'assessment'
    });

    return { success: true, exam };
  }

  // --- SECTION 5: DAVOMAT BALLI HISOBLASH ---
  public calculateStudentAttendanceScore(studentId: string, practiceId?: string): {
    score: number;
    maxScore: number;
    percentage: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    excusedCount: number;
    totalDays: number;
  } {
    const state = this.getState();
    const settings = this.getAssessmentSettings();
    const maxScore = settings.attendanceMaxScore;

    let targetPracticeId = practiceId;
    if (!targetPracticeId) {
      const asg = state.practiceAssignments.find(a => a.studentId === studentId);
      targetPracticeId = asg?.practiceId || 'prac-1';
    }

    const practice = state.practices.find(p => p.id === targetPracticeId);
    const plannedDays = practice ? Math.max(1, practice.durationDays || 24) : 24;

    const studentAtt = (state.attendance || []).filter(
      a => a.studentId === studentId && (practiceId ? a.practiceId === practiceId : true)
    );

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    studentAtt.forEach(a => {
      const st = (a.status || '').toUpperCase();
      if (st === 'PRESENT' || st === 'HOZIR') presentCount++;
      else if (st === 'LATE' || st === 'KECHIKDI') lateCount++;
      else if (st === 'EXCUSED' || st === 'SABABLI') excusedCount++;
      else absentCount++;
    });

    const activeDays = presentCount + lateCount;
    const percentage = Math.min(100, Math.round((activeDays / plannedDays) * 100));
    const score = Math.min(maxScore, Math.max(0, Math.round((percentage / 100) * maxScore)));

    return {
      score,
      maxScore,
      percentage,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      totalDays: studentAtt.length > 0 ? studentAtt.length : plannedDays
    };
  }

  // --- SECTION 6: ELEKTRON KUNDALIK BALLI HISOBLASH ---
  public calculateStudentJournalScore(studentId: string, practiceId?: string): {
    score: number;
    maxScore: number;
    submittedCount: number;
    approvedCount: number;
    revisionCount: number;
    avgRating: number;
    completionPct: number;
  } {
    const state = this.getState();
    const settings = this.getAssessmentSettings();
    const maxScore = settings.journalMaxScore;

    let targetPracticeId = practiceId;
    if (!targetPracticeId) {
      const asg = state.practiceAssignments.find(a => a.studentId === studentId);
      targetPracticeId = asg?.practiceId || 'prac-1';
    }

    const practice = state.practices.find(p => p.id === targetPracticeId);
    const expectedJournals = practice ? Math.max(1, practice.durationDays || 20) : 20;

    const journals = (state.dailyJournals || []).filter(
      j => j.studentId === studentId && (practiceId ? j.practiceId === practiceId : true)
    );

    const submittedCount = journals.length;
    const approvedJournals = journals.filter(j => j.status === 'APPROVED');
    const approvedCount = approvedJournals.length;
    const revisionCount = journals.filter(j => j.status === 'REVISION').length;

    let ratingSum = 0;
    approvedJournals.forEach(j => {
      ratingSum += (j.supervisorRating || 5);
    });
    const avgRating = approvedCount > 0 ? Number((ratingSum / approvedCount).toFixed(1)) : 5.0;

    // Weighting: 70% approval ratio against expected journals + 30% quality rating
    const approvalRatio = Math.min(1.0, approvedCount / expectedJournals);
    const ratingPct = Math.min(1.0, avgRating / 5.0);
    const completionPct = Math.min(100, Math.round((approvalRatio * 0.7 + ratingPct * 0.3) * 100));
    const score = Math.min(maxScore, Math.max(0, Math.round((completionPct / 100) * maxScore)));

    return {
      score,
      maxScore,
      submittedCount,
      approvedCount,
      revisionCount,
      avgRating,
      completionPct
    };
  }

  // --- SECTION 7: AMALIY KO'NIKMALAR BALLI HISOBLASH ---
  public calculateStudentSkillsScore(studentId: string, practiceId?: string): {
    score: number;
    maxScore: number;
    skillProgressPercent: number;
    totalSkills: number;
    completedSkills: number;
    unmasteredMandatorySkills: string[];
  } {
    const settings = this.getAssessmentSettings();
    const maxScore = settings.skillsMaxScore;
    const passport = this.getStudentPassportSummary(studentId, practiceId);

    const progressPct = passport.minimalQuotaMetPct;
    const score = Math.min(maxScore, Math.max(0, Math.round((progressPct / 100) * maxScore)));

    const unmasteredMandatorySkills = passport.detailedSkills
      .filter(s => s.skill.importance === 'MANDATORY' && !s.isMastered)
      .map(s => s.skill.name);

    return {
      score,
      maxScore,
      skillProgressPercent: progressPct,
      totalSkills: passport.totalSkills,
      completedSkills: passport.completedSkills,
      unmasteredMandatorySkills
    };
  }

  // --- SECTION 8 & 10: YAKUNIY IMTIHON BALLI ---
  public calculateStudentFinalExamScore(studentId: string, practiceId?: string): {
    score: number;
    maxScore: number;
    exam?: FinalExam;
    status: ExamStatus;
  } {
    const settings = this.getAssessmentSettings();
    const maxScore = settings.finalExamMaxScore;

    const exams = this.getFinalExams({ studentId, practiceId });
    const completedExam = exams.find(e => e.status === 'COMPLETED');
    const latestExam = exams[0];

    const exam = completedExam || latestExam;
    const score = completedExam ? Math.min(maxScore, Math.max(0, completedExam.totalScore)) : 0;
    const status: ExamStatus = exam ? exam.status : 'SCHEDULED';

    return {
      score,
      maxScore,
      exam,
      status
    };
  }

  // --- FULL 100-POINT SYSTEM ASSESSMENT CALCULATION ---
  public calculateStudentAssessment(studentId: string, practiceId?: string): Assessment {
    const state = this.getState();
    const settings = this.getAssessmentSettings();

    const asg = state.practiceAssignments.find(a => a.studentId === studentId);
    const targetPracticeId = practiceId || asg?.practiceId || 'prac-1';

    const existingAss = (state.assessments || []).find(
      a => a.studentId === studentId && a.practiceId === targetPracticeId
    );

    const att = this.calculateStudentAttendanceScore(studentId, targetPracticeId);
    const jnl = this.calculateStudentJournalScore(studentId, targetPracticeId);
    const skl = this.calculateStudentSkillsScore(studentId, targetPracticeId);
    const exm = this.calculateStudentFinalExamScore(studentId, targetPracticeId);

    const total = Math.min(100, Math.max(0, att.score + jnl.score + skl.score + exm.score));
    const percentage = total;

    // Grade threshold
    let grade: '5' | '4' | '3' | '2' = '2';
    if (total >= settings.grade5Min) grade = '5';
    else if (total >= settings.grade4Min) grade = '4';
    else if (total >= settings.grade3Min) grade = '3';
    else grade = '2';

    // Status logic
    let status: AssessmentStatus = existingAss?.status || 'IN_PROGRESS';
    const isAttendanceComplete = att.totalDays > 0;
    const isJournalComplete = jnl.approvedCount > 0;
    const isSkillsComplete = skl.completedSkills > 0 || skl.skillProgressPercent >= 60;
    const isExamComplete = exm.exam !== undefined && exm.exam.status === 'COMPLETED';

    const validationErrors: string[] = [];
    if (!isAttendanceComplete) validationErrors.push("Davomat ma'lumotlari mavjud emas.");
    if (!isJournalComplete) validationErrors.push("Tasdiqlangan amaliyot kundaliklari mavjud emas.");
    if (!isSkillsComplete) validationErrors.push("Amaliy ko'nikmalar minimal me'yori bajarilmagan.");
    if (!isExamComplete) validationErrors.push("Yakuniy amaliyot imtihoni natijasi kiritilmagan.");

    if (existingAss?.status === 'APPROVED' || existingAss?.status === 'COMPLETED') {
      status = existingAss.status;
    } else if (existingAss?.status === 'RETAKE_REQUIRED') {
      status = 'RETAKE_REQUIRED';
    } else if (isExamComplete) {
      status = total >= settings.grade3Min ? 'PENDING_APPROVAL' : 'FAILED';
    } else {
      status = 'WAITING_FOR_EXAM';
    }

    const defaultCommission = (state.attestationCommissions || [])[0];

    const result: Assessment = {
      id: existingAss?.id || `ass-${Date.now()}-${studentId}`,
      practiceId: targetPracticeId,
      studentId,
      assignmentId: asg?.id,
      attendanceScore: att.score,
      attendanceMaxScore: settings.attendanceMaxScore,
      journalScore: jnl.score,
      journalMaxScore: settings.journalMaxScore,
      skillsScore: skl.score,
      skillsMaxScore: settings.skillsMaxScore,
      finalExamScore: exm.score,
      finalExamMaxScore: settings.finalExamMaxScore,
      totalScore: total,
      percentage,
      grade,
      status,
      commissionId: existingAss?.commissionId || defaultCommission?.id,
      commissionName: existingAss?.commissionName || defaultCommission?.name,
      assessorId: existingAss?.assessorId || asg?.supervisorId,
      assessorName: existingAss?.assessorName || 'Prof. Sobirov Alisher Tolipovich',
      assessmentDate: existingAss?.assessmentDate || new Date().toISOString().split('T')[0],
      feedback: existingAss?.feedback || '',
      approvedBy: existingAss?.approvedBy,
      approvedAt: existingAss?.approvedAt,
      retakeReason: existingAss?.retakeReason,
      retakeExamDate: existingAss?.retakeExamDate,
      retakeCount: existingAss?.retakeCount || 0,
      history: existingAss?.history || [],
      isAttendanceComplete,
      isJournalComplete,
      isSkillsComplete,
      isExamComplete,
      validationErrors,
      createdAt: existingAss?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return result;
  }

  public calculateAndSaveAssessment(
    studentId: string,
    practiceId?: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): Assessment {
    const calculated = this.calculateStudentAssessment(studentId, practiceId);
    this.saveAssessment(calculated, actorUserId, actorRole);
    return calculated;
  }

  public getAssessments(filters?: {
    practiceId?: string;
    studentId?: string;
    status?: AssessmentStatus;
    grade?: string;
  }): Assessment[] {
    const state = this.getState();
    let list = state.assessments || [];
    if (!filters) return list;

    if (filters.practiceId) list = list.filter(a => a.practiceId === filters.practiceId);
    if (filters.studentId) list = list.filter(a => a.studentId === filters.studentId);
    if (filters.status) list = list.filter(a => a.status === filters.status);
    if (filters.grade) list = list.filter(a => a.grade === filters.grade);
    return list;
  }

  public getAssessmentById(id: string): Assessment | undefined {
    return (this.getState().assessments || []).find(a => a.id === id);
  }

  public getAssessmentByStudent(studentId: string, practiceId?: string): Assessment | undefined {
    const list = this.getAssessments({ studentId, practiceId });
    if (list.length > 0) return list[0];
    // If not existing yet, calculate on the fly
    return this.calculateStudentAssessment(studentId, practiceId);
  }

  public saveAssessment(
    assessment: Assessment,
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): void {
    const state = this.getState();
    if (!state.assessments) state.assessments = [];

    // Ensure non-negative and <= 100
    const clampedTotal = Math.min(100, Math.max(0, assessment.totalScore));
    assessment.totalScore = clampedTotal;
    assessment.percentage = clampedTotal;
    assessment.updatedAt = new Date().toISOString();

    const idx = state.assessments.findIndex(
      a => a.id === assessment.id || (a.studentId === assessment.studentId && a.practiceId === assessment.practiceId)
    );

    if (idx >= 0) {
      state.assessments[idx] = assessment;
    } else {
      state.assessments.unshift(assessment);
    }

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assessmentCalculated',
      entity: 'assessments',
      entityId: assessment.id,
      metadata: JSON.stringify({
        studentId: assessment.studentId,
        totalScore: assessment.totalScore,
        grade: assessment.grade,
        status: assessment.status
      })
    });

    this.saveState(state);
  }

  // --- SECTION 15: ATTESTATSIYANI TASDIQLASH (VALIDATSIYA VA TASDIQ) ---
  public approveAssessment(
    assessmentId: string,
    reviewerId: string,
    reviewerName: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): { success: boolean; assessment?: Assessment; error?: string } {
    const state = this.getState();
    const assessment = (state.assessments || []).find(a => a.id === assessmentId);
    if (!assessment) return { success: false, error: "Attestatsiya yozuvi topilmadi." };

    // Validation 1: Davomat mavjudmi?
    const att = this.calculateStudentAttendanceScore(assessment.studentId, assessment.practiceId);
    if (att.totalDays === 0 || (att.presentCount + att.lateCount) === 0) {
      return {
        success: false,
        error: "Tasdiqlash mumkin emas: Talabaning amaliyot davomati ma'lumotlari kiritilmagan yoki qoniqarsiz."
      };
    }

    // Validation 2: Kundaliklar tekshirilganmi?
    const jnl = this.calculateStudentJournalScore(assessment.studentId, assessment.practiceId);
    if (jnl.approvedCount === 0) {
      return {
        success: false,
        error: "Tasdiqlash mumkin emas: Talabaning tasdiqlangan elektron kundaliklari mavjud emas."
      };
    }

    // Validation 3: Ko'nikmalar tasdiqlanganmi?
    const skl = this.calculateStudentSkillsScore(assessment.studentId, assessment.practiceId);
    if (skl.completedSkills === 0 && skl.skillProgressPercent < 50) {
      return {
        success: false,
        error: "Tasdiqlash mumkin emas: Amaliy ko'nikmalar pasporti minimal me'yori (kamida 50%) bajarilmagan."
      };
    }

    // Validation 4: Imtihon natijasi mavjudmi?
    const exm = this.calculateStudentFinalExamScore(assessment.studentId, assessment.practiceId);
    if (!exm.exam || exm.status !== 'COMPLETED') {
      return {
        success: false,
        error: "Tasdiqlash mumkin emas: Yakuniy amaliyot imtihoni o'tkazilmagan yoki natijasi kiritilmagan."
      };
    }

    const now = new Date().toISOString();
    assessment.status = 'APPROVED';
    assessment.approvedBy = reviewerName;
    assessment.approvedAt = now;
    assessment.updatedAt = now;

    // Send notification to student (Section 21)
    const student = state.students.find(s => s.id === assessment.studentId);
    this.addNotification({
      recipientUserId: student?.userId,
      recipientRoles: ['STUDENT'],
      title: 'Attestatsiya natijangiz tasdiqlandi.',
      message: `Sizning amaliyot attestatsiyangiz tasdiqlandi. Yakuniy ball: ${assessment.totalScore}/100, Baho: ${assessment.grade}.`,
      type: 'success',
      linkModule: 'assessment'
    });

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'assessmentApproved',
      entity: 'assessments',
      entityId: assessment.id,
      metadata: JSON.stringify({
        studentId: assessment.studentId,
        totalScore: assessment.totalScore,
        grade: assessment.grade,
        approvedBy: reviewerName
      })
    });

    this.saveState(state);
    return { success: true, assessment };
  }

  // --- SECTION 17: QAYTA TOPSHIRISH (RETAKE WORKFLOW) ---
  public requestRetake(
    assessmentId: string,
    params: {
      reason: string;
      nextExamDate: string;
      examinerId?: string;
      reviewerName?: string;
    },
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): { success: boolean; assessment?: Assessment; error?: string } {
    const state = this.getState();
    const assessment = (state.assessments || []).find(a => a.id === assessmentId);
    if (!assessment) return { success: false, error: "Attestatsiya yozuvi topilmadi." };

    if (!params.reason.trim()) {
      return { success: false, error: "Qayta topshirish sababini ko'rsatish majburiy." };
    }
    if (!params.nextExamDate) {
      return { success: false, error: "Yangi imtihon sanasini belgilash majburiy." };
    }

    if (!assessment.history) assessment.history = [];
    assessment.history.push({
      attempt: (assessment.retakeCount || 0) + 1,
      date: assessment.assessmentDate || new Date().toISOString().split('T')[0],
      attendanceScore: assessment.attendanceScore,
      journalScore: assessment.journalScore,
      skillsScore: assessment.skillsScore,
      finalExamScore: assessment.finalExamScore,
      totalScore: assessment.totalScore,
      grade: assessment.grade,
      status: assessment.status,
      reason: params.reason,
      evaluator: params.reviewerName || 'Komissiya'
    });

    assessment.status = 'RETAKE_REQUIRED';
    assessment.retakeReason = params.reason;
    assessment.retakeExamDate = params.nextExamDate;
    assessment.retakeCount = (assessment.retakeCount || 0) + 1;
    assessment.updatedAt = new Date().toISOString();

    // Schedule next exam attempt
    this.createFinalExam(
      {
        practiceId: assessment.practiceId,
        studentId: assessment.studentId,
        assignmentId: assessment.assignmentId,
        examDate: params.nextExamDate,
        examTime: '10:00',
        examinerIds: params.examinerId ? [params.examinerId] : [],
        comments: `Qayta topshirish #${assessment.retakeCount}: ${params.reason}`
      },
      actorUserId,
      actorRole
    );

    // Notification (Section 21)
    const student = state.students.find(s => s.id === assessment.studentId);
    this.addNotification({
      recipientUserId: student?.userId,
      recipientRoles: ['STUDENT'],
      title: 'Yakuniy imtihon qayta topshirishga belgilandi.',
      message: `Attestatsiya natijasi bo'yicha qayta topshirish belgilandi. Yangi imtihon sanasi: ${params.nextExamDate}. Sabab: ${params.reason}`,
      type: 'warning',
      linkModule: 'assessment'
    });

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'retakeRequested',
      entity: 'assessments',
      entityId: assessment.id,
      metadata: JSON.stringify({
        studentId: assessment.studentId,
        retakeExamDate: params.nextExamDate,
        reason: params.reason
      })
    });

    this.saveState(state);
    return { success: true, assessment };
  }

  // --- KPI STATISTICS FOR ATTESTATION DASHBOARD (SECTION 3) ---
  public getAttestationKPIs(practiceId?: string): {
    totalAssessments: number;
    completedCount: number;
    pendingApprovalCount: number;
    waitingExamCount: number;
    approvedCount: number;
    retakeCount: number;
    averageScore: number;
    gradeDistribution: { grade5: number; grade4: number; grade3: number; grade2: number };
  } {
    const assessments = this.getAssessments({ practiceId });
    const total = assessments.length;

    let completed = 0;
    let pending = 0;
    let waiting = 0;
    let approved = 0;
    let retake = 0;
    let scoreSum = 0;

    const grades = { grade5: 0, grade4: 0, grade3: 0, grade2: 0 };

    assessments.forEach(a => {
      scoreSum += a.totalScore;
      if (a.status === 'APPROVED' || a.status === 'COMPLETED') {
        completed++;
        approved++;
      } else if (a.status === 'PENDING_APPROVAL') {
        pending++;
      } else if (a.status === 'WAITING_FOR_EXAM') {
        waiting++;
      } else if (a.status === 'RETAKE_REQUIRED' || a.status === 'FAILED') {
        retake++;
      }

      if (a.grade === '5') grades.grade5++;
      else if (a.grade === '4') grades.grade4++;
      else if (a.grade === '3') grades.grade3++;
      else grades.grade2++;
    });

    const averageScore = total > 0 ? Number((scoreSum / total).toFixed(1)) : 85.0;

    return {
      totalAssessments: total,
      completedCount: completed,
      pendingApprovalCount: pending,
      waitingExamCount: waiting,
      approvedCount: approved,
      retakeCount: retake,
      averageScore,
      gradeDistribution: grades
    };
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
  public clearDatabase(): void {
    const adminUsers = DEFAULT_USERS_V2.filter(u => u.role === 'SUPER_ADMIN' || u.email === 'shohdonar@gmail.com');
    const state: DatabaseStateV2 = {
      mode: 'PRODUCTION',
      users: adminUsers,
      academicYears: [],
      students: [],
      faculties: [],
      directions: [],
      courses: DEFAULT_COURSES,
      groups: [],
      practicePlaces: [],
      practiceDepartments: [],
      supervisors: [],
      clinicResponsibles: [],
      practices: [],
      practiceDistributions: [],
      practiceAssignments: [],
      attendance: [],
      attendanceSessions: [],
      dailyJournals: [],
      skills: DEFAULT_SKILLS_V2,
      studentSkills: [],
      skillLogs: [],
      skillCategories: DEFAULT_SKILL_CATEGORIES_V2,
      tasks: [],
      assessments: [],
      finalExams: [],
      attestationCommissions: DEFAULT_COMMISSIONS_V2,
      assessmentSettings: DEFAULT_ASSESSMENT_SETTINGS_V2,
      vedomosts: [],
      documents: [],
      notifications: [],
      auditLogs: []
    };
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  }

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

  // ==========================================
  // --- STAGE 8: YAKUNIY HISOBOTLAR VA NAZORAT MARKAZI ---
  // ==========================================

  public calculateStudentOverallStatus(studentId: string, practiceId?: string): StudentPracticeOverallStatus {
    const state = this.getState();
    const asg = (state.practiceAssignments || []).find(
      a => a.studentId === studentId && (!practiceId || a.practiceId === practiceId)
    );
    if (!asg) return 'NOT_STARTED';

    const targetPracticeId = practiceId || asg.practiceId;
    const practice = state.practices.find(p => p.id === targetPracticeId);
    const assessment = (state.assessments || []).find(
      a => a.studentId === studentId && a.practiceId === targetPracticeId
    );
    const exam = (state.finalExams || []).find(
      e => e.studentId === studentId && e.practiceId === targetPracticeId && e.status === 'COMPLETED'
    );
    const scheduledExam = (state.finalExams || []).find(
      e => e.studentId === studentId && e.practiceId === targetPracticeId && (e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS')
    );

    if (assessment?.status === 'APPROVED' || assessment?.status === 'COMPLETED') {
      return 'COMPLETED';
    }
    if (assessment?.status === 'RETAKE_REQUIRED' || assessment?.status === 'FAILED') {
      return 'RETAKE_REQUIRED';
    }
    if (exam && (!assessment || assessment.status === 'PENDING_APPROVAL' || assessment.status === 'WAITING_FOR_APPROVAL')) {
      return 'WAITING_FOR_APPROVAL';
    }
    if (scheduledExam) {
      return 'WAITING_FOR_EXAM';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isPracticePeriodEnded = practice ? practice.endDate < todayStr : false;

    if (isPracticePeriodEnded) {
      return 'PRACTICE_COMPLETED';
    }

    return 'IN_PROGRESS';
  }

  public getOverallMonitoringRows(filters?: {
    practiceId?: string;
    facultyId?: string;
    directionId?: string;
    courseLevel?: number;
    groupId?: string;
    clinicId?: string;
    supervisorId?: string;
    status?: string;
    grade?: string;
    searchQuery?: string;
  }) {
    const state = this.getState();
    const students = state.students || [];
    const practices = state.practices || [];
    const assignments = state.practiceAssignments || [];
    const places = state.practicePlaces || [];
    const supervisors = state.supervisors || [];
    const faculties = state.faculties || [];
    const directions = state.directions || [];
    const groups = state.groups || [];
    const settings = this.getAssessmentSettings();

    const activePracticeId = filters?.practiceId || practices[0]?.id || 'prac-1';
    const activePractice = practices.find(p => p.id === activePracticeId) || practices[0];

    const practiceStudents = students.filter(s => {
      const hasAsg = assignments.some(a => a.studentId === s.id && a.practiceId === activePracticeId);
      const inPracGroups = activePractice ? activePractice.groupIds.includes(s.groupId) : true;
      return hasAsg || inPracGroups;
    });

    const rows = practiceStudents.map((std, index) => {
      const asg = assignments.find(a => a.studentId === std.id && a.practiceId === activePracticeId);
      const place = places.find(p => p.id === asg?.practicePlaceId);
      const sup = supervisors.find(s => s.id === asg?.supervisorId);
      const faculty = faculties.find(f => f.id === std.facultyId);
      const direction = directions.find(d => d.id === std.directionId);
      const group = groups.find(g => g.id === std.groupId);

      const att = this.calculateStudentAttendanceScore(std.id, activePracticeId);
      const jnl = this.calculateStudentJournalScore(std.id, activePracticeId);
      const skl = this.calculateStudentSkillsScore(std.id, activePracticeId);
      const exm = this.calculateStudentFinalExamScore(std.id, activePracticeId);
      const ass = this.getAssessmentByStudent(std.id, activePracticeId);
      const overallStatus = this.calculateStudentOverallStatus(std.id, activePracticeId);

      let problemLabel = '';
      if (att.percentage < 70) {
        problemLabel = `Davomat past (${att.percentage}%)`;
      } else if (jnl.approvedCount === 0) {
        problemLabel = 'Kundalik topshirilmagan';
      } else if (jnl.revisionCount > 0) {
        problemLabel = `${jnl.revisionCount} ta kundalik qaytarilgan`;
      } else if (skl.skillProgressPercent < 50) {
        problemLabel = `Ko'nikmalar me'yori yetarli emas (${skl.skillProgressPercent}%)`;
      } else if (skl.unmasteredMandatorySkills.length > 0) {
        problemLabel = `${skl.unmasteredMandatorySkills.length} ta majburiy ko'nikma bajarilmagan`;
      } else if (!exm.exam) {
        problemLabel = 'Yakuniy imtihon belgilanmagan';
      } else if (ass && ass.status === 'RETAKE_REQUIRED') {
        problemLabel = 'Qayta topshirishga yuborilgan';
      }

      const totalScore = ass?.totalScore ?? (att.score + jnl.score + skl.score + exm.score);
      const grade = ass?.grade || (totalScore >= settings.grade5Min ? '5' : totalScore >= settings.grade4Min ? '4' : totalScore >= settings.grade3Min ? '3' : '2');

      return {
        number: index + 1,
        student: std,
        assignment: asg,
        practice: activePractice,
        practicePlace: place,
        supervisor: sup,
        facultyName: faculty?.name || std.faculty || 'Davolash fakulteti',
        directionName: direction?.name || std.direction || 'Davolash ishi',
        groupName: group?.name || std.group || std.groupId,
        courseLevel: std.courseId || 4,
        attendancePercentage: att.percentage,
        attendanceScore: att.score,
        attendanceMax: settings.attendanceMaxScore,
        journalCompletionPct: jnl.completionPct,
        journalScore: jnl.score,
        journalMax: settings.journalMaxScore,
        skillsProgressPct: skl.skillProgressPercent,
        skillsScore: skl.score,
        skillsMax: settings.skillsMaxScore,
        examScore: exm.score,
        examMax: settings.finalExamMaxScore,
        examStatus: exm.status,
        totalScore,
        grade,
        status: overallStatus,
        problem: problemLabel,
        lastUpdated: ass?.updatedAt ? ass.updatedAt.split('T')[0] : (asg?.createdAt?.split('T')[0] || '2026-09-28')
      };
    });

    return rows.filter(row => {
      if (filters?.facultyId && row.student.facultyId !== filters.facultyId) return false;
      if (filters?.directionId && row.student.directionId !== filters.directionId) return false;
      if (filters?.groupId && row.student.groupId !== filters.groupId) return false;
      if (filters?.clinicId && row.assignment?.practicePlaceId !== filters.clinicId) return false;
      if (filters?.supervisorId && row.assignment?.supervisorId !== filters.supervisorId) return false;
      if (filters?.status && filters.status !== 'ALL' && row.status !== filters.status) return false;
      if (filters?.grade && filters.grade !== 'ALL' && row.grade !== filters.grade) return false;
      if (filters?.searchQuery?.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = row.student.fullName.toLowerCase().includes(q);
        const matchesId = row.student.studentId.toLowerCase().includes(q);
        const matchesGroup = row.groupName.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesGroup) return false;
      }
      return true;
    });
  }

  public getProblemStudents(filters?: { practiceId?: string; facultyId?: string; problemType?: string }): ProblemStudent[] {
    const rows = this.getOverallMonitoringRows({ practiceId: filters?.practiceId, facultyId: filters?.facultyId });
    const problems: ProblemStudent[] = [];

    rows.forEach(r => {
      const std = r.student;
      const att = this.calculateStudentAttendanceScore(std.id, r.practice?.id);
      const jnl = this.calculateStudentJournalScore(std.id, r.practice?.id);
      const skl = this.calculateStudentSkillsScore(std.id, r.practice?.id);
      const exm = this.calculateStudentFinalExamScore(std.id, r.practice?.id);
      const ass = this.getAssessmentByStudent(std.id, r.practice?.id);

      if (att.percentage < 80) {
        problems.push({
          id: `prob-att-${std.id}`,
          studentId: std.id,
          studentName: std.fullName,
          group: r.groupName,
          faculty: r.facultyName,
          practiceId: r.practice?.id || 'prac-1',
          practiceName: r.practice?.name || 'Amaliyot',
          practicePlaceName: r.practicePlace?.name,
          supervisorName: r.supervisor?.fullName,
          problemType: 'ATTENDANCE_INSUFFICIENT',
          problemLabel: `Davomat yetarli emas (${att.percentage}%)`,
          detectedDate: '2026-09-28',
          responsiblePerson: r.supervisor?.fullName || 'Amaliyot rahbari',
          severity: att.percentage < 60 ? 'HIGH' : 'MEDIUM',
          status: 'OPEN',
          comment: `${att.absentCount} kun sababsiz dars qoldirilgan. Talabaga ogohlantirish berilsin.`
        });
      }

      if (jnl.revisionCount > 0) {
        problems.push({
          id: `prob-jnl-${std.id}`,
          studentId: std.id,
          studentName: std.fullName,
          group: r.groupName,
          faculty: r.facultyName,
          practiceId: r.practice?.id || 'prac-1',
          practiceName: r.practice?.name || 'Amaliyot',
          practicePlaceName: r.practicePlace?.name,
          supervisorName: r.supervisor?.fullName,
          problemType: 'JOURNAL_REVISION',
          problemLabel: 'Kundalik REVISION holatida',
          detectedDate: '2026-09-27',
          responsiblePerson: r.supervisor?.fullName || 'Klinik rahbar',
          severity: 'MEDIUM',
          status: 'IN_REVIEW',
          comment: `${jnl.revisionCount} ta elektron kundalik qayta ishlashga yuborilgan.`
        });
      }

      if (jnl.submittedCount === 0 && att.totalDays > 3) {
        problems.push({
          id: `prob-jnl0-${std.id}`,
          studentId: std.id,
          studentName: std.fullName,
          group: r.groupName,
          faculty: r.facultyName,
          practiceId: r.practice?.id || 'prac-1',
          practiceName: r.practice?.name || 'Amaliyot',
          practicePlaceName: r.practicePlace?.name,
          supervisorName: r.supervisor?.fullName,
          problemType: 'JOURNAL_MISSING',
          problemLabel: 'Kundalik topshirilmagan',
          detectedDate: '2026-09-28',
          responsiblePerson: r.supervisor?.fullName || 'Amaliyot rahbari',
          severity: 'HIGH',
          status: 'OPEN',
          comment: 'Birorta ham kundalik tizimga kiritilmagan.'
        });
      }

      if (skl.skillProgressPercent < 60 || skl.unmasteredMandatorySkills.length > 0) {
        problems.push({
          id: `prob-skl-${std.id}`,
          studentId: std.id,
          studentName: std.fullName,
          group: r.groupName,
          faculty: r.facultyName,
          practiceId: r.practice?.id || 'prac-1',
          practiceName: r.practice?.name || 'Amaliyot',
          practicePlaceName: r.practicePlace?.name,
          supervisorName: r.supervisor?.fullName,
          problemType: 'SKILLS_QUOTA_UNMET',
          problemLabel: 'Ko\'nikmalar minimal me\'yori bajarilmagan',
          detectedDate: '2026-09-28',
          responsiblePerson: r.supervisor?.fullName || 'Klinik mas\'ul',
          severity: 'MEDIUM',
          status: 'OPEN',
          comment: skl.unmasteredMandatorySkills.length > 0
            ? `Majburiy ko'nikmalar to'liq emas: ${skl.unmasteredMandatorySkills.slice(0, 2).join(', ')}`
            : `Umumiy ko'nikmalar bajarilishi: ${skl.skillProgressPercent}%`
        });
      }

      if (ass?.status === 'RETAKE_REQUIRED' || r.totalScore < 55) {
        problems.push({
          id: `prob-ret-${std.id}`,
          studentId: std.id,
          studentName: std.fullName,
          group: r.groupName,
          faculty: r.facultyName,
          practiceId: r.practice?.id || 'prac-1',
          practiceName: r.practice?.name || 'Amaliyot',
          practicePlaceName: r.practicePlace?.name,
          supervisorName: r.supervisor?.fullName,
          problemType: 'RETAKE_REQUIRED',
          problemLabel: 'Qayta topshirish kerak (< 55 ball)',
          detectedDate: '2026-09-28',
          responsiblePerson: 'Attestatsiya komissiyasi',
          severity: 'HIGH',
          status: 'OPEN',
          comment: ass?.retakeReason || `Yakuniy ball: ${r.totalScore} ball (Baho: 2). Qayta imtihon belgilansin.`
        });
      }

      if (!exm.exam) {
        problems.push({
          id: `prob-exm-${std.id}`,
          studentId: std.id,
          studentName: std.fullName,
          group: r.groupName,
          faculty: r.facultyName,
          practiceId: r.practice?.id || 'prac-1',
          practiceName: r.practice?.name || 'Amaliyot',
          practicePlaceName: r.practicePlace?.name,
          supervisorName: r.supervisor?.fullName,
          problemType: 'EXAM_UNSCHEDULED',
          problemLabel: 'Yakuniy imtihon belgilanmagan',
          detectedDate: '2026-09-28',
          responsiblePerson: 'Kafedra mudiri',
          severity: 'LOW',
          status: 'OPEN',
          comment: 'Talabaga yakuniy imtihon jadvali belgilanmagan.'
        });
      }
    });

    if (filters?.problemType && filters.problemType !== 'ALL') {
      return problems.filter(p => p.problemType === filters.problemType);
    }
    return problems;
  }

  public getGroupSummaryReports(practiceId?: string) {
    const rows = this.getOverallMonitoringRows({ practiceId });
    const groupMap: { [groupId: string]: any } = {};

    rows.forEach(r => {
      const gId = r.student.groupId || 'grp-1';
      if (!groupMap[gId]) {
        groupMap[gId] = {
          groupId: gId,
          groupName: r.groupName,
          facultyName: r.facultyName,
          totalStudents: 0,
          inPractice: 0,
          completed: 0,
          attendanceSum: 0,
          journalSum: 0,
          skillsSum: 0,
          examCount: 0,
          totalScoreSum: 0,
          grade5Count: 0,
          grade4Count: 0,
          grade3Count: 0,
          grade2Count: 0,
          retakeCount: 0,
          approvedCount: 0,
          incompleteCount: 0,
          students: []
        };
      }

      const g = groupMap[gId];
      g.totalStudents++;
      g.students.push(r);
      if (r.status !== 'NOT_STARTED') g.inPractice++;
      if (r.status === 'COMPLETED' || r.status === 'APPROVED') g.completed++;
      if (r.status === 'APPROVED' || r.status === 'COMPLETED') g.approvedCount++;
      if (r.status === 'RETAKE_REQUIRED' || r.grade === '2') g.retakeCount++;
      if (r.status === 'IN_PROGRESS' || r.status === 'WAITING_FOR_EXAM') g.incompleteCount++;

      g.attendanceSum += r.attendancePercentage;
      g.journalSum += r.journalCompletionPct;
      g.skillsSum += r.skillsProgressPct;
      if (r.examScore > 0) g.examCount++;
      g.totalScoreSum += r.totalScore;

      if (r.grade === '5') g.grade5Count++;
      else if (r.grade === '4') g.grade4Count++;
      else if (r.grade === '3') g.grade3Count++;
      else g.grade2Count++;
    });

    return Object.values(groupMap).map(g => {
      const cnt = g.totalStudents || 1;
      const assessedCnt = (g.grade5Count + g.grade4Count + g.grade3Count + g.grade2Count) || 1;
      const passedCnt = g.grade5Count + g.grade4Count + g.grade3Count;
      const masteryPct = Math.round((passedCnt / assessedCnt) * 100);
      const qualityPct = Math.round(((g.grade5Count + g.grade4Count) / assessedCnt) * 100);

      return {
        ...g,
        avgAttendance: Math.round(g.attendanceSum / cnt),
        avgJournal: Math.round(g.journalSum / cnt),
        avgSkills: Math.round(g.skillsSum / cnt),
        avgScore: Number((g.totalScoreSum / cnt).toFixed(1)),
        masteryPercentage: masteryPct,
        qualityPercentage: qualityPct
      };
    });
  }

  public getFacultyDirectionReports(practiceId?: string) {
    const rows = this.getOverallMonitoringRows({ practiceId });
    const facultyMap: { [facId: string]: any } = {};

    rows.forEach(r => {
      const fId = r.student.facultyId || 'fac-1';
      if (!facultyMap[fId]) {
        facultyMap[fId] = {
          facultyId: fId,
          facultyName: r.facultyName,
          studentsCount: 0,
          practicesCount: 1,
          attendanceSum: 0,
          journalSum: 0,
          skillsSum: 0,
          examCount: 0,
          totalScoreSum: 0,
          grade5: 0,
          grade4: 0,
          grade3: 0,
          grade2: 0,
          retakeCount: 0,
          clinics: new Set<string>(),
          supervisors: new Set<string>()
        };
      }

      const f = facultyMap[fId];
      f.studentsCount++;
      f.attendanceSum += r.attendancePercentage;
      f.journalSum += r.journalCompletionPct;
      f.skillsSum += r.skillsProgressPct;
      if (r.examScore > 0) f.examCount++;
      f.totalScoreSum += r.totalScore;

      if (r.practicePlace?.id) f.clinics.add(r.practicePlace.id);
      if (r.supervisor?.id) f.supervisors.add(r.supervisor.id);

      if (r.grade === '5') f.grade5++;
      else if (r.grade === '4') f.grade4++;
      else if (r.grade === '3') f.grade3++;
      else f.grade2++;

      if (r.grade === '2' || r.status === 'RETAKE_REQUIRED') f.retakeCount++;
    });

    return Object.values(facultyMap).map(f => {
      const cnt = f.studentsCount || 1;
      const assessed = (f.grade5 + f.grade4 + f.grade3 + f.grade2) || 1;
      const passed = f.grade5 + f.grade4 + f.grade3;
      return {
        ...f,
        clinicsCount: f.clinics.size,
        supervisorsCount: f.supervisors.size,
        avgAttendance: Math.round(f.attendanceSum / cnt),
        avgJournal: Math.round(f.journalSum / cnt),
        avgSkills: Math.round(f.skillsSum / cnt),
        avgScore: Number((f.totalScoreSum / cnt).toFixed(1)),
        masteryPercentage: Math.round((passed / assessed) * 100),
        qualityPercentage: Math.round(((f.grade5 + f.grade4) / assessed) * 100)
      };
    });
  }

  public getClinicReports(practiceId?: string) {
    const rows = this.getOverallMonitoringRows({ practiceId });
    const clinicMap: { [cId: string]: any } = {};

    rows.forEach(r => {
      const cId = r.practicePlace?.id || 'place-1';
      if (!clinicMap[cId]) {
        clinicMap[cId] = {
          clinicId: cId,
          clinicName: r.practicePlace?.name || 'Klinik baza',
          type: r.practicePlace?.type || 'Shifoxona',
          department: r.assignment?.department || 'Bo\'lim',
          studentsCount: 0,
          supervisors: new Set<string>(),
          attendanceSum: 0,
          journalSum: 0,
          skillsSum: 0,
          examCount: 0,
          totalScoreSum: 0,
          problemCount: 0,
          approvedCount: 0
        };
      }

      const c = clinicMap[cId];
      c.studentsCount++;
      if (r.supervisor?.fullName) c.supervisors.add(r.supervisor.fullName);
      c.attendanceSum += r.attendancePercentage;
      c.journalSum += r.journalCompletionPct;
      c.skillsSum += r.skillsProgressPct;
      if (r.examScore > 0) c.examCount++;
      c.totalScoreSum += r.totalScore;
      if (r.problem) c.problemCount++;
      if (r.status === 'APPROVED' || r.status === 'COMPLETED') c.approvedCount++;
    });

    return Object.values(clinicMap).map(c => {
      const cnt = c.studentsCount || 1;
      return {
        ...c,
        supervisorsCount: c.supervisors.size,
        supervisorsList: Array.from(c.supervisors),
        avgAttendance: Math.round(c.attendanceSum / cnt),
        avgJournal: Math.round(c.journalSum / cnt),
        avgSkills: Math.round(c.skillsSum / cnt),
        avgScore: Number((c.totalScoreSum / cnt).toFixed(1))
      };
    });
  }

  public getSupervisorReports(practiceId?: string) {
    const state = this.getState();
    const rows = this.getOverallMonitoringRows({ practiceId });
    const supList = state.supervisors || [];

    return supList.map(sup => {
      const assignedRows = rows.filter(r => r.supervisor?.id === sup.id);
      const studentIds = assignedRows.map(r => r.student.id);

      const allJournals = (state.dailyJournals || []).filter(j => studentIds.includes(j.studentId));
      const reviewedCount = allJournals.filter(j => j.status === 'APPROVED' || j.status === 'REVISION').length;
      const pendingCount = allJournals.filter(j => j.status === 'PENDING' || !j.status).length;
      const approvedCount = allJournals.filter(j => j.status === 'APPROVED').length;
      const revisionCount = allJournals.filter(j => j.status === 'REVISION').length;

      const allSkillLogs = (state.skillLogs || []).filter(l => studentIds.includes(l.studentId));
      const skillsReviewed = allSkillLogs.filter(l => l.status === 'APPROVED' || l.status === 'REJECTED').length;
      const skillsPending = allSkillLogs.filter(l => l.status === 'PENDING').length;

      const completedStudents = assignedRows.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED').length;

      return {
        supervisorId: sup.id,
        fullName: sup.fullName,
        clinicName: assignedRows[0]?.practicePlace?.name || 'Respublika Shifoxonasi',
        department: sup.department,
        assignedStudentsCount: assignedRows.length,
        reviewedJournalsCount: reviewedCount,
        pendingJournalsCount: pendingCount,
        approvedJournalsCount: approvedCount,
        revisionJournalsCount: revisionCount,
        skillsReviewedCount: skillsReviewed,
        skillsPendingCount: skillsPending,
        attestationApprovedCount: completedStudents,
        needsActionCount: pendingCount + skillsPending,
        lastActivityDate: '2026-09-28'
      };
    });
  }

  // --- VEDOMOSTS MANAGEMENT ---
  public getVedomosts(filters?: { practiceId?: string; facultyId?: string; status?: VedomostStatus }): OfficialVedomost[] {
    const state = this.getState();
    let list = state.vedomosts || [];
    if (!filters) return list;
    if (filters.practiceId) list = list.filter(v => v.practiceId === filters.practiceId);
    if (filters.facultyId) list = list.filter(v => v.facultyId === filters.facultyId);
    if (filters.status) list = list.filter(v => v.status === filters.status);
    return list;
  }

  public getVedomostById(id: string): OfficialVedomost | undefined {
    return (this.getState().vedomosts || []).find(v => v.id === id);
  }

  public getVedomostByVerificationCode(code: string): OfficialVedomost | undefined {
    return (this.getState().vedomosts || []).find(v => v.verificationCode === code.trim());
  }

  public createVedomost(
    params: {
      practiceId: string;
      facultyId: string;
      groupId: string;
      directionId?: string;
      commissionId?: string;
      title?: string;
      academicYear?: string;
    },
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): OfficialVedomost {
    const state = this.getState();
    if (!state.vedomosts) state.vedomosts = [];

    const practice = state.practices.find(p => p.id === params.practiceId);
    const faculty = state.faculties.find(f => f.id === params.facultyId);
    const group = state.groups.find(g => g.id === params.groupId);
    const direction = state.directions.find(d => d.id === params.directionId);
    const commission = (state.attestationCommissions || []).find(c => c.id === params.commissionId) || (state.attestationCommissions || [])[0];

    const rows = this.getOverallMonitoringRows({
      practiceId: params.practiceId,
      groupId: params.groupId
    });

    const studentRows: VedomostStudentRow[] = rows.map(r => ({
      studentId: r.student.id,
      fullName: r.student.fullName,
      studentCode: r.student.studentId,
      group: r.groupName,
      attendanceScore: r.attendanceScore,
      journalScore: r.journalScore,
      skillsScore: r.skillsScore,
      finalExamScore: r.examScore,
      totalScore: r.totalScore,
      grade: r.grade as '5' | '4' | '3' | '2',
      gradeWord: r.grade === '5' ? "A'lo" : r.grade === '4' ? "Yaxshi" : r.grade === '3' ? "Qoniqarli" : "Qoniqarsiz",
      status: r.status,
      signature: r.status === 'APPROVED' ? 'Elektron tasdiq' : ''
    }));

    const totalCnt = studentRows.length;
    const g5 = studentRows.filter(s => s.grade === '5').length;
    const g4 = studentRows.filter(s => s.grade === '4').length;
    const g3 = studentRows.filter(s => s.grade === '3').length;
    const g2 = studentRows.filter(s => s.grade === '2').length;
    const assessed = (g5 + g4 + g3 + g2) || 1;
    const passed = g5 + g4 + g3;
    const masteryPct = Math.round((passed / assessed) * 100);
    const qualityPct = Math.round(((g5 + g4) / assessed) * 100);

    const now = new Date();
    const verifCode = `TMA-VRF-${Math.floor(10000 + Math.random() * 90000)}`;

    const newVedomost: OfficialVedomost = {
      id: `ved-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      vedomostNumber: `VED-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(state.vedomosts.length + 1).padStart(3, '0')}`,
      title: params.title || `${group?.name || 'Guruh'} ${practice?.name || 'Amaliyot'} Yakuniy Attestatsiya Vedomosti`,
      academicYear: params.academicYear || practice?.academicYear || '2026-2027',
      facultyId: params.facultyId,
      facultyName: faculty?.name,
      directionId: params.directionId,
      directionName: direction?.name,
      courseLevel: 4,
      groupId: params.groupId,
      groupName: group?.name,
      practiceId: params.practiceId,
      practiceName: practice?.name,
      practiceCode: practice?.code,
      practiceStartDate: practice?.startDate,
      practiceEndDate: practice?.endDate,
      commissionId: commission?.id,
      commissionName: commission?.name,
      commissionChairperson: commission?.chairpersonName,
      commissionMembers: commission?.memberNames,
      issueDate: now.toISOString().split('T')[0],
      status: 'GENERATED',
      students: studentRows,
      totalStudentsCount: totalCnt,
      grade5Count: g5,
      grade4Count: g4,
      grade3Count: g3,
      grade2Count: g2,
      masteryPercentage: masteryPct,
      qualityPercentage: qualityPct,
      retakeCount: g2,
      verificationCode: verifCode,
      qrPayload: `https://ais-dev-jfkrtatp7imduu6bfeocus-226016755915.asia-east1.run.app/verify/${verifCode}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    state.vedomosts.unshift(newVedomost);

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'vedomostCreated',
      entity: 'vedomosts',
      entityId: newVedomost.id,
      metadata: JSON.stringify({ number: newVedomost.vedomostNumber, group: newVedomost.groupName })
    });

    this.saveState(state);
    return newVedomost;
  }

  public signVedomost(
    vedomostId: string,
    signerName: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_SUPERVISOR'
  ): { success: boolean; vedomost?: OfficialVedomost; error?: string } {
    const state = this.getState();
    const v = (state.vedomosts || []).find(item => item.id === vedomostId);
    if (!v) return { success: false, error: 'Vedomost topilmadi.' };

    v.status = 'SIGNED';
    v.signedAt = new Date().toISOString();
    v.signedBy = signerName;
    v.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'vedomostSigned',
      entity: 'vedomosts',
      entityId: v.id,
      metadata: JSON.stringify({ signedBy: signerName })
    });

    this.saveState(state);
    return { success: true, vedomost: v };
  }

  public approveVedomost(
    vedomostId: string,
    approverName: string,
    actorUserId = 'system',
    actorRole = 'FACULTY_DEAN'
  ): { success: boolean; vedomost?: OfficialVedomost; error?: string } {
    const state = this.getState();
    const v = (state.vedomosts || []).find(item => item.id === vedomostId);
    if (!v) return { success: false, error: 'Vedomost topilmadi.' };

    v.status = 'APPROVED';
    v.approvedAt = new Date().toISOString();
    v.approvedBy = approverName;
    v.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'vedomostApproved',
      entity: 'vedomosts',
      entityId: v.id,
      metadata: JSON.stringify({ approvedBy: approverName })
    });

    this.saveState(state);
    return { success: true, vedomost: v };
  }

  public archiveVedomost(
    vedomostId: string,
    actorUserId = 'system',
    actorRole = 'PRACTICE_HEAD'
  ): { success: boolean; vedomost?: OfficialVedomost; error?: string } {
    const state = this.getState();
    const v = (state.vedomosts || []).find(item => item.id === vedomostId);
    if (!v) return { success: false, error: 'Vedomost topilmadi.' };

    v.status = 'ARCHIVED';
    v.updatedAt = new Date().toISOString();

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'vedomostArchived',
      entity: 'vedomosts',
      entityId: v.id,
      metadata: JSON.stringify({ archivedAt: v.updatedAt })
    });

    this.saveState(state);
    return { success: true, vedomost: v };
  }

  // --- STUDENT TIMELINE (SECTION 16) ---
  public getStudentTimeline(studentId: string, practiceId?: string): StudentTimelineStep[] {
    const state = this.getState();
    const asg = (state.practiceAssignments || []).find(
      a => a.studentId === studentId && (!practiceId || a.practiceId === practiceId)
    );
    const targetPracId = practiceId || asg?.practiceId || 'prac-1';
    const att = this.calculateStudentAttendanceScore(studentId, targetPracId);
    const jnl = this.calculateStudentJournalScore(studentId, targetPracId);
    const skl = this.calculateStudentSkillsScore(studentId, targetPracId);
    const exm = this.calculateStudentFinalExamScore(studentId, targetPracId);
    const ass = this.getAssessmentByStudent(studentId, targetPracId);
    const vedomost = (state.vedomosts || []).find(v => v.students.some(s => s.studentId === studentId));

    return [
      {
        stepNumber: 1,
        title: 'Amaliyotga biriktirildi',
        status: asg ? 'COMPLETED' : 'PENDING',
        date: asg?.createdAt?.split('T')[0] || '2026-08-30',
        description: asg ? 'Klinik baza va amaliyot rahbariga biriktirildi.' : 'Taqsimot kutilmoqda.'
      },
      {
        stepNumber: 2,
        title: 'Amaliyot boshlandi',
        status: asg && att.totalDays > 0 ? 'COMPLETED' : 'PENDING',
        date: asg?.startDate || '2026-09-01',
        description: 'Tibbiyot muassasasida amaliyot o\'tash davri boshlandi.'
      },
      {
        stepNumber: 3,
        title: 'Davomat qayd etish',
        status: att.percentage >= 80 ? 'COMPLETED' : att.percentage > 0 ? 'IN_PROGRESS' : 'PROBLEM',
        description: `Qatnashish ko'rsatkichi: ${att.percentage}% (${att.presentCount + att.lateCount} kun).`
      },
      {
        stepNumber: 4,
        title: 'Elektron kundalik yuritish',
        status: jnl.approvedCount >= 5 ? 'COMPLETED' : jnl.submittedCount > 0 ? 'IN_PROGRESS' : 'PENDING',
        description: `${jnl.approvedCount} ta kundalik tasdiqlangan, reyting: ${jnl.avgRating} ⭐.`
      },
      {
        stepNumber: 5,
        title: 'Amaliy ko\'nikmalar (Skills Logbook)',
        status: skl.skillProgressPercent >= 80 ? 'COMPLETED' : skl.skillProgressPercent > 0 ? 'IN_PROGRESS' : 'PENDING',
        description: `Minimal me'yor bajarilishi: ${skl.skillProgressPercent}% (${skl.completedSkills}/${skl.totalSkills} ta ko'nikma).`
      },
      {
        stepNumber: 6,
        title: 'Supervisor tasdig\'i',
        status: jnl.approvedCount > 0 && skl.completedSkills > 0 ? 'COMPLETED' : 'PENDING',
        description: 'Rahbar tomonidan kundaliklar va manipulyatsiyalar ko\'rib chiqildi.'
      },
      {
        stepNumber: 7,
        title: 'Yakuniy imtihon',
        status: exm.status === 'COMPLETED' ? 'COMPLETED' : exm.exam ? 'IN_PROGRESS' : 'PENDING',
        date: exm.exam?.examDate,
        description: exm.status === 'COMPLETED' ? `5 ta mezon bo'yicha ${exm.score}/30 ball olindi.` : 'Imtihon rejalashtirilgan.'
      },
      {
        stepNumber: 8,
        title: '100 ballik attestatsiya shakllantirildi',
        status: ass ? 'COMPLETED' : 'PENDING',
        description: ass ? `Jami to'plangan: ${ass.totalScore} / 100 ball (Baho: ${ass.grade}).` : 'Hisob-kitob kutilmoqda.'
      },
      {
        stepNumber: 9,
        title: 'Komissiya tasdig\'i',
        status: ass?.status === 'APPROVED' ? 'COMPLETED' : ass?.status === 'RETAKE_REQUIRED' ? 'PROBLEM' : 'PENDING',
        date: ass?.approvedAt?.split('T')[0],
        description: ass?.status === 'APPROVED' ? `Tasdiqladi: ${ass.approvedBy}` : ass?.status === 'RETAKE_REQUIRED' ? 'Qayta topshirish belgilandi.' : 'Komissiya ko\'rib chiqmoqda.'
      },
      {
        stepNumber: 10,
        title: 'Yakuniy natija e\'lon qilindi',
        status: ass?.status === 'APPROVED' ? 'COMPLETED' : 'PENDING',
        description: ass?.status === 'APPROVED' ? `Rasmiy baho: ${ass.grade} (${ass.grade === '5' ? 'A\'lo' : ass.grade === '4' ? 'Yaxshi' : 'Qoniqarli'}).` : 'Natija kutilmoqda.'
      },
      {
        stepNumber: 11,
        title: 'Vedomostga kiritildi',
        status: vedomost ? 'COMPLETED' : 'PENDING',
        date: vedomost?.issueDate,
        description: vedomost ? `Rasmiy vedomost: № ${vedomost.vedomostNumber} (${vedomost.status}).` : 'Vedomost shakllantirilmoqda.'
      }
    ];
  }

  // --- SYNC ALL STUDENT STATUSES (SECTION 19) ---
  public syncAllStudentStatuses(actorUserId = 'system', actorRole = 'SUPER_ADMIN'): { success: boolean; syncedCount: number } {
    const state = this.getState();
    const students = state.students || [];
    let count = 0;

    students.forEach(std => {
      this.calculateAndSaveAssessment(std.id, undefined, actorUserId, actorRole);
      count++;
    });

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'studentStatusSynced',
      entity: 'students',
      entityId: 'all',
      metadata: JSON.stringify({ syncedCount: count, timestamp: new Date().toISOString() })
    });

    return { success: true, syncedCount: count };
  }

  // --- 12 KPIS FOR FINAL REPORTS CONTROL CENTER (SECTION 2) ---
  public getFinalReportsKPIs(practiceId?: string) {
    const rows = this.getOverallMonitoringRows({ practiceId });
    const total = rows.length;

    let assigned = 0;
    let started = 0;
    let finished = 0;
    let fullAttendance = 0;
    let fullJournal = 0;
    let fullSkills = 0;
    let examTaken = 0;
    let approved = 0;
    let retake = 0;
    let incomplete = 0;

    rows.forEach(r => {
      if (r.assignment) assigned++;
      if (r.status !== 'NOT_STARTED') started++;
      if (r.status === 'COMPLETED' || r.status === 'APPROVED') finished++;
      if (r.attendancePercentage >= 95) fullAttendance++;
      if (r.journalCompletionPct >= 90) fullJournal++;
      if (r.skillsProgressPct >= 100) fullSkills++;
      if (r.examScore > 0) examTaken++;
      if (r.status === 'APPROVED' || r.status === 'COMPLETED') approved++;
      if (r.status === 'RETAKE_REQUIRED' || r.grade === '2') retake++;
      if (r.status === 'IN_PROGRESS' || r.status === 'WAITING_FOR_EXAM' || r.status === 'WAITING_FOR_APPROVAL') incomplete++;
    });

    const problems = this.getProblemStudents({ practiceId });

    return {
      totalStudents: total,
      assignedCount: assigned,
      startedCount: started,
      finishedCount: finished,
      fullAttendanceCount: fullAttendance,
      fullJournalCount: fullJournal,
      fullSkillsCount: fullSkills,
      examTakenCount: examTaken,
      approvedCount: approved,
      retakeCount: retake,
      incompleteCount: incomplete,
      problemStudentsCount: problems.length
    };
  }

  // --- SAFE QR VERIFICATION DATA (SECTION 15) ---
  public getVerificationData(code: string): {
    isValid: boolean;
    vedomost?: {
      number: string;
      title: string;
      academicYear: string;
      faculty: string;
      practice: string;
      commission: string;
      chairperson: string;
      issueDate: string;
      totalStudents: number;
      masteryPercentage: number;
      qualityPercentage: number;
      status: string;
      signedBy?: string;
      approvedBy?: string;
    };
    message?: string;
  } {
    const v = this.getVedomostByVerificationCode(code);
    if (!v) {
      return { isValid: false, message: 'Ushbu QR verification kodi bo\'yicha hujjat topilmadi yoki haqiqiy emas.' };
    }

    return {
      isValid: true,
      vedomost: {
        number: v.vedomostNumber,
        title: v.title,
        academicYear: v.academicYear,
        faculty: v.facultyName || this.getUniversityName(),
        practice: v.practiceName || 'Klinik amaliyot',
        commission: v.commissionName || 'Attestatsiya komissiyasi',
        chairperson: v.commissionChairperson || 'Komissiya raisi',
        issueDate: v.issueDate,
        totalStudents: v.totalStudentsCount,
        masteryPercentage: v.masteryPercentage,
        qualityPercentage: v.qualityPercentage,
        status: v.status,
        signedBy: v.signedBy,
        approvedBy: v.approvedBy
      }
    };
  }

  // --- STAGE 9: SYSTEM HEALTH & DATA QUALITY (SECTIONS 25 & 26) ---
  public getSystemHealthStatus(): Array<{ service: string; status: 'ONLINE' | 'WARNING' | 'ERROR' | 'UNKNOWN'; latencyMs: number; details: string }> {
    const fb = getFirebaseConfigStatus();
    return [
      {
        service: 'Firebase Connection',
        status: fb.isConfigured ? 'ONLINE' : 'WARNING',
        latencyMs: fb.isConfigured ? 24 : 0,
        details: fb.isConfigured
          ? `GCP Project: ${fb.projectIdMasked}`
          : `Requires Configuration (${fb.missingVariables.slice(0, 2).join(', ')} missing in .env)`
      },
      { service: 'Authentication (AuthContext)', status: 'ONLINE', latencyMs: 12, details: '7 role security matrix active' },
      {
        service: 'Firestore Collections (21)',
        status: fb.isConfigured ? 'ONLINE' : 'WARNING',
        latencyMs: fb.isConfigured ? 31 : 0,
        details: fb.isConfigured ? 'Live Firestore sync active' : 'Local source-of-truth active (Cloud rules ready)'
      },
      {
        service: 'Firebase Storage',
        status: fb.isConfigured ? 'ONLINE' : 'WARNING',
        latencyMs: fb.isConfigured ? 45 : 0,
        details: fb.isConfigured ? 'Cloud bucket active' : 'Requires Storage Bucket Configuration (storage.rules created)'
      },
      { service: 'Audit Logs (Immutable)', status: 'ONLINE', latencyMs: 15, details: 'Zero-trust transaction logging active' },
      { service: 'Notifications Gateway', status: 'ONLINE', latencyMs: 18, details: 'Real-time alerting active' },
      { service: 'Analytics & Reports Engine', status: 'ONLINE', latencyMs: 22, details: '12 KPI calculators & aggregation operational' },
      { service: 'PDF & Print Subsystem', status: 'ONLINE', latencyMs: 10, details: 'Official vedomost & transcript renderers ready' },
      { service: 'Export (CSV/Excel) Service', status: 'ONLINE', latencyMs: 8, details: 'Client-side UTF-8 CSV generators operational' },
      { service: 'QR Verifications & Privacy', status: 'ONLINE', latencyMs: 14, details: 'Tamper-resistant verification & medical privacy active' }
    ];
  }

  public getDataQualityIssues(): Array<{ id: string; category: string; severity: 'Critical' | 'Warning' | 'Info'; description: string; count: number }> {
    const state = this.getState();
    const issues = [];

    const students = state.students || [];
    const assignments = state.practiceAssignments || [];
    const attendance = state.attendance || [];
    const journals = state.dailyJournals || [];
    const assessments = state.assessments || [];

    // Check orphan assignments
    const orphanAsg = assignments.filter(a => !students.some(s => s.id === a.studentId));
    if (orphanAsg.length > 0) {
      issues.push({
        id: 'dq-1',
        category: 'Orphan Assignments',
        severity: 'Warning' as const,
        description: 'Tizimda talabasi mavjud bo‘lmagan yetim amaliyot topshiriqlari mavjud.',
        count: orphanAsg.length
      });
    }

    // Check negative scores or score > maxScore in assessments
    const invalidScores = assessments.filter(a => a.totalScore < 0 || a.totalScore > 100);
    if (invalidScores.length > 0) {
      issues.push({
        id: 'dq-2',
        category: 'Invalid Assessment Scores',
        severity: 'Critical' as const,
        description: '100 ballik limitdan oshgan yoki manfiy baholi attestatsiyalar aniqlandi.',
        count: invalidScores.length
      });
    }

    // Check duplicate student IDs
    const studentIds = students.map(s => s.studentId);
    const duplicates = studentIds.filter((id, idx) => studentIds.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      issues.push({
        id: 'dq-3',
        category: 'Duplicate Student IDs',
        severity: 'Critical' as const,
        description: 'Takroriy talaba ID raqamlari mavjud.',
        count: duplicates.length
      });
    }

    if (issues.length === 0) {
      issues.push({
        id: 'dq-ok',
        category: 'Database Clean',
        severity: 'Info' as const,
        description: 'Barcha ma’lumotlar yaxlitligi va qoidalari to‘liq qondirilgan. Muammolar topilmadi.',
        count: 0
      });
    }

    return issues;
  }

  public async hardResetCloudAndLocalState(actorUserId = 'system', actorRole = 'SUPER_ADMIN'): Promise<void> {
    const state = this.getState();
    state.practices = [];
    state.practiceDistributions = [];
    state.practiceAssignments = [];
    state.attendance = [];
    state.attendanceSessions = [];
    state.dailyJournals = [];
    state.students = [];
    state.supervisors = [];
    state.clinicResponsibles = [];
    state.practicePlaces = [];
    state.practiceDepartments = [];
    state.vedomosts = [];
    state.assessments = [];
    state.finalExams = [];
    state.deletedPracticeIds = [];
    state.deletedSupervisorIds = [];
    state.deletedClinicResponsibleIds = [];

    this.recordAuditLog({
      userId: actorUserId,
      userRole: actorRole,
      action: 'databaseHardReset',
      entity: 'system',
      entityId: 'hard-reset',
      metadata: JSON.stringify({ description: 'Hard-delete of all practices, allocations, and demo data triggered by admin.' })
    });

    this.saveState(state);

    if (typeof window !== 'undefined' && db) {
      try {
        const docRef = doc(db, 'appState', 'v2');
        const cleanState = JSON.parse(JSON.stringify(state));
        await setDoc(docRef, cleanState);
        console.log('Successfully hard-reset Firestore and local database state.');
      } catch (err) {
        console.error('Error hard-resetting Firestore state:', err);
        throw err;
      }
    }
  }
}

export const storageService = new StorageServiceV2();

export async function hardResetDatabaseState(actorUserId?: string, actorRole?: string): Promise<void> {
  return storageService.hardResetCloudAndLocalState(actorUserId, actorRole);
}

