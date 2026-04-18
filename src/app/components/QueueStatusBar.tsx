import { Clock, Play, CheckCircle } from 'lucide-react';

interface QueueStats {
  waiting: number;
  serving: number;
  completed: number;
}

interface QueueStatusBarProps {
  activeTab?: 'waiting' | 'serving' | 'completed';
  onTabChange?: (tab: 'waiting' | 'serving' | 'completed') => void;
  stats: QueueStats;
}

export function QueueStatusBar({ activeTab = 'waiting', onTabChange, stats }: QueueStatusBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange?.('waiting')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'waiting'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Waiting</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'waiting' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
              {stats.waiting}
            </span>
          </button>
          <button
            onClick={() => onTabChange?.('serving')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'serving'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Serving</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'serving' ? 'bg-white/20' : 'bg-green-100 text-green-600'}`}>
              {stats.serving}
            </span>
          </button>
          <button
            onClick={() => onTabChange?.('completed')}
            className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Completed</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'completed' ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
              {stats.completed}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
