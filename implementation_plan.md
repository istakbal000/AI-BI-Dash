# Follow-up Questions: Conversational Dashboard

Allow users to refine or filter a generated chart by typing follow-up messages. For example, after asking "Show revenue by region", the user can say "Now filter to only the East Coast" and the system will apply that filter to regenerate the chart.

## Proposed Changes

### Backend

#### [MODIFY] [geminiService.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/services/geminiService.js)
- Add a `generateFollowUpSQL` function that accepts:
  - `followUpQuery` – the user's new message
  - `conversationHistory` – an array of previous `{ query, sql }` pairs
  - `tableName` – the active table
- Builds a richer prompt that includes all previous turns so Gemini can understand the context, and then generates a refined SQL + chart config.

#### [MODIFY] [queryController.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/controllers/queryController.js)
- Add `handleFollowUp` controller that:
  - Accepts `{ followUpQuery, conversationHistory, table }` from the request body
  - Calls `generateFollowUpSQL`
  - Executes the SQL, formats, and returns a chart response (same format as `/api/query`)

#### [MODIFY] [queryRoutes.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/routes/queryRoutes.js)
- Add `POST /api/followup` route pointing to `handleFollowUp`

### Frontend

#### [MODIFY] [apiService.js](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/services/apiService.js)
- Add `sendFollowUp(followUpQuery, conversationHistory, table)` function

#### [MODIFY] [useDashboard.js](file:///c:/Users/User/OneDrive\Desktop\hackgfg/frontend/src/hooks/useDashboard.js)
- Add `conversationHistory` state (array of previous `{ query, sql }` turns)
- When [executeQuery](file:///c:/Users/User/OneDrive/Desktop/hackgfg/backend/services/queryService.js#3-22) succeeds, append to `conversationHistory`
- Add `executeFollowUp(followUpQuery)` function that calls `sendFollowUp` with the current `conversationHistory`
- When a follow-up succeeds, append again to `conversationHistory`
- Add `clearConversation()` to reset history

#### [NEW] [ChatPanel.jsx](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/components/ChatPanel.jsx)
- A sleek chat-style panel rendered **below** the Dashboard result
- Shows any previous turns (bubbles for user query + brief AI chart title)
- Has a "Follow-up..." text input + send button
- Shows loading indicator while processing
- Includes a "New conversation" button that clears the history and result

#### [MODIFY] [DashboardPage.jsx](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/pages/DashboardPage.jsx)
- Destructure `conversationHistory`, `executeFollowUp`, `clearConversation` from [useDashboard](file:///c:/Users/User/OneDrive/Desktop/hackgfg/frontend/src/hooks/useDashboard.js#4-110)
- Render `<ChatPanel>` below `<Dashboard>` when a result exists

## Verification Plan

### Manual Verification (Browser)
1. Start the dev servers: `cd backend && npm run dev` and `cd frontend && npm run dev`
2. Open `http://localhost:5173`, log in, and type: **"Show total revenue by product category"** → verify a bar chart appears.
3. In the follow-up chat panel below, type: **"Now only show Electronics and Books"** → verify the new chart only shows those two categories.
4. Type: **"Change this to a line chart"** → verify chart type changes.
5. Type: **"New conversation"** → verify the dashboard and chat reset.
