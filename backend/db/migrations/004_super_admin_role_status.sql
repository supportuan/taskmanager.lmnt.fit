-- Super Admin: role and account status on users.
-- Run manually: psql -d taskflow_db -f 004_super_admin_role_status.sql

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

UPDATE users
SET role = 'SUPER_ADMIN'
WHERE lower(trim(email)) IN (
    lower('sandeep@applyuninow.com'),
    lower('srihari@lmnt.fit'),
    lower('srinivastarun2002@gmail.com')
);
