export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
}

export interface GmailMessageSnippet {
  id: string;
  snippet: string;
  subject?: string;
  date?: string;
}

export interface IngredientItem {
  name: string;
  amount: string;
  status: 'Have' | 'Buy';
  estCost?: number;
}

export interface MealDetail {
  title: string;
  description: string;
  prepTime: string; // e.g. "25 min"
  calories: number;
  protein: string; // e.g. "18g"
  tags: string[]; // e.g. ["High Protein", "Comfort"]
  ingredients: IngredientItem[];
  steps: string[];
  rating?: number;
}

export interface SubstitutionItem {
  original: string;
  substitute: string;
  benefit: string;
}

export interface BudgetFeasibility {
  totalEstCost: number;
  budgetLimit: number;
  isFeasible: boolean;
  analysis: string;
}

export interface MealPlanData {
  id?: string;
  date: string;
  daySummary: string; // a brief paragraph summarizing how the day looks and how meals are planned for it
  breakfast: MealDetail;
  lunch: MealDetail;
  dinner: MealDetail;
  groceryList: {
    id: string;
    name: string;
    amount: string;
    status: 'Have' | 'Buy';
    estCost: number;
  }[];
  substitutions: SubstitutionItem[];
  budgetFeasibility: BudgetFeasibility;
  createdAt: string;
}

export interface UserPreferences {
  preferences: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    keto: boolean;
    other: string;
  };
  healthGoals: {
    proteinGoal: number; // e.g. 100 grams
    caloriesGoal: number; // e.g. 1800 kcal
    carbLimit: number; // e.g. 150 grams
  };
  budgetLimit: number; // e.g. 500 (per day or per meal plan)
  fridgePreset: string; // e.g. "standard", "nearly_empty", "veggie_lover", "high_protein"
}
