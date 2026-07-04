import { useState } from "react";
import { MealPlanData } from "../types";
import { ShoppingBag, ArrowLeftRight, Check, CheckSquare, Bookmark, AlertCircle, ShoppingCart } from "lucide-react";

interface GrocerySubstitutionsProps {
  plan: MealPlanData;
  onSyncTasks: () => void;
  onSaveHistory: () => void;
  syncingTasks: boolean;
  savingPlan: boolean;
  isSignedIn: boolean;
}

export const GrocerySubstitutions: React.FC<GrocerySubstitutionsProps> = ({
  plan,
  onSyncTasks,
  onSaveHistory,
  syncingTasks,
  savingPlan,
  isSignedIn,
}) => {
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});

  const toggleGrocery = (id: string) => {
    setCheckedGroceries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const buyItems = plan.groceryList.filter((item) => item.status === "Buy");
  const haveItems = plan.groceryList.filter((item) => item.status === "Have");

  const feasibility = plan.budgetFeasibility;
  const budgetRatio = Math.min(100, (feasibility.totalEstCost / feasibility.budgetLimit) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Grocery List Checklist */}
      <div id="grocery-checklist" className="md:col-span-2 bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-pink-100/80 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-pink-50 text-pink-500 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-display tracking-tight">Grocery List</h2>
                <p className="text-xs text-slate-500">Auto-generated for the week</p>
              </div>
            </div>
            <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-100 px-3.5 py-1 rounded-full flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" /> Est: ₹{feasibility.totalEstCost}
            </span>
          </div>

          {buyItems.length > 0 ? (
            <div className="space-y-2 mb-6">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Needs purchase</div>
              {buyItems.map((item) => {
                const isChecked = !!checkedGroceries[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleGrocery(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? "bg-purple-50/50 border-purple-100 opacity-65"
                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked ? "bg-purple-500 border-purple-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`text-xs text-slate-700 font-bold ${isChecked ? "line-through text-slate-400" : ""}`}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-semibold">{item.amount}</span>
                      <span className="text-xs font-extrabold text-slate-700">₹{item.estCost}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 bg-purple-50 text-purple-800 border border-purple-100 rounded-2xl text-xs mb-6 text-center font-bold">
              You already have all required ingredients in your fridge! No purchase needed. 🎉
            </div>
          )}

          {haveItems.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">In your fridge (reused)</div>
              <div className="grid grid-cols-2 gap-2">
                {haveItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs text-slate-500">
                    <span className="truncate pr-1 font-semibold text-slate-600">{item.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-8 border-t border-slate-100 pt-5">
          <button
            onClick={onSyncTasks}
            disabled={syncingTasks}
            className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl transition cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-purple-500" />
            {syncingTasks ? "Syncing with Tasks..." : "Sync to Google Tasks"}
          </button>

          <button
            onClick={onSaveHistory}
            disabled={savingPlan || !isSignedIn}
            title={isSignedIn ? "Save Plan to Firestore" : "Sign in with Google to save plan"}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:brightness-110 text-white font-bold text-xs py-3 px-4 rounded-xl transition disabled:opacity-40 cursor-pointer shadow-md shadow-pink-100/50"
          >
            <Bookmark className="w-4 h-4 text-white" />
            {savingPlan ? "Saving Plan..." : "Save Plan to History"}
          </button>
        </div>
      </div>

      {/* 2. Substitutions & Budget feasibility */}
      <div className="space-y-6">
        {/* Substitutions */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-pink-100/80 shadow-sm transition-all hover:shadow-md hover:border-pink-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-display tracking-tight">Smart Substitutions</h2>
              <p className="text-xs text-slate-500">Health or budget conscious swaps</p>
            </div>
          </div>

          <div className="space-y-3">
            {plan.substitutions.map((sub, idx) => (
              <div key={idx} className="p-3 bg-pink-50/30 border border-pink-100/30 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="line-through text-slate-400 font-semibold">{sub.original}</span>
                  <span className="text-pink-500">→</span>
                  <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">{sub.substitute}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-normal font-medium">{sub.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Feasibility */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-pink-100/80 shadow-sm transition-all hover:shadow-md hover:border-pink-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 font-display">Budget Feasibility</h2>
                <p className="text-xs text-slate-500">grocery spending vs limit</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              feasibility.isFeasible
                ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100"
                : "bg-rose-50 text-rose-700 border-rose-100"
              }`}
            >
              {feasibility.isFeasible ? "FEASIBLE" : "OVER BUDGET"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
              <span>Spent: ₹{feasibility.totalEstCost}</span>
              <span>Limit: ₹{feasibility.budgetLimit}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  feasibility.isFeasible ? "bg-gradient-to-r from-pink-500 to-fuchsia-500" : "bg-rose-500"
                }`}
                style={{ width: `${budgetRatio}%` }}
              ></div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 font-bold">
            {feasibility.analysis}
          </p>
        </div>
      </div>
    </div>
  );
};
