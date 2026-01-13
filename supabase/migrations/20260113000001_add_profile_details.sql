alter table profiles
add column if not exists address text,
add column if not exists mobile_no text,
add column if not exists emergency_contact_no text;
