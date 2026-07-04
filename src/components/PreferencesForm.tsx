import { UserPreferences } from "../types";
import { Settings, Sparkles, Check } from "lucide-react";

interface PreferencesFormProps {
  preferences: UserPreferences;
  onPreferencesChange: (prefs: UserPreferences) => void;
  customIngredients: string;
  onCustomIngredientsChange: (val: string) => void;
  onGenerate: () => void;
  loading: boolean;
  isSignedIn: boolean;
  onSavePreferences: () => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onPreferencesChange,
  customIngredients,
  onCustomIngredientsChange,
  onGenerate,
  loading,
  isSignedIn,
  onSavePreferences,
}) => {
  const toggleDiet = (key: keyof UserPreferences["preferences"]) => {
    if (key === "other") return;
    const updated = {
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [key]: !preferences.preferences[key],
      },
    };
    onPreferencesChange(updated);
  };

  const handleGoalChange = (key: keyof UserPreferences["healthGoals"], value: number) => {
    const updated = {
      ...preferences,
      healthGoals: {
        ...preferences.healthGoals,
        [key]: value,
      },
    };
    onPreferencesChange(updated);
  };

  const handleBudgetChange = (value: number) => {
    onPreferencesChange({
      ...preferences,
      budgetLimit: value,
    });
  };

  const handlePresetChange = (preset: string) => {
    onPreferencesChange({
      ...preferences,
      fridgePreset: preset,
    });
  };

  return (
    <div id="pref-card" className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-pink-100/80 shadow-sm transition-all hover:shadow-md hover:border-pink-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-pink-50 text-pink-500 rounded-xl">
            <Settings className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display tracking-tight">Preferences & Goals</h2>
            <p className="text-xs text-slate-500">Configure constraints & targets</p>
          </div>
        </div>
        {isSignedIn && (
          <button
            onClick={onSavePreferences}
            className="text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3.5 py-1.5 rounded-xl transition"
          >
            Save Defaults
          </button>
        )}
      </div>

      {/* Dietary Profiles */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dietary Profile</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(preferences.preferences)
            .filter(([key]) => key !== "other")
            .map(([key, val]) => (
              <button
                key={key}
                id={`diet-${key}`}
                onClick={() => toggleDiet(key as any)}
                className={`px-3 py-2 text-xs rounded-xl border transition-all flex items-center gap-1.5 font-semibold ${
                  val
                    ? "bg-pink-500 border-pink-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {val && <Check className="w-3.5 h-3.5" />}
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </button>
            ))}
        </div>
      </div>

      {/* Target Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-[9px] font-bold text-slate-400 uppercase">Protein Goal</label>
          <div className="mt-1 flex items-baseline gap-1">
            <input
              type="number"
              value={preferences.healthGoals.proteinGoal}
              onChange={(e) => handleGoalChange("proteinGoal", Number(e.target.value))}
              className="w-full text-base font-extrabold text-slate-800 bg-transparent focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-semibold">g</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-[9px] font-bold text-slate-400 uppercase">Calories Goal</label>
          <div className="mt-1 flex items-baseline gap-1">
            <input
              type="number"
              value={preferences.healthGoals.caloriesGoal}
              onChange={(e) => handleGoalChange("caloriesGoal", Number(e.target.value))}
              className="w-full text-base font-extrabold text-slate-800 bg-transparent focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-semibold">kcal</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <label className="block text-[9px] font-bold text-slate-400 uppercase">Daily Budget</label>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-extrabold text-slate-800">₹</span>
            <input
              type="number"
              value={preferences.budgetLimit}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-full text-base font-extrabold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Fridge Presets */}
      <div className="mb-5">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">What's in your Fridge?</label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { id: "standard", label: "Standard", desc: "Eggs, Onion, Milk" },
            { id: "high_protein", label: "Protein Rich", desc: "Paneer, Yogurt, Oats" },
            { id: "veggie_lover", label: "Veggie", desc: "Mushrooms, Tofu, Spinach" },
            { id: "nearly_empty", label: "Nearly Empty", desc: "Condiments, Water" },
          ].map((preset) => (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handlePresetChange(preset.id)}
              className={`p-2 rounded-xl text-left border transition-all ${
                preferences.fridgePreset === preset.id
                  ? "bg-gradient-to-br from-pink-500 to-fuchsia-600 border-none text-white shadow-md"
                  : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="font-bold text-xs">{preset.label}</div>
              <div className={`text-[9px] mt-1 line-clamp-1 ${preferences.fridgePreset === preset.id ? "text-pink-100" : "text-slate-400"}`}>
                {preset.desc}
              </div>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Additional custom ingredients (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. Tomato, Capsicum, Ginger, Garlic"
            value={customIngredients}
            onChange={(e) => onCustomIngredientsChange(e.target.value)}
            className="w-full text-xs bg-slate-50/50 border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 rounded-xl px-3 py-2.5 text-slate-700 outline-none transition"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={loading}
        id="btn-generate-plan"
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:brightness-110 active:scale-98 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-100 hover:shadow-xl hover:shadow-pink-200 transition-all disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        {loading ? "Planning your day..." : "Plan meals with AI agent"}
      </button>
    </div>
  );
};
