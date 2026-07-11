import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';
import { ToggleLeft, ToggleRight, Loader2, Save, Plus, Trash2, Clock, Calendar } from 'lucide-react';

const DEFAULT_STATUS = {
  senior: {
    FY_BBA: true,
    FY_BCA: true,
    FY_BCOM: true,
    FY_BA: true,
    SY_BBA: true,
    SY_BCA: true,
    SY_BCOM: true,
    SY_BA: true,
    TY_BBA: true,
    TY_BCA: true,
    TY_BCOM: true,
    TY_BA: true,
  },
  junior: {
    '11th_Science': true,
    '11th_Commerce': true,
    '11th_Arts': true,
    '11th_CET': true,
    '12th_Science': true,
    '12th_Commerce': true,
    '12th_Arts': true,
    '12th_CET': true,
  },
  hybrid: {
    senior: true,
    junior: true,
  },
};

const SENIOR_YEARS = ['FY', 'SY', 'TY'];
const SENIOR_COURSES = ['BBA', 'BCA', 'BCOM', 'BA'];
const COURSE_LABELS = { BBA: 'BBA', BCA: 'BCA', BCOM: 'B.Com', BA: 'BA' };
const JUNIOR_STANDARDS = ['11th', '12th'];
const JUNIOR_STREAMS = ['Science', 'Commerce', 'Arts', 'CET'];

// Build a flat list of all controllable targets for the schedule dropdown
const ALL_TARGETS = [
  ...SENIOR_YEARS.flatMap((y) =>
    SENIOR_COURSES.map((c) => ({
      value: `senior.${y}_${c}`,
      label: `${y} ${COURSE_LABELS[c]}`,
      group: 'Senior College',
    }))
  ),
  ...JUNIOR_STANDARDS.flatMap((s) =>
    JUNIOR_STREAMS.map((st) => ({
      value: `junior.${s}_${st}`,
      label: `${s} ${st}`,
      group: 'Junior College',
    }))
  ),
  { value: 'hybrid.senior', label: 'Senior Hybrid Mode', group: 'Hybrid' },
  { value: 'hybrid.junior', label: 'Junior Hybrid Mode', group: 'Hybrid' },
];

