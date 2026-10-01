import { firestoreService } from './firestoreService';
import { AcademicYear, Faculty, Direction, Course, Group } from '../types';
import { collection, Timestamp, doc, runTransaction, query, where, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import { storageService } from './storageService';

const COLLECTIONS = {
  academicYears: 'academicYears',
  faculties: 'faculties',
  directions: 'directions',
  courses: 'courses',
  groups: 'groups'
};

export const academicStructureService = {
  // Academic Years
  getAcademicYears: async () => {
    const fsData = await firestoreService.queryDocuments(COLLECTIONS.academicYears, []) as AcademicYear[];
    const lsData = storageService.getAcademicYears();
    return mergeData(fsData, lsData, 'id');
  },
  
  // Faculties
  getFaculties: async (academicYearId: string) => {
    const constraints: QueryConstraint[] = [where('academicYearId', '==', academicYearId)];
    const fsData = await firestoreService.queryDocuments(COLLECTIONS.faculties, constraints) as Faculty[];
    const lsData = storageService.getFaculties().filter(f => f.academicYearId === academicYearId);
    return mergeData(fsData, lsData, 'id');
  },

  // Directions
  getDirections: async (facultyId: string) => {
    const constraints: QueryConstraint[] = [where('facultyId', '==', facultyId)];
    const fsData = await firestoreService.queryDocuments(COLLECTIONS.directions, constraints) as Direction[];
    const lsData = storageService.getDirections().filter(d => d.facultyId === facultyId);
    return mergeData(fsData, lsData, 'id');
  },
  
  // Courses
  getCourses: async (academicYearId: string) => {
    const constraints: QueryConstraint[] = [where('academicYearId', '==', academicYearId)];
    const fsData = await firestoreService.queryDocuments(COLLECTIONS.courses, constraints) as Course[];
    const lsData = storageService.getCourses().filter(c => c.academicYearId === academicYearId);
    return mergeData(fsData, lsData, 'id');
  },

  // Groups
  getGroups: async (academicYearId: string, directionId: string) => {
    const constraints: QueryConstraint[] = [
        where('academicYearId', '==', academicYearId),
        where('directionId', '==', directionId)
    ];
    const fsData = await firestoreService.queryDocuments(COLLECTIONS.groups, constraints) as Group[];
    const lsData = storageService.getGroups().filter(g => g.academicYearId === academicYearId && g.directionId === directionId);
    return mergeData(fsData, lsData, 'id');
  }
};

// Helper: Merge Firestore and LocalStorage data
function mergeData<T extends { id: string }>(fsData: T[], lsData: T[], idField: keyof T): T[] {
    const fsMap = new Map(fsData.map(item => [item[idField], item]));
    lsData.forEach(item => {
        if (!fsMap.has(item[idField])) {
            fsMap.set(item[idField], item);
        }
    });
    return Array.from(fsMap.values());
}
