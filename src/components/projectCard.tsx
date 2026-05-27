import SegmentedProgressBar from "./segmentedProgressBar";
import { formatDate, getPhaseName, GRACE_PERIOD_DAYS, isProjectLate } from "../utils/helpers";
import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: () => void;
  onClick?: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  const isLate = isProjectLate(project.target_end_date);
  
  const today = new Date();
  const targetDate = new Date(project.target_end_date);
  const diffDays = (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);
  const isInGracePeriod = diffDays > 0 && diffDays <= GRACE_PERIOD_DAYS;

  return (
    <div 
      onClick={onClick}
      className="bg-brand-bg-card border border-brand-border rounded-xl shadow-xs p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer transition-all text-left group"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-brand-text-title m-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.project_name}
            </h2>
            {isLate && (
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 animate-pulse flex items-center gap-1 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/40">
                <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full"></span>
                DELAYED
              </span>
            )}
            {isInGracePeriod && (
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/40">
                <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
                GRACE PERIOD
              </span>
            )}
          </div>

          <p className="text-sm text-brand-text-main mt-1">
            {project.project_lead} • Team Size {project.team_size}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto sm:justify-end sm:shrink-0 mt-2 sm:mt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-950/50 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Phase Badge */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold rounded-md uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-900/30 w-fit">
            {getPhaseName(project.current_phase_id)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 block">
            {project.percent_complete}%
          </span>
        </div>
      </div>

      {/* Main Progress Bar (Segmented with color coding) */}
      <SegmentedProgressBar
        currentPhaseId={project.current_phase_id}
        targetDate={project.target_end_date}
      />

      {/* Status Indicators */}
      <div className="flex justify-between items-center text-xs mt-5 pt-4 border-t border-brand-border">
        <div className="flex flex-col text-left">
          <span className="font-bold text-[9px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Start Date</span>
          <span className="text-brand-text-main font-medium mt-0.5">
            {formatDate(project.start_date)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="font-bold text-[9px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Target End</span>
          <span className="text-brand-text-main font-medium mt-0.5">
            {formatDate(project.target_end_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
