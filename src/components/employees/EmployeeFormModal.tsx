import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Save, 
  Trash2, 
  Building2, 
  FolderKanban, 
  Sliders, 
  Check, 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Employee, EmployeeStatus, ProjectId } from '../../types';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

const PRESET_AVATARS = ['🤖', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '📈', '🎮', '👨‍🏫', '💡', '🔍', '⚙️', '🛡️'];
const PRESET_COLORS = [
  { label: 'سماوي رقمي', hex: '#06b6d4' },
  { label: 'بنفسجي نيون', hex: '#a855f7' },
  { label: 'نيلي سيبراني', hex: '#6366f1' },
  { label: 'زمردي حيوي', hex: '#10b981' },
  { label: 'وردي جريء', hex: '#f43f5e' },
  { label: 'كهرماني ذهبي', hex: '#f59e0b' }
];

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit
}) => {
  const { departments, addEmployee, editEmployee, deleteEmployee } = useCompany();

  const isEditing = Boolean(employeeToEdit);

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [avatar, setAvatar] = useState('🤖');
  const [departmentId, setDepartmentId] = useState('pm');
  const [assignedProject, setAssignedProject] = useState<ProjectId>('qaddha');
  const [status, setStatus] = useState<EmployeeStatus>('يعمل الآن');
  const [robotColor, setRobotColor] = useState('#06b6d4');
  const [currentTask, setCurrentTask] = useState('');
  const [taskProgress, setTaskProgress] = useState<number>(35);
  const [skillsStr, setSkillsStr] = useState('');
  const [permissionsStr, setPermissionsStr] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setPosition(employeeToEdit.position);
      setAvatar(employeeToEdit.avatar);
      setDepartmentId(employeeToEdit.departmentId || 'pm');
      setAssignedProject(employeeToEdit.assignedProject || 'qaddha');
      setStatus(employeeToEdit.status);
      setRobotColor(employeeToEdit.robotColor || '#06b6d4');
      setCurrentTask(employeeToEdit.currentTask);
      setTaskProgress(employeeToEdit.taskProgress ?? 45);
      setSkillsStr(employeeToEdit.skills?.join('، ') || '');
      setPermissionsStr(employeeToEdit.permissions?.join('، ') || '');
      setInstructions(employeeToEdit.instructions || '');
    } else {
      setName('');
      setPosition('');
      setAvatar('🤖');
      setDepartmentId('pm');
      setAssignedProject('qaddha');
      setStatus('يعمل الآن');
      setRobotColor('#06b6d4');
      setCurrentTask('');
      setTaskProgress(25);
      setSkillsStr('الذكاء الاصطناعي، الأتمتة السريعة');
      setPermissionsStr('تنفيذ المهام المستقلة، التنسيق مع الزملاء');
      setInstructions('التزم بالقانون رقم 1 الصارم (تكلفة صفرية دائماً) وتوليد قيمة حقيقية فورية.');
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) return;

    const deptObj = departments.find(d => d.id === departmentId);
    const departmentName = deptObj ? deptObj.name : 'إدارة عامة';

    const skills = skillsStr
      .split(/[،,]/)
      .map(s => s.trim())
      .filter(Boolean);

    const permissions = permissionsStr
      .split(/[،,]/)
      .map(p => p.trim())
      .filter(Boolean);

    if (isEditing && employeeToEdit) {
      editEmployee(employeeToEdit.id, {
        name: name.trim(),
        position: position.trim(),
        avatar,
        departmentId,
        departmentName,
        assignedProject,
        status,
        robotColor,
        currentTask: currentTask.trim() || 'تنسيق المهام المستقلة',
        taskProgress,
        skills,
        permissions,
        instructions: instructions.trim()
      });
    } else {
      addEmployee({
        name: name.trim(),
        position: position.trim(),
        avatar,
        departmentId,
        departmentName,
        assignedProject,
        status,
        robotColor,
        currentTask: currentTask.trim() || 'البدء في استكشاف المهام',
        taskProgress,
        skills,
        permissions,
        instructions: instructions.trim(),
        systemRole: 'Autonomous Agent',
        productivity: 95,
        tasksCompletedCount: 0,
        recentWork: ['انضم للمنظومة الذكية حديثاً'],
        collaborationHistory: []
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!employeeToEdit) return;
    if (confirm(`هل أنت متأكد من إنهاء تكليف الموظف «${employeeToEdit.name}»؟`)) {
      deleteEmployee(employeeToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-2xl text-right">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-lg"
            style={{ borderColor: robotColor, backgroundColor: `${robotColor}20` }}
          >
            {avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{isEditing ? `تعديل الموظف الذكي: ${employeeToEdit?.name}` : 'إضافة موظف AI جديد إلى المنظومة'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing 
                ? 'تعديل الصلاحيات، المهام، التوجيهات الأساسية، والمظهر البصري للروبوت.'
                : 'إنشاء وكيل ذكي جديد وربطه بالأقسام والمشاريع في Nawaf HQ.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Name & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم الموظف الذكي:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: يوسف، سارة، معاذ..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المسمى والتخصص:
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="مثال: مهندس واجهات، كاتب محتوى إبداعي..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Row 2: Avatar & Robot Glow Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الأيقونة / الرمز التعبيري:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AVATARS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                      avatar === av 
                        ? 'bg-cyan-500/30 border border-cyan-400 scale-110' 
                        : 'bg-slate-900 border border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                لون إضاءة الروبوت (Glow):
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setRobotColor(c.hex)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      robotColor === c.hex ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {robotColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Department & Project */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                القسم التشغيلي:
              </label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                المشروع المخصص:
              </label>
              <select
                value={assignedProject}
                onChange={e => setAssignedProject(e.target.value as ProjectId)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="qaddha">قدّها (لعبة الأسئلة والتحديات)</option>
                <option value="mueen">مُعين (المساعد القرآني والروحي)</option>
                <option value="general">مركز الشركة العام (HQ Core)</option>
              </select>
            </div>
          </div>

          {/* Row 4: Status & Task Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                حالة العمل الحالية:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EmployeeStatus)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="يعمل الآن">يعمل الآن</option>
                <option value="يطور">يطور</option>
                <option value="يصمم">يصمم</option>
                <option value="يبحث">يبحث</option>
                <option value="يحلل">يحلل</option>
                <option value="ينتظر قرارك">ينتظر قرارك</option>
                <option value="متوقف مؤقتًا">متوقف مؤقتًا</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>نسبة إنجاز المهمة:</span>
                <span className="font-mono text-cyan-300">{taskProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={taskProgress}
                onChange={e => setTaskProgress(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Row 5: Current Task */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              المهمة قيد التنفيذ حالياً:
            </label>
            <input
              type="text"
              required
              value={currentTask}
              onChange={e => setCurrentTask(e.target.value)}
              placeholder="اكتب وصف المهمة التي يقوم بها الروبوت حالياً..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Row 6: Permissions & System Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              الصلاحيات الممنوحة (افصل بفواصل):
            </label>
            <input
              type="text"
              value={permissionsStr}
              onChange={e => setPermissionsStr(e.target.value)}
              placeholder="مثال: قراءة ملفات التصميم، رفع التحديثات التجريبية، التعاون مع فريق التسويق..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>التعليمات التأسيسية للموظف (System Prompt / Instructions):</span>
              <span className="text-[10px] text-slate-500 font-normal">تتحكم بسلوك الوكيل الذكي</span>
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="اكتب التوجيهات الإلزامية التي يتبعها هذا الوكيل الذكي..."
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
            />
          </div>

          {/* Actions Bar */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إنهاء التكليف والحذف</span>
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الموظف الذكي'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
