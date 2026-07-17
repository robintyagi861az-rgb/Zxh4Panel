# ZXH4 Panel

A mobile-first SMM reseller platform on Next.js (App Router) + Firebase,
styled with the "Royal Amethyst" dark glassmorphism theme.

## Folder structure

Every file — every component, every lib helper, types — lives loose at the
repo root. Nothing is wrapped in a `components/`, `lib/`, or `types/`
folder.

The only folders that exist are the ones Next.js itself requires to work:
`app/` (the App Router needs this to find your routes) and one folder per
route inside it (`app/login/`, `app/dashboard/`, etc. — a route in Next.js
*is* a folder containing a `page.tsx`, there's no way around that), plus
`app/api/` and one folder per API route inside it, for the same reason.
None of those nest more than one level deep, and nothing outside `app/`
is nested at all.

```
.
├── app/
│   ├── page.tsx, layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── dashboard/page.tsx
│   ├── admin/page.tsx
│   ├── maintenance/page.tsx
│   └── api/
│       ├── maintenance-status/route.ts
│       ├── place-order/route.ts
│       ├── redeem-coupon/route.ts
│       ├── request-password-reset/route.ts
│       ├── confirm-password-reset/route.ts
│       ├── admin-adjust-wallet/route.ts
│       └── admin-broadcast/route.ts
├── globals.css
├── firebase.ts, firebaseAdmin.ts, smmvault.ts, email.ts, useAuth.tsx
├── types.ts
├── Navbar.tsx, ServiceCard.tsx, BuyModal.tsx, CouponWidget.tsx,
│   ChatPanel.tsx, OrderHistory.tsx, MaintenanceModal.tsx,
│   AdminSidebar.tsx, SettingsPanel.tsx, CouponCreator.tsx,
│   WalletQuickAction.tsx, SubAdminManager.tsx, ChatDesk.tsx,
│   BroadcastCenter.tsx
├── middleware.ts
├── package.json, tsconfig.json, tailwind.config.js, postcss.config.js, next.config.js
├── FIRESTORE_SCHEMA.md
└── .env.example
```

Imports use the `@/` alias, which `tsconfig.json` points straight at the
repo root — e.g. `import { db } from "@/firebase"` or
`import Navbar from "@/Navbar"`.

## 1. Firebase setup

1. In the Firebase console for the `zxh4panel` project, enable:
   - **Authentication** -> Email/Password and Google sign-in methods.
   - **Firestore** -> create the database, then paste the security rules
     from `FIRESTORE_SCHEMA.md` into Rules.
2. Generate a service account key (Project Settings -> Service accounts ->
   Generate new private key) and fill in `.env.local` from `.env.example`.
3. Manually create your first admin user:
   - Register normally through `/register` (this creates `role: "user"`).
   - In the Firestore console, edit that user's document and change
     `role` to `"admin"`.

## 2. Configure business settings from the Admin Panel

Once logged in as `admin`, go to **Global Settings** and fill in:
- Google SMTP (Gmail address + App Password, not your real password)
- Google OAuth client ID/secret (optional, only needed to show the toggle;
  the actual provider must also be enabled in Firebase Authentication)
- SmmVault API base URL + key

Add at least one document to the `services` collection (via Firestore
console or a small seed script) so the dashboard catalog isn't empty —
see `FIRESTORE_SCHEMA.md` for the shape.

## 3. Local development

```bash
npm install
cp .env.example .env.local   # then fill in your service account values
npm run dev
```

## 4. Deploy to Vercel

```bash
vercel
```

Add the three `FIREBASE_*` environment variables in the Vercel dashboard
before your first production deploy — the app will throw a clear error on
any server route if they're missing.

## What's implemented vs. what to extend

**Implemented:** wallet + single-use coupon system (atomic, race-safe),
SmmVault order placement with the "Not Enough Funds" -> maintenance-modal
interceptor, global maintenance-mode middleware with admin bypass, Google
OAuth toggle wiring, 6-digit-code password reset over your own SMTP,
dynamic SMTP/OAuth/API config stored in Firestore and editable from the
admin panel, real-time chat (user <-> admin) via Firestore listeners,
coupon creator, quick-action wallet panel, sub-admin creation with 4
granular permission toggles, and an SMTP broadcast center.

**You'll likely want to add next:** a services CRUD screen in the admin
panel (services are currently seeded directly in Firestore), pagination
on order history and chat threads for scale, a cron/webhook to poll
SmmVault order status and auto-fire the "Order Update" email, and rate
limiting on the public API routes.
