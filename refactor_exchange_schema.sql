-- STRICT REFACTOR SCHEMA FOR EXCHANGE MODULE (Refined)

-- 1. Create Normalized Tables

-- Currencies Table
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- USD, EUR
    name TEXT NOT NULL, -- US Dollar
    symbol TEXT, -- $
    is_active BOOLEAN DEFAULT true,
    buy_min NUMERIC, -- Min price admin buys at
    buy_max NUMERIC,
    sell_min NUMERIC, -- Min price admin sells at
    sell_max NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wilayas Table (Algeria)
CREATE TABLE IF NOT EXISTS wilayas (
    id INTEGER PRIMARY KEY, -- Official Code 1-58
    code TEXT NOT NULL UNIQUE, -- '01', '02'...
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Payment Methods Table (Global)
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Currency <-> Payment Method Junction (Many-to-Many)
CREATE TABLE IF NOT EXISTS currency_payment_methods (
    currency_id INTEGER REFERENCES currencies(id) ON DELETE CASCADE,
    -- Dual Payment Methods
    payment_method_from_id BIGINT REFERENCES public.payment_methods(id),
    payment_method_to_id BIGINT REFERENCES public.payment_methods(id),
    
    -- Request details
    amount DECIMAL(18, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (currency_id, payment_method_from_id, payment_method_to_id)
);

-- 2. Seed Data

-- Seed Currencies
INSERT INTO currencies (code, name, symbol) VALUES 
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('CAD', 'Canadian Dollar', 'C$'),
('USDT', 'Tether', '₮'),
('DZD', 'Algerian Dinar', 'DA'),
('TRX', 'Tron', 'TRX'),
('RUB', 'Russian Ruble', '₽'),
('CHF', 'Swiss Franc', 'Fr')
ON CONFLICT (code) DO NOTHING;

-- Seed Payment Methods
INSERT INTO payment_methods (name) VALUES 
('Hand to Hand'),
('BaridiMob'),
('CCP'),
('Wise'),
('Paysera'),
('PayPal'),
('USDT Transfer'),
('Bank Transfer'),
('Revolut'),
('Payoneer'),
('Skrill'),
('Neteller'),
('AdvCash'),
('Perfect Money'),
('Payeer'),
('Western Union'),
('MoneyGram')
ON CONFLICT (name) DO NOTHING;

-- Seed Wilayas (Full 58)
INSERT INTO wilayas (id, code, name_ar, name_fr, name_en) VALUES
(1, '01', 'أدرار', 'Adrar', 'Adrar'),
(2, '02', 'الشلف', 'Chlef', 'Chlef'),
(3, '03', 'الأغواط', 'Laghouat', 'Laghouat'),
(4, '04', 'أم البواقي', 'Oum El Bouaghi', 'Oum El Bouaghi'),
(5, '05', 'باتنة', 'Batna', 'Batna'),
(6, '06', 'بجاية', 'Béjaïa', 'Bejaia'),
(7, '07', 'بسكرة', 'Biskra', 'Biskra'),
(8, '08', 'بشار', 'Béchar', 'Bechar'),
(9, '09', 'البليدة', 'Blida', 'Blida'),
(10, '10', 'البويرة', 'Bouira', 'Bouira'),
(11, '11', 'تمنراست', 'Tamanrasset', 'Tamanrasset'),
(12, '12', 'تبسة', 'Tébessa', 'Tebessa'),
(13, '13', 'تلمسان', 'Tlemcen', 'Tlemcen'),
(14, '14', 'تيارت', 'Tiaret', 'Tiaret'),
(15, '15', 'تيزي وزو', 'Tizi Ouzou', 'Tizi Ouzou'),
(16, '16', 'الجزائر', 'Alger', 'Algiers'),
(17, '17', 'الجلفة', 'Djelfa', 'Djelfa'),
(18, '18', 'جيجل', 'Jijel', 'Jijel'),
(19, '19', 'سطيف', 'Sétif', 'Setif'),
(20, '20', 'سعيدة', 'Saïda', 'Saida'),
(21, '21', 'سكيكدة', 'Skikda', 'Skikda'),
(22, '22', 'سيدي بلعباس', 'Sidi Bel Abbès', 'Sidi Bel Abbes'),
(23, '23', 'عنابة', 'Annaba', 'Annaba'),
(24, '24', 'قالمة', 'Guelma', 'Guelma'),
(25, '25', 'قسنطينة', 'Constantine', 'Constantine'),
(26, '26', 'المدية', 'Médéa', 'Medea'),
(27, '27', 'مستغانم', 'Mostaganem', 'Mostaganem'),
(28, '28', 'المسيلة', 'M''Sila', 'M''Sila'),
(29, '29', 'معسكر', 'Mascara', 'Mascara'),
(30, '30', 'ورقلة', 'Ouargla', 'Ouargla'),
(31, '31', 'وهران', 'Oran', 'Oran'),
(32, '32', 'البيض', 'El Bayadh', 'El Bayadh'),
(33, '33', 'إليزي', 'Illizi', 'Illizi'),
(34, '34', 'برج بوعريريج', 'Bordj Bou Arréridj', 'Bordj Bou Arreridj'),
(35, '35', 'بومرداس', 'Boumerdès', 'Boumerdes'),
(36, '36', 'الطارف', 'El Tarf', 'El Tarf'),
(37, '37', 'تندوف', 'Tindouf', 'Tindouf'),
(38, '38', 'تيسمسيلت', 'Tissemsilt', 'Tissemsilt'),
(39, '39', 'الوادي', 'El Oued', 'El Oued'),
(40, '40', 'خنشلة', 'Khenchela', 'Khenchela'),
(41, '41', 'سوق أهراس', 'Souk Ahras', 'Souk Ahras'),
(42, '42', 'تيبازة', 'Tipaza', 'Tipaza'),
(43, '43', 'ميلة', 'Mila', 'Mila'),
(44, '44', 'عين الدفلى', 'Aïn Defla', 'Ain Defla'),
(45, '45', 'النعامة', 'Naâma', 'Naama'),
(46, '46', 'عين تموشنت', 'Aïn Témouchent', 'Ain Temouchent'),
(47, '47', 'غرداية', 'Ghardaïa', 'Ghardaia'),
(48, '48', 'غليزان', 'Relizane', 'Relizane'),
(49, '49', 'تيميمون', 'Timimoun', 'Timimoun'),
(50, '50', 'برج باجي مختار', 'Bordj Badji Mokhtar', 'Bordj Badji Mokhtar'),
(51, '51', 'أولاد جلال', 'Ouled Djellal', 'Ouled Djellal'),
(52, '52', 'بني عباس', 'Béni Abbès', 'Beni Abbes'),
(53, '53', 'عين صالح', 'In Salah', 'In Salah'),
(54, '54', 'عين قزام', 'In Guezzam', 'In Guezzam'),
(55, '55', 'توقرت', 'Touggourt', 'Touggourt'),
(56, '56', 'جانت', 'Djanet', 'Djanet'),
(57, '57', 'المغير', 'El M''Ghair', 'El M''Ghair'),
(58, '58', 'المنيعة', 'El Meniaa', 'El Meniaa')
ON CONFLICT (id) DO UPDATE SET 
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en;

-- 3. Refactor Exchange Requests
-- Update schema to fit new requirements: 
-- - separate contact columns
-- - date specific timeframe

ALTER TABLE exchange_requests 
ADD COLUMN IF NOT EXISTS currency_from_id INTEGER REFERENCES currencies(id),
ADD COLUMN IF NOT EXISTS currency_to_id INTEGER REFERENCES currencies(id),
ADD COLUMN IF NOT EXISTS wilaya_id INTEGER REFERENCES wilayas(id),
-- DUAL PAYMENT METHODS
ADD COLUMN IF NOT EXISTS payment_method_from_id BIGINT REFERENCES payment_methods(id),
ADD COLUMN IF NOT EXISTS payment_method_to_id BIGINT REFERENCES payment_methods(id),

-- New Contact Fields
ADD COLUMN IF NOT EXISTS email TEXT, -- Mandatory
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT,

-- Timeframe as specific date
ADD COLUMN IF NOT EXISTS needed_by TIMESTAMP WITH TIME ZONE;

-- Make old columns nullable to allow transition to ID-based system
ALTER TABLE exchange_requests ALTER COLUMN currency_from DROP NOT NULL;
ALTER TABLE exchange_requests ALTER COLUMN currency_to DROP NOT NULL;
ALTER TABLE exchange_requests ALTER COLUMN payment_method_id DROP NOT NULL;
ALTER TABLE exchange_requests ALTER COLUMN rate DROP NOT NULL;

-- 4. Refactor Exchange Rates
ALTER TABLE exchange_rates
ADD COLUMN IF NOT EXISTS currency_from_id INTEGER REFERENCES currencies(id),
ADD COLUMN IF NOT EXISTS currency_to_id INTEGER REFERENCES currencies(id);

COMMENT ON COLUMN exchange_requests.needed_by IS 'Custom date/time when exchange is needed';
COMMENT ON COLUMN exchange_requests.phone_number IS 'Obligatory phone number';
