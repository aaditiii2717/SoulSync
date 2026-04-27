# Supabase Storage Setup: Volunteers CVs

The volunteer CV flow now depends on the migration
`supabase/migrations/20260425_secure_volunteer_cvs_and_admin_governance.sql`.

## Expected Architecture
1. The storage bucket name is `volunteers-cvs`.
2. The bucket should be **private**.
3. Volunteer CV uploads happen through the app's server-side function using the Supabase service role.
4. Admins open CVs through short-lived signed URLs generated on the server.
5. Volunteer records store a canonical `cv_storage_path` so the admin panel no longer has to reconstruct paths from public URLs.

## Required Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Setup Steps
1. Run the latest Supabase migrations.
2. Confirm the private `volunteers-cvs` bucket exists.
3. Do not add public read or anonymous upload policies for volunteer CVs unless you intentionally want to bypass the new secured flow.

## If Your Project Drifted
If someone changed the bucket manually in the dashboard, bring it back to:
- Bucket: `volunteers-cvs`
- Visibility: `private`
- Access pattern: server-managed uploads and server-generated signed URLs only
