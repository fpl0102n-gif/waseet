-- 1. Create Wilayas Table
CREATE TABLE IF NOT EXISTS wilayas (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    name_en TEXT NOT NULL
);

ALTER TABLE wilayas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read wilayas" ON wilayas FOR SELECT USING (true);

-- Seed Data (Truncated for brevity, normally 58)
INSERT INTO wilayas (code, name_ar, name_fr, name_en) VALUES
('01', 'أدرار', 'Adrar', 'Adrar'),
('02', 'الشلف', 'Chlef', 'Chlef'),
('03', 'الأغواط', 'Laghouat', 'Laghouat'),
('04', 'أم البواقي', 'Oum El Bouaghi', 'Oum El Bouaghi'),
('05', 'باتنة', 'Batna', 'Batna'),
('06', 'بجاية', 'Béjaïa', 'Bejaia'),
('07', 'بسكرة', 'Biskra', 'Biskra'),
('08', 'بشار', 'Béchar', 'Bechar'),
('09', 'البليدة', 'Blida', 'Blida'),
('10', 'البويرة', 'Bouira', 'Bouira'),
('11', 'تمنراست', 'Tamanrasset', 'Tamanrasset'),
('12', 'تبسة', 'Tébessa', 'Tebessa'),
('13', 'تلمسان', 'Tlemcen', 'Tlemcen'),
('14', 'تيارت', 'Tiaret', 'Tiaret'),
('15', 'تيزي وزو', 'Tizi Ouzou', 'Tizi Ouzou'),
('16', 'الجزائر', 'Alger', 'Algiers'),
('17', 'الجلفة', 'Djelfa', 'Djelfa'),
('18', 'جيجل', 'Jijel', 'Jijel'),
('19', 'سطيف', 'Sétif', 'Setif'),
('20', 'سعيدة', 'Saïda', 'Saida'),
('21', 'سكيكدة', 'Skikda', 'Skikda'),
('22', 'سيدي بلعباس', 'Sidi Bel Abbès', 'Sidi Bel Abbes'),
('23', 'عنابة', 'Annaba', 'Annaba'),
('24', 'قالمة', 'Guelma', 'Guelma'),
('25', 'قسنطينة', 'Constantine', 'Constantine'),
('26', 'المدية', 'Médéa', 'Medea'),
('27', 'مستغانم', 'Mostaganem', 'Mostaganem'),
('28', 'المسيلة', 'M''Sila', 'M''Sila'),
('29', 'معسكر', 'Mascara', 'Mascara'),
('30', 'ورقلة', 'Ouargla', 'Ouargla'),
('31', 'وهران', 'Oran', 'Oran'),
('32', 'البيض', 'El Bayadh', 'El Bayadh'),
('33', 'إليزي', 'Illizi', 'Illizi'),
('34', 'برج بوعريريج', 'Bordj Bou Arréridj', 'Bordj Bou Arreridj'),
('35', 'بومرداس', 'Boumerdès', 'Boumerdes'),
('36', 'الطرف', 'El Tarf', 'El Tarf'),
('37', 'تندوف', 'Tindouf', 'Tindouf'),
('38', 'تيسمسيلت', 'Tissemsilt', 'Tissemsilt'),
('39', 'الوادي', 'El Oued', 'El Oued'),
('40', 'خنشلة', 'Khenchela', 'Khenchela'),
('41', 'سوق أهراس', 'Souk Ahras', 'Souk Ahras'),
('42', 'تيبازة', 'Tipaza', 'Tipaza'),
('43', 'ميلة', 'Mila', 'Mila'),
('44', 'عين الدفلى', 'Aïn Defla', 'Ain Defla'),
('45', 'النعامة', 'Naâma', 'Naama'),
('46', 'عين تموشنت', 'Aïn Témouchent', 'Ain Temouchent'),
('47', 'غرداية', 'Ghardaïa', 'Ghardaia'),
('48', 'غليزان', 'Relizane', 'Relizane'),
('49', 'تيميمون', 'Timimoun', 'Timimoun'),
('50', 'برج باجي مختار', 'Bordj Badji Mokhtar', 'Bordj Badji Mokhtar'),
('51', 'أولاد جلال', 'Ouled Djellal', 'Ouled Djellal'),
('52', 'بني عباس', 'Béni Abbès', 'Beni Abbes'),
('53', 'عين صالح', 'In Salah', 'In Salah'),
('54', 'عين قزام', 'In Guezzam', 'In Guezzam'),
('55', 'توقرت', 'Touggourt', 'Touggourt'),
('56', 'جانت', 'Djanet', 'Djanet'),
('57', 'المغير', 'El M''Ghair', 'El M''Ghair'),
('58', 'المنيعة', 'El Meniaa', 'El Meniaa')
ON CONFLICT (code) DO NOTHING;

