import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramPayload {
    type: string;
    record: any;
}

serve(async (req) => {
    // VERSION CHECK: 2.1 (Added to confirm deployment)
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
            throw new Error("Missing Telegram configuration");
        }

        const { type, record } = await req.json() as TelegramPayload;

        // Log payload for debugging (viewable in Supabase Dashboard)
        console.log(`[v2.1] Received ${type} notification:`, record);

        let message = "";
        const adminUrl = "https://waseet-dz.com/admin";
        const safe = (val: any) => val || 'N/A';

        switch (type) {
            case "local_request":
                message = `
🚨 *NEW HUMANITARIAN REQUEST (Local)*

*Name:* ${safe(record.full_name)}
*Need:* ${safe(record.medicine_name)}
*City:* ${safe(record.city)}
*Urgency:* ${record.urgency === 'urgent' ? 'CRITICAL 🔴' : 'Normal 🟡'}

[Open in Admin](${adminUrl}/alkhayr)
        `;
                break;

            case "foreign_request":
                message = `
✈️ *NEW HUMANITARIAN REQUEST (Foreign)*

*Name:* ${safe(record.full_name)}
*Need:* ${safe(record.medicine_details)}
*City:* ${safe(record.city)}
*Target:* ${safe(record.expected_country)}

[Open in Admin](${adminUrl}/alkhayr)
        `;
                break;

            case "blood":
                // Fallback for missing fields or different schema casing
                const bType = record.blood_type || record.blood_group || record.bloodtype || 'Unknown';
                const bLoc = record.wilaya || record.state || 'Unknown';
                const bPhone = record.phone_number || record.phone || record.contact_value || 'Unknown';

                message = `
🩸 *NEW BLOOD DONOR*

*Name:* ${safe(record.full_name)}
*Type:* ${bType}
*Location:* ${bLoc}
*Phone:* ${bPhone}

[Open in Admin](${adminUrl}/blood)
        `;
                break;

            case "order":
                const oUrl = record.product_url || '';
                const oIsCustom = oUrl.startsWith('http');
                const oName = record.name || record.customer_name || 'Customer';
                const oProduct = record.product_name || record.items || 'Products';
                const oTotal = record.total || record.amount || '0';

                message = `
🛒 *NEW ORDER*

*Type:* ${oIsCustom ? 'Custom Request 📝' : 'Store Order 🛍️'}
*Product:* ${oIsCustom ? 'Custom Link' : safe(oProduct)}
*Total:* ${oTotal} DZD
*Customer:* ${oName}

[Open in Admin](${adminUrl}/orders/${record.id})
        `;
                break;

            case "test":
                message = `✅ *Test Notification*\nSystem is working correctly! (v2.1)`;
                break;

            default:
                // Generic Handler for ANY other type or unknown schema
                message = `
🔔 *NEW NOTIFICATION (${type})*

*ID:* ${record.id}
*Created:* ${record.created_at}

Raw Data:
${JSON.stringify(record, null, 2).substring(0, 500)}...
        `;
        }

        // Send to Telegram
        const telegramRes = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_ADMIN_CHAT_ID,
                    text: message,
                    parse_mode: "Markdown",
                    disable_web_page_preview: true,
                }),
            }
        );

        const telegramData = await telegramRes.json();

        if (!telegramRes.ok) {
            console.error("Telegram API Error:", telegramData);
            // Fallback: Send raw text if markdown fails
            await fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_ADMIN_CHAT_ID,
                        text: `Backup Notification:\n\n${message.replace(/[*_]/g, '')}`,
                    }),
                }
            );
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
