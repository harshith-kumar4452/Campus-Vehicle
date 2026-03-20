# Campus Vehicle Security & Monitoring Portal 🚗🛡️

A comprehensive vehicle registration and security management system designed for university campuses. This portal allows students and faculty to register their vehicles, while providing administrators with tools for verification and violation tracking.

## 🌟 Key Features

- **Role-Based Access**: Specialized registration flows for Students and Faculty.
- **Secure Admin Dashboard**: Restricted access for Super Admins to verify registrations.
- **Document Management**: Automated file organization for Driving Licenses and ID Cards in Supabase Storage.
- **Violation Tracking**: Centralized database to record speeding, parking offenses, and fine status.
- **Real-Time Status Check**: Users can instantly verify if their vehicle registration is "Approved", "Pending", or "Rejected".
- **Strict Validation**: Enforces Indian Driving License formats and university email domains.

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), Vite, Tailwind CSS.
- **Backend/Database**: Supabase (PostgreSQL).
- **Icons**: Lucide React.
- **Forms**: React Hook Form.

## 🚀 Setup Procedure

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/harshith-kumar4452/Campus-Vehicle.git
cd "CAMPUS VEHICLE SPEED CONTROL AND"

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a **`.env`** file in the root directory. You can create your own Supabase project keys or use the predefined keys below:

```env
VITE_SUPABASE_URL=https://nuxqjsfylcfzadpyrpyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eHFqc2Z5bGNmemFkcHlycHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTg0ODYsImV4cCI6MjA4OTU5NDQ4Nn0.CLGGdQdXsn7F1w6hVuBlo7NwiwssZibzETBbWfkP7As
```

### 3. Database Initialization
Go to the **SQL Editor** in your Supabase Dashboard and run the following scripts in order:
1. `setup-db.sql`: Creates all tables (Students, Faculty, Vehicles, Violations, Admins) and seeds the primary admin account.
2. `setup-rls.sql`: Configures Row Level Security and Storage policies.

### 4. Storage Setup
In the Supabase **Storage** section:
1. Create a bucket named **`documents`**.
2. Go to Policies and ensure the **`setup-rls.sql`** policies are applied correctly.

### 5. Run Locally
```bash
npm run dev
```

## 🔐 Administrative Access
To access the **Super Admin Dashboard**:
- **Role**: Select "Admin" on the landing page.
- **Email**: `admin@vnrvjiet.in`
- **Password**: `123456789`

## 📂 Project Structure
- `/src/components`: UI components (RegistrationForm, StatusCheck, AdminDashboard).
- `/src/lib`: Supabase client configuration.
- `setup-db.sql`: Database schema definition.
- `schema_design.md`: Detailed database architecture document.

---
© 2026 Campus Vehicle Management System. All Rights Reserved.

# Campus-Vehicle