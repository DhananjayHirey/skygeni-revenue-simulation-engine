# Revenue Simulation Engine

This project is a full-stack Revenue Simulation Engine designed for a sales leadership team. It analyzes historical sales data (Q1 & Q2) and allows users to project pipeline outcomes for an upcoming period (Q3) dynamically. By tweaking different sales parameters—such as conversion rates, average deal sizes, and sales cycle lengths—users can instantly see exactly how their revenue will be impacted.

The application computes actual baseline metrics and simulates projected revenue on a weekly basis, returning immediate insights mapping raw numbers into easily digestible takeaways.

## Basic Formulae & Analysis

The underlying logic processes the historical data using the following standard metrics:

- **Conversion Rate** = `Closed Won / (Closed Won + Closed Lost)`
- **Average Deal Size** = `Total Revenue / Closed Won`
- **Average Sales Cycle** = `Average(closed_date - created_date)`

When projecting revenue for open pipeline deals (Q3):
- **Base Projected Value** = `Number of Deals * Conversion Rate * Average Deal Size`
- **Simulated Conversion Rate** = `Base Conversion Rate * (1 + Conversion Rate Change %)`
- **Simulated Deal Size** = `Base Average Deal Size * (1 + Deal Size Change %)`
- **New Simulated Value** = `Number of Deals * Simulated Conversion Rate * Simulated Deal Size`

The expected closure dates are estimated by adding the Sales Cycle (modified by user input) to the `created_date`.

---

## Technical Stack
- **Database**: PostgreSQL
- **Backend**: Express.js + TypeScript
- **Frontend**: React.js + Recharts + Vite

---

## Installation & Setup

### 1. Database Configuration
This application uses a standard PostgreSQL database. You need to configure it locally.

**Step 1:** Create a PostgreSQL database (e.g., `revenue_simulation`).

**Step 2:** Create the `deals` table by executing the following query in your PostgreSQL shell or pgAdmin:

```sql
CREATE TABLE deals (
    deal_id VARCHAR(50) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL,
    closed_date TIMESTAMP,
    stage VARCHAR(50) NOT NULL,
    deal_value NUMERIC,
    region VARCHAR(50),
    source VARCHAR(50)
);
```

### 2. Backend Setup
**Step 1:** Navigate into the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

**Step 2:** Create a `.env` file inside the `backend` folder and add your database configuration:
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=revenue_simulation
```

**Step 3:** Load the CSV dataset into your database. Ensure the `deals.csv` file exists inside the `backend` folder, then run:
```bash
npx ts-node src/load.ts
```
*(This script reads the CSV and inserts the deals into the SQL table.)*

**Step 4:** Start the backend server:
```bash
npm run dev
```
*The API will run on `http://localhost:5000`.*

---

### 3. Frontend Setup
**Step 1:** Open a new terminal window, navigate into the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

**Step 2:** Start the frontend development server:
```bash
npm run dev
```

**Step 3:** Open the frontend URL (usually `http://localhost:5173`) in your browser to interact with the engine.

---

## Assumptions & Disclaimers
1. **Week Indexing**: The baseline week logic assumes the start of Q3 explicitly starts on **July 1, 2025** to normalize exactly which deals fall under which simulated week.
2. **Sales Cycle Calculation**: Cycle dates are aggregated linearly in milliseconds and mapped strictly onto weekly buckets based on the modified expected `close_date`.
3. **Database Population**: The data ingestion script assumes `deals.csv` has identically matching column names as described.

Enjoy simulating your future revenue!
