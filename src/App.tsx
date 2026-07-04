import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
  logout,
  saveUserPreferences,
  getUserPreferences,
  saveMealPlan,
  getMealPlansHistory,
} from "./lib/firebase";
import {
  fetchCalendarEvents,
  fetchGmailSnippets,
  exportToGoogleTasks,
} from "./lib/workspace";
import { CalendarEvent, GmailMessageSnippet, MealPlanData, UserPreferences } from "./types";
import { PreferencesForm } from "./components/PreferencesForm";
import { DaySchedule } from "./components/DaySchedule";
import { MealPlanDisplay } from "./components/MealPlanDisplay";
import { GrocerySubstitutions } from "./components/GrocerySubstitutions";
import { MealHistory } from "./components/MealHistory";
import { motion, AnimatePresence } from "motion/react";
import {
  ChefHat,
  LogOut,
  Calendar,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowRight,
} from "lucide-react";

// Initial premium meal plan to show by default
const defaultMealPlan: MealPlanData = {
  date: "Today's Meal Plan",
  daySummary: "Your calendar shows a Client Lunch at 12:30 PM, followed by a Gym workout at 4:00 PM. We've optimized your day with a high-protein post-workout dinner, a balanced lighter breakfast, and a quick lunch suited for an active business day.",
  breakfast: {
    title: "Moong Dal Chilla",
    description: "Savory high-protein lentil crepes stuffed with fresh coriander.",
    prepTime: "25 min",
    calories: 430,
    protein: "22g",
    tags: ["High Protein", "Warm", "Quick"],
    ingredients: [
      { name: "Moong Dal", amount: "2 tbsp", status: "Have", estCost: 0 },
      { name: "Onion", amount: "1", status: "Have", estCost: 0 },
      { name: "Green Chilli", amount: "1", status: "Have", estCost: 0 },
      { name: "Coriander", amount: "1 bunch", status: "Have", estCost: 0 },
      { name: "Tomato", amount: "1", status: "Buy", estCost: 12 },
    ],
    steps: [
      "Soak moong dal (2 tbsp) in hot water for 10 min.",
      "Blend soaked dal with ginger and green chilli into a smooth batter.",
      "Add chopped onion, tomato, and fresh coriander into the batter.",
      "Heat a non-stick pan, pour batter and spread into thin crepes.",
      "Cook both sides with minimal oil until golden brown."
    ],
    rating: 4.6
  },
  lunch: {
    title: "Veg Oats Upma",
    description: "Light, fiber-rich oats cooked with seasoned chopped vegetables.",
    prepTime: "20 min",
    calories: 320,
    protein: "10g",
    tags: ["Quick & Light", "High Fiber"],
    ingredients: [
      { name: "Oats", amount: "1 cup", status: "Have", estCost: 0 },
      { name: "Onion", amount: "1", status: "Have", estCost: 0 },
      { name: "Tomato", amount: "2", status: "Buy", estCost: 12 },
      { name: "Capsicum", amount: "1", status: "Buy", estCost: 18 },
    ],
    steps: [
      "Dry roast oats in a pan for 3-4 minutes and set aside.",
      "Sauté chopped onions, ginger, and curry leaves in 1 tsp oil.",
      "Add chopped tomatoes and capsicum, cook for 2 minutes.",
      "Add 2 cups of water, salt to taste, and bring to a boil.",
      "Stir in roasted oats, cover and cook on low heat for 5 minutes."
    ],
    rating: 4.3
  },
  dinner: {
    title: "Paneer Bhurji Wrap",
    description: "Spiced scrambled cottage cheese wrapped in whole wheat rotis, ideal for post-workout muscle recovery.",
    prepTime: "20 min",
    calories: 580,
    protein: "32g",
    tags: ["Comfort", "Balanced", "Post-Gym"],
    ingredients: [
      { name: "Paneer", amount: "100g", status: "Buy", estCost: 42 },
      { name: "Whole Wheat Roti", amount: "2 pieces", status: "Have", estCost: 0 },
      { name: "Onion", amount: "1", status: "Have", estCost: 0 },
      { name: "Tomato", amount: "2", status: "Buy", estCost: 12 },
      { name: "Greek Yogurt", amount: "200g", status: "Buy", estCost: 58 },
      { name: "Banana", amount: "6", status: "Buy", estCost: 30 }
    ],
    steps: [
      "Crumble 100g fresh paneer and finely chop onions and tomatoes.",
      "Heat 1 tsp oil, sauté cumin seeds and chopped onions until translucent.",
      "Add tomatoes and spices (turmeric, garam masala), cook until soft.",
      "Stir in crumbled paneer, cook on medium heat for 3-4 minutes.",
      "Warm the rotis, place paneer bhurji inside, wrap tightly and serve."
    ],
    rating: 4.8
  },
  groceryList: [
    { id: "g1", name: "Paneer", amount: "100g", status: "Buy", estCost: 42 },
    { id: "g2", name: "Capsicum", amount: "1", status: "Buy", estCost: 18 },
    { id: "g3", name: "Tomato", amount: "4", status: "Buy", estCost: 12 },
    { id: "g4", name: "Banana", amount: "6", status: "Buy", estCost: 30 },
    { id: "g5", name: "Greek Yogurt", amount: "200g", status: "Buy", estCost: 58 },
    { id: "g6", name: "Moong Dal", amount: "2 tbsp", status: "Have", estCost: 0 },
    { id: "g7", name: "Onion", amount: "1", status: "Have", estCost: 0 },
    { id: "g8", name: "Oats", amount: "1 cup", status: "Have", estCost: 0 },
    { id: "g9", name: "Coriander", amount: "1 bunch", status: "Have", estCost: 0 }
  ],
  substitutions: [
    { original: "Paneer", substitute: "Tofu / Chickpeas", benefit: "Lower fat, dairy-free, and highly cost-efficient swap." },
    { original: "Oats", substitute: "Daliya / Rava", benefit: "Excellent local fiber alternatives with perfect savory binding." },
    { original: "Milk", substitute: "Curd + Water", benefit: "Probiotic enrichment with longer shelf-life and lower cost." }
  ],
  budgetFeasibility: {
    totalEstCost: 160,
    budgetLimit: 500,
    isFeasible: true,
    analysis: "Your total grocery expense is ₹160, which easily fits within your ₹500 limit. Sourcing staples like onions, dal, and oats directly from your fridge saved ₹126!"
  },
  createdAt: new Date().toISOString()
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // User preferences & fridge state
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferences: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      keto: false,
      other: "",
    },
    healthGoals: {
      proteinGoal: 85,
      caloriesGoal: 1800,
      carbLimit: 160,
    },
    budgetLimit: 400,
    fridgePreset: "high_protein",
  });
  const [customIngredients, setCustomIngredients] = useState("Moong Dal, Paneer, Oats, Onions");

  // Google Workspace Data
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [emails, setEmails] = useState<GmailMessageSnippet[]>([]);

  // Generated Plan State
  const [mealPlan, setMealPlan] = useState<MealPlanData>(defaultMealPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firestore History State
  const [history, setHistory] = useState<MealPlanData[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [syncingTasks, setSyncingTasks] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Adaptive simulated scenario
  const [activeScenario, setActiveScenario] = useState<"extended" | "cancelled" | "takeaway" | null>(null);

  // Auto Sign-in listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (loggedInUser, token) => {
        setUser(loggedInUser);
        setAccessToken(token);
        setNeedsAuth(false);
        await loadUserData(loggedInUser.uid, token);
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        showTemporaryInfo(`Successfully signed in as ${result.user.displayName}! Syncing Workspace details...`);
        await loadUserData(result.user.uid, result.accessToken);
      }
    } catch (err: any) {
      setError("Sign-in failed. Please try again. Make sure to allow popup access.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    setEvents([]);
    setEmails([]);
    setHistory([]);
    setMealPlan(defaultMealPlan);
    showTemporaryInfo("Signed out successfully.");
  };

  const showTemporaryInfo = (msg: string) => {
    setInfoMessage(msg);
    setTimeout(() => {
      setInfoMessage(null);
    }, 4500);
  };

  // Load Firestore preferences & Google Workspace lists
  const loadUserData = async (uid: string, token: string) => {
    try {
      // 1. Fetch user preferences from Firestore
      const savedPrefs = await getUserPreferences(uid);
      if (savedPrefs) {
        setPreferences(savedPrefs);
      }

      // 2. Fetch today's schedule from Google Calendar
      const calEvents = await fetchCalendarEvents(token);
      setEvents(calEvents);

      // 3. Fetch dining snippets from Gmail
      const emailSnips = await fetchGmailSnippets(token);
      setEmails(emailSnips);

      // 4. Fetch meal history from Firestore
      setHistoryLoading(true);
      const plans = await getMealPlansHistory(uid);
      setHistory(plans);
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    try {
      await saveUserPreferences(user.uid, preferences);
      showTemporaryInfo("Default preferences saved to Firestore!");
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  // Call server-side API to generate meal plan using Gemini
  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setActiveScenario(null); // Reset simulation state
    try {
      const res = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events,
          emails,
          preferences,
          customIngredients,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate meal plan");
      }

      const data: MealPlanData = await res.json();
      setMealPlan(data);
      showTemporaryInfo("Successfully generated personalized meal plan based on your calendar & fridge contents!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while compiling your meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Adaptive Real-Time Scenarios
  const triggerScenario = (scenarioType: "extended" | "cancelled" | "takeaway") => {
    setActiveScenario(scenarioType);
    
    // Create deep copy of meal plan to modify on-the-fly
    const adaptedPlan = JSON.parse(JSON.stringify(mealPlan)) as MealPlanData;

    if (scenarioType === "extended") {
      adaptedPlan.daySummary = "⚠️ SCHEDULE ALERT: Your meetings got extended! Shifted dinner to be 15 mins faster to cook and moved to 9:15 PM so you can decompress first.";
      adaptedPlan.dinner.title = "Express Paneer Quesadilla";
      adaptedPlan.dinner.prepTime = "10 min";
      adaptedPlan.dinner.calories = 490;
      adaptedPlan.dinner.description = "A simplified, high-speed toasted cheese flatbread using your available pantry stock.";
      adaptedPlan.dinner.steps = [
        "Crumble remaining paneer with salt and green chilli.",
        "Spread filling onto roti, fold in half, and press onto a preheated skillet.",
        "Toast for 3 minutes on each side until crispy. Serve immediately."
      ];
      setMealPlan(adaptedPlan);
      showTemporaryInfo("Scenario adapted: Dinner changed to ultra-fast 10-minute recipe.");
    } else if (scenarioType === "cancelled") {
      adaptedPlan.daySummary = "💪 HEALTH SYNC: Gym session cancelled. Daily caloric intake target lowered. Adapted dinner to a light low-carb style to match your active energy output.";
      adaptedPlan.dinner.title = "Keto Paneer Stir-Fry";
      adaptedPlan.dinner.calories = 360;
      adaptedPlan.dinner.description = "Low-calorie sautéed cottage cheese cubes with fresh coriander, discarding heavy wheat carbs.";
      adaptedPlan.dinner.steps = [
        "Sauté chopped onions and tomatoes with cumin seeds.",
        "Add cubed paneer, salt, and black pepper.",
        "Stir-fry for 5 mins and serve warm without roti."
      ];
      setMealPlan(adaptedPlan);
      showTemporaryInfo("Scenario adapted: Caloric goal reduced. Heavy dinner carbs removed.");
    } else if (scenarioType === "takeaway") {
      adaptedPlan.daySummary = "🍕 CALORIE BALANCE: You got takeaway for lunch! Compensated by planning an extremely light, high-fiber dinner to keep your day within nutritional targets.";
      adaptedPlan.lunch.title = "Takeaway Lunch (Logged)";
      adaptedPlan.lunch.calories = 750;
      adaptedPlan.lunch.description = "Logged lunch. Calorie budget recalculated.";
      adaptedPlan.dinner.title = "Minty Cucumber Yogurt Salad";
      adaptedPlan.dinner.calories = 190;
      adaptedPlan.dinner.prepTime = "5 min";
      adaptedPlan.dinner.protein = "12g";
      adaptedPlan.dinner.description = "Light and refreshing spiced curd bowl with fresh grated cucumber.";
      adaptedPlan.dinner.steps = [
        "Grate cucumber and squeeze excess water.",
        "Whisk greek yogurt with roasted cumin powder, salt, and mint.",
        "Fold cucumber into curd, chill for 5 mins and serve."
      ];
      setMealPlan(adaptedPlan);
      showTemporaryInfo("Scenario adapted: Lunch logged from takeaway, dinner adjusted to 190 kcal curd bowl.");
    }
  };

  const syncToTasks = async () => {
    if (!accessToken) {
      showTemporaryInfo("Authentication required to export tasks.");
      setNeedsAuth(true);
      return;
    }
    setSyncingTasks(true);
    try {
      const listTitle = `Cooking checklist - ${mealPlan.date || "Today"}`;
      
      // Compile task list texts
      const tasksToExport: string[] = [];
      tasksToExport.push("--- GROCERY SHOPPING LIST ---");
      mealPlan.groceryList
        .filter((i) => i.status === "Buy")
        .forEach((i) => tasksToExport.push(`🛒 Buy ${i.name} (${i.amount}) - Est: ₹${i.estCost}`));
      
      tasksToExport.push("--- MEAL PREP TO-DO LIST ---");
      tasksToExport.push(`🍳 Breakfast: ${mealPlan.breakfast.title} (${mealPlan.breakfast.prepTime})`);
      tasksToExport.push(`🍳 Lunch: ${mealPlan.lunch.title} (${mealPlan.lunch.prepTime})`);
      tasksToExport.push(`🍳 Dinner: ${mealPlan.dinner.title} (${mealPlan.dinner.prepTime})`);

      const success = await exportToGoogleTasks(accessToken, listTitle, tasksToExport);
      if (success) {
        showTemporaryInfo(`Successfully exported cooking tasks to Google Tasks under list "${listTitle}"!`);
      } else {
        throw new Error("Tasks API return failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sync checklist to Google Tasks. Please verify OAuth permissions.");
    } finally {
      setSyncingTasks(false);
    }
  };

  const saveToHistory = async () => {
    if (!user) return;
    setSavingPlan(true);
    try {
      const savedId = await saveMealPlan(user.uid, mealPlan);
      showTemporaryInfo("Meal plan saved to history in Firestore!");
      // Reload history list
      const updatedHistory = await getMealPlansHistory(user.uid);
      setHistory(updatedHistory);
    } catch (err) {
      console.error(err);
      setError("Failed to save plan to Firestore. Please check database permissions.");
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-16">
      {/* Dynamic Alert Info Message */}
      <AnimatePresence>
        {infoMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-pink-300 font-semibold text-xs py-3.5 px-6 rounded-full shadow-xl border border-slate-800 flex items-center gap-2 max-w-lg text-center"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-pink-400 animate-pulse" />
            <span>{infoMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & OAuth Integration Panel */}
      <header className="bg-white/95 backdrop-blur-md border-b border-pink-100/60 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 rounded-2xl text-white shadow-md shadow-pink-100">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-800 flex items-center gap-1.5">
              Candy <span className="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Hyper-Personal Cooking Agent</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-bold">Auto-meal schedule adaptive model</p>
          </div>
        </div>

        <div>
          {needsAuth ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              id="gsi-login-button"
              className="gsi-material-button flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 px-4 py-2 rounded-xl text-xs transition shadow-xs cursor-pointer"
            >
              <div className="gsi-material-button-icon w-4 h-4">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents">{isLoggingIn ? "Signing in..." : "Sign in with Google"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 p-1.5 pl-3 rounded-2xl">
              {user?.photoURL ? (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full border border-slate-200" />
              ) : (
                <div className="w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user?.displayName?.charAt(0) || "U"}
                </div>
              )}
              <div className="text-left shrink-0">
                <div className="text-[11px] font-bold text-slate-700 leading-none">{user?.displayName}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-none">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                id="btn-logout"
                className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-12 mt-8 space-y-6">
        {/* Error Notice */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-red-800">Operation Error</h3>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Informational intro banner if not signed in */}
        {needsAuth && (
          <div className="bg-gradient-to-r from-pink-50/50 via-purple-50/30 to-teal-50/20 border border-pink-100/50 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3">
              <div className="p-2.5 bg-white rounded-2xl text-pink-500 border border-pink-100/60 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 font-display">Meet Candy: Your Smart Cooking Agent</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl font-medium">
                  Try configuring your preferences, explore cooking guides with interactive countdown timers, and simulate adaptive schedule shifts. <strong className="text-pink-600 font-semibold">Note:</strong> You can try demoing the app using a guest account, but for actual working features (like loading calendars, emails, syncing tasks, and saving history), sign in securely using your Gmail account.
                </p>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shrink-0 self-start md:self-center cursor-pointer"
            >
              Connect Accounts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Preferences Form & Saved History */}
          <div className="lg:col-span-5 space-y-6">
            <PreferencesForm
              preferences={preferences}
              onPreferencesChange={setPreferences}
              customIngredients={customIngredients}
              onCustomIngredientsChange={setCustomIngredients}
              onGenerate={generatePlan}
              loading={loading}
              isSignedIn={!!user}
              onSavePreferences={handleSavePreferences}
            />

            {user && (
              <MealHistory
                history={history}
                onSelectPlan={(plan) => {
                  setMealPlan(plan);
                  showTemporaryInfo(`Loaded historical meal plan dated: ${plan.date || "Past Saved"}`);
                }}
                loading={historyLoading}
              />
            )}
          </div>

          {/* Right Column: Day Schedule & Meal Plans */}
          <div className="lg:col-span-7 space-y-6">
            <DaySchedule
              events={events}
              emails={emails}
              onTriggerScenario={triggerScenario}
              activeScenario={activeScenario}
            />

            <MealPlanDisplay plan={mealPlan} />
          </div>
        </div>

        {/* Lower Full-Width Section: Grocery check & feasibility */}
        <GrocerySubstitutions
          plan={mealPlan}
          onSyncTasks={syncToTasks}
          onSaveHistory={saveToHistory}
          syncingTasks={syncingTasks}
          savingPlan={savingPlan}
          isSignedIn={!!user}
        />
      </main>
    </div>
  );
}
