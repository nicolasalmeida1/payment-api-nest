-- Remover defaults temporariamente
ALTER TABLE payment ALTER COLUMN payment_method DROP DEFAULT;
ALTER TABLE payment ALTER COLUMN status DROP DEFAULT;

-- Alterar as colunas para usar os enums corretos (snake_case)
ALTER TABLE payment 
  ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method;

ALTER TABLE payment 
  ALTER COLUMN status TYPE payment_status USING status::text::payment_status;

-- Recriar o default para status
ALTER TABLE payment ALTER COLUMN status SET DEFAULT 'PENDING'::payment_status;

-- Dropar os enums antigos (se não estiverem em uso)
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
