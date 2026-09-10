-- ============================================================
-- AAMS - Ambarrukmo Asset Management System
-- Seed Data
-- ============================================================
-- NOTE: Run this AFTER creating your first super_admin user
-- in Supabase Auth dashboard, then update the UUID below.
-- ============================================================

-- ============================================================
-- 1. BUSINESS UNITS
-- ============================================================
INSERT INTO public.business_units (id, name, type, address) VALUES
  ('bu-hotel-00000000-0000-0000-0000-000000000001', 'Royal Ambarrukmo Yogyakarta', 'hotel', 'Jl. Laksda Adisucipto No.81, Ambarrukmo, Sleman, Yogyakarta 55281'),
  ('bu-mall-000000000-0000-0000-0000-000000000002', 'Plaza Ambarrukmo Mall', 'mall', 'Jl. Laksda Adisucipto No.108, Depok, Sleman, Yogyakarta 55281'),
  ('bu-prop-00000000-0000-0000-0000-000000000003', 'Ambarrukmo Property & Corporate', 'property', 'Jl. Laksda Adisucipto No.108, Yogyakarta 55281');

-- ============================================================
-- 2. LOCATIONS (Hotel)
-- ============================================================
INSERT INTO public.locations (id, business_unit_id, parent_id, name, level) VALUES
  -- Site level
  ('loc-h-site-000000-0000-0000-0000-000000000001', 'bu-hotel-00000000-0000-0000-0000-000000000001', NULL, 'Royal Ambarrukmo Yogyakarta – Site', 'site'),
  -- Building level
  ('loc-h-bld-000000-0000-0000-0000-000000000002', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-site-000000-0000-0000-0000-000000000001', 'Gedung Utama', 'building'),
  ('loc-h-bld-000000-0000-0000-0000-000000000003', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-site-000000-0000-0000-0000-000000000001', 'Gedung Convention', 'building'),
  -- Floor level
  ('loc-h-fl-0000000-0000-0000-0000-000000000004', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-bld-000000-0000-0000-0000-000000000002', 'Lantai Lobby (G)', 'floor'),
  ('loc-h-fl-0000000-0000-0000-0000-000000000005', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-bld-000000-0000-0000-0000-000000000002', 'Lantai 1', 'floor'),
  ('loc-h-fl-0000000-0000-0000-0000-000000000006', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-bld-000000-0000-0000-0000-000000000002', 'Lantai 2', 'floor'),
  -- Room/Zone level
  ('loc-h-rm-0000000-0000-0000-0000-000000000007', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-fl-0000000-0000-0000-0000-000000000004', 'Front Office & Resepsionis', 'room'),
  ('loc-h-rm-0000000-0000-0000-0000-000000000008', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-fl-0000000-0000-0000-0000-000000000004', 'Restoran Candi Bentar', 'room'),
  ('loc-h-rm-0000000-0000-0000-0000-000000000009', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-fl-0000000-0000-0000-0000-000000000005', 'Ruang Kamar 101–120', 'zone'),
  ('loc-h-rm-0000000-0000-0000-0000-00000000000a', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-fl-0000000-0000-0000-0000-000000000006', 'Fitness Center & Spa', 'room');

-- ============================================================
-- 2. LOCATIONS (Mall)
-- ============================================================
INSERT INTO public.locations (id, business_unit_id, parent_id, name, level) VALUES
  ('loc-m-site-000000-0000-0000-0000-000000000011', 'bu-mall-000000000-0000-0000-0000-000000000002', NULL, 'Plaza Ambarrukmo – Site', 'site'),
  ('loc-m-bld-000000-0000-0000-0000-000000000012', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-site-000000-0000-0000-0000-000000000011', 'Gedung Mall Utama', 'building'),
  ('loc-m-fl-0000000-0000-0000-0000-000000000013', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-bld-000000-0000-0000-0000-000000000012', 'Ground Floor (GF)', 'floor'),
  ('loc-m-fl-0000000-0000-0000-0000-000000000014', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-bld-000000-0000-0000-0000-000000000012', 'Upper Ground (UG)', 'floor'),
  ('loc-m-fl-0000000-0000-0000-0000-000000000015', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-bld-000000-0000-0000-0000-000000000012', 'Lantai 1', 'floor'),
  ('loc-m-rm-0000000-0000-0000-0000-000000000016', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-fl-0000000-0000-0000-0000-000000000013', 'Area Foodcourt', 'zone'),
  ('loc-m-rm-0000000-0000-0000-0000-000000000017', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-fl-0000000-0000-0000-0000-000000000013', 'Customer Service & Manajemen', 'room'),
  ('loc-m-rm-0000000-0000-0000-0000-000000000018', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-fl-0000000-0000-0000-0000-000000000015', 'Area Hiburan & Bioskop', 'zone');

-- ============================================================
-- 2. LOCATIONS (Property)
-- ============================================================
INSERT INTO public.locations (id, business_unit_id, parent_id, name, level) VALUES
  ('loc-p-site-000000-0000-0000-0000-000000000021', 'bu-prop-00000000-0000-0000-0000-000000000003', NULL, 'Ambarrukmo Property – Site', 'site'),
  ('loc-p-bld-000000-0000-0000-0000-000000000022', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-site-000000-0000-0000-0000-000000000021', 'Tower A – Kondotel', 'building'),
  ('loc-p-bld-000000-0000-0000-0000-000000000023', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-site-000000-0000-0000-0000-000000000021', 'Kantor Pengelola & Marketing', 'building'),
  ('loc-p-fl-0000000-0000-0000-0000-000000000024', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-bld-000000-0000-0000-0000-000000000022', 'Lobby & Amenities (G)', 'floor'),
  ('loc-p-fl-0000000-0000-0000-0000-000000000025', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-bld-000000-0000-0000-0000-000000000022', 'Lantai 3–10 Unit Kondotel', 'floor'),
  ('loc-p-rm-0000000-0000-0000-0000-000000000026', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-fl-0000000-0000-0000-0000-000000000025', 'Unit 301–310', 'zone');

-- ============================================================
-- 3. ASSET CATEGORIES
-- ============================================================
INSERT INTO public.asset_categories (id, name, default_useful_life_months, default_depreciation_method) VALUES
  ('cat-001-00000000-0000-0000-0000-000000000001', 'Furniture & Fixture', 120, 'straight_line'),
  ('cat-002-00000000-0000-0000-0000-000000000002', 'Elektronik & AV', 60, 'declining_balance'),
  ('cat-003-00000000-0000-0000-0000-000000000003', 'Kendaraan Operasional', 60, 'straight_line'),
  ('cat-004-00000000-0000-0000-0000-000000000004', 'Peralatan Dapur & F&B', 84, 'straight_line'),
  ('cat-005-00000000-0000-0000-0000-000000000005', 'IT Equipment & Komputer', 48, 'declining_balance'),
  ('cat-006-00000000-0000-0000-0000-000000000006', 'Mesin & Peralatan HVAC', 120, 'straight_line'),
  ('cat-007-00000000-0000-0000-0000-000000000007', 'Peralatan Housekeeping', 60, 'straight_line'),
  ('cat-008-00000000-0000-0000-0000-000000000008', 'Peralatan Keamanan & CCTV', 60, 'declining_balance'),
  ('cat-009-00000000-0000-0000-0000-000000000009', 'Peralatan Fitness & Olahraga', 84, 'straight_line'),
  ('cat-010-00000000-0000-0000-0000-000000000010', 'Signage & Display Retail', 48, 'straight_line');

-- ============================================================
-- 4. DUMMY ASSETS (25 assets)
-- ============================================================
-- NOTE: asset_code will be auto-generated by trigger, we set it empty
-- We explicitly set qr_code_uuid for predictable seed data

-- Hotel Assets (10)
INSERT INTO public.assets (id, name, description, category_id, business_unit_id, current_location_id, purchase_date, purchase_price, useful_life_months, depreciation_method, current_book_value, condition, status, qr_code_uuid) VALUES
  (gen_random_uuid(), 'Sofa Lounge Lobby Premium', 'Sofa 3-seater kulit sintetis warna coklat tua, merk Ligna', 'cat-001-00000000-0000-0000-0000-000000000001', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-rm-0000000-0000-0000-0000-000000000007', '2022-03-15', 18500000, 120, 'straight_line', 15391667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'TV LED 65" Samsung Smart TV', 'Samsung QA65Q80C, terpasang di ruang tunggu lobby', 'cat-002-00000000-0000-0000-0000-000000000002', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-rm-0000000-0000-0000-0000-000000000007', '2022-06-01', 12000000, 60, 'declining_balance', 7680000, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Mesin Cuci Industri Electrolux WE165P', 'Kapasitas 16kg, laundry operasional hotel', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-fl-0000000-0000-0000-0000-000000000004', '2021-08-20', 85000000, 120, 'straight_line', 72291667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Laptop Dell Latitude 5540', 'Intel i7 Gen 13, RAM 16GB, SSD 512GB, untuk Front Desk Manager', 'cat-005-00000000-0000-0000-0000-000000000005', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-rm-0000000-0000-0000-0000-000000000007', '2023-01-10', 22000000, 48, 'declining_balance', 16843750, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Meja Makan Restoran Set (4 kursi)', 'Set meja makan kayu jati finishing natural, merk Kampoeng Furniture', 'cat-001-00000000-0000-0000-0000-000000000001', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-rm-0000000-0000-0000-0000-000000000008', '2021-05-01', 9500000, 120, 'straight_line', 8316667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Treadmill Commercial LifeFitness T5', 'Treadmill lipat komersial, max 20km/h, untuk fitness center', 'cat-009-00000000-0000-0000-0000-000000000009', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-rm-0000000-0000-0000-0000-00000000000a', '2022-09-01', 55000000, 84, 'straight_line', 47321429, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'CCTV System Dahua 32CH NVR', 'NVR 32 channel + 24 IP Camera 4MP, area lobby dan parkir', 'cat-008-00000000-0000-0000-0000-000000000008', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-bld-000000-0000-0000-0000-000000000002', '2021-11-15', 65000000, 60, 'declining_balance', 40960000, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Vacuum Cleaner Nilfisk GD930 S2', 'Vacuum industri 30L, untuk housekeeping lantai 1', 'cat-007-00000000-0000-0000-0000-000000000007', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-fl-0000000-0000-0000-0000-000000000005', '2022-04-01', 8500000, 60, 'straight_line', 7233333, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Kendaraan Operasional Toyota Avanza', 'Plat AB 1234 XY, tahun 2021, untuk antar jemput tamu VIP', 'cat-003-00000000-0000-0000-0000-000000000003', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-site-000000-0000-0000-0000-000000000001', '2021-07-01', 220000000, 60, 'straight_line', 183333333, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Mesin Espresso La Marzocca Linea', 'Mesin kopi profesional 2-group, untuk Coffee Corner lobby', 'cat-004-00000000-0000-0000-0000-000000000004', 'bu-hotel-00000000-0000-0000-0000-000000000001', 'loc-h-rm-0000000-0000-0000-0000-000000000008', '2022-02-14', 135000000, 84, 'straight_line', 118392857, 'good', 'active', gen_random_uuid());

-- Mall Assets (8)
INSERT INTO public.assets (id, name, description, category_id, business_unit_id, current_location_id, purchase_date, purchase_price, useful_life_months, depreciation_method, current_book_value, condition, status, qr_code_uuid) VALUES
  (gen_random_uuid(), 'Digital Signage 75" Outdoor Samsung OH75B', 'Display outdoor waterproof, terpasang di main entrance mall', 'cat-010-00000000-0000-0000-0000-000000000010', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-fl-0000000-0000-0000-0000-000000000013', '2022-08-01', 98000000, 48, 'straight_line', 67083333, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Eskalator KONE EcoMod 3000', 'Eskalator kapasitas 6500 persons/hour, GF ke UG', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-bld-000000-0000-0000-0000-000000000012', '2020-01-01', 850000000, 120, 'straight_line', 736250000, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Server Dell PowerEdge R740', 'Server utama untuk POS & tenant billing system mall', 'cat-005-00000000-0000-0000-0000-000000000005', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-rm-0000000-0000-0000-0000-000000000017', '2021-06-15', 185000000, 48, 'declining_balance', 87890625, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'AC Split Daikin 5PK FTKQ Series', 'AC untuk ruang Customer Service, energi efisien inverter', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-rm-0000000-0000-0000-0000-000000000017', '2022-03-01', 28000000, 120, 'straight_line', 24266667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Meja Kursi Foodcourt Set A (25 set)', 'Set meja+2 kursi stainless & HPL, untuk area foodcourt GF', 'cat-001-00000000-0000-0000-0000-000000000001', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-rm-0000000-0000-0000-0000-000000000016', '2020-06-01', 75000000, 120, 'straight_line', 61875000, 'fair', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'CCTV IP Camera Axis Q6135-LE (outdoor)', 'PTZ IP Camera 32x zoom, untuk area parkir basement', 'cat-008-00000000-0000-0000-0000-000000000008', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-site-000000-0000-0000-0000-000000000011', '2022-01-10', 45000000, 60, 'declining_balance', 30000000, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Generator Caterpillar C15 1000kVA', 'Genset backup daya utama mall, auto-start', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-bld-000000-0000-0000-0000-000000000012', '2019-09-01', 1250000000, 120, 'straight_line', 1031250000, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Mesin Antrian Digital Qmatic', 'Sistem antrian elektronik dengan display monitor, CS area', 'cat-005-00000000-0000-0000-0000-000000000005', 'bu-mall-000000000-0000-0000-0000-000000000002', 'loc-m-rm-0000000-0000-0000-0000-000000000017', '2023-03-01', 35000000, 48, 'straight_line', 31979167, 'good', 'active', gen_random_uuid());

-- Property Assets (7)
INSERT INTO public.assets (id, name, description, category_id, business_unit_id, current_location_id, purchase_date, purchase_price, useful_life_months, depreciation_method, current_book_value, condition, status, qr_code_uuid) VALUES
  (gen_random_uuid(), 'Lift Penumpang Schindler 3300 AP', 'Lift kapasitas 8 orang 630kg, Tower A, 10 lantai', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-bld-000000-0000-0000-0000-000000000022', '2020-03-15', 650000000, 120, 'straight_line', 552916667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Water Heater Central Rheem 300L', 'Pemanas air terpusat untuk Tower A lantai 3-10', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-fl-0000000-0000-0000-0000-000000000024', '2020-03-15', 85000000, 120, 'straight_line', 72291667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Furniture Unit Kondotel 301 – Full Set', 'Set lengkap: tempat tidur queen, wardrobe, meja kerja, kursi, TV', 'cat-001-00000000-0000-0000-0000-000000000001', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-rm-0000000-0000-0000-0000-000000000026', '2021-01-01', 95000000, 120, 'straight_line', 81583333, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Laptop Lenovo ThinkPad L14 Gen 4', 'Untuk staf marketing kantor pengelola, i5/8GB/256GB', 'cat-005-00000000-0000-0000-0000-000000000005', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-bld-000000-0000-0000-0000-000000000023', '2023-06-01', 14500000, 48, 'declining_balance', 13203125, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Printer Multifungsi Canon imageRUNNER C3226i', 'Printer A3 warna laser, untuk kantor pengelola', 'cat-005-00000000-0000-0000-0000-000000000005', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-bld-000000-0000-0000-0000-000000000023', '2022-11-01', 38500000, 48, 'declining_balance', 28875000, 'fair', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'Pompa Air Grundfos CR 3-17', 'Pompa sirkulasi air bersih Tower A, kapasitas 18 m³/jam', 'cat-006-00000000-0000-0000-0000-000000000006', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-fl-0000000-0000-0000-0000-000000000024', '2020-03-15', 35000000, 120, 'straight_line', 29791667, 'good', 'active', gen_random_uuid()),
  (gen_random_uuid(), 'TV LED 43" Samsung Smart TV Unit Kondotel', 'Samsung UA43CU7700KXXD, terpasang di tiap unit kondotel (sample unit 302)', 'cat-002-00000000-0000-0000-0000-000000000002', 'bu-prop-00000000-0000-0000-0000-000000000003', 'loc-p-rm-0000000-0000-0000-0000-000000000026', '2021-01-01', 8500000, 60, 'declining_balance', 5440000, 'good', 'active', gen_random_uuid());

-- ============================================================
-- 5. DEFAULT APPROVAL WORKFLOWS
-- ============================================================
INSERT INTO public.approval_workflows (action_type, min_value_threshold, required_role) VALUES
  ('disposal_sale', 50000000, 'corporate_admin'),
  ('disposal_sale', 500000000, 'super_admin'),
  ('disposal_auction', 0, 'corporate_admin'),
  ('disposal_donation', 0, 'unit_admin'),
  ('disposal_transfer', 0, 'unit_admin'),
  ('disposal_writeoff', 10000000, 'corporate_admin'),
  ('high_value_purchase', 100000000, 'corporate_admin'),
  ('high_value_purchase', 1000000000, 'super_admin');
