# What to set up on your Supabase project

The code side is done. For variant creation (and the rest of the admin panel) to actually work on your new Supabase project, you need these things in place on the backend. No code changes required.

## 1. Run all migrations

Apply everything in `supabase/migrations/` to your new project (SQL editor → paste each file in order, or use the Supabase CLI). This creates:

- `product_variants`, `orders`, `order_status_history`, `user_roles` tables
- `app_role` enum (`admin`, `moderator`) and `order_status` enum
- `has_role()` security-definer function
- RLS policies on all tables
- GRANTs to `authenticated` / `service_role` / `anon`
- Triggers: `generate_order_ref`, `reduce_stock_on_order`, `validate_order_price`, `insert_initial_status_history`, `update_updated_at_column`

Quick verification in SQL editor:
```sql
select tablename from pg_tables where schemaname='public';
-- expect: product_variants, orders, order_status_history, user_roles

select has_table_privilege('service_role','public.product_variants','INSERT');
-- expect: true
```

## 2. Deploy the 5 edge functions

From `supabase/functions/`, deploy all of them to your project:

```
supabase functions deploy admin-variants
supabase functions deploy admin-orders
supabase functions deploy create-order
supabase functions deploy get-order
supabase functions deploy get-variants
```

Without this, the "Add Variant" button will get a 404.

## 3. Set edge-function secrets

In Project Settings → Edge Functions → Secrets, make sure these exist:

- `SUPABASE_URL` (usually auto-set)
- `SUPABASE_ANON_KEY` (usually auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` — required so `admin-variants` and `admin-orders` can bypass RLS

## 4. Create the `variant-images` storage bucket

Storage → New bucket:
- Name: `variant-images`
- Public: **yes**

Add a policy allowing authenticated users to upload/update/delete objects in this bucket (admin uploads variant photos from the admin panel).

## 5. Make yourself an admin (if you haven't already)

After signing up your user in Auth → Users:
```sql
insert into public.user_roles (user_id, role)
values ('<your-auth-user-uuid>', 'admin');
```

## 6. Auth URL config (for reset password on localhost)

Auth → URL Configuration:
- Site URL: `http://localhost:8080`
- Redirect URLs: add `http://localhost:8080/**` (and your production URL if any)

---

After these six steps: reload the admin panel → Variants tab → click **Add Variant** → the new row should insert and appear in the list.
