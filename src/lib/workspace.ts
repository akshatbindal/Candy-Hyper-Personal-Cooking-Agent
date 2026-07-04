import { CalendarEvent, GmailMessageSnippet } from "../types";

/**
 * Fetch Google Calendar events for the user's primary calendar for today.
 */
export const fetchCalendarEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
  try {
    const now = new Date();
    // Calculate start and end of today in local time, converted to ISO strings
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.error("Failed to fetch calendar events:", await res.text());
      return [];
    }

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      summary: item.summary || "No Title",
      description: item.description,
      start: item.start,
      end: item.end,
    }));
  } catch (err) {
    console.error("Error fetching calendar events:", err);
    return [];
  }
};

/**
 * Fetch Gmail messages that contain keywords related to food, dinners, meetings, or planning.
 */
export const fetchGmailSnippets = async (accessToken: string): Promise<GmailMessageSnippet[]> => {
  try {
    // Search query for meals, lunch, dinners, or meetings in subject or body
    const query = "subject:(dinner OR lunch OR food OR meeting OR restaurant OR reservation) OR meeting OR dinner";
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.error("Failed to search Gmail messages:", await res.text());
      return [];
    }

    const listData = await res.json();
    if (!listData.messages || listData.messages.length === 0) return [];

    const snippets: GmailMessageSnippet[] = [];
    
    // Fetch individual snippets in parallel to keep performance optimal
    await Promise.all(
      listData.messages.map(async (msg: { id: string }) => {
        try {
          const msgRes = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=minimal`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            snippets.push({
              id: msg.id,
              snippet: msgData.snippet || "",
            });
          }
        } catch (e) {
          console.error(`Failed to fetch message details for ${msg.id}:`, e);
        }
      })
    );

    return snippets;
  } catch (err) {
    console.error("Error fetching Gmail snippets:", err);
    return [];
  }
};

/**
 * Export a meal plan cooking guide and grocery list directly to a new Google Tasks list.
 */
export const exportToGoogleTasks = async (
  accessToken: string,
  listTitle: string,
  tasks: string[]
): Promise<boolean> => {
  try {
    // 1. Create a new task list
    const createListRes = await fetch("https://www.googleapis.com/tasks/v1/users/@me/lists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: listTitle }),
    });

    if (!createListRes.ok) {
      throw new Error(`Failed to create task list: ${await createListRes.text()}`);
    }

    const list = await createListRes.json();
    const listId = list.id;

    // 2. Add each task sequentially or in batch to the list
    for (const taskText of tasks) {
      try {
        await fetch(`https://www.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: taskText,
            notes: "Added via Hyper-Personal Cooking Agent 🍳",
          }),
        });
      } catch (err) {
        console.error(`Error adding task: ${taskText}`, err);
      }
    }

    return true;
  } catch (err) {
    console.error("Error in Google Tasks export flow:", err);
    return false;
  }
};
