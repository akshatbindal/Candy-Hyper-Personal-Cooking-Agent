import { CalendarEvent, GmailMessageSnippet } from "../types";
import { Calendar, Mail, Flame } from "lucide-react";

interface DayScheduleProps {
  events: CalendarEvent[];
  emails: GmailMessageSnippet[];
  onTriggerScenario: (scenarioType: "extended" | "cancelled" | "takeaway") => void;
  activeScenario: string | null;
}

export const DaySchedule: React.FC<DayScheduleProps> = ({
  events,
  emails,
  onTriggerScenario,
  activeScenario,
}) => {
  // Safe formatter for calendar dates
  const formatTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "All Day";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateTimeStr;
    }
  };

  // Default events to show if user calendar is empty
  const displayEvents = events.length > 0 ? events : [
    { id: "e1", summary: "Standup Call", start: { dateTime: "2026-07-03T09:30:00Z" } },
    { id: "e2", summary: "Client Lunch (Out)", start: { dateTime: "2026-07-03T12:30:00Z" } },
    { id: "e3", summary: "Gym", start: { dateTime: "2026-07-03T16:00:00Z" } },
    { id: "e4", summary: "Dinner with Mom", start: { dateTime: "2026-07-03T20:00:00Z" } },
  ];

  // Default emails to show if gmail is empty
  const displayEmails = emails.length > 0 ? emails : [
    { id: "m1", snippet: "Team Lunch tomorrow at 12:30 PM at Mainland China. High protein and low-calorie lunch suggested." },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-purple-100/80 shadow-sm transition-all hover:shadow-md hover:border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display tracking-tight">Today's Schedule</h2>
            <p className="text-xs text-slate-500">Synced with Calendar & Gmail</p>
          </div>
        </div>
        <span className="text-xs bg-fuchsia-50 text-fuchsia-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border border-fuchsia-100">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-ping"></span> Live Sync
        </span>
      </div>

      {/* Calendar Timeline */}
      <div className="mb-6 relative pl-4 border-l-2 border-purple-100/80 space-y-4">
        {displayEvents.map((event, idx) => (
          <div key={event.id} className="relative group">
            {/* Timeline dot */}
            <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white transition-all ${
              event.summary.toLowerCase().includes("lunch")
                ? "bg-pink-500 group-hover:scale-125"
                : event.summary.toLowerCase().includes("gym")
                ? "bg-purple-500 group-hover:scale-125"
                : "bg-indigo-500 group-hover:scale-125"
            }`}></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  {formatTime(event.start?.dateTime || event.start?.date)}
                </span>
                <h4 className="text-xs font-bold text-slate-700 mt-0.5">{event.summary}</h4>
                {event.description && (
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{event.description}</p>
                )}
              </div>
              {/* Context suggestion badges */}
              {event.summary.toLowerCase().includes("gym") && (
                <span className="text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-semibold border border-purple-100/40">
                  Protein focus
                </span>
              )}
              {event.summary.toLowerCase().includes("lunch") && (
                <span className="text-[9px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-semibold border border-pink-100/40">
                  Light evening
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Email context summary */}
      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-6">
        <div className="flex items-center gap-2 mb-2 text-slate-600">
          <Mail className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Context from Emails</h3>
        </div>
        <div className="space-y-2">
          {displayEmails.map((email) => (
            <div key={email.id} className="text-xs text-slate-600 flex items-start gap-1.5">
              <span className="text-purple-500 font-bold">•</span>
              <p className="leading-relaxed font-medium">{email.snippet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptive Scenarios Simulation */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Flame className="w-4 h-4 text-pink-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Adaptive Scenarios</h3>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          How do plan metrics change when today's scenarios shift? Toggle a simulation to adapt your recipe recommendations in real-time.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onTriggerScenario("extended")}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeScenario === "extended"
                ? "bg-gradient-to-br from-pink-500 to-rose-600 border-none text-white shadow-md"
                : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold text-[10px]">Meeting Extended</div>
            <div className={`text-[8px] mt-0.5 leading-tight ${activeScenario === "extended" ? "text-pink-100" : "text-slate-400"}`}>
              Push dinner later & shorten prep time
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario("cancelled")}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeScenario === "cancelled"
                ? "bg-gradient-to-br from-purple-500 to-fuchsia-600 border-none text-white shadow-md"
                : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold text-[10px]">Gym Cancelled</div>
            <div className={`text-[8px] mt-0.5 leading-tight ${activeScenario === "cancelled" ? "text-purple-100" : "text-slate-400"}`}>
              Lower calorie intake suggest
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario("takeaway")}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeScenario === "takeaway"
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white shadow-md"
                : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="font-bold text-[10px]">Got Takeaway</div>
            <div className={`text-[8px] mt-0.5 leading-tight ${activeScenario === "takeaway" ? "text-indigo-100" : "text-slate-400"}`}>
              Adjust calorie & suggest very light dinner
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
