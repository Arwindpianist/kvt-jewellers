# Trading Pre-Registration System Setup

## Overview
Complete pre-registration system for the Online Trading Platform with admin management and email notifications.

## Database Migration Required

Before deploying, run the migration SQL in Supabase to create the `trading_pre_registrations` table:

**File:** `supabase/migrations/create_trading_pre_registrations_table.sql`

Run this migration through:
1. Supabase Dashboard → SQL Editor → New Query
2. Copy and paste the SQL from the migration file
3. Execute the query

The migration creates:
- `trading_pre_registrations` table with fields: id, name, email, phone, country, status, created_at, updated_at
- Indexes for performance
- RLS policies for security
- Auto-update trigger for `updated_at`

## Features Implemented

### 1. Pre-Registration Form (`/pre-register-trading`)
- Lists 6 planned features of the trading platform
- Collects: name, email, phone, country
- Shows success message after registration
- Sends confirmation email

### 2. Admin Management (`/staff/pre-registrations`)
- View all pre-registrations with stats (Total, Pending, Converted)
- Table showing: Name, Email, Phone, Country, Status, Registration Date
- "Convert All & Notify" button to activate all pending registrations

### 3. Email Notifications
- **Pre-registration confirmation**: Sent immediately when someone pre-registers
- **Launch notification**: Sent when admin converts pre-registrations (notifies platform is live)

### 4. Updated Online Trading Button
- Now links to `/pre-register-trading` instead of being disabled
- Changed label from "(Coming Soon)" to "(Pre-Register)"

## API Endpoints

### Public
- `POST /api/trading/pre-register` - Submit pre-registration

### Admin (Protected)
- `GET /api/admin/trading/pre-registrations` - Get all pre-registrations
- `POST /api/admin/trading/convert-pre-registrations` - Convert all pending to members and send launch emails

## TypeScript Notes

The code uses type assertions (`as any`) for the `trading_pre_registrations` table because:
- The table needs to be created via migration first
- TypeScript types are generated from the database schema
- After migration, regenerate types and remove `as any` assertions

## Next Steps

1. **Run the database migration** in Supabase Dashboard
2. **Regenerate TypeScript types** using `npx supabase gen types typescript --project-id <your-project-id> > types/database.ts`
3. **Remove type assertions** (`as any`) from API routes after types are updated
4. **Test the pre-registration flow** on the public site
5. **Test the admin conversion** in the staff portal

## Admin Workflow

1. Admin views pre-registrations at `/staff/pre-registrations`
2. When platform is ready to launch:
   - Click "Convert All & Notify" button
   - All pending pre-registrations are marked as "converted"
   - Launch notification emails are sent to all converted users
   - Users can then access the trading platform

## Email Templates

Both emails use the branded email template with:
- KVT Jewellers branding
- Professional layout
- Clear call-to-action buttons
- Responsive design
