# 🤖 AI BI Dashboard — Conversational AI for Instant Business Intelligence

> Generate interactive dashboards from natural language queries using AI, PostgreSQL, and React.

![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.0_Flash-orange?logo=google)

---

## 📋 Overview

AI BI Dashboard allows **non-technical users** to generate interactive dashboards using natural language queries. Simply type a question like:

> *"Show monthly sales revenue for Q3 broken down by region and highlight the top-performing product category."*

The system will:
1. 🧠 Understand your question using **Google Gemini AI**
2. 🔄 Convert it to optimized **PostgreSQL SQL**
3. 📊 Select the best **visualization** (line, bar, pie, scatter, KPI, table)
4. 📈 Render an **interactive dashboard** with Recharts

---

## 🏗️ Architecture

```
User Prompt
  → React Frontend (TailwindCSS + Recharts)
    → Express Backend API
      → Gemini AI (NL → SQL + chart config)
        → PostgreSQL (execute query)
          → Data Processing + Chart Selection
            → JSON Response
              → React renders interactive dashboard
```

---

## 📁 Project Structure

```
ai-bi-dashboard/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── PromptInput.jsx      # Natural language input
│       │   ├── Dashboard.jsx        # Main dashboard layout
│       │   ├── ChartContainer.jsx   # Dynamic chart rendering
│       │   ├── KPICards.jsx         # KPI metric cards
│       │   └── DataTable.jsx        # Data table view
│       ├── pages/
│       │   └── DashboardPage.jsx    # Main page with history
│       ├── hooks/
│       │   └── useDashboard.js      # State management hook
│       └── services/
│           └── apiService.js        # API client
├── backend/
│   ├── server.js                    # Express entry point
│   ├── config/
│   │   ├── db.js                    # PostgreSQL connection
│   │   └── env.js                   # Environment config
│   ├── controllers/
│   │   └── queryController.js       # Request handlers
│   ├── routes/
│   │   └── queryRoutes.js           # API routes
│   ├── services/
│   │   ├── geminiService.js         # Gemini AI integration
│   │   ├── queryService.js          # Database query service
│   │   └── chartService.js          # Chart selection engine
│   └── middleware/
│       └── errorHandler.js          # Error handling
└── database/
    ├── migrations/
    │   └── 001_create_sales_table.sql
    └── seed/
        └── importCSV.js             # CSV import script
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 15+
- **Google Gemini API Key** — [Get yours here](https://aistudio.google.com/apikey)

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ai_bi_dashboard
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Setup Database

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE ai_bi_dashboard;"

# Run migration and seed
cd backend
npm run seed
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

### `POST /api/query`
Send a natural language query and receive chart data.

**Request:**
```json
{
  "query": "Show total revenue by product category",
  "table": "sales"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sql": "SELECT product_category, SUM(total_revenue) as total_revenue FROM sales GROUP BY product_category ORDER BY total_revenue DESC",
    "chartType": "bar",
    "xAxis": "product_category",
    "yAxis": "total_revenue",
    "title": "Total Revenue by Product Category",
    "chartData": [...],
    "rowCount": 5
  }
}
```

### `POST /api/upload`
Upload a CSV file to create a new queryable table.

### `GET /api/schema`
Returns database schema information.

### `GET /api/health`
Health check endpoint.

---

## 💡 Demo Prompts

Try these queries:

1. **"Show monthly sales revenue for 2023 broken down by region"**
2. **"What are the top 5 product categories by total revenue?"**
3. **"Show average rating by payment method"**
4. **"Compare quantity sold across regions for Electronics"**
5. **"Show the distribution of discount percentages"**
6. **"What is the total revenue for each quarter?"**

---

## 🗃️ Dataset Schema

**Table: `sales`** (Amazon Sales Dataset)

| Column | Type | Description |
|--------|------|-------------|
| order_id | INTEGER | Unique order identifier |
| order_date | DATE | Date of order |
| product_id | INTEGER | Product identifier |
| product_category | TEXT | Category (Books, Electronics, etc.) |
| price | FLOAT | Original price |
| discount_percent | INTEGER | Discount percentage |
| quantity_sold | INTEGER | Quantity sold |
| customer_region | TEXT | Customer region |
| payment_method | TEXT | Payment method |
| rating | FLOAT | Customer rating |
| review_count | INTEGER | Number of reviews |
| discounted_price | FLOAT | Price after discount |
| total_revenue | FLOAT | discounted_price × quantity_sold |

---

## 🛡️ Error Handling

The system handles:
- ❌ Invalid SQL queries
- ❌ Missing columns or tables
- ❌ Empty results
- ❌ Ambiguous prompts
- ❌ Destructive SQL prevention (INSERT, DELETE, DROP blocked)

---

## 🔮 Future Roadmap

- [ ] Redis caching for repeated queries
- [ ] Multi-dataset support with joins
- [ ] User authentication system
- [ ] Role-based access control
- [ ] Dashboard saving and sharing
- [ ] Export to PDF/PNG
- [ ] Real-time data streaming

---

## 📄 License

MIT

---

Built with ❤️ using React, Express, PostgreSQL, and Google Gemini AI
