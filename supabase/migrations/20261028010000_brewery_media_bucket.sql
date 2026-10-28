-- Public bucket for brewery photos and logos (replaces public/photos and public/logos).
-- Public buckets serve files at /storage/v1/object/public/brewery-media/... without a read
-- policy; uploads use the service-role key, which bypasses RLS. Safe to re-run.
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('brewery-media', 'brewery-media', true, ARRAY['image/webp'], 5242880)
ON CONFLICT (id) DO NOTHING;
