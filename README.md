# WEXO - Workforce & Service Business Management Platform

WEXO is a premium SaaS platform designed for local service businesses in India (electricians, plumbers, CCTV installers, AC technicians, etc.). It empowers business owners with high-end administrative tools and provides field technicians with a simplified mobile experience.

## 🚀 Key Modules
- **Admin Dashboard**: Next.js 14+ / Tailwind CSS / Framer Motion / 3D Glassmorphism.
- **Worker Mobile App**: Flutter (Android & iOS) with offline support.
- **Shared Data Engine**: Bi-directional sync with **BillMensor** for unified Billing, CRM, and Inventory.
- **Workforce Lifecycle**: Job Assignment, Live Attendance (GPS), Payroll, and Skill Tracking.

## 📂 Project Structure
- `/src`: Next.js Web Application (Website & Admin Dashboard).
- `/mobile`: Flutter Mobile Application source code.
- `/docs`: SQL Database Schemas (`shared_supabase_schema.sql` and `wexo_schema_extension.sql`).
- `/public`: 3D SVG assets and branding materials.

## 🛠️ Getting Started

### 1. Database Setup
1. Create a project on [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the scripts in this order:
   - `docs/shared_supabase_schema.sql` (Core Billing & Profiles)
   - `docs/wexo_schema_extension.sql` (Workforce & Job Tracking)

### 2. Environment Configuration
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Development Servers
**Web Dashboard:**
```bash
npm install
npm run dev
```

**Mobile App:**
```bash
cd mobile
flutter pub get
flutter run
```

## 💎 Design System: 3D Light Glassmorphism
WEXO uses a curated design system available in `src/app/globals.css`:
- **Surface**: White/70 backdrop blur.
- **Primary**: #2563EB (WEXO Blue).
- **Secondary**: #F59E0B (Energy Orange).
- **Roundedness**: 24px (Large) to 48px (Extra Large).

## 🛡️ Support
Built for the unique needs of the Indian service economy.
© 2024 WEXO Technologies.
