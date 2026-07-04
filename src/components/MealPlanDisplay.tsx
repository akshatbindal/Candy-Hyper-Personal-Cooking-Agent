import React, { useState, useEffect } from "react";
import { MealDetail, MealPlanData } from "../types";
import { Clock, Play, Pause, RotateCcw, Flame, Dumbbell, Star, ChevronRight, Check } from "lucide-react";

interface MealPlanDisplayProps {
  plan: MealPlanData;
}

export const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ plan }) => {
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner">("breakfast");
  const [timerSeconds, setTimerSeconds] = useState(150); // 2:30 default, just like the mock!
  const [timerActive, setTimerActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const activeMeal: MealDetail = plan[selectedMealType];

  // Sync timer when active meal changes
  useEffect(() => {
    // Try to parse prep time (e.g., "25 min" -> 25 * 60 seconds, or fallback to 150s for testing)
    const minutes = parseInt(activeMeal.prepTime);
    if (!isNaN(minutes)) {
      setTimerSeconds(minutes * 60);
    } else {
      setTimerSeconds(150);
    }
    setTimerActive(false);
    setCompletedSteps({});
  }, [selectedMealType, activeMeal]);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleStep = (stepIdx: number) => {
    const key = `${selectedMealType}-${stepIdx}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-pink-100/80 shadow-sm transition-all hover:shadow-md hover:border-pink-200">
      {/* Date & Overview Header */}
      <div className="mb-6">
        <span className="text-[10px] font-extrabold text-pink-500 uppercase tracking-wider">AI Meal Plan (Candy Chef Selected)</span>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-0.5">
          {plan.date || "Today's Plan"}
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed bg-pink-50/40 p-3 rounded-2xl border border-pink-100/40">
          {plan.daySummary}
        </p>
      </div>

      {/* Breakfast, Lunch, Dinner Tabs */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {(["breakfast", "lunch", "dinner"] as const).map((type) => {
          const m = plan[type];
          const isSelected = selectedMealType === type;
          return (
            <button
              key={type}
              id={`tab-meal-${type}`}
              onClick={() => setSelectedMealType(type)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                isSelected
                  ? "bg-gradient-to-br from-pink-500 to-fuchsia-600 border-none text-white shadow-lg shadow-pink-100"
                  : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-pink-100" : "text-slate-400"}`}>
                  {type}
                </span>
                <span className="flex items-center text-[10px] gap-0.5 font-bold">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  {m.rating || "4.5"}
                </span>
              </div>
              <h3 className="font-bold text-xs truncate mt-1.5">{m.title}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-pink-600/60 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {m.calories} kcal
                </span>
                <span className="text-[9px] font-bold flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {m.prepTime}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Meal Details Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients & Details */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Required Ingredients</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Reuses items in fridge</span>
          </div>

          <div className="space-y-2 mb-5 max-h-[220px] overflow-y-auto pr-1">
            {activeMeal.ingredients.map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${ing.status === "Have" ? "bg-fuchsia-500" : "bg-rose-400"}`}></span>
                  <span className="font-bold text-slate-700">{ing.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px] font-medium">{ing.amount}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      ing.status === "Have"
                        ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}
                  >
                    {ing.status === "Have" ? "Have" : "Buy"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeMeal.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] font-bold bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg border border-pink-100/50">
                {tag}
              </span>
            ))}
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100/50 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> {activeMeal.protein} Protein
            </span>
          </div>
        </div>

        {/* Step-by-Step Cooking Guide with Timer */}
        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Step-by-Step Guide</h3>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-extrabold uppercase">
                Interactive checklist
              </span>
            </div>

            <div className="space-y-3 mb-5">
              {activeMeal.steps.map((step, idx) => {
                const key = `${selectedMealType}-${idx}`;
                const isCompleted = !!completedSteps[key];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isCompleted
                        ? "bg-purple-50/50 border-purple-100 opacity-60"
                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                      isCompleted ? "bg-purple-500 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={`text-xs text-slate-600 leading-normal ${isCompleted ? "line-through text-slate-400" : ""}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Timer */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[9px] font-bold text-purple-200 uppercase tracking-wider block">Kitchen Active Timer</span>
              <span className="font-mono text-xl font-bold tracking-tight text-pink-400">{formatTimer(timerSeconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className={`p-2 rounded-full transition-all ${
                  timerActive ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-pink-500 hover:bg-pink-600 text-white"
                }`}
              >
                {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  const minutes = parseInt(activeMeal.prepTime);
                  setTimerSeconds(!isNaN(minutes) ? minutes * 60 : 150);
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
