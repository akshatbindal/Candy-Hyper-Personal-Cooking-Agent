import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Ensure the Gemini API client is initialized.
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API: Get health status
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasAi: !!ai });
  });

  // API: Generate structured meal plan using Gemini API
  app.post("/api/generate-meal-plan", async (req, res) => {
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel.",
      });
    }

    try {
      const { events = [], emails = [], preferences, customIngredients = "" } = req.body;

      // Map preferences to strings
      const prefs = preferences || {
        preferences: { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false, keto: false, other: "" },
        healthGoals: { proteinGoal: 100, caloriesGoal: 1800, carbLimit: 150 },
        budgetLimit: 500,
        fridgePreset: "standard"
      };

      const prompt = `
Generate a highly customized 1-day meal plan (Breakfast, Lunch, Dinner) and a cooking to-do list based on the user's daily schedule, relevant emails, food preferences, health targets, and fridge ingredients.

Here is the context about the user's day:
1. Google Calendar Events for today:
${JSON.stringify(events, null, 2)}

2. Gmail Context or Booking Updates:
${JSON.stringify(emails, null, 2)}

3. Fridge Contents / Availability:
Fridge Preset selected: "${prefs.fridgePreset}"
Custom fridge ingredients entered by user: "${customIngredients}"

4. User Preferences & Health Goals:
Dietary preferences:
- Vegetarian: ${prefs.preferences?.vegetarian ? "YES" : "NO"}
- Vegan: ${prefs.preferences?.vegan ? "YES" : "NO"}
- Gluten Free: ${prefs.preferences?.glutenFree ? "YES" : "NO"}
- Dairy Free: ${prefs.preferences?.dairyFree ? "YES" : "NO"}
- Keto: ${prefs.preferences?.keto ? "YES" : "NO"}
- Other notes: ${prefs.preferences?.other || "None"}

Nutritional targets for the day:
- Daily Protein target: ${prefs.healthGoals?.proteinGoal || 100} grams
- Daily Calories target: ${prefs.healthGoals?.caloriesGoal || 1800} kcal
- Carb limit: ${prefs.healthGoals?.carbLimit || 150} grams

Budget Feasibility Limit for daily groceries to buy:
- Daily Grocery Budget Limit: ₹${prefs.budgetLimit || 500}

INSTRUCTIONS FOR EXPERT MEAL DESIGN:
1. Schedule Adaptation: Align meal prep time and sizes with the calendar events. 
   - E.g. If the user has a "Client Lunch (Out)" or "Team Lunch", the generated Lunch should reflect eating out (keep it light or list "Eating Out (Client Lunch)" but suggest a light, fast pre/post meal strategy, or design a lightweight sandwich/salad they can make if it's optional).
   - If they have a "Gym" event, make the surrounding meal (like dinner or post-gym snack/meal) high protein.
   - If they have back-to-back meetings, make lunch extremely fast (under 15 mins).
2. Fridge Optimization: Reuse ingredients they already have in their fridge (categorized as "Have"). Minimize additional items to buy.
3. Budget Feasibility: Total estimated cost for items categorized as "Buy" should be calculated realistically in Indian Rupees (₹) since they use local quick commerce apps like Blinkit. Keep costs aligned with typical prices. Provide a clear breakdown and state if it is feasible within their ₹${prefs.budgetLimit} limit.
4. Smart Substitutions: List 3 smart ingredients substitutions that would make the plan cheaper, healthier, or fit their dietary restriction if any ingredient is hard to find (e.g. Paneer -> Tofu/Chickpeas, Milk -> Curd + Water, etc.).
5. Clear Cooking Steps: Keep the steps concise and action-oriented. Max 5 steps per meal.
      `;

      // Define the response schema structure matching our frontend types
      const ingredientSchema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["Have", "Buy"] },
          estCost: { type: Type.INTEGER, description: "Estimated cost in Rupees (₹) to buy this. Set to 0 if status is Have" }
        },
        required: ["name", "amount", "status", "estCost"]
      };

      const mealDetailSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prepTime: { type: Type.STRING, description: "Preparation time, e.g., '15 min'" },
          calories: { type: Type.INTEGER },
          protein: { type: Type.STRING, description: "Protein content, e.g., '22g'" },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          ingredients: { type: Type.ARRAY, items: ingredientSchema },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          rating: { type: Type.NUMBER, description: "Rating out of 5 stars, e.g. 4.6" }
        },
        required: ["title", "description", "prepTime", "calories", "protein", "tags", "ingredients", "steps", "rating"]
      };

      const groceryItemSchema = {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          amount: { type: Type.STRING, description: "E.g. Buy 100g, Have 2" },
          status: { type: Type.STRING, enum: ["Have", "Buy"] },
          estCost: { type: Type.INTEGER, description: "Estimated cost in Rupees (₹) to buy. Set to 0 if status is Have" }
        },
        required: ["id", "name", "amount", "status", "estCost"]
      };

      const substitutionSchema = {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "Original ingredient to replace" },
          substitute: { type: Type.STRING, description: "Suggested substitute ingredient" },
          benefit: { type: Type.STRING, description: "Why swap? E.g., cheaper, lower calorie, vegan, etc." }
        },
        required: ["original", "substitute", "benefit"]
      };

      const budgetFeasibilitySchema = {
        type: Type.OBJECT,
        properties: {
          totalEstCost: { type: Type.INTEGER, description: "Total estimated grocery cost in ₹ of all elements marked 'Buy'" },
          budgetLimit: { type: Type.INTEGER },
          isFeasible: { type: Type.BOOLEAN, description: "Whether totalEstCost <= budgetLimit" },
          analysis: { type: Type.STRING, description: "A conversational explanation of budget feasibility." }
        },
        required: ["totalEstCost", "budgetLimit", "isFeasible", "analysis"]
      };

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "E.g. May 20, Tue" },
          daySummary: { type: Type.STRING, description: "A high-level overview of how today's calendar and meals sync up." },
          breakfast: mealDetailSchema,
          lunch: mealDetailSchema,
          dinner: mealDetailSchema,
          groceryList: { type: Type.ARRAY, items: groceryItemSchema },
          substitutions: { type: Type.ARRAY, items: substitutionSchema },
          budgetFeasibility: budgetFeasibilitySchema
        },
        required: ["date", "daySummary", "breakfast", "lunch", "dinner", "groceryList", "substitutions", "budgetFeasibility"]
      };

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          systemInstruction: "You are an expert personal chef and health coach. You build highly custom-tailored meal plans that adapt directly to the user's day, calendar schedule, emails, health metrics, and grocery budgets. Always output valid JSON strictly according to the requested schema. Provide realistic cost estimations in INR (₹)."
        }
      });

      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const mealPlan = JSON.parse(responseText);
      res.json(mealPlan);
    } catch (error: any) {
      console.error("Gemini meal generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate meal plan" });
    }
  });

  // Serve static assets / Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
