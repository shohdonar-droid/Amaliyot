export type CanonicalUserRole = 
  | 'SUPER_ADMIN'
  | 'PRACTICE_HEAD'
  | 'PRACTICE_STAFF'
  | 'FACULTY_DEAN'
  | 'PRACTICE_SUPERVISOR'
  | 'CLINIC_RESPONSIBLE'
  | 'STUDENT';

export type LegacyUserRole = 
  | 'super_admin'
  | 'dept_head'
  | 'dept_staff'
  | 'dean'
  | 'supervisor'
  | 'clinic_responsible'
  | 'student';

export type UserRole = CanonicalUserRole | LegacyUserRole;

export interface RoleConfig {
  id: UserRole;
  canonicalRole: CanonicalUserRole;
  title: string;
  badgeColor: string;
  description: string;
}

export interface User {
  id: string;
  uid: string;
  username?: string;
  login?: string;
  password?: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  photoURL?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  facultyId?: string;
  practicePlaceId?: string;
  studentId?: string;
  supervisorId?: string;
  clinicResponsibleId?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  deanName: string;
  phone: string;
  email: string;
  directionsCount?: number;
  createdAt?: string;
}

export interface Direction {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  degree: 'Bakalavr' | 'Magistratura' | 'Klinik ordinatura';
  durationYears: number;
  createdAt?: string;
}

export interface Course {
  id: string;
  level: number;
  name: string;
  academicYear: string;
}

export interface Group {
  id: string;
  name: string;
  directionId: string;
  courseId: string;
  facultyId: string;
  language: "O'zbek" | "Rus" | "Ingliz";
  studentCount?: number;
}

export type StudentStatus = 
  | 'active' | 'in_practice' | 'completed' | 'suspended'
  | 'ACTIVE' | 'IN_PRACTICE' | 'COMPLETED' | 'SUSPENDED';

