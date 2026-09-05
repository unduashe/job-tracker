SET local check_function_bodies = off;

CREATE TABLE "public"."applications" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "company"     text                     NOT NULL,
  "role"        text,
  "description" text,
  "created_at"  timestamp with time zone DEFAULT now(),
  "updated_at"  timestamp with time zone DEFAULT now(),
  CONSTRAINT "applications_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."applications"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."notes" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "application_id" uuid                     NOT NULL,
  "subject"        text,
  "content"        text                     NOT NULL,
  "created_at"     timestamp with time zone DEFAULT now(),
  "updated_at"     timestamp with time zone DEFAULT now(),
  CONSTRAINT "notes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."notes"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."application_status" AS ENUM (
  'applied',
  'interview',
  'offer',
  'rejected',
  'archived'
);

ALTER TABLE "public"."applications"
  ADD COLUMN "status" public.application_status NOT NULL DEFAULT 'applied'::public.application_status;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

ALTER TABLE "public"."applications"
  ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."notes"
  ADD CONSTRAINT "notes_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;

CREATE INDEX applications_status_idx ON public.applications USING btree (status);

CREATE INDEX applications_user_id_idx ON public.applications USING btree (user_id);

CREATE INDEX notes_application_id_idx ON public.notes USING btree (application_id);

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can delete their applications" ON "public"."applications"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their applications" ON "public"."applications"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their applications" ON "public"."applications"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their applications" ON "public"."applications"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can manage their notes" ON "public"."notes"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.applications
  WHERE ((applications.id = notes.application_id) AND (applications.user_id = auth.uid())))));

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."applications" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."notes" TO "anon", "authenticated", "postgres", "service_role";

GRANT USAGE ON TYPE "public"."application_status" TO "postgres";