const AdminAdmissionControl = () => {
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [schedules, setSchedules] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ target: '', action: false, at: '' });

  const docRef = useMemo(() => doc(db, 'siteContent', 'admissionStatus'), []);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const snap = await getDoc(docRef);
        if (!snap.exists() || ignore) {
          setIsLoading(false);
          return;
        }
        const data = snap.data() || {};
        const initialStatus = {
          senior: { ...DEFAULT_STATUS.senior, ...(data.senior || {}) },
          junior: { ...DEFAULT_STATUS.junior, ...(data.junior || {}) },
          hybrid: { ...DEFAULT_STATUS.hybrid, ...(data.hybrid || {}) },
        };
        const initialSchedules = data.schedules || [];
        
        // Auto-apply past schedules on initial load too
        const now = new Date();
        const pastSchedules = initialSchedules.filter(s => now >= new Date(s.at));
        if (pastSchedules.length > 0) {
          const updatedStatus = { ...initialStatus };
          const remainingSchedules = initialSchedules.filter(s => now < new Date(s.at));
          for (const sch of pastSchedules) {
            const [section, key] = sch.target.split('.');
            if (updatedStatus[section] !== undefined) {
              updatedStatus[section] = { ...updatedStatus[section], [key]: sch.action };
            }
          }
          setStatus(updatedStatus);
          setSchedules(remainingSchedules);
          // Save the clean applied state to Firestore automatically
          setDoc(docRef, {
            ...data,
            senior: updatedStatus.senior,
            junior: updatedStatus.junior,
            hybrid: updatedStatus.hybrid,
            schedules: remainingSchedules,
            updatedAt: serverTimestamp(),
          });
        } else {
          setStatus(initialStatus);
          setSchedules(initialSchedules);
        }
        setIsLoading(false);
      } catch (e) {
        if (!ignore) {
          toastError('Error', e?.message || 'Failed to load admission status');
          setIsLoading(false);
        }
      }
    };

    load();

    // Check every 5 seconds for newly past-due schedules and apply/clean them up automatically
    const interval = setInterval(() => {
      setSchedules((currentSchedules) => {
        const now = new Date();
        const past = currentSchedules.filter((s) => now >= new Date(s.at));
        if (past.length > 0) {
          const remaining = currentSchedules.filter((s) => now < new Date(s.at));
          setStatus((currentStatus) => {
            const updatedStatus = {
              senior: { ...currentStatus.senior },
              junior: { ...currentStatus.junior },
              hybrid: { ...currentStatus.hybrid },
            };
            for (const sch of past) {
              const [section, key] = sch.target.split('.');
              if (updatedStatus[section] !== undefined) {
                updatedStatus[section] = { ...updatedStatus[section], [key]: sch.action };
              }
            }
            // Auto-persist the update to Firestore
            setDoc(docRef, {
              senior: updatedStatus.senior,
              junior: updatedStatus.junior,
              hybrid: updatedStatus.hybrid,
              schedules: remaining,
              updatedAt: serverTimestamp(),
            }).then(() => {
              success('Schedule Triggered', `${past.length} scheduled change(s) auto-applied and saved.`);
            }).catch((err) => {
              console.error('Failed to auto-save scheduled update:', err);
            });
            return updatedStatus;
          });
          return remaining;
        }
        return currentSchedules;
      });
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docRef]);

  const toggleSenior = (key) => {
    setStatus((prev) => ({
      ...prev,
      senior: { ...prev.senior, [key]: !prev.senior[key] },
    }));
  };

  const toggleJunior = (key) => {
    setStatus((prev) => ({
      ...prev,
      junior: { ...prev.junior, [key]: !prev.junior[key] },
    }));
  };

  const toggleHybrid = (key) => {
    setStatus((prev) => ({
      ...prev,
      hybrid: { ...prev.hybrid, [key]: !prev.hybrid[key] },
    }));
  };

  // Apply past-due schedules to current status and return remaining schedules
  const processPastSchedules = (currentStatus, currentSchedules) => {
    const now = new Date();
    const updatedStatus = {
      senior: { ...currentStatus.senior },
      junior: { ...currentStatus.junior },
      hybrid: { ...currentStatus.hybrid },
    };
    const remaining = [];

    for (const sch of currentSchedules) {
      const schTime = new Date(sch.at);
      if (now >= schTime) {
        // Apply this schedule
        const [section, key] = sch.target.split('.');
        if (updatedStatus[section] !== undefined) {
          updatedStatus[section] = { ...updatedStatus[section], [key]: sch.action };
        }
      } else {
        remaining.push(sch);
      }
    }

    return { updatedStatus, remaining };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto-apply any past-due schedules before saving
      const { updatedStatus, remaining } = processPastSchedules(status, schedules);

      await setDoc(docRef, {
        senior: updatedStatus.senior,
        junior: updatedStatus.junior,
        hybrid: updatedStatus.hybrid,
        schedules: remaining,
        updatedAt: serverTimestamp(),
      });

      setStatus(updatedStatus);
      setSchedules(remaining);

      const appliedCount = schedules.length - remaining.length;
      if (appliedCount > 0) {
        success('Saved', `Status updated. ${appliedCount} past schedule(s) auto-applied.`);
      } else {
        success('Saved', 'Admission status updated successfully.');
      }
    } catch (e) {
      toastError('Error', e?.message || 'Failed to save admission status');
    } finally {
      setIsSaving(false);
    }
  };

  const addSchedule = () => {
    if (!newSchedule.target || !newSchedule.at) {
      toastError('Missing fields', 'Please select a target and date/time.');
      return;
    }
    const targetInfo = ALL_TARGETS.find((t) => t.value === newSchedule.target);
    const entry = {
      id: `sch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      target: newSchedule.target,
      action: newSchedule.action,
      at: new Date(newSchedule.at).toISOString(),
      label: targetInfo?.label || newSchedule.target,
    };
    setSchedules((prev) => [...prev, entry]);
    setNewSchedule({ target: '', action: false, at: '' });
    setShowAddForm(false);
    success('Schedule Added', `Will ${entry.action ? 'enable' : 'disable'} ${entry.label} at ${new Date(entry.at).toLocaleString()}. Don't forget to Save!`);
  };

  const removeSchedule = (id) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Get minimum datetime for the picker (now)
  const getMinDatetime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Admission Control</h2>
          <p className="text-gray-500 mt-1">Enable or disable admissions for each course. Changes take effect immediately after saving.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-60"
          style={{ backgroundColor: '#800020' }}
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Senior College Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">Senior College Admissions</h3>
          <p className="text-sm text-gray-500 mt-1">FY / SY / TY — BBA, BCA, B.Com, BA</p>
        </div>
        <div className="p-6">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-5 gap-4 mb-4 px-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Year</div>
            {SENIOR_COURSES.map((c) => (
              <div key={c} className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">
                {COURSE_LABELS[c]}
              </div>
            ))}
          </div>

          {/* Rows */}
          {SENIOR_YEARS.map((year) => (
            <div
              key={year}
              className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center py-4 px-2 border-b border-gray-100 last:border-0"
            >
              <div className="col-span-2 sm:col-span-1 font-bold text-gray-700 text-lg">{year}</div>
              {SENIOR_COURSES.map((course) => {
                const key = `${year}_${course}`;
                const isOpen = status.senior[key];
                return (
                  <div key={key} className="flex items-center justify-between sm:justify-center gap-2">
                    <span className="text-sm text-gray-600 sm:hidden">{COURSE_LABELS[course]}</span>
                    <button
                      type="button"
                      onClick={() => toggleSenior(key)}
                      className="flex items-center gap-2 group"
                      title={isOpen ? 'Click to close' : 'Click to open'}
                    >
                      {isOpen ? (
                        <ToggleRight className="w-10 h-10 text-green-500 transition-colors group-hover:text-green-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-300 transition-colors group-hover:text-gray-400" />
                      )}
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isOpen ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Junior College Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">Junior College Admissions</h3>
          <p className="text-sm text-gray-500 mt-1">11th & 12th Standard — Science, Commerce, Arts, CET</p>
        </div>
        <div className="p-6">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-5 gap-4 mb-4 px-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Standard</div>
            {JUNIOR_STREAMS.map((s) => (
              <div key={s} className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">
                {s}
              </div>
            ))}
          </div>

          {/* Rows */}
          {JUNIOR_STANDARDS.map((std) => (
            <div
              key={std}
              className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center py-4 px-2 border-b border-gray-100 last:border-0"
            >
              <div className="col-span-2 sm:col-span-1 font-bold text-gray-700 text-lg">{std}</div>
              {JUNIOR_STREAMS.map((stream) => {
                const key = `${std}_${stream}`;
                const isOpen = status.junior[key] !== false;
                return (
                  <div key={key} className="flex items-center justify-between sm:justify-center gap-2">
                    <span className="text-sm text-gray-600 sm:hidden">{stream}</span>
                    <button
                      type="button"
                      onClick={() => toggleJunior(key)}
                      className="flex items-center gap-2 group"
                      title={isOpen ? 'Click to close' : 'Click to open'}
                    >
                      {isOpen ? (
                        <ToggleRight className="w-10 h-10 text-green-500 transition-colors group-hover:text-green-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-300 transition-colors group-hover:text-gray-400" />
                      )}
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${
                          isOpen ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Hybrid Mode Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">Hybrid Mode</h3>
          <p className="text-sm text-gray-500 mt-1">Enable or disable hybrid mode option on admission forms</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ key: 'senior', label: 'Senior College' }, { key: 'junior', label: 'Junior College' }].map(({ key, label }) => {
              const isOpen = status.hybrid[key] !== false;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                    isOpen
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{label} Hybrid</p>
                    <p className={`text-sm font-medium ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                      {isOpen ? 'Hybrid Option Visible' : 'Hybrid Option Hidden'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleHybrid(key)}
                    className="group"
                    title={isOpen ? 'Click to hide' : 'Click to show'}
                  >
                    {isOpen ? (
                      <ToggleRight className="w-12 h-12 text-green-500 transition-colors group-hover:text-green-600" />
                    ) : (
                      <ToggleLeft className="w-12 h-12 text-gray-300 transition-colors group-hover:text-gray-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scheduled Changes Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              Scheduled Changes
            </h3>
            <p className="text-sm text-gray-500 mt-1">Schedule admissions to auto-enable or auto-disable at a specific date & time</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold text-sm transition-all hover:shadow-md"
            style={{ backgroundColor: '#002147' }}
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>

        <div className="p-6">
          {/* Add Schedule Form */}
          {showAddForm && (
            <div className="mb-6 p-5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30">
              <h4 className="font-bold text-gray-700 mb-4">New Scheduled Change</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Target</label>
                  <select
                    value={newSchedule.target}
                    onChange={(e) => setNewSchedule((p) => ({ ...p, target: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:border-blue-400"
                  >
                    <option value="">Select target...</option>
                    <optgroup label="Senior College">
                      {ALL_TARGETS.filter((t) => t.group === 'Senior College').map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Junior College">
                      {ALL_TARGETS.filter((t) => t.group === 'Junior College').map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Hybrid Mode">
                      {ALL_TARGETS.filter((t) => t.group === 'Hybrid').map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Action</label>
                  <select
                    value={newSchedule.action ? 'enable' : 'disable'}
                    onChange={(e) => setNewSchedule((p) => ({ ...p, action: e.target.value === 'enable' }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:border-blue-400"
                  >
                    <option value="disable">🔴 Disable / Close</option>
                    <option value="enable">🟢 Enable / Open</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newSchedule.at}
                    min={getMinDatetime()}
                    onChange={(e) => setNewSchedule((p) => ({ ...p, at: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:border-blue-400"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-bold text-sm transition-all hover:shadow-md"
                    style={{ backgroundColor: '#800020' }}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setNewSchedule({ target: '', action: false, at: '' }); }}
                    className="px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Schedule List */}
          {schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules
                .sort((a, b) => new Date(a.at) - new Date(b.at))
                .map((sch) => {
                  const schDate = new Date(sch.at);
                  const isPast = new Date() >= schDate;
                  return (
                    <div
                      key={sch.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                        isPast
                          ? 'border-orange-200 bg-orange-50/50'
                          : 'border-gray-200 bg-gray-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${sch.action ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {sch.action ? 'Enable' : 'Disable'}{' '}
                            <span style={{ color: '#002147' }}>{sch.label}</span>
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {schDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' at '}
                            {schDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {isPast && (
                              <span className="ml-2 text-orange-600 font-bold">(Past due — will auto-apply on save)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSchedule(sch.id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm font-medium transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No scheduled changes. Click "Add Schedule" to create one.</p>
            </div>
          )}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};

export default AdminAdmissionControl;
