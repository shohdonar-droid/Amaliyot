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
  group?: string;
  course?: string | number;
  faculty?: string;
  direction?: string;
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
  position?: string;
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
  durationDays?: number;
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
  description: string;
  requiredCount: number; // minimal me'yor
  recommendedCount?: number; // maksimal tavsiya etiladigan son
  facultyIds?: string[];
  directionIds?: string[];
  courseIds?: string[];
  practiceTypeIds?: string[];
  difficulty?: 'oddiy' | 'o\'rta' | 'murakkab' | string;
  practiceType?: string; // Amaliyot turi / fani
  course?: number | string; // Kurs (masalan: 3, 4, 5)
  specialty?: string; // Yo'nalish (Davolash ishi, Pediatriya, etc.)
  importance?: SkillImportance;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SkillRecordStatus = 'PENDING' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION';
export type SkillPerformanceType = 'OBSERVED' | 'SUPERVISED' | 'INDEPENDENT' | 'Mustaqil' | 'Rahbar nazoratida' | 'Kuzatuvchi';

export interface SkillRecord {
  id: string;
  studentSkillId?: string;
  studentId: string;
  practiceId: string;
  assignmentId?: string;
  skillId: string;
  date: string; // YYYY-MM-DD
  count: number;
  performanceType?: 'OBSERVED' | 'SUPERVISED' | 'INDEPENDENT';
  participationType?: SkillParticipationType; // backwards-compatible alias
  source?: 'MANUAL' | 'DAILY_JOURNAL';
  journalId?: string;
  dailyJournalId?: string; // backwards-compatible alias
  attendanceId?: string;
  description?: string;
  notes?: string; // backwards-compatible alias
  evidenceUrls?: string[];
  attachmentUrl?: string;
  attachmentName?: string;
  patientInfo?: {
    age?: number | string;
    gender?: 'Erkak' | 'Ayol' | 'male' | 'female';
    department?: string;
    clinicalCondition?: string;
  };
  status: SkillRecordStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  revisionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  supervisorFeedback?: string;
  supervisorRating?: number; // 1-5 baho
  supervisorId?: string;
  supervisorName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SkillLogEntry = SkillRecord;

export type StudentSkillStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REVISION' 
  | 'COMPLETED' 
  | 'not_started' 
  | 'in_progress' 
  | 'mastered' 
  | 'MASTERED';

export interface StudentSkill {
  id: string;
  studentId: string;
  practiceId: string;
  assignmentId?: string;
  skillId: string;
  practicePlaceId?: string;
  departmentId?: string;
  supervisorId?: string;
  requiredCount?: number;
  targetCount?: number; // backwards-compatible alias
  observedCount?: number;
  supervisedCount?: number;
  independentCount?: number;
  totalPerformedCount?: number;
  performedCount?: number; // backwards-compatible alias
  approvedCount?: number;
  verifiedCount?: number; // backwards-compatible alias
  status: StudentSkillStatus;
  progressPercent?: number;
  verifiedBySupervisor?: boolean;
  lastPerformedDate?: string;
  lastPerformedAt?: string;
  lastApprovedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  practiceId: string;
  title: string;
  description: string;
  deadline: string;
  status: 'OPEN' | 'CLOSED';
}

export type AssessmentStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_EXAM'
  | 'EXAM_COMPLETED'
  | 'WAITING_FOR_APPROVAL'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'FAILED'
  | 'RETAKE_REQUIRED'
  | 'COMPLETED'
  | 'graded'
  | 'pending'
  | 'GRADED'
  | 'PENDING';

export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'CANCELLED';

export interface FinalExam {
  id: string;
  practiceId: string;
  studentId: string;
  assignmentId?: string;
  examDate: string; // YYYY-MM-DD
  examTime?: string; // HH:mm
  placeName?: string;
  departmentName?: string;
  examinerIds: string[];
  examinerNames?: string[];
  commissionId?: string;
  theoryScore: number; // Max 6
  practicalScore: number; // Max 8
  clinicalCaseScore: number; // Max 8
  professionalismScore: number; // Max 4
  safetyScore: number; // Max 4
  totalScore: number; // Max 30
  maxScore: number; // 30
  percentage: number; // 0-100%
  status: ExamStatus;
  comments?: string;
  attemptNumber?: number; // 1, 2
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttestationCommission {
  id: string;
  name: string;
  chairpersonId: string;
  chairpersonName: string;
  memberIds: string[];
  memberNames: string[];
  position?: string;
  department?: string;
  facultyId?: string;
  facultyName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AssessmentSettings {
  id: string;
  attendanceMaxScore: number; // 20
  journalMaxScore: number; // 20
  skillsMaxScore: number; // 30
  finalExamMaxScore: number; // 30
  grade5Min: number; // 86
  grade4Min: number; // 71
  grade3Min: number; // 56
  grade2Min: number; // 0
  examCriteriaWeights: {
    theoryMax: number; // 6
    practicalMax: number; // 8
    clinicalCaseMax: number; // 8
    professionalismMax: number; // 4
    safetyMax: number; // 4
  };
  attendanceFormula?: 'LINEAR' | 'STRICT';
  updatedAt?: string;
}

export interface AssessmentHistoryItem {
  attempt: number;
  date: string;
  attendanceScore: number;
  journalScore: number;
  skillsScore: number;
  finalExamScore: number;
  totalScore: number;
  grade: string;
  status: AssessmentStatus;
  reason?: string;
  evaluator?: string;
}

export interface Assessment {
  id: string;
  practiceId: string;
  studentId: string;
  assignmentId?: string;

  attendanceScore: number;
  attendanceMaxScore?: number;

  journalScore: number;
  journalMaxScore?: number;

  skillsScore: number;
  skillsMaxScore?: number;

  finalExamScore: number;
  finalExamMaxScore?: number;

  totalScore: number;
  percentage?: number;

  grade: '5' | '4' | '3' | '2';
  status: AssessmentStatus;

  commissionId?: string;
  commissionName?: string;
  assessorId?: string;
  assessorName?: string;
  assessmentDate?: string;
  feedback?: string;
  comments?: string;

  approvedBy?: string;
  approvedAt?: string;

  retakeReason?: string;
  retakeExamDate?: string;
  retakeCount?: number;
  history?: AssessmentHistoryItem[];

  isAttendanceComplete?: boolean;
  isJournalComplete?: boolean;
  isSkillsComplete?: boolean;
  isExamComplete?: boolean;
  validationErrors?: string[];

  createdAt?: string;
  updatedAt?: string;
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
  | 'skillRecordCreated'
  | 'skillRecordUpdated'
  | 'skillRecordSubmitted'
  | 'skillRecordApproved'
  | 'skillRecordRevisionRequested'
  | 'studentSkillCompleted'
  | 'skillProgressUpdated'
  | 'skillLogSubmitted'
  | 'skillLogApproved'
  | 'skillLogRejected'
  | 'skillLogBatchApproved'
  | 'skillCategoryCreated'
  | 'assessmentCreated'
  | 'assessmentCalculated'
  | 'examCreated'
  | 'examScoreEntered'
  | 'assessmentApproved'
  | 'assessmentRejected'
  | 'retakeRequested'
  | 'retakeScheduled'
  | 'finalResultPublished'
  | 'commissionCreated'
  | 'commissionUpdated'
  | 'assessmentSettingsUpdated'
  | 'finalReportGenerated'
  | 'reportExported'
  | 'reportPrinted'
  | 'vedomostCreated'
  | 'vedomostUpdated'
  | 'vedomostSigned'
  | 'vedomostApproved'
  | 'vedomostArchived'
  | 'verificationGenerated'
  | 'finalStatusCalculated'
  | 'studentStatusSynced'
  | 'problemResolved'
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

// ==========================================
// --- STAGE 8: YAKUNIY HISOBOTLAR VA NAZORAT MARKAZI ---
// ==========================================

export type StudentPracticeOverallStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PRACTICE_COMPLETED'
  | 'WAITING_FOR_EXAM'
  | 'EXAM_COMPLETED'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'FAILED'
  | 'RETAKE_REQUIRED'
  | 'COMPLETED';

export type VedomostStatus = 'DRAFT' | 'GENERATED' | 'SIGNED' | 'APPROVED' | 'ARCHIVED';

export interface VedomostStudentRow {
  studentId: string;
  fullName: string;
  studentCode: string;
  group: string;
  attendanceScore: number;
  journalScore: number;
  skillsScore: number;
  finalExamScore: number;
  totalScore: number;
  grade: '5' | '4' | '3' | '2';
  gradeWord: string;
  status: string;
  signature?: string;
}

export interface OfficialVedomost {
  id: string;
  vedomostNumber: string; // e.g. "VED-2026-09-001"
  title: string;
  academicYear: string;
  facultyId: string;
  facultyName?: string;
  directionId?: string;
  directionName?: string;
  courseLevel?: number;
  groupId: string;
  groupName?: string;
  practiceId: string;
  practiceName?: string;
  practiceCode?: string;
  practiceStartDate?: string;
  practiceEndDate?: string;
  practicePlaceId?: string;
  practicePlaceName?: string;
  commissionId?: string;
  commissionName?: string;
  commissionChairperson?: string;
  commissionMembers?: string[];
  departmentChair?: string;
  deanName?: string;
  issueDate: string;
  status: VedomostStatus;
  students: VedomostStudentRow[];
  totalStudentsCount: number;
  grade5Count: number;
  grade4Count: number;
  grade3Count: number;
  grade2Count: number;
  masteryPercentage: number; // >= 55 ball
  qualityPercentage: number; // >= 71 ball
  retakeCount: number;
  verificationCode: string; // e.g. "TMA-VRF-98214"
  qrPayload?: string;
  signedAt?: string;
  signedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProblemType = 
  | 'ATTENDANCE_INSUFFICIENT'
  | 'QR_ATTENDANCE_ISSUE'
  | 'JOURNAL_MISSING'
  | 'JOURNAL_REVISION'
  | 'SKILLS_QUOTA_UNMET'
  | 'SUPERVISOR_APPROVAL_MISSING'
  | 'EXAM_UNSCHEDULED'
  | 'EXAM_ABSENT'
  | 'ATTESTATION_UNAPPROVED'
  | 'RETAKE_REQUIRED'
  | 'DOCUMENT_MISSING';

export interface ProblemStudent {
  id: string;
  studentId: string;
  studentName: string;
  group: string;
  faculty: string;
  practiceId: string;
  practiceName: string;
  practicePlaceName?: string;
  supervisorName?: string;
  problemType: ProblemType;
  problemLabel: string;
  detectedDate: string;
  responsiblePerson: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'RESOLVED' | 'IN_REVIEW';
  comment: string;
  details?: string;
}

export interface StudentTimelineStep {
  stepNumber: number;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'PROBLEM';
  date?: string;
  description: string;
  details?: string;
}

