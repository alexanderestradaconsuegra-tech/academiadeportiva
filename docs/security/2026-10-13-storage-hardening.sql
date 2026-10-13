-- Metrikas — endurecimiento del almacenamiento (Supabase Storage)
-- Fecha: 2026-10-13
--
-- PENDIENTE DE APLICAR. Las demás migraciones de esta ronda ya están aplicadas;
-- esta toca el esquema `storage` y la herramienta automática pidió aprobación
-- manual. Pegar completo en: Supabase → SQL Editor → Run. Es idempotente.
--
-- Qué corrige:
--  1. Comprobantes de pago: cualquier miembro de la academia (un jugador, por
--     ejemplo) podía listar y descargar los comprobantes de TODAS las familias
--     usando la API de Storage. Ahora solo el coach, o el jugador dueño del pago.
--  2. Fotos: cualquier coach de cualquier academia podía pisar o borrar archivos
--     ajenos. Ahora solo los que subió él mismo.
--  3. Ningún bucket tenía límite de tamaño ni de tipo de archivo. Como las fotos
--     se sirven desde el mismo dominio de la app, un HTML o SVG subido como
--     "foto" podía ejecutarse como si fuera la aplicación.
--
-- Cómo verificar después de aplicar:
--   select policyname, cmd from pg_policies where schemaname='storage' and tablename='objects' order by 1;
--   select id, file_size_limit, allowed_mime_types from storage.buckets;
--
-- Cómo revertir: volver a crear las políticas originales:
--   "academy members read receipts"   (select, bucket payment-receipts, carpeta = academia)
--   "academy members upload receipts" (insert, mismo criterio)
--   "coach update photos" / "coach delete photos" (bucket photos, current_role() = 'coach')

-- 1) Comprobantes. Ruta: <academy_id>/<payment_id>/<archivo>
drop policy if exists "academy members read receipts" on storage.objects;
drop policy if exists "academy members upload receipts" on storage.objects;
drop policy if exists receipts_read_owner_or_coach on storage.objects;
drop policy if exists receipts_upload_owner_or_coach on storage.objects;

create policy receipts_read_owner_or_coach on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = ((select get_my_academy_id())::text)
    and (
      (select is_coach())
      or exists (
        select 1 from public.payments p
        where p.id::text = (storage.foldername(name))[2]
          and p.player_id = (select get_my_player_id())
      )
    )
  );

create policy receipts_upload_owner_or_coach on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = ((select get_my_academy_id())::text)
    and (
      (select is_coach())
      or exists (
        select 1 from public.payments p
        where p.id::text = (storage.foldername(name))[2]
          and p.player_id = (select get_my_player_id())
      )
    )
  );

-- 2) Fotos: solo el coach que subió el archivo puede modificarlo o borrarlo.
--    La app nunca actualiza ni borra fotos, así que nada legítimo cambia.
drop policy if exists "coach update photos" on storage.objects;
drop policy if exists "coach delete photos" on storage.objects;
drop policy if exists photos_update_own on storage.objects;
drop policy if exists photos_delete_own on storage.objects;

create policy photos_update_own on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (select "current_role"()) = 'coach' and owner_id = ((select auth.uid())::text))
  with check (bucket_id = 'photos' and (select "current_role"()) = 'coach' and owner_id = ((select auth.uid())::text));

create policy photos_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (select "current_role"()) = 'coach' and owner_id = ((select auth.uid())::text));

-- 3) Límites de tamaño y tipo. Los archivos que ya existen no se tocan.
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
where id = 'photos';

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','application/pdf']
where id = 'payment-receipts';