export interface Student {
  id: string;
  userId?: string;
  studentId: string;
  pinfl: string;
  fullName: string;
  facultyId: string;
  directionId: string;
  courseId: string;
  groupId: string;
  phone: string;
  telegram: string;
  email: string;
  photoURL?: string;
  avatarUrl?: string;
  status: StudentStatus;
  currentPracticeId?: string;
  currentPracticePlaceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PracticePlaceType = 'Shifoxona' | 'Klinika' | 'Poliklinika' | 'Ilmiy Markaz' | 'Tez Yordam';

export interface PracticePlace {
  id: string;
  name: string;
  type: PracticePlaceType;
  city: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  activeStudentsCount: number;
  contactPerson: string;
  contactPhone: string;
  departments: string[];
  contractNumber: string;
  contractDate: string;
  contractExpiryDate: string;
  latitude?: number;
  longitude?: number;
  allowedRadius?: number; // in meters (default 200m)
  createdAt?: string;
}

export interface PracticeDepartment {
  id: string;
  practicePlaceId: string;
  name: string;
  headDoctor?: string;
  bedCapacity?: number;
  activeStudentQuota?: number;
}

export interface Supervisor {
  id: string;
  userId?: string;
  fullName: string;
  department: string;
  academicDegree: string;
  phone: string;
  email: string;
  type: 'university' | 'clinic';
  practicePlaceId?: string;
  assignedStudentsCount: number;
  createdAt?: string;
}

export interface ClinicResponsible {
  id: string;
  userId?: string;
  fullName: string;
  practicePlaceId: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  createdAt?: string;
}

export type PracticeType = 
  | "Ishlab chiqarish amaliyoti"
  | "Klinik amaliyot"
  | "O'quv amaliyoti"
  | "Pedagogik amaliyot"
  | "Malakaviy amaliyot"
  | "Boshqa"
  | "O'quv-tanishuv amaliyoti"
  | "Hamshiralik malakaviy amaliyoti"
  | "Klinik ishlab chiqarish amaliyoti"
  | "Subordinatura amaliyoti"
  | "Klinik ordinatura amaliyoti"
  | string;

export type PracticeStatus = 
  | 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  | 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface Practice {
  id: string;
  name: string;
  type: PracticeType;
  code: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  facultyId: string;
  directionId: string;
  courseLevel: number;
  groupIds: string[];
  practicePlaceIds: string[];
  supervisorIds: string[];
  clinicResponsibleIds: string[];
  status: PracticeStatus;
  orderNumber: string;
  orderDate: string;
  description?: string;
  totalHours: number;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticeAssignment {
  id: string;
  practiceId: string;
  studentId: string;
  practicePlaceId: string;
  department: string;
  departmentId?: string;
  supervisorId: string;
  clinicResponsibleId?: string;
  startDate: string;
  endDate: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt?: string;
}

export type AttendanceStatus = 
  | 'present' | 'absent' | 'excused' | 'late'
  | 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';

export type AttendanceSessionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface AttendanceSession {
  id: string;
  practiceId: string;
  practicePlaceId: string;
  departmentId?: string;
  departmentName?: string;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
  expiresAt: string;
  status: AttendanceSessionStatus;
  token: string;
  durationMinutes: number; // 5, 10, 15
  practiceStartTime?: string; // e.g. "08:00"
  lateThresholdMinutes?: number; // e.g. 15
  allowedRadius?: number; // in meters
  latitude?: number;
  longitude?: number;
}

export interface Attendance {
  id: string;
  practiceId: string;
  studentId: string;
  assignmentId?: string;
  practicePlaceId?: string;
  departmentId?: string;
  supervisorId?: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
  status: AttendanceStatus;
  qrSessionId?: string;
  qrId?: string;
  qrTokenHash?: string;
  latitude?: number;
  longitude?: number;
  locationVerified?: boolean;
  deviceInfo?: string;
  note?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProcedureParticipationType = 'Mustaqil' | 'Rahbar nazoratida' | 'Kuzatuvchi';

export interface JournalProcedure {
  id: string;
  name: string;
  count: number;
  participationType: ProcedureParticipationType;
  skillId?: string;
}

export interface ClinicalCaseItem {
  id: string;
  caseTitle: string;
  patientAgeGender?: string;
  complaints: string;
  anamnesis: string;
  examination: string;
  presumptiveDiagnosis: string;
  treatmentTactics: string;
  learnedAspect: string;
}

export interface JournalReflection {
  whatLearned: string;
  skillsImproved: string;
  tomorrowFocus: string;
}

export interface JournalAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  sizeBytes?: number;
  sizeFormatted?: string;
  uploadedAt: string;
}

export type JournalStatus = 
  | 'pending' | 'approved' | 'rejected' | 'revision'
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION' | 'DRAFT';

export interface DailyJournal {
  id: string;
  practiceId: string;
  studentId: string;
  assignmentId?: string;
  practicePlaceId?: string;
  departmentId?: string;
  department: string;
  supervisorId?: string;
  attendanceId?: string;
  date: string; // YYYY-MM-DD
  
  // A. Bog'langan amaliyot va davomat ma'lumotlari (readonly)
  attendanceSnapshot?: {
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    verifiedBy?: string;
    practicePlaceName?: string;
    supervisorName?: string;
    departmentName?: string;
  };

  // B. Bugun bajarilgan ishlar
  workSummary?: string;

  // C. Ko'rilgan bemorlar
  patientsExaminedCount: number;
  patientDiagnosesSummary?: string;

  // D. Bajarilgan muolajalar
  procedures?: JournalProcedure[];
  proceduresDone: string[]; // for backward compat

  // E. Klinik holatlar
  clinicalCases?: ClinicalCaseItem[];
  clinicalCasesSummary: string; // for backward compat

  // F. O'rganilgan mavzular
  topicsLearned?: string;
  questionsLearned: string; // for backward compat

  // G. O'z-o'zini tahlil qilish
  selfReflection?: JournalReflection;

  // Fayllar va rasmlar
  attachments?: JournalAttachment[];
  photoURLs?: string[];

  // Rahbar tekshiruvi va baholash
  status: JournalStatus;
  supervisorFeedback?: string;
  supervisorRating?: number; // 1-5 yulduz yoki ball
  revisionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerId?: string;
  version?: number;
  updatedAt?: string;
}

export type StandardSkillCategory = 
  | "Diagnostika"
  | "Muolajalar"
  | "Terapiya"
  | "Jarrohlik"
  | "Pediatriya"
  | "Akusherlik va ginekologiya"
  | "Reanimatsiya"
  | "Tez tibbiy yordam"
  | "Laboratoriya"
  | "Infeksiya nazorati"
  | "Hamshiralik ishi"
  | "Laboratoriya & Diagnostika"
  | "Shoshilinch tibbiy yordam"
  | "Boshqa";

export type SkillCategory = StandardSkillCategory | string;

export type SkillImportance = 'MANDATORY' | 'RECOMMENDED' | 'ELECTIVE' | 'majburiy' | 'tavsiya' | 'ixtiyoriy';

export type SkillParticipationType = 
  | 'INDEPENDENT' 
  | 'SUPERVISED' 
  | 'OBSERVED'
  | 'Mustaqil'
  | 'Rahbar nazoratida'
  | 'Kuzatuvchi';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  requiredCount: number; // minimal me'yor
  recommendedCount?: number; // maksimal tavsiya etiladigan son
  description: string;
  difficulty?: 'oddiy' | 'o\'rta' | 'murakkab';
  practiceType?: string; // Amaliyot turi / fani
  course?: number | string; // Kurs (masalan: 3, 4, 5)
  specialty?: string; // Yo'nalish (Davolash ishi, Pediatriya, etc.)
  importance?: SkillImportance;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillLogEntry {
  id: string;
  studentId: string;
  practiceId: string;
  skillId: string;
  date: string; // YYYY-MM-DD
  participationType: SkillParticipationType;
  count: number;
  notes?: string;
  patientInfo?: {
    age?: number | string;
    gender?: 'Erkak' | 'Ayol' | 'male' | 'female';
    department?: string;
    clinicalCondition?: string;
  };
  supervisorId?: string;
  supervisorName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  supervisorFeedback?: string;
  supervisorRating?: number; // 1-5 baho
  dailyJournalId?: string; // Bog'langan elektron kundalik IDsi
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface StudentSkill {
  id: string;
  studentId: string;
  practiceId: string;
  skillId: string;
  performedCount: number;
  independentCount?: number;
  supervisedCount?: number;
  observedCount?: number;
  verifiedCount?: number;
  targetCount: number;
  status: 'not_started' | 'in_progress' | 'mastered' | 'NOT_STARTED' | 'IN_PROGRESS' | 'MASTERED';
  verifiedBySupervisor: boolean;
  lastPerformedDate?: string;
  notes?: string;
}

export interface Task {
  id: string;
  practiceId: string;
  title: string;
  description: string;
  deadline: string;
  status: 'OPEN' | 'CLOSED';
}

export interface Assessment {
  id: string;
  practiceId: string;
  studentId: string;
  attendanceScore: number;
  journalScore: number;
  skillsScore: number;
  finalExamScore: number;
  totalScore: number;
  grade: '5' | '4' | '3' | '2';
  assessorId: string;
  assessorName: string;
  assessmentDate: string;
  feedback: string;
  status: 'graded' | 'pending' | 'GRADED' | 'PENDING';
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: 'order' | 'contract' | 'referral' | 'syllabus' | 'report';
  docNumber: string;
  issueDate: string;
  practiceId?: string;
  studentId?: string;
  status: 'active' | 'archived' | 'ACTIVE' | 'ARCHIVED';
  description: string;
  downloadUrl?: string;
  fileURL?: string;
}

export interface AppNotification {
  id: string;
  recipientRoles?: UserRole[];
  recipientUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  createdAt: string;
  isRead: boolean;
  linkModule?: string;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'studentCreated'
  | 'studentUpdated'
  | 'studentDeleted'
  | 'practiceCreated'
  | 'practiceUpdated'
  | 'practiceStatusChanged'
  | 'assignmentCreated'
  | 'assignmentRemoved'
  | 'attendanceCreated'
  | 'attendanceUpdated'
  | 'attendanceSessionCreated'
  | 'attendanceSessionExpired'
  | 'attendanceCheckIn'
  | 'attendanceCheckOut'
  | 'attendanceManualCreated'
  | 'attendanceManualUpdated'
  | 'attendanceExcused'
  | 'attendanceDeleted'
  | 'journalSubmitted'
  | 'journalReviewed'
  | 'journalUpdated'
  | 'journalResubmitted'
  | 'journalRevisionRequested'
  | 'gradeUpdated'
  | 'documentCreated'
  | 'documentDeleted'
  | 'skillCreated'
  | 'skillUpdated'
  | 'skillDeleted'
  | 'skillLogSubmitted'
  | 'skillLogApproved'
  | 'skillLogRejected'
  | 'skillLogBatchApproved'
  | 'skillCategoryCreated'
  | 'systemReset';

export interface AuditLog {
  id: string;
  userId: string;
  userRole?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  timestamp: string;
  metadata?: string;
}
