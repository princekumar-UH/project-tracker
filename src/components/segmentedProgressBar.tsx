import { PROJECT_PHASES, isProjectLate } from "../utils/helpers";

const getShortName = (name: string): string => {
  switch (name) {
    case "Requirement":
      return "REQ";
    case "Development":
      return "DEV";
    case "Pre Prod":
      return "PRE-P";
    case "Production":
      return "PROD";
    case "Business Use":
      return "B-USE";
    case "Training":
      return "TRN";
    case "Handover":
      return "HND";
    default:
      return name.toUpperCase();
  }
};

interface SegmentedProgressBarProps {
  currentPhaseId: number | string;
  targetDate: string;
}

export default function SegmentedProgressBar({
  currentPhaseId,
  targetDate
}: SegmentedProgressBarProps) {
  const isLate = isProjectLate(targetDate);
  const techPhases = PROJECT_PHASES.slice(0, 5);
  const otherPhases = PROJECT_PHASES.slice(5);

  const getSegmentColor = (phaseId: number): string => {
    const isCompleted = phaseId < Number(currentPhaseId);
    const isCurrent = phaseId === Number(currentPhaseId);

    if (isCompleted) {
      return isLate
        ? "bg-red-500 dark:bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
        : "bg-emerald-500 dark:bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
    }

    if (isCurrent) {
      return "bg-amber-400 dark:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] ring-1 ring-amber-300 dark:ring-amber-600";
    }

    return "bg-gray-100 dark:bg-zinc-800";
  };

  const getTextColor = (phaseId: number): string => {
    const isCompleted = phaseId < Number(currentPhaseId);
    const isCurrent = phaseId === Number(currentPhaseId);

    if (isCompleted) return "text-white font-semibold";
    if (isCurrent) return "text-amber-950 dark:text-amber-100 font-extrabold";
    return "text-gray-400 dark:text-zinc-500";
  };

  const getPhaseStatusText = (phaseId: number): string => {
    const isCompleted = phaseId < Number(currentPhaseId);
    const isCurrent = phaseId === Number(currentPhaseId);
    if (isCompleted) return isLate ? "Delayed" : "Completed";
    if (isCurrent) return "In Progress";
    return "Pending";
  };

  return (
    <div className="w-full mt-5">
      {/* Group Headers */}
      <div className="flex gap-2 mb-2 items-end">
        <div className="flex-[5] flex justify-center border-b border-brand-border pb-1">
          <span className="text-[7px] sm:text-[9px] font-extrabold text-gray-400 dark:text-zinc-500 tracking-wider uppercase">
            Tech Infrastructure
          </span>
        </div>
        {otherPhases.map((phase) => (
          <div key={phase.id} className="flex-1 flex justify-center border-b border-brand-border pb-1">
            <span
              className="text-[7px] sm:text-[9px] font-extrabold text-gray-400 dark:text-zinc-500 tracking-wider uppercase truncate w-full text-center"
              title={phase.name}
            >
              {phase.name === "Business Use"
                ? "B-Use"
                : phase.name === "Handover"
                  ? "Hnd"
                  : phase.name === "Training"
                    ? "Trn"
                    : phase.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-end">
        {/* Tech Infrastructure Cluster (5 segments) */}
        <div className="flex-[5] flex flex-col gap-1">
          <div className="flex w-full gap-1.5">
            {techPhases.map((phase) => (
              <div
                key={phase.id}
                className={`h-5.5 flex-1 rounded-md flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-default overflow-hidden ${getSegmentColor(phase.id)}`}
                title={`${phase.name} (${phase.weight}%) - ${getPhaseStatusText(phase.id)}`}
              >
                <span
                  className={`text-[7px] sm:text-[8px] font-bold tracking-tighter ${getTextColor(phase.id)}`}
                >
                  {getShortName(phase.name)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-Production Cluster (4 segments) */}
        {otherPhases.map((phase) => (
          <div
            key={phase.id}
            className={`h-5.5 flex-1 rounded-md flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-default overflow-hidden ${getSegmentColor(phase.id)}`}
            title={`${phase.name} (${phase.weight}%) - ${getPhaseStatusText(phase.id)}`}
          />
        ))}
      </div>
    </div>
  );
}
