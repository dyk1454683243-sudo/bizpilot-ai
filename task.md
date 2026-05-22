# Phase 3J Task List

- [x] Landing page polish
  - [x] Update headline in `src/app/page.tsx`
  - [x] Connect Privacy and Terms footer links to `/privacy` and `/terms`
  - [x] Update CTA styles and hover transitions
- [x] SEO Metadata updates in `src/app/layout.tsx`
- [x] Statically-rendered Legal Pages
  - [x] Create `/privacy` page (`src/app/privacy/page.tsx`)
  - [x] Create `/terms` page (`src/app/terms/page.tsx`)
- [x] Login Sandbox Mode instructions card in `src/app/login/page.tsx`
- [x] Redirect/protect `/billing` outside `/dashboard` in `src/app/billing/page.tsx`
- [x] Clean unsafe Supabase fallbacks in `src/lib/supabase.ts`
- [x] Add `.env.example` file
- [x] Create custom 404 page at `src/app/not-found.tsx`
- [x] Razorpay Checkout refinements
  - [x] Add script loading timeout/error handling in `src/app/dashboard/billing/page.tsx`
  - [x] Refetch billing/subscription data on signature verification failure in `src/app/dashboard/billing/page.tsx`
- [x] Documentation updates in `README.md`
- [x] Code quality & validation
  - [x] Run `npx tsc --noEmit`
  - [x] Run `npm run build`
  - [x] Verify local server and git status (no staging of `.env.local`, no exposed secrets)

## Final Verification Summary
- [x] Phase 3J is manually verified on Vercel production:
  - [x] Landing page works
  - [x] Privacy and Terms pages work
  - [x] Custom 404 page works
  - [x] Login works
  - [x] Dashboard works
  - [x] Refresh works
  - [x] Billing and Razorpay Test Mode still work
  - [x] Settings and Business Profile save correctly
  - [x] All existing modules (Leads, Appointments, Invoices, Reviews, Reports) are fully functional
  - [x] Verified that `.env.local` is not staged and no secrets are exposed
