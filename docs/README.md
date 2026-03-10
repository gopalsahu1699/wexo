# WEXO - Workforce & Service Business Management Platform

WEXO is a SaaS platform designed for local service businesses in India (electricians, plumbers, CCTV installers, etc.).

## 🚀 Overview
- **Admin Dashboard**: Next.js 14+ / Tailwind CSS / Shadcn
- **Mobile app**: Flutter (Android/iOS)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Functions)
- **Billing Engine**: BillMensor Integrated

## 📂 Project Structure
- `shared_supabase_schema.sql`: Core billing and profile engine.
- `wexo_schema_extension.sql`: Custom workforce, jobs, and attendance modules.
- Check the [Master Report](file:///C:/Users/Gopal/.gemini/antigravity/brain/1bd44938-c288-4918-b5ba-d096cf2bec9a/wexo_master_report.md) for full architecture and design details.

## 🛠️ Getting Started
1. Setup a project on [Supabase](https://supabase.com).
2. Run the SQL scripts in the SQL Editor.
3. Configure your `.env` files for Web and Mobile.