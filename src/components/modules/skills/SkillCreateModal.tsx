import React, { useState, useEffect } from 'react';
import { Plus, Check, AlertCircle, Stethoscope, Tag, BookOpen, Layers } from 'lucide-react';
import { Modal } from '../../common/Modal';
import { Skill, SkillImportance, SkillCategory } from '../../../types';
import { storageService } from '../../../services/storageService';
import { useToast } from '../../../context/ToastContext';

interface SkillCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editSkill?: Skill | null;
  actorUserId?: string;
  actorRole?: string;
}

export function SkillCreateModal({
  isOpen,
  onClose,
  onSuccess,
  editSkill,
  actorUserId = 'user-admin',
  actorRole = 'SUPER_ADMIN'
}: SkillCreateModalProps) {
  const { showToast } = useToast();
  const availableCategories = storageService.getSkillCategories();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Diagnostika');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [requiredCount, setRequiredCount] = useState<number>(10);
  const [recommendedCount, setRecommendedCount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<'oddiy' | 'o\'rta' | 'murakkab'>('o\'rta');
  const [practiceType, setPracticeType] = useState('Klinik amaliyot');
  const [course, setCourse] = useState<string>('4');
  const [specialty, setSpecialty] = useState('Davolash ishi');
  const [importance, setImportance] = useState<SkillImportance>('MANDATORY');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editSkill) {
      setName(editSkill.name);
      setCategory(editSkill.category);
      setDescription(editSkill.description || '');
      setRequiredCount(editSkill.requiredCount || 10);
      setRecommendedCount(editSkill.recommendedCount || (editSkill.requiredCount * 2));
      setDifficulty(editSkill.difficulty || 'o\'rta');
      setPracticeType(editSkill.practiceType || 'Klinik amaliyot');
      setCourse(String(editSkill.course || '4'));
      setSpecialty(editSkill.specialty || 'Davolash ishi');
      setImportance(editSkill.importance || 'MANDATORY');
      setIsActive(editSkill.isActive !== undefined ? editSkill.isActive : true);
    } else {
      setName('');
      setCategory(availableCategories[0] || 'Diagnostika');
      setCustomCategory('');
      setIsAddingNewCategory(false);
      setDescription('');
      setRequiredCount(10);
      setRecommendedCount(20);
      setDifficulty('o\'rta');
      setPracticeType('Klinik amaliyot');
      setCourse('4');
      setSpecialty('Davolash ishi');
      setImportance('MANDATORY');
      setIsActive(true);
    }
    setError('');
  }, [editSkill, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Ko\'nikma nomini kiritish majburiy.');
      return;
    }

    let finalCategory = category;
    if (isAddingNewCategory) {
      if (!customCategory.trim()) {
        setError('Yangi kategoriya nomini kiriting.');
        return;
      }
      finalCategory = customCategory.trim();
      storageService.addSkillCategory(finalCategory, actorUserId, actorRole);
    }

    const numReq = Number(requiredCount);
    if (!numReq || numReq <= 0) {
      setError('Minimal me\'yor kamida 1 bo\'lishi kerak.');
      return;
    }

    const numRec = Number(recommendedCount) || numReq;

    if (editSkill) {
      storageService.updateSkill(
        editSkill.id,
        {
          name: name.trim(),
          category: finalCategory,
          description: description.trim(),
          requiredCount: numReq,
          recommendedCount: numRec,
          difficulty,
          practiceType,
          course: course,
          specialty,
          importance,
          isActive
        },
        actorUserId,
        actorRole
      );
      showToast('success', 'Ko\'nikma tahrirlandi', `"${name}" muvaffaqiyatli yangilandi.`);
    } else {
      storageService.createSkill(
        {
          name: name.trim(),
          category: finalCategory,
          description: description.trim(),
          requiredCount: numReq,
          recommendedCount: numRec,
          difficulty,
          practiceType,
          course: course,
          specialty,
          importance,
          isActive
        },
        actorUserId,
        actorRole
      );
      showToast('success', 'Yangi ko\'nikma yaratildi', `"${name}" katalogga qo'shildi.`);
    }

    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSkill ? "Ko'nikmani tahrirlash" : "Yangi klinik ko'nikma qo'shish"}
      subtitle="Amaliy ko'nikmalar katalogi va ta'lim dasturi me'yorlarini sozlash"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Skill Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Ko'nikma / Manipulyatsiya nomi *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Masalan: Arterial qon bosimini Korotkov usulida o'lchash"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            required
          />
        </div>

        {/* Category & New Category Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-800">
              Klinik kategoriya *
            </label>
            <button
              type="button"
              onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              {isAddingNewCategory ? 'Mavjud kategoriyalardan tanlash' : '+ Yangi kategoriya kiritish'}
            </button>
          </div>

          {isAddingNewCategory ? (
            <input
              type="text"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              placeholder="Yangi kategoriya nomini kiriting (masalan: Oftalmologiya, Nevrologiya)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              required
            />
          ) : (
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {/* Counts Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Minimal me'yor (marta) *
            </label>
            <input
              type="number"
              min={1}
              value={requiredCount}
              onChange={e => setRequiredCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              required
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Pasport uchun majburiy</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Tavsiya etilgan son
            </label>
            <input
              type="number"
              min={1}
              value={recommendedCount}
              onChange={e => setRecommendedCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">Maksimal / rag'batlantiruvchi</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Murakkablik darajasi
            </label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="oddiy">Oddiy</option>
              <option value="o'rta">O'rta</option>
              <option value="murakkab">Murakkab</option>
            </select>
          </div>
        </div>

        {/* Practice Type, Course, Specialty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Amaliyot turi / Fani
            </label>
            <select
              value={practiceType}
              onChange={e => setPracticeType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="Klinik amaliyot">Klinik amaliyot</option>
              <option value="Hamshiralik amaliyoti">Hamshiralik amaliyoti</option>
              <option value="Pediatriya amaliyoti">Pediatriya amaliyoti</option>
              <option value="Xirurgik amaliyot">Xirurgik amaliyot</option>
              <option value="Umumiy amaliyot">Umumiy amaliyot</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Kurs
            </label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="1">1-kurs</option>
              <option value="2">2-kurs</option>
              <option value="3">3-kurs</option>
              <option value="4">4-kurs</option>
              <option value="5">5-kurs</option>
              <option value="6">6-kurs</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Muhimlik darajasi
            </label>
            <select
              value={importance}
              onChange={e => setImportance(e.target.value as SkillImportance)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="MANDATORY">Majburiy (Mandatory)</option>
              <option value="RECOMMENDED">Tavsiya etilgan (Recommended)</option>
              <option value="ELECTIVE">Ixtiyoriy (Elective)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Ko'nikma tavsifi va klinik protokoli
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Manipulyatsiyani bajarish tartibi, aseptika, talab etiladigan asboblar..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActiveSkill"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isActiveSkill" className="text-xs font-medium text-slate-800 cursor-pointer">
            Faol ko'nikma (talabalar pasportida va kundalikda aks ettiriladi)
          </label>
        </div>

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{editSkill ? "O'zgarishlarni saqlash" : "Katalogga qo'shish"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
