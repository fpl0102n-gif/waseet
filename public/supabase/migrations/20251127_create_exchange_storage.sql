-- Create storage bucket for exchange attachments
-- This needs to be run manually in Supabase Dashboard > Storage

-- Create the bucket (run in SQL editor or use Storage UI)
insert into storage.buckets (id, name, public)
values ('exchange-attachments', 'exchange-attachments', true);

-- Set up storage policies for exchange-attachments bucket

-- Allow authenticated users and anonymous to upload
create policy "Allow authenticated upload to exchange-attachments"
on storage.objects for insert
with check (
  bucket_id = 'exchange-attachments'
);

-- Allow public read access to attachments
create policy "Allow public read from exchange-attachments"
on storage.objects for select
using (bucket_id = 'exchange-attachments');

-- Allow users to delete their own uploads (optional)
create policy "Allow users to delete their own exchange attachments"
on storage.objects for delete
using (
  bucket_id = 'exchange-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);
