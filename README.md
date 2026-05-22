# BizPilot AI

**Your AI Employee for Sales, Follow-ups, Bookings & Payments.**

🔗 **Live Demo:** [https://bizpilot-ai-ten.vercel.app](https://bizpilot-ai-ten.vercel.app)

BizPilot AI is an all-in-one business operation platform designed specifically for service-based businesses, clinics, salons, coaching centers, and consultants. It streamlines operations by tracking leads, scoring interest levels, booking appointments, drafting WhatsApp follow-up messages (in English and Hinglish), tracking invoices, collecting client reviews, and generating daily AI operations reports.

---

## 🚀 Active Integrations & Architecture
BizPilot AI is built as a complete Next.js full-stack application integrated with:
- **Supabase Backend**:
  - **Authentication**: Email/Password and Google OAuth integrations.
  - **Database (PostgreSQL)**: Relational schemas tracking Leads CRM, Appointments scheduler, Invoices, Business Profiles, and Settings.
- **Razorpay Integration (Test Mode)**:
  - Dynamic checkout SDK integrations allowing simulated subscription upgrades and payment verification workflows.

---

## ✨ Features
1. **Landing Page**: Visually premium showcase highlighting product suites, use cases by business type, FAQs, and subscription plans.
2. **Secure Authentication**: Full login and signup screens with session management handled via Supabase.
3. **Onboarding Wizard**: A 4-step interactive business configuration setup (saves preferences, payment methods, working hours, and goals) with stateful persistence.
4. **Interactive Dashboard**: Stat cards, recent appointments, invoice tracking, recent leads list, and a smart AI recommendation feed.
5. **Lead CRM**: View, search, and filter leads. View individual lead detail pages with action histories, timeline logs, and custom AI follow-up generators.
6. **AI Follow-up Messages**: Instantly generates follow-up messages using customizable tones (Professional, Friendly, Hinglish, Short, or Persuasive) ready for WhatsApp, SMS, or email.
7. **Appointment Scheduler**: Organized weekly and daily calendars to handle customer bookings and track statuses.
8. **Invoices**: Create, track, and filter invoices, with automatic status badges and local UPI payment links.
9. **Review Manager**: Templates and mock logs to request client reviews and showcase business testimonials.
10. **AI Reports**: Non-technical summary report detailing leads acquired, appointment conversion rates, missed opportunity flags, and daily check-lists.
11. **Settings Page**: Account profile synchronization, services CRUD management, staff members list, and payment settings.
12. **Subscription & Billing**: Upgrade pricing plans and view invoice billing history.
13. **Topbar Utilities**: Real-time notifications bell dropdown and profile shortcut dropdown.
14. **Mobile Responsive**: Fully optimized bottom-bar navigation and slide-up dialogs for mobile viewports.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: TypeScript
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Payments**: [Razorpay](https://razorpay.com/) (Test Mode)
- **Styling**: TailwindCSS v4 with custom styling tokens (CSS custom properties, custom animations)
- **Icons**: Lucide React

---

## 💻 How to Run Locally

### Prerequisites
Make sure you have Node.js (version 18+ recommended) installed on your system.

### Steps
1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` in the project root:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and fill in your Supabase connection strings and Razorpay Key IDs:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project API URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase API Anon / Publishable Key.
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your Razorpay Merchant Key ID (Test Mode).
   - `RAZORPAY_KEY_SECRET`: Your Razorpay API Key Secret (Test Mode).
   - `RAZORPAY_WEBHOOK_SECRET`: Your Razorpay Webhook Signing Secret.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view and interact with the application.

4. **Verify Type Checks and Production Build**:
   To ensure the application compiles cleanly without errors:
   ```bash
   npx tsc --noEmit
   ```
   ```bash
   npm run build
   ```
