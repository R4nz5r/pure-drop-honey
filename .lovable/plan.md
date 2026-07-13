There are actually **two separate problems** here — one is a real code gap, one is deployment. You'll need both fixed.

## Problem 1 (code): No "Add Variant" UI exists

The Variants tab in `src/pages/AdminDashboard.tsx` only renders existing variants with an **Edit** button — there is no "Add Variant" button anywhere. That's why you can't create a variant even though the backend supports it (`supabase/functions/admin-variants/index.ts` already handles `POST`).

There is also a hardcoded URL bug in `updateVariant` (line 183):
```ts
const url = `https://mfhbvojkmpuvkrwllrzg.supabase.co/functions/v1/admin-variants`;
```
This points to the **original** Supabase project, not yours. On your local install, edits also hit the wrong project. It must use `import.meta.env.VITE_SUPABASE_URL` like the other calls.

### Fix
In `src/pages/AdminDashboard.tsx`:
1. Replace the hardcoded URL on line 183 with `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-variants`.
2. Add a `createVariant(payload)` function that does a `POST` to the same endpoint (mirrors `updateVariant`).
3. Add an "Add Variant" button next to the refresh button in the Variants tab header (around line 650), which opens a `VariantCreateForm` (reuse the existing `VariantEditForm` shape: name, price, original_price, stock_qty, weight_order, is_active, image upload).
4. On submit, call `createVariant`, then `fetchVariants()` to refresh the list.

## Problem 2 (config on your new Supabase): edge functions and grants

Even after the UI is fixed, creating variants will fail on your local install unless the new Supabase project has:

1. **Edge functions deployed.** The Variants tab calls the `admin-variants` edge function. If you never ran `supabase functions deploy admin-variants admin-orders create-order get-order get-variants` against your new project, the fetch will 404. Deploy all five functions in `supabase/functions/`.
2. **`SUPABASE_SERVICE_ROLE_KEY` set as an edge-function secret** on your new project — the function needs it to bypass RLS for admin writes.
3. **`product_variants` table + GRANTs + `has_role` present.** These come from `supabase/migrations/`. If the SQL editor didn't run all migrations, `admin-variants` will error on insert. Verify with:
   ```sql
   select tablename from pg_tables where schemaname='public';
   select has_table_privilege('service_role','public.product_variants','INSERT');
   ```

## Technical details

- Files touched: only `src/pages/AdminDashboard.tsx`.
- New network call: `POST {VITE_SUPABASE_URL}/functions/v1/admin-variants` with JSON body `{ name, price, original_price, stock_qty, weight_order, is_active, image_url }` and headers `{ Authorization: Bearer <session token>, apikey: VITE_SUPABASE_PUBLISHABLE_KEY, Content-Type: application/json }`.
- The `variant-images` storage bucket already exists and is public; the create form uploads to it the same way `VariantEditForm` does, using the new variant id — so upload after insert (two-step: create → get id → upload → PATCH `image_url`), or upload with a temporary name and pass the URL in the initial POST. Two-step is simpler.
- No schema or RLS changes needed.

Ready to switch to build mode and implement Problem 1? Problem 2 stays on your side since it's on your local Supabase project.