import { Clock, Play } from 'lucide-react';

interface QueueStats {
  waiting: number;
  serving: number;
}

interface CustomerQueueStatusBarProps {
  stats: QueueStats;
}

export function CustomerQueueStatusBar({ stats }: CustomerQueueStatusBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Waiting</div>
              <div className="text-lg text-slate-800">{stats.waiting}</div>
            </div>
          </div>
          
          <div className="w-px h-10 bg-slate-200" />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Serving</div>
              <div className="text-lg text-slate-800">{stats.serving}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
