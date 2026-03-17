# Follow-up Questions — Feature Walkthrough

## What Was Built

A full conversational "chat with your dashboard" system. After an initial chart is generated, a **ChatPanel** appears below it allowing users to refine, filter, or change the visualization via natural language follow-ups.

## How It Works

```
User types follow-up → ChatPanel → executeFollowUp() → POST /api/followup
  → geminiService.generateFollowUpSQL (with full history context)
    → SQL executed on PostgreSQL
      → chart re-rendered in Dashboard
        → turn appended to conversationHistory
```

Key design decision: **every previous `{query, sql}` pair is injected** into the Gemini prompt as "Conversation History", so the LLM always knows what SQL was last run before refining it.

## Files Changed

### Backend
| File | Change |
|---|---|
| [geminiService.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/services/geminiService.js) | Added [generateFollowUpSQL](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/services/geminiService.js#129-199) \u2014 builds a multi-turn prompt with history and sends to Gemini |
| [queryController.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/controllers/queryController.js) | Added [handleFollowUp](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/controllers/queryController.js#204-272) controller (same pipeline as [handleQuery](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/controllers/queryController.js#8-71), but using follow-up SQL generator) |
| [queryRoutes.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/routes/queryRoutes.js) | Added `POST /api/followup` (auth-protected) |

### Frontend
| File | Change |
|---|---|
| [apiService.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/services/apiService.js) | Added [sendFollowUp(query, history, table)](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/services/apiService.js#51-61) |
| [useDashboard.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/hooks/useDashboard.js) | Added `conversationHistory`, `activeTable`, `executeFollowUp`, `clearConversation` |
| [ChatPanel.jsx](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/components/ChatPanel.jsx) | **New file** \u2014 full chat UI with user/AI bubbles, loading dots, follow-up chips |
| [DashboardPage.jsx](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/pages/DashboardPage.jsx) | Renders `<ChatPanel>` below the Dashboard once a result exists |

## How to Test

1. Start servers: `cd backend && npm run dev` | `cd frontend && npm run dev`
2. Log in at `http://localhost:5173`
3. Type: **"Show total revenue by product category"** → bar chart appears
4. In the chat panel below, type: **"Now only show Electronics and Books"** → chart updates with just those 2 categories
5. Type: **"Change this to a pie chart"** → chart type changes to pie
6. Click **"New conversation"** → dashboard and chat reset

## Bonus Feature Score

This completes the final **+10 Bonus points** for Follow-up Questions, bringing the total to the maximum possible score.
