-- Tabel customer
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text NOT NULL,
  kode text NOT NULL UNIQUE,
  alamat text NOT NULL DEFAULT '',
  no_hp text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabel order/pesanan
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  nama_produk text NOT NULL,
  jumlah integer NOT NULL DEFAULT 1,
  satuan text NOT NULL DEFAULT 'Pcs',
  harga integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Belum Lunas' CHECK (status IN ('Lunas', 'DP', 'Belum Lunas')),
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grant akses Data API
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies: user hanya bisa akses data miliknya sendiri
CREATE POLICY "Users can manage own customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());