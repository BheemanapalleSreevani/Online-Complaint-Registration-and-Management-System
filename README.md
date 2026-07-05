# Online Complaint Registration and Management System

A fully functional, production-ready **MERN Stack** (MongoDB, Express, React, Node) application featuring a clean MVC backend architecture, JWT-based security layers, and an elegant, responsive Tailwind CSS frontend with Recharts analytics.

---

## Features

### Role: Citizen
- **Secure Registration & Log In**: Citizen JWT sessions with password hashing (Bcrypt).
- **Grievance Logging**: Register complaints with Category, Location, Priority (Low, Medium, High, Critical), and multiple file attachments (Multer).
- **Interactive Stepper Timeline**: Real-time status update tracing (Submitted, Under Review, In Progress, Resolved, Closed, Rejected).
- **Interactive Messaging**: Direct comment stream/chat panel with Assigned Administrative Officers.
- **Verification Reviews**: Accept and close tickets or request reopening. Submit 1-5 star ratings with feedback reviews.
- **Export Grievance PDF**: Download signed PDF complaint receipts on demand.

### Role: Executive Administrator
- **Admin Console Panel**: High-level dashboards plotting monthly complaint frequencies, category distribution (Pie Chart), and citizen satisfaction distributions (Bar Chart).
- **Grievance Operations**: Set priority ratings, update progress milestones, add official resolution logs, and assign tickets to admins.
- **Category Administration**: Full CRUD dashboard to add, toggle active states, or remove grievance categories.
- **Citizen Directory**: Review citizen portfolios, change admin clearance roles, and toggle account block status.
- **Export Data Sheets**: Filter complaints database by category, status, priority, and date limits to download formatted **Excel spreadsheets** or printable **PDF summaries**.

---

## Directory Architecture

```text
online-complaint/
├── backend/
│   ├── config/          # DB connection & Cloudinary setup
│   ├── controllers/     # MVC Controllers (auth, complaints, categories, users, etc.)
│   ├── middleware/      # JWT guards, rate limiters, Multer upload fallbacks
│   ├── models/          # Mongoose Schemas (User, Category, Complaint, Comment, etc.)
│   ├── routes/          # Express Router endpoints mapping
│   ├── utils/           # PDF receipt, Excel/PDF report generators, Seeding helper
│   ├── server.js        # Node application entry point
│   ├── swagger.json     # Swagger API Specifications
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Shared layouts, Navbar, Sidebar
    │   ├── context/     # React Context Auth session manager
    │   ├── pages/       # Citizen and admin views (Dashboards, profile, details, forms)
    │   ├── services/    # Axios API client integrations
    │   ├── index.css    # Tailwind CSS imports & custom glass panels
    │   └── App.jsx      # Navigation routing map
    ├── tailwind.config.js
    ├── index.html       # Web App entry point
    └── package.json
```

---

## Local Setup & Deployment

### Prerequisite
Make sure you have [Node.js](https://nodejs.org/) (v16+) and [MongoDB](https://www.mongodb.com/) installed/accessible.

### Step 1: Clone or Open Workspace
Place the folders inside your working directory (e.g., `E:\online complaint`).

### Step 2: Configure Backend Environment Variables
Create a file named `.env` inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://sreevani940_db_user:sree2005@cluster0.0lqznpj.mongodb.net/online_complaints?retryWrites=true&w=majority
JWT_SECRET=supersecuresecretkey12345
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Email Notification setup (Fallback console logger exists)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=mockuser
SMTP_PASS=mockpass
EMAIL_FROM=noreply@onlinecomplaints.gov.in
```

### Step 3: Install Dependencies
Open a terminal and run:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend:**
```bash
cd ../frontend
npm install
```

### Step 4: Seed Initial Data
We provide an automated seed script containing 6 main categories, 1 citizen account, 1 admin account, and 3 active complaints:

```bash
cd ../backend
npm run seed
```

*Seeded credentials for immediate sign-in:*
- **Citizen Account:** `citizen@complaints.com` | Password: `citizenpassword`
- **Admin Account:** `admin@complaints.com` | Password: `adminpassword`

### Step 5: Boot Dev Servers
Run the backend and frontend simultaneously:

**Run Express Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Run React Client (Port 5173):**
```bash
cd ../frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## Core REST API Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public | Register citizen account |
| `/api/auth/login` | `POST` | Public | Authenticate citizen or admin |
| `/api/auth/admin-login` | `POST` | Public | Admin specific login panel |
| `/api/auth/forgot-password` | `POST` | Public | Dispatches password reset emails |
| `/api/auth/me` | `GET` | Private | Retrieve logged-in session profile |
| `/api/complaints` | `POST` | Citizen | File a complaint (Handles Multipart uploads) |
| `/api/complaints` | `GET` | Private | Get all or own complaints (Filters & pagination) |
| `/api/complaints/:id` | `GET` | Private | Detailed single complaint parameters |
| `/api/complaints/:id/status` | `PUT` | Admin | Update status/priority/resolution notes |
| `/api/complaints/:id/close-reopen` | `PUT` | Private | Close or Reopen complaint ticket |
| `/api/complaints/:id/receipt` | `GET` | Private | Download complaint receipt PDF |
| `/api/categories` | `GET` | Public | Get active categories list |
| `/api/comments` | `POST` | Private | Post direct message to ticket thread |
| `/api/feedback` | `POST` | Citizen | Submit rating review for resolved ticket |
| `/api/dashboard/admin` | `GET` | Admin | Fetch analytics overview metrics & charts |
| `/api/reports/export` | `GET` | Admin | Export Excel or PDF data sheets |

*API interactive documentation page is accessible at [http://localhost:5000/api-docs](http://localhost:5000/api-docs).*