-- 2. Add wilaya_id to Request Tables
ALTER TABLE local_medicine_requests ADD COLUMN IF NOT EXISTS wilaya_id INTEGER REFERENCES wilayas(id);
ALTER TABLE foreign_medicine_requests ADD COLUMN IF NOT EXISTS wilaya_id INTEGER REFERENCES wilayas(id);

-- 3. Create Admin View (Full Access)
CREATE OR REPLACE VIEW alkhayr_requests_admin AS
SELECT 
    l.id,
    l.title,
    l.medicine_name as description,
    l.category,
    l.classification,
    l.wilaya,
    l.wilaya_id,
    l.urgency,
    l.status,
    l.full_name as requester_name,
    l.email,
    l.contact_value,
    l.contact_type,
    'local_medicine_requests' as table_name,
    'local' as origin,
    l.created_at,
    l.approved,
    l.prescription_url,
    l.public_notes,
    l.visibility,
    l.visibility_settings,
    l.admin_public_description,
    l.financial_ability,
    l.afford_amount,
    l.need_delivery,
    l.notes as admin_notes, -- mapping notes to admin notes view
    l.user_notes
FROM local_medicine_requests l
UNION ALL
SELECT 
    f.id,
    f.title,
    f.medicine_details as description,
    f.category,
    f.classification,
    f.wilaya,
    f.wilaya_id,
    f.urgency,
    f.status,
    f.full_name as requester_name,
    f.email,
    f.contact_value,
    f.contact_type,
    'foreign_medicine_requests' as table_name,
    'foreign' as origin,
    f.created_at,
    f.approved,
    f.prescription_url,
    f.public_notes,
    f.visibility,
    f.visibility_settings,
    f.admin_public_description,
    f.financial_ability,
    f.budget as afford_amount,
    NULL as need_delivery, -- foreign doesn't have need_delivery
    f.notes as admin_notes, 
    f.user_notes
FROM foreign_medicine_requests f;

-- 4. Rewrite Public View (Secure)
DROP VIEW IF EXISTS alkhayr_requests;

CREATE OR REPLACE VIEW alkhayr_requests AS
SELECT 
    id,
    -- Secure Title: Use Admin override or fallback to sanitized name
    COALESCE(admin_public_description, title, 'Demande Humanitaire') as title,
    
    -- Secure Description: ONLY Admin Description is fully trusted for public. 
    -- If admin_public_description is NULL, we might return a generic string or the medicine name if permitted.
    -- Assuming we prefer Admin Description:
    COALESCE(admin_public_description, description) as description,

    category,
    classification,
    urgency,
    status,
    created_at,
    origin,
    table_name,

    -- Location Security
    CASE 
        WHEN (visibility_settings->>'show_city')::boolean = true THEN wilaya 
        ELSE 'Algérie' 
    END as wilaya,

    -- Media
    CASE 
        WHEN (visibility_settings->>'show_photos')::boolean = true THEN prescription_url 
        ELSE NULL 
    END as prescription_url,

    -- Sensitive Fields (NULLified)
    NULL::text as requester_name, -- Logic: Name is PII. Only show if 'show_name' is true?
    -- Point 2 says "Show Name" is an admin control.
    CASE 
        WHEN (visibility_settings->>'show_name')::boolean = true THEN requester_name 
        ELSE 'Bénéficiaire' 
    END as public_name,

    NULL::text as phone,
    NULL::text as email,
    NULL::text as contact_value,
    
    -- Public Notes
    public_notes

FROM alkhayr_requests_admin
WHERE 
    (status = 'accepted' OR status = 'completed') 
    AND visibility = 'public';

