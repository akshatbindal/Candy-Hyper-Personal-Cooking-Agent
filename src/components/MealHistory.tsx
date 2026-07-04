import React from "react";
import { MealPlanData } from "../types";
import { History, Calendar, ExternalLink, Trash2 } from "lucide-react";

interface MealHistoryProps {
  history: MealPlanData[];
  onSelectPlan: (plan: MealPlanData) => void;
  loading: boolean;
}

export const MealHistory: React.FC<MealHistoryProps> = ({
  history,
  onSelectPlan,
  loading,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-pink-100/80 shadow-sm transition-all hover:shadow-md hover:border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2.5 bg-pink-50 text-pink-500 rounded-xl">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display tracking-tight">Saved Plan History</h2>
          <p className="text-xs text-slate-500">Retrieve previously saved custom meal lists</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400 font-semibold">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl font-medium">
          No saved plans yet. Generate a plan and click "Save Plan to History" to persist it in Firestore!
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {history.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className="p-3 bg-slate-50 hover:bg-pink-50/40 border border-slate-100 hover:border-pink-100 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-slate-400 group-hover:text-pink-500 rounded-lg border border-slate-100 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">{plan.date}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-medium">{plan.daySummary}</p>
                </div>
              </div>
              <div className="text-xs font-bold text-pink-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                Load <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
