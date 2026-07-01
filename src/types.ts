export type SubjectKey = 'bio' | 'phys' | 'chem' | 'math';
export type SessionMode = 'Study' | 'Revise' | 'Exercise';

export interface PlanItem {
  id: string;
  subject: SubjectKey;
  topic: string;
  sessionType: SessionMode;
  targetUnits?: number; // pages or questions
  targetMins: number;
  status: 'pending' | 'completed';
}

export interface LogItem {
  id: string;
  planId?: string;
  subject: SubjectKey;
  topic: string;
  sessionType: SessionMode;
  revisionType?: string; // "Quick Recap", "Standard Review", "Deep Dive"
  activeMins: number;
  distractionMins: number;
  recoveryMins: number;
  retentionScore?: number; // 1 to 10
  startPage?: number;
  endPage?: number;
  vsaCount?: number;
  saCount?: number;
  laCount?: number;
  notes: string;
  frictionAnalysis?: string; // Explicitly records bottleneck items
  tinyWin?: string; // Optional: one small change / next session intention
  scratchpadImage?: string; // Captures and retains full-screen Base64 canvas drawings
  isMissed?: boolean;
  synced?: boolean;
}

export interface UserSettings {
  name: string;
  className: string;
  activeSubjects: SubjectKey[];
  subjectGoals: Record<string, string>;
  subjectPageTotals: Record<string, number>; // Total syllabus pages per subject
}

export interface SubjectConfig {
  name: string;
  color: string;
  bg: string;
  text: string;
  border: string;
}

// Data models for the pre-made charts and Gemini context summary processing
export interface TimeBlockMetrics {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

export interface AnalysisInsights {
  frictionSpotlight: string;
  trendCalibration: string;
  retentionAlerts: string;
  lastUpdated: string;
}

// 100% Fail-Safe Subject Configuration Engine
export function getSubjectConfig(sub: string | undefined): SubjectConfig {
  const mapping: Record<SubjectKey, SubjectConfig> = {
    bio: {
      name: 'Biology',
      color: '#10B981',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    phys: {
      name: 'Physics',
      color: '#3B82F6',
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    chem: {
      name: 'Chemistry',
      color: '#F59E0B',
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    math: {
      name: 'Mathematics',
      color: '#EC4899',
      bg: 'bg-pink-500/20',
      text: 'text-pink-400',
      border: 'border-pink-500/30'
    }
  };

  // If the browser memory passes a corrupted, missing, or undefined subject,
  // we return a safe generic styling object instead of undefined. 
  // This instantly stops the "reading 'name' of undefined" React crash.
  if (!sub || !(sub in mapping)) {
    return {
      name: 'General Study',
      color: '#64748b',
      bg: 'bg-slate-500/20',
      text: 'text-slate-400',
      border: 'border-slate-500/30'
    };
  }

  return mapping[sub as SubjectKey];
}

export function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getFocusScore(log: LogItem): number {
  if (log.isMissed) return 0;
  const total = log.activeMins + log.distractionMins + log.recoveryMins;
  if (total === 0) return 0;
  const ratio = log.activeMins / total;
  return Math.round(ratio * 100);
}
