import React from 'react';
import { 
  X, 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Briefcase,
  Zap,
  FolderKanban
} from 'lucide-react';
import { Department } from '../../types';
import { useCompany } from '../../context/CompanyContext';

interface DepartmentModalProps {
  department: Department | null;
  onClose: () => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({ department, onClose }) => {
  const { employees, setSelectedEmployee, setActiveTab } = useCompany();

  if (!department) return null;

  const deptEmployees = employees.filter(e => e.departmentId === department.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel p-6 border border-white/10 shadow-2xl overflow-hidden bg-[#0a0f1d]">
        
        {/* Ambient glow */}
        <div 
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: department.glowColor || '#06b6d4' }}
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{department.name}</h2>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {department.nameEn}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مسؤول القسم: <span className="text-white font-bold">{department.managerName}</span> ({department.managerTitle})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description & Responsibilities */}
        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            {department.description}
          </p>

          <div>
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>المسؤوليات التشغيلية الرئيسية:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {department.responsibilities.map((resp, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Team Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>فريق العمل الذكي ({deptEmployees.length}):</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  setActiveTab('employees');
                }}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>إدارة الفريق</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {deptEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    onClose();
                    setSelectedEmployee(emp);
                  }}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-950 border border-cyan-500/30 flex items-center justify-center text-lg">
                      {emp.avatar || '🤖'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {emp.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {emp.position}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      {emp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>القسم يعمل بتناغم تام ومؤتمت بنسبة 100%</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
