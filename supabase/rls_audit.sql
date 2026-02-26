-- ═══════════════════════════════════════════════════════════════════════════
-- TaxFlowAI — Supabase RLS Audit & Policy Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1 — Verify current bucket configuration
-- Expected: public = false (PRIVATE bucket)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT name, public, allowed_mime_types, file_size_limit
FROM storage.buckets
WHERE name = 'tax-documents';

-- If "public" = true → run STEP 2 immediately to lock it down.
-- If "public" = false → good, continue to STEP 3.


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2 — Make bucket PRIVATE (run only if public = true above)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE storage.buckets
SET public = false
WHERE name = 'tax-documents';

-- Also enforce file type + size limits at the bucket level
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif'
  ],
  file_size_limit = 10485760  -- 10 MB in bytes
WHERE name = 'tax-documents';


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3 — Enable RLS on storage.objects (required for policies to take effect)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4 — Drop existing policies (clean slate)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "service_role_full_access"    ON storage.objects;
DROP POLICY IF EXISTS "deny_all_anon"               ON storage.objects;


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5 — Storage RLS policies
--
-- Architecture note: The backend uses SUPABASE_SERVICE_KEY which automatically
-- bypasses RLS (service_role has superuser-equivalent access).
-- These policies protect the bucket from:
--   • Direct Supabase client calls with anon key
--   • Any future accidental public exposure
--
-- Rule: DENY everything to anon + authenticated roles (all access goes through backend)
-- ─────────────────────────────────────────────────────────────────────────────

-- Allow service_role unrestricted access (backend uses this)
CREATE POLICY "service_role_full_access"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'tax-documents')
  WITH CHECK (bucket_id = 'tax-documents');

-- Deny all anonymous access
CREATE POLICY "deny_all_anon"
  ON storage.objects
  FOR ALL
  TO anon
  USING (false);


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6 — Verify database table isolation
-- (Prisma uses DATABASE_URL which connects as postgres/service role — bypasses RLS)
-- This confirms our application-layer isolation is the correct approach.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('accountants', 'clients', 'tax_years', 'documents', 'validations', 'notification_logs')
ORDER BY tablename;

-- Expected: rls_enabled = false for all tables
-- Reason: Prisma connects as superuser (bypasses RLS anyway).
-- Application-layer isolation is enforced in every query via accountantId/clientId checks.


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 7 — Verify signed URL policy
-- Check that the bucket does NOT have any policies allowing direct object reads
-- without signed URLs (public read = false means signed URLs are required)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- Expected: Only "service_role_full_access" and "deny_all_anon" should appear.
-- If there are SELECT policies for "authenticated" or "anon" roles, review them.


-- ─────────────────────────────────────────────────────────────────────────────
-- SUMMARY — Security posture after running this script
-- ─────────────────────────────────────────────────────────────────────────────
-- ✅ Bucket is PRIVATE — public URLs return 403
-- ✅ Service role (backend) has full access — uploads/deletes/presign work
-- ✅ Anon role denied — direct Supabase client access blocked
-- ✅ File downloads require signed URLs (1-hour expiry) — already implemented
-- ✅ Presigned upload URLs are single-use, path-specific — already implemented
-- ✅ Application-layer isolation: every DB query filters by clientId/accountantId
-- ─────────────────────────────────────────────────────────────────────────────
