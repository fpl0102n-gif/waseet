
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Update imports to include the new templates
import { getWaseetTemplate, getAlkhayrTemplate, getBloodTemplate, getExchangeTemplate, getAgentRegistrationTemplate, getAgentApprovedTemplate, getBloodDonorRegistrationTemplate, getBloodDriverRegistrationTemplate, getBloodDonorAcceptanceTemplate, getBloodDonationThankYouTemplate } from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
    type: string;
    record: any;
    old_record?: any;
    admin_note?: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json() as EmailPayload;
        const { type, record } = payload;

        console.log(`[DEBUG V5] Incoming Type: '${type}' (Length: ${type.length})`);
        const allowed = ['order', 'order_update', 'exchange_request', 'import_request', 'product_suggestion', 'agent_registration', 'agent_approved', 'blood_donor_registration', 'transport_volunteer', 'blood_donor_acceptance', 'blood_donation_thank_you'];
        console.log(`[DEBUG V5] Is Allowed? ${allowed.includes(type)}`);

        console.log(`[Email] Received request type: ${type}`);

        // LOG TO DB (Proof of Life)
        await supabase.from('debug_email_logs').insert({
            message: 'Edge Function Received Request',
            details: { type, order_id: record.id }
        });

        // ... (lines 26-196 logic remains mostly same but using payload variable if needed)
        // Actually I need to be careful with replace_file_content range.
        // The file is large. I should do this in chunks or targeted replacing.

        // Let's replace the Interface definition first and the payload extraction.

        // Validate email existence
        // Priority: 1. record.email column, 2. contact_email column
        let userEmail = record.email || record.contact_email;

        // 3. check contact_value if contact_type is email, OR if it looks like an email
        if (!userEmail) {
            if (record.contact_type === 'email') {
                userEmail = record.contact_value;
            } else if (record.contact_value && record.contact_value.includes('@')) {
                // Sometimes users put email in contact_value even if type is not explicitly 'email'
                userEmail = record.contact_value;
            }
        }

        // 4. SPECIAL HANDLING FOR ORDERS: Email is buried in notes JSON
        if (!userEmail && (type === 'order' || type === 'order_update' || type.startsWith('alkhayr')) && record.notes) {
            try {
                let notesObj = record.notes;
                // Handle if notes is string or object
                if (typeof notesObj === 'string' && (notesObj.startsWith('{') || notesObj.startsWith('['))) {
                    notesObj = JSON.parse(notesObj);
                }

                // Check 'internal' note field pattern
                // 1. Explicit check for user_email in JSON
                if (typeof notesObj === 'object' && notesObj !== null && notesObj.user_email) {
                    userEmail = notesObj.user_email;
                    console.log(`[Email] Found explicit user_email in notes: ${userEmail}`);
                }

                // 2. Regex Search Backup (in internal notes or raw text)
                if (!userEmail) {
                    const notesText = typeof notesObj === 'string' ? notesObj : (notesObj.internal || JSON.stringify(notesObj));
                    const emailMatch = notesText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                    if (emailMatch && emailMatch[1] && !emailMatch[1].includes('waseet')) {
                        userEmail = emailMatch[1];
                        console.log(`[Email] Extracted email via regex from notes: ${userEmail}`);
                    }
                }
            } catch (e) {
                console.log(`[Email] Failed to parse ${type} notes for email extraction`);
            }
        }

        if (!userEmail || !userEmail.includes('@')) {
            console.log(`[Email] Skipped: No valid email found for record ID ${record.id}`);
            await supabase.from('debug_email_logs').insert({
                message: 'Aborting: No Email Found',
                details: {
                    record_id: record.id,
                    contact_value: record.contact_value,
                    notes_sample: record.notes ? (typeof record.notes === 'string' ? record.notes.substring(0, 200) : JSON.stringify(record.notes).substring(0, 200)) : "N/A"
                }
            });
            return new Response(JSON.stringify({ message: "No email found, skipped" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!RESEND_API_KEY) {
            console.error("[Email] Error: RESEND_API_KEY is missing");
            await supabase.from('debug_email_logs').insert({
                message: 'Aborting: Missing RESEND_API_KEY',
                details: {}
            });
            return new Response(JSON.stringify({ message: "Configuration error" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        let subject = "";
        let html = "";
        // Updated to use the user's custom domain
        const from = "Waseet <noreply@waseet.store>";
        // NOTE: On free Resend plan, can only send to registered email unless domain verified

        // 1️⃣ WASEET – Brokerage / Store / Exchange
        if (['order', 'order_update', 'exchange_request', 'import_request', 'product_suggestion', 'agent_registration', 'agent_approved', 'blood_donor_registration', 'transport_volunteer', 'blood_donor_acceptance', 'blood_donation_thank_you'].includes(type)) {

            if (type === 'order') {
                let productName = record.product_name || "Order";
                let productUrl = record.product_url;
                let description = "";
                let itemsList: string[] = [];
                let contactInfo = record.contact_value || "N/A";
                let customerName = record.name || "Customer";
                let orderTime = new Date(record.created_at).toLocaleString('en-US', {
                    timeZone: 'Africa/Algiers',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });

                // Try to extract extracted data from notes
                if (record.notes) {
                    try {
                        let notesObj = record.notes;
                        if (typeof notesObj === 'string') {
                            // Try parsing JSON first
                            if (notesObj.trim().startsWith('{') || notesObj.trim().startsWith('[')) {
                                try {
                                    notesObj = JSON.parse(notesObj);
                                } catch (e) { /* ignore if not valid json */ }
                            }
                        }

                        if (typeof notesObj === 'object' && notesObj !== null) {
                            // JSON Format Analysis
                            if (notesObj.items_metadata && Array.isArray(notesObj.items_metadata)) {
                                itemsList = notesObj.items_metadata.map((item: any) => `${item.quantity}x ${item.name} (${item.price} DZD)`);
                                const names = notesObj.items_metadata.map((item: any) => item.name).join(', ');
                                if (names) productName = names;
                            } else if (notesObj.items && Array.isArray(notesObj.items)) {
                                // Fallback to simple items string list
                                itemsList = notesObj.items;
                            }

                            // Description / Public Note
                            if (notesObj.public) {
                                description = notesObj.public;
                            }

                            // Override contact info if available in metadata
                            if (notesObj.user_email) contactInfo += ` / ${notesObj.user_email}`;
                            if (notesObj.shipping_address) description += `\n\nShipping: ${notesObj.shipping_address}`;

                            // If productUrl is generic "Store Order...", replace it with item names
                            if (notesObj.items_metadata && Array.isArray(notesObj.items_metadata)) {
                                const names = notesObj.items_metadata.map((item: any) => item.name).join(', ');
                                if (productUrl && (productUrl.startsWith('Store Order') || productUrl.startsWith('Custom Request'))) {
                                    productUrl = names;
                                }
                            } else if (notesObj.product_url && !productUrl) {
                                productUrl = notesObj.product_url;
                            }

                        } else if (typeof notesObj === 'string') {
                            // Legacy String Analysis
                            const lines = notesObj.split('\n');
                            // Extract URL if not in record
                            const urlLine = lines.find(l => l.toLowerCase().includes('url:'));
                            if (urlLine && !productUrl) productUrl = urlLine.split('URL:')[1].trim();

                            // Attempt to grab clean description (removing legacy headers)
                            let cleanDesc = notesObj
                                .replace(/CONTACT INFO:[\s\S]*?(?=\n\n|\n[A-Z]|$)/i, '')
                                .replace(/Phone:.*?(?:\n|$)/i, '')
                                .replace(/TYPE:.*?(?:\n|$)/i, '')
                                .replace(/Items:[\s\S]*?(?=\n|$)/i, '')
                                .replace(/URL:.*?(?:\n|$)/i, '')
                                .trim();
                            if (cleanDesc) description = cleanDesc;
                        }
                    } catch (e) {
                        console.log("[Email] Failed to parse details from notes:", e);
                    }
                }

                if (itemsList.length === 0 && productName !== "Order") {
                    itemsList.push(productName);
                }

                // Construct Email Body Items
                const emailItems = [
                    { label: "Order ID", value: `#${record.id}` },
                    { label: "Date & Time", value: orderTime },
                    { label: "Customer", value: customerName },
                    { label: "Contact", value: contactInfo },
                    { label: "Status", value: "Pending Processing" }, // Default initial status
                ];

                if (productUrl) {
                    emailItems.push({ label: "Link/Product", value: productUrl });
                }

                // Add financials
                emailItems.push({ label: "Total Price", value: `${record.total || 0} DZD` });

                // Add Items List to description if it's long, or to metadata if short? 
                // Let's actually append items directly to the description block for clarity if there are many
                // UPDATE: User wants ONLY client notes in description. Items go separately.

                subject = `New Order #${record.id} - ${customerName}`;
                html = getWaseetTemplate({
                    title: `New Order Received`,
                    subtitle: `Order #${record.id} has been successfully placed.`,
                    items: emailItems,
                    orderedItems: itemsList.length > 0 ? itemsList : undefined,
                    description: description || undefined, // Pass description to template
                    ctaText: "View Order Details",
                    ctaLink: `https://waseet-dz.com/orders/${record.id}` // Placeholder, update if needed
                });
            } else if (type === 'order_update') {
                const oldRecord = (payload as any).old_record;
                // Parse Notes to get Public Note
                const getPublicNote = (notes: string | any) => {
                    if (!notes) return "";
                    try {
                        if (typeof notes === 'string' && (notes.startsWith('{') || notes.startsWith('['))) {
                            return JSON.parse(notes).public || "";
                        }
                        if (typeof notes === 'object') return notes.public || "";
                    } catch (e) { }
                    return "";
                };

                const newPublicNote = getPublicNote(record.notes);
                const oldPublicNote = getPublicNote(oldRecord.notes);
                const statusChanged = record.status !== oldRecord?.status;
                const noteChanged = newPublicNote && newPublicNote !== oldPublicNote;

                console.log(`[Email Debug] Update: Status ${oldRecord?.status} -> ${record.status}`);
                console.log(`[Email Debug] Note Changed: ${noteChanged}`);

                // FOR DEBUGGING: Send email even if no obvious change, to confirm connectivity
                if (!statusChanged && !noteChanged) {
                    console.log(`[Email] No relevant status/note changes for order ${record.id}`);
                    await supabase.from('debug_email_logs').insert({
                        message: 'Aborting: No Relevant Changes',
                        details: { statusChanged, noteChanged }
                    });
                    return new Response(JSON.stringify({ message: "No relevant updates" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
                }

                let customerName = record.name || "Customer";

                // Extract Product Name / Items for context
                let productName = record.product_name || "Order";
                let itemsList: string[] = [];

                if (record.notes) {
                    try {
                        let notesObj = record.notes;
                        if (typeof notesObj === 'string' && (notesObj.startsWith('{') || notesObj.startsWith('['))) {
                            try { notesObj = JSON.parse(notesObj); } catch (e) { }
                        }
                        if (typeof notesObj === 'object' && notesObj !== null) {
                            if (notesObj.items_metadata && Array.isArray(notesObj.items_metadata)) {
                                const names = notesObj.items_metadata.map((item: any) => item.name).join(', ');
                                if (names) productName = names;
                                itemsList = notesObj.items_metadata.map((item: any) => `${item.quantity}x ${item.name}`);
                            } else if (notesObj.items && Array.isArray(notesObj.items)) {
                                itemsList = notesObj.items;
                            }
                        }
                    } catch (e) { }
                }

                // Construct Email Items (ORDER: ID -> Product -> Customer -> Time -> Note -> Status)
                const emailItems = [
                    { label: "Order ID", value: `#${record.id}` },
                    { label: "Product", value: productName },
                    { label: "Customer", value: customerName },
                    { label: "Date & Time", value: new Date().toLocaleString('en-US', { timeZone: 'Africa/Algiers', dateStyle: 'medium', timeStyle: 'short' }) },
                ];

                // FIXED: Admin Message moved to Description (Main Content)
                // if (newPublicNote) {
                //      emailItems.push({ label: "Admin Message", value: newPublicNote });
                // }

                // FIXED: Admin Message moved to Description (Main Content)
                // if (newPublicNote) {
                //      emailItems.push({ label: "Admin Message", value: newPublicNote });
                // }

                // FIXED: Moved Current Status down to be just before content (handled in next block)
                // emailItems.push({ label: "Current Status", value: record.status.toUpperCase() });

                let title = "Order Updated";
                let subtitle = `Your order #${record.id} has been updated.`;

                if (statusChanged) {
                    title = "Order Status Changed";
                    subtitle = `Your order #${record.id} is now ${record.status.toUpperCase()}.`;
                } else if (noteChanged) {
                    title = "New Message from Admin";
                    subtitle = `You have a new message regarding Order #${record.id}.`;
                }

                // FIXED: Set the email subject line
                subject = `${title} - Order #${record.id}`;

                // FIXED: Current Status moved up (before Order Content)
                emailItems.push({ label: "Current Status", value: record.status.toUpperCase() });

                // Add Order Content (Items) AFTER status
                if (itemsList.length > 0) {
                    itemsList.forEach((item, index) => {
                        emailItems.push({ label: index === 0 ? "Order Content" : "", value: item });
                    });
                }

                html = getWaseetTemplate({
                    title: title,
                    subtitle: subtitle,
                    items: emailItems,

                    orderedItems: undefined, // Removed separate block
                    description: newPublicNote || undefined, // Message is now the main description
                    ctaText: "View Order Details",
                    ctaLink: `https://waseet-dz.com/orders/${record.id}`
                });
            } else if (type === 'exchange_request') {
                subject = `Exchange Request #${record.id}`;

                // --- 1. Fetch Related Data (Currencies, Methods, Wilaya, Profile) ---
                let currencyFrom = "Unknown";
                let currencyTo = "Unknown";
                let methodFrom = "Unknown";
                let methodTo = "Unknown";
                let wilayaName = "Unknown";
                let customerName = "Unknown";

                try {
                    const [resCurrencies, resMethods, resWilaya, resProfile] = await Promise.all([
                        // Currencies
                        supabase.from('currencies').select('id, code, name').in('id', [record.currency_from_id, record.currency_to_id]),
                        // Payment Methods
                        supabase.from('payment_methods').select('id, name').in('id', [record.payment_method_from_id, record.payment_method_to_id].filter(id => id !== null)),
                        // Wilaya
                        supabase.from('wilayas').select('name_en, name_ar').eq('id', record.wilaya_id).single(),
                        // Profile
                        record.user_id ? supabase.from('profiles').select('full_name, first_name, last_name').eq('id', record.user_id).single() : Promise.resolve({ data: null })
                    ]);

                    // Map Currencies
                    if (resCurrencies.data) {
                        const fromCurr = resCurrencies.data.find((c: any) => c.id === record.currency_from_id);
                        const toCurr = resCurrencies.data.find((c: any) => c.id === record.currency_to_id);
                        if (fromCurr) currencyFrom = `${fromCurr.code} (${fromCurr.name})`;
                        if (toCurr) currencyTo = `${toCurr.code} (${toCurr.name})`;
                    }

                    // Map Methods
                    if (resMethods.data) {
                        const fromMethod = resMethods.data.find((m: any) => m.id === record.payment_method_from_id);
                        const toMethod = resMethods.data.find((m: any) => m.id === record.payment_method_to_id);
                        if (fromMethod) methodFrom = fromMethod.name;
                        if (toMethod) methodTo = toMethod.name;
                    }

                    // Map Wilaya
                    if (resWilaya.data) {
                        wilayaName = `${resWilaya.data.name_en} / ${resWilaya.data.name_ar}`;
                    }

                    // Map Profile
                    if (resProfile.data) {
                        const p = resProfile.data;
                        customerName = p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || "Customer";
                    }

                } catch (err) {
                    console.error("[Email] Error fetching related exchange data:", err);
                    // Continue with default "Unknown" values
                }

                // --- 2. Construct Email Items ---
                const emailItems = [
                    // Transaction Details
                    { label: "Request ID", value: `#${record.id}` },
                    { label: "Type", value: (record.request_type || "Exchange").toUpperCase() },
                    { label: "Amount", value: `${record.amount || 0} ${currencyFrom}` },
                    { label: "Total To Receive", value: `${record.total_price || 0} ${currencyTo}` },


                    // Payment Details
                    { label: "Payment From", value: methodFrom },
                    { label: "Payment To", value: methodTo },

                    // Logistics
                    { label: "Location", value: wilayaName },
                    { label: "Needed By", value: record.needed_by ? new Date(record.needed_by).toLocaleDateString('en-US') : "N/A" },

                    // Customer / Contact (Enhanced)
                    { label: "Customer Name", value: customerName },
                    { label: "Email", value: userEmail || record.email || "N/A" },
                    { label: "Phone", value: record.phone_number || "N/A" },
                    { label: "Status", value: (record.status || 'pending').toUpperCase() }, // Added Status
                ];

                if (record.whatsapp) emailItems.push({ label: "WhatsApp", value: record.whatsapp });
                if (record.telegram) emailItems.push({ label: "Telegram", value: record.telegram });

                // Construct Description (Notes)
                let description = undefined;
                if (record.notes) {
                    description = `User Notes: ${record.notes}`;
                }

                html = getExchangeTemplate({
                    title: "Exchange Request Submitted",
                    subtitle: "Your currency exchange request is under review.",
                    items: emailItems,
                    description: description,
                    ctaText: "View Request",
                    ctaLink: `https://waseet-dz.com/admin/exchange`
                });

            }
            else if (type === 'donor_update') {
                subject = "Merci pour votre don ! / Thank you for your donation";
                html = getBloodTemplate({
                    title: "Merci pour votre don de sang !",
                    subtitle: "Votre générosité sauve des vies. Voici les détails de votre don enregistré.",
                    items: [
                        { label: "Nom / Name", value: record.full_name },
                        { label: "Groupe Sanguin / Blood Type", value: record.blood_type },
                        { label: "Date du Don / Donation Date", value: record.last_donation_date || "N/A" },
                        { label: "Wilaya", value: record.wilaya },
                        { label: "Téléphone / Phone", value: record.phone_number }
                    ]
                });
            }
            else if (type === 'import_request') {
                subject = "Import Request Received";
                html = getWaseetTemplate({
                    title: "Import Request Submitted",
                    subtitle: "We will review your import logistics request shortly.",
                    items: [
                        { label: "Request ID", value: `#${record.id}` },
                        { label: "Item", value: record.product_description || "Import Item" },
                        { label: "Origin", value: record.origin_country || "International" }
                    ]
                });
            }
            else if (type === 'agent_registration') {
                subject = "Agent Registration Received";

                // Helper to format arrays
                const formatList = (arr: any) => Array.isArray(arr) ? arr.join(', ') : (arr || "N/A");

                html = getAgentRegistrationTemplate({
                    title: "Shipping Agent Profile",
                    subtitle: "New intermediary registration received.",
                    sections: [
                        {
                            title: "Personal Information",
                            items: [
                                { label: "Full Name", value: record.full_name || record.name || "N/A" },
                                { label: "Email", value: record.email || "N/A" },
                                { label: "Phone (WhatsApp)", value: record.phone_number || "N/A" },
                                { label: "Telegram", value: record.telegram || "N/A" }
                            ]
                        },
                        {
                            title: "Location Information",
                            items: [
                                { label: "Current Country", value: record.country || "N/A" },
                                { label: "City", value: record.city || "N/A" }
                            ]
                        },
                        {
                            title: "Shipping Capabilities",
                            items: [
                                { label: "Countries to Ship From", value: formatList(record.shipping_countries) },
                                { label: "Shipping Methods", value: formatList(record.shipping_methods) },
                                { label: "Frequency", value: record.shipment_frequency || "N/A" },
                                { label: "Categories Handled", value: formatList(record.categories) }
                            ]
                        },
                        {
                            title: "Pricing Information",
                            items: [
                                { label: "Price per KG", value: `${record.price_per_kg || 'N/A'}` },
                                { label: "Currency", value: record.currency || "N/A" },
                                { label: "Pricing Type", value: record.pricing_type || "N/A" }
                            ]
                        },
                        {
                            title: "Additional Notes",
                            items: [
                                { label: "Notes", value: record.additional_notes || "None" }
                            ]
                        }
                    ]
                });
            }
            else if (type === 'agent_approved') {
                subject = "Registration Approved - Waseet";
                // Ensure we have the email from the record
                userEmail = record.email;
                html = getAgentApprovedTemplate({
                    name: record.name || "Agent",
                    note: (payload as any).admin_note
                });
            }
            else if (type === 'blood_donor_registration') {
                subject = `New Blood Donor: ${record.full_name}`;
                // Map record to SectionedTemplateData
                html = getBloodDonorRegistrationTemplate({
                    title: "Waseet",
                    subtitle: "New Blood Donor Registration",
                    sections: [
                        {
                            title: "Registration Information",
                            items: [
                                { label: "Full Name", value: record.full_name },
                                { label: "Phone Number", value: record.phone_number },
                                { label: "Email", value: record.email || "N/A" }
                            ]
                        },
                        {
                            title: "Personal Details",
                            items: [
                                { label: "Age", value: record.age?.toString() || "N/A" },
                                { label: "Blood Type", value: record.blood_type || "N/A" }
                            ]
                        },
                        {
                            title: "Location",
                            items: [
                                { label: "Wilaya", value: record.wilaya },
                                { label: "City", value: record.city }
                            ]
                        },
                        {
                            title: "Medical & Donation History",
                            items: [
                                { label: "Last Donation", value: record.last_donation_date || "Never" },
                                { label: "Medical Conditions", value: record.medical_conditions || "None" }
                            ]
                        }
                    ]
                });
            }
            else if (type === 'transport_volunteer') {
                subject = `New Transport Volunteer: ${record.full_name}`;
                html = getBloodDriverRegistrationTemplate({
                    title: "Waseet",
                    subtitle: "Blood Donation Driver Registration",
                    sections: [
                        {
                            title: "Driver Information",
                            items: [
                                { label: "Full Name", value: record.full_name },
                                { label: "Phone Number", value: record.phone_number },
                                { label: "Email", value: record.email || "N/A" },
                                { label: "Wilaya", value: record.wilaya },
                                { label: "City", value: record.city },
                                { label: "Additional Info", value: record.additional_info || "None" },
                                { label: "WhatsApp", value: record.whatsapp || "N/A" },
                                { label: "Telegram", value: record.telegram || "N/A" }
                            ]
                        }
                    ]
                });
            }
            else if (type === 'blood_donor_acceptance') {
                subject = "Registration Approved - Waseet Blood Donation";
                // Ensure email is set
                userEmail = record.email;
                html = getBloodDonorAcceptanceTemplate({
                    full_name: record.full_name
                });
            }
            else if (type === 'blood_donation_thank_you') {
                subject = "Thank You for Your Donation - Waseet";
                userEmail = record.email;
                html = getBloodDonationThankYouTemplate({
                    full_name: record.full_name,
                    date: record.last_donation_date
                });
            }
            else if (type === 'product_suggestion') {
                subject = "Product Suggestion Received";
                html = getWaseetTemplate({
                    title: "Suggestion Received",
                    subtitle: "Thank you for suggesting a product to the store.",
                    items: [
                        { label: "Product", value: record.product_name },
                        { label: "Price", value: `${record.proposed_price || 0}` }
                    ]
                });
            }

        }
        // 2️⃣ ALKHAYR – Humanitarian
        else if (['alkhayr_request', 'alkhayr_request_local', 'alkhayr_request_foreign', 'material_donation', 'transport_volunteer'].includes(type)) {

            if (type.startsWith('alkhayr_request')) {
                const isForeign = type === 'alkhayr_request_foreign';
                subject = isForeign ? "International Medical Request - Received" : "Humanitarian Request - Received";

                const needName = record.medicine_name || record.medicine_details || "Medical Assistance";

                html = getAlkhayrTemplate({
                    title: "Request Received",
                    subtitle: "Your request for assistance has been securely recorded.",
                    items: [
                        { label: "Request Kind", value: isForeign ? 'International' : 'Local' },
                        { label: "Need", value: needName },
                        { label: "Privacy", value: "Protected" }
                    ]
                });
            }
            else if (type === 'material_donation') {
                subject = "Donation Offer Received";
                html = getAlkhayrTemplate({
                    title: "Thank You for Your Generosity",
                    subtitle: "We have received your offer to donate.",
                    items: [
                        { label: "Item", value: record.item_name || "Donation" },
                        { label: "Category", value: record.category || "General" },
                        { label: "Condition", value: record.condition || "N/A" }
                    ]
                });
            }
            else if (type === 'transport_volunteer') {
                subject = "Volunteer Registration";
                html = getAlkhayrTemplate({
                    title: "Welcome to Alkhayr",
                    subtitle: "Thank you for volunteering your vehicle for humanitarian aid.",
                    items: [
                        { label: "Name", value: record.full_name },
                        { label: "Phone", value: record.phone_number || "N/A" },
                        { label: "Wilaya", value: record.wilaya },
                        { label: "City", value: record.city || "N/A" }
                    ]
                });
            }

        }
        // 3️⃣ BLOOD DONATION
        else if (type === 'blood_donor') {
            subject = "Blood Donor Registration";
            html = getBloodTemplate({
                title: "You are a Life Saver",
                subtitle: "Thank you for registering as a blood donor.",
                items: [
                    { label: "Blood Type", value: record.blood_type || record.blood_group || "Unknown" },
                    { label: "Location", value: record.wilaya || record.city || "Unknown" },
                    { label: "Status", value: "Registered" }
                ]
            });
        }
        else if (type === 'donor_update') {
            subject = "Merci pour votre don ! / Thank you for your donation";
            html = getBloodTemplate({
                title: "Thank You for Your Donation",
                subtitle: "Your contribution saves lives.",
                items: [
                    { label: "Donor", value: record.full_name || "Valued Donor" },
                    { label: "Blood Type", value: record.blood_type || "Unknown" },
                    { label: "Date", value: record.last_donation_date || "Today" },
                    { label: "Location", value: record.wilaya || "Unknown" }
                ]
            });
        } else {
            console.log(`[Email] Unknown type: ${type}, skipping.`);
            await supabase.from('debug_email_logs').insert({
                message: 'Aborting: Unknown Type',
                details: { type }
            });
            return new Response(JSON.stringify({ message: `Unknown type (DEPLOY CHECK V4): ${type}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Send Email via Resend
        console.log(`[Email] Sending '${subject}' to ${userEmail}...`);

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: from,
                to: userEmail,
                subject: subject,
                html: html,
            }),
        });

        const data = await res.json();
        console.log("[Email] Resend Response:", data);

        // LOG SUCCESS
        await supabase.from('debug_email_logs').insert({
            message: 'Edge Function Resend Result',
            details: { resend_response: data, email_to: userEmail }
        });

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("[Email] Error:", error.message);
        await supabase.from('debug_email_logs').insert({
            message: 'CRITICAL FUNCTION ERROR',
            details: { error: error.message, stack: error.stack }
        });
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
