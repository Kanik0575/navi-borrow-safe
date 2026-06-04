import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Diagnosis" },
  { id: 3, label: "Plan" },
  { id: 4, label: "Simulator" },
  { id: 5, label: "Risk" },
];

interface ProgressStepsProps {
  current: 1 | 2 | 3 | 4 | 5;
}

export function ProgressSteps({ current }: ProgressStepsProps) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((step, idx) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200",
                  done && "bg-indigo-600 text-white shadow-sm",
                  active && "bg-white border-2 border-indigo-600 text-indigo-600 shadow-md",
                  !done && !active && "bg-white border-2 border-slate-200 text-slate-400"
                )}
              >
                {done ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : (
                  <span className="tabular-nums">{step.id}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] hidden sm:block font-medium tracking-wide",
                  active ? "text-indigo-700" : done ? "text-indigo-400" : "text-slate-300"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-1.5 mt-[-14px] sm:mt-[-24px]">
                <div className={cn(
                  "h-0.5 rounded-full transition-all duration-300",
                  step.id < current ? "bg-indigo-500" : "bg-slate-200"
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
