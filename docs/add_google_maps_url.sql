-- Migration to add Google Maps URL to tasks
ALTER TABLE "public"."task_assignments" 
ADD COLUMN IF NOT EXISTS "google_maps_url" text;
