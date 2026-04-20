# Supabase Storage Setup: Volunteers CVs

The Volunteer CV upload is currently failing because the required storage bucket is missing in your Supabase project. Please follow these steps to set it up:

## 1. Create the Bucket
1. Go to your **Supabase Dashboard**.
2. Navigate to **Storage** (the bucket icon in the left sidebar).
3. Click **New Bucket**.
4. Name the bucket exactly: `volunteers-cvs`
5. Toggle **Public bucket** to ON (so CVs can be viewed by Admins).
6. Click **Save**.

## 2. Configure RLS Policies
To allow volunteers to upload their CVs and Admins to view them, you need to add policies:

1. Click on the `volunteers-cvs` bucket.
2. Go to the **Policies** tab.
3. Add a **Select** policy:
   - Name: `Allow public read access`
   - Allowed operations: `SELECT`
   - Target roles: `anon` (or `public`)
   - Policy definition: `true`
4. Add an **Insert** policy:
   - Name: `Allow anonymous uploads`
   - Allowed operations: `INSERT`
   - Target roles: `anon`
   - Policy definition: `true`

> [!NOTE]
> Since we use anonymous logins, we allow `anon` roles for these operations. The application logic ensures that CVs are only accessed via the Admin portal.
