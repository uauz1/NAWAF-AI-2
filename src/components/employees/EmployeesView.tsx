import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Sparkles, 
  Activity, 
  CheckCircle, 
  ArrowUpRight,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { Employee, EmployeeStatus } from '../../types';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeFormModal } from './EmployeeFormModal';

export const EmployeesView: React.FC = () => {
  const { employees, selectedEmployee, setSelectedEmployee } = useCompany();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.currentTask.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'all' || emp.departmentId === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'all' || emp.status === selectedStatusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case 'يعمل الآن':
      case 'يطور':
      case 'يصمم':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'يبحث':
      case 'يحلل':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'ينتظر قرارك':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';
      case 'متوقف مؤقتًا':
        return 'bg-slate-800 text-slate-400 border-white/5';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                فريق موظفي الذكاء الاصطناعي (AI Workforce)
              </h2>
              <span className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                {employees.length} موظفاً
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              كادر متكامل من الوكلاء الأذكياء Fictional AI Agents يعملون باستقلالية وتنسيق ذاتي على تطوير مشاريعك.
            </p>
          </div>

          {/* Quick Search & Filters + Add Employee Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة موظف AI جديد</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو التخصص..."
                className="bg-slate-900 border border-white/10 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">جميع الأقسام</option>
              <option value="pm">إدارة المشاريع</option>
              <option value="tech">التقنية والتطوير</option>
              <option value="design">التصميم والإبداع</option>
              <option value="marketing">التسويق والنمو</option>
              <option value="research">البحث والابتكار</option>
              <option value="qa">التحليلات والجودة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => {
          return (
            <div
              key={emp.id}
              id={`emp-card-${emp.id}`}
              onClick={() => setSelectedEmployee(emp)}
              className="rounded-2xl glass-panel p-5 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              {/* Top: Avatar, Name, Position, Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0"
                      style={{ 
                        borderColor: emp.robotColor ? `${emp.robotColor}60` : 'rgba(255,255,255,0.1)',
                        backgroundColor: emp.robotColor ? `${emp.robotColor}15` : 'rgba(15,23,42,0.8)' 
                      }}
                    >
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: emp.robotColor || '#10b981' }}
                        ></span>
                      </div>
                      <div className="text-xs text-slate-400">{emp.position}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(emp.status)}`}>
                    {emp.status}
                  </span>
                </div>

                {/* Department & Assigned Project */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-3">
                  <span className="text-cyan-400 font-medium">{emp.departmentName}</span>
                  <span>•</span>
                  <span>مشروع: <strong className="text-purple-300">{emp.assignedProject === 'mueen' ? 'مُعين' : emp.assignedProject === 'qaddha' ? 'قدّها' : 'HQ'}</strong></span>
                </div>

                {/* Current Task Snippet with Progress */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cyan-400 font-semibold truncate max-w-[170px]">{emp.currentTask}</span>
                    <span className="font-mono text-[10px] text-cyan-300 font-bold">{emp.taskProgress ?? 50}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${emp.taskProgress ?? 50}%`,
                        backgroundColor: emp.robotColor || '#06b6d4'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom: Productivity & Completed Count */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">الإنتاجية</span>
                    <span className="font-bold text-emerald-400 font-mono">{emp.productivity}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">مهام منجزة</span>
                    <span className="font-bold text-white font-mono">{emp.tasksCompletedCount}</span>
                  </div>
                </div>

                <div className="text-xs text-cyan-400 font-medium group-hover:translate-x-[-2px] transition-transform flex items-center gap-1">
                  <span>الملف الكامل والتعديل</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Employee Modal (Details & Edit) */}
      <EmployeeModal 
        employee={selectedEmployee} 
        onClose={() => setSelectedEmployee(null)} 
      />

      {/* Add New Employee Modal */}
      <EmployeeFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

    </div>
  );
};

