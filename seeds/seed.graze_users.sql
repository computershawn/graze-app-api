BEGIN;

TRUNCATE
  graze_users,
  RESTART IDENTITY CASCADE;

  INSERT INTO graze_users (user_name, password)
VALUES
  ('admin', 'password'),
  ('shawnj', 'bKre8iv');

COMMIT;