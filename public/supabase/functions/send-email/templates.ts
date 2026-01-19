
interface EmailTemplateData {
  title: string;
  subtitle: string;
  items: { label: string; value: string }[];
  orderedItems?: string[];
  ctaText?: string;
  ctaLink?: string;
  description?: string;
  descriptionLabel?: string;
}

const BODY_STYLE = `
  margin: 0;
  padding: 0;
  background-color: #f4f4f5;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
`;

const CONTAINER_STYLE = `
  max-width: 600px;
  margin: 20px auto;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const HEADER_STYLE = `
  background-color: #2563eb;
  padding: 24px;
  text-align: center;
  background-image: linear-gradient(to right, #2563eb, #1d4ed8);
`;

const CONTENT_STYLE = `
  padding: 32px;
  color: #333333;
`;

const FOOTER_STYLE = `
  background-color: #f4f4f5;
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  border-top: 1px solid #e2e8f0;
`;

const ITEM_ROW_STYLE = `
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
`;

const ITEM_LABEL_STYLE = `
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
  width: 40%;
`;

const ITEM_VALUE_STYLE = `
  color: #1e293b;
  font-weight: 600;
  text-align: right;
  width: 60%;
  font-size: 14px;
  word-break: break-word;
`;

const commonLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Waseet Notification</title>
</head>
<body style="${BODY_STYLE}">
  <div style="${CONTAINER_STYLE}">
     <!-- Header -->
     <div style="${HEADER_STYLE}">
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Waseet</h1>
        <p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Platform Services</p>
     </div>
     
     <!-- Content -->
     <div style="${CONTENT_STYLE}">
        ${content}
     </div>

     <!-- Footer -->
     <div style="${FOOTER_STYLE}">
        <p style="margin: 0;">&copy; Waseet – Platform Services</p>
     </div>
  </div>
</body>
</html>
`;

// Helper to generate Table Rows
const generateTable = (items: { label: string, value: string }[]) => `
  <div style="margin-bottom: 24px;">
    ${items.map(item => `
      <div style="${ITEM_ROW_STYLE}">
        <div style="${ITEM_LABEL_STYLE}">${item.label}</div>
        <div style="${ITEM_VALUE_STYLE}">${item.value}</div>
      </div>
    `).join('')}
  </div>
`;

// 1. /order & /store Template
export const getWaseetTemplate = (data: EmailTemplateData) => {
  const content = `
    <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px;">${data.title}</h2>
    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 15px; line-height: 1.5;">${data.subtitle}</p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;">

    ${generateTable(data.items)}

    ${data.description ? `
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Notes</h3>
        <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${data.description}</p>
      </div>
    ` : ''}

    ${data.orderedItems ? `
      <div style="margin-top: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; text-transform: uppercase;">Order Items</h3>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px;">
          ${data.orderedItems.map(item => `
            <div style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0; color: #334155; font-size: 14px; last-child: border-bottom: none;">• ${item}</div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${data.ctaText ? `
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.ctaLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">${data.ctaText}</a>
      </div>
    ` : ''}
  `;
  return commonLayout(content);
};

// 2. /exchange Template
export const getExchangeTemplate = (data: EmailTemplateData) => {
  // Exchange templates use the same clean structure
  return getWaseetTemplate(data);
};

// 3. Alkhayr (Legacy Support - Kept just in case, but wrapped in new layout)
export const getAlkhayrTemplate = (data: EmailTemplateData) => {
  // We update the header color for Alkhayr but keep structure
  const content = `
    <h2 style="margin: 0 0 8px 0; color: #166534; font-size: 20px;">${data.title}</h2>
    <p style="margin: 0 0 24px 0; color: #15803d; font-size: 15px;">${data.subtitle}</p>
    
    <div style="border: 1px solid #dcfce7; background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        ${(data as any).sections ? (data as any).sections.map((section: any) => `
          <div style="margin-bottom: 20px; border-bottom: 1px dashed #bbf7d0; padding-bottom: 15px; last-child: border-bottom: none;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
              ${section.title}
            </h3>
            ${generateTable(section.items)}
          </div>
        `).join('') : generateTable(data.items)}
    </div>
  `;
  // Override Header for Alkhayr
  const alkhayrLayout = commonLayout(content)
    .replace('background-color: #2563eb;', 'background-color: #166534;')
    .replace('background-image: linear-gradient(to right, #2563eb, #1d4ed8);', 'background-image: linear-gradient(to right, #166534, #15803d);')
    .replace('Waseet', 'Alkhayr')
    .replace('Platform Services', 'Humanitarian Initiative');

  return alkhayrLayout;
};

// 4. Blood (Legacy Support)
export const getBloodTemplate = (data: EmailTemplateData) => {
  const content = `
    <h2 style="margin: 0 0 8px 0; color: #991b1b; font-size: 20px;">${data.title}</h2>
    <p style="margin: 0 0 24px 0; color: #b91c1c; font-size: 15px;">${data.subtitle}</p>
    
    <div style="border: 1px solid #fee2e2; background-color: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        ${generateTable(data.items)}
    </div>
  `;
  // Override Header for Blood
  const bloodLayout = commonLayout(content)
    .replace('background-color: #2563eb;', 'background-color: #991b1b;')
    .replace('background-image: linear-gradient(to right, #2563eb, #1d4ed8);', 'background-image: linear-gradient(to right, #991b1b, #7f1d1d);')
    .replace('Waseet', 'Waseet')
    .replace('<p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Platform Services</p>', '');

  return bloodLayout;
};

// 5. Section-based Template (used by Agent Registration & Blood Modules)
export interface SectionedTemplateData {
  title: string;
  subtitle: string;
  sections: {
    title: string;
    items: { label: string; value: string }[];
  }[];
}

// Alias for backward compatibility if needed, or just update usages
export type AgentTemplateData = SectionedTemplateData;

export const getAgentRegistrationTemplate = (data: SectionedTemplateData) => {
  const content = `
    <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px;">${data.title}</h2>
    <p style="margin: 0 0 24px 0; color: #64748b; font-size: 15px;">${data.subtitle}</p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;">

    ${data.sections.map(section => `
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
          ${section.title}
        </h3>
        ${generateTable(section.items)}
      </div>
    `).join('')}
  `;

  return commonLayout(content);
};

// 6. Blood Donor Registration Template
export const getBloodDonorRegistrationTemplate = (data: SectionedTemplateData) => {
  // Reuse the Agent Registration internal layout (Sections)
  // But override the Common Layout colors to Red
  const agentLayout = getAgentRegistrationTemplate(data);

  return agentLayout
    .replace('background-color: #2563eb;', 'background-color: #991b1b;')
    .replace('background-image: linear-gradient(to right, #2563eb, #1d4ed8);', 'background-image: linear-gradient(to right, #991b1b, #7f1d1d);')
    .replace('Waseet', 'Waseet')
    .replace('<p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Platform Services</p>', '');
};

// 7. Blood Driver Registration Template
export const getBloodDriverRegistrationTemplate = (data: SectionedTemplateData) => {
  const agentLayout = getAgentRegistrationTemplate(data);

  return agentLayout
    .replace('background-color: #2563eb;', 'background-color: #991b1b;')
    .replace('background-image: linear-gradient(to right, #2563eb, #1d4ed8);', 'background-image: linear-gradient(to right, #991b1b, #7f1d1d);')
    .replace('<p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Platform Services</p>', '');
};

// 8. Agent Approved Template
export const getAgentApprovedTemplate = (data: { name: string; note?: string }) => {
  const noteHtml = data.note ? `
    <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
        <p style="margin: 0; color: #334155; font-size: 14px; font-weight: 500;">Note from Admin:</p>
        <p style="margin: 4px 0 0 0; color: #475569; font-size: 14px;">${data.note}</p>
    </div>
  ` : '';

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Congratulations!</h2>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
      Dear <strong>${data.name}</strong>,
    </p>
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      We are pleased to inform you that your registration as an International Agent with Waseet has been <strong>APPROVED</strong>.
    </p>
    
    ${noteHtml}

    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      We will contact you shortly with further instructions.
    </p>
  `;

  return commonLayout(content);
};

// 9. Blood Donor Acceptance Template
export const getBloodDonorAcceptanceTemplate = (data: { full_name: string }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Registration Approved</h2>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
      Dear <strong>${data.full_name}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      Thank you for registering as a blood donor with Waseet. We are pleased to inform you that your registration has been <strong>APPROVED</strong>.
    </p>
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      Your willingness to help others is a noble gesture. We will contact you when there is an urgent need for your blood type.
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500;">Ready to Save Lives?</p>
        <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 14px;">Please keep your contact information up to date so we can reach you easily.</p>
    </div>

    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      With gratitude,<br>
      The Waseet Team
    </p>
  `;

  // Apply Red Theme Overrides
  const base = commonLayout(content);
  return base
    .replace('background-color: #2563eb;', 'background-color: #991b1b;')
    .replace('background-image: linear-gradient(to right, #2563eb, #1d4ed8);', 'background-image: linear-gradient(to right, #991b1b, #7f1d1d);')
    .replace('<p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Platform Services</p>', '');
};

// 10. Blood Donation Thank You Template
export const getBloodDonationThankYouTemplate = (data: { full_name: string; date?: string }) => {
  const dateHtml = data.date ? `on <strong>${data.date}</strong>` : 'recently';

  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Thank You for Your Donation</h2>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
      Dear <strong>${data.full_name}</strong>,
    </p>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      We want to express our deepest gratitude for your blood donation ${dateHtml}.
    </p>
    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      Your selfless act has the power to save multiple lives. You are a true hero in our community.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 500;">Impact</p>
        <p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 14px;">A single donation can save up to three lives.</p>
    </div>

    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      Thank you for being part of the Waseet family.
    </p>
  `;

  // Apply Red Theme Overrides
  const base = commonLayout(content);
  return base
    .replace('background-color: #2563eb;', 'background-color: #991b1b;')
    .replace('background-image: linear-gradient(to right, #2563eb, #1d4ed8);', 'background-image: linear-gradient(to right, #991b1b, #7f1d1d);')
    .replace('<p style="color: #bfdbfe; margin: 5px 0 0 0; font-size: 14px;">Platform Services</p>', '');
};

// 11. Withdrawal Request Template
export const getWithdrawalRequestTemplate = (data: { phone: string; amount: string; method: string }) => {
  const content = `
    <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Withdrawal Request Received</h2>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
      We have received your request to withdraw funds from your Referral Balance.
    </p>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        ${generateTable([
    { label: "Phone Number", value: data.phone },
    { label: "Amount", value: data.amount },
    { label: "Payment Details", value: data.method },
    { label: "Status", value: "Pending Review" }
  ])}
    </div>

    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      An admin will review your request and process the payment shortly.
    </p>
  `;

  return commonLayout(content);
};

// 12. Withdrawal Processed Template (Paid/Rejected)
export const getWithdrawalProcessedTemplate = (data: {
  amount: string;
  status: string;
  note?: string;
  referralCode?: string;
}) => {
  const isPaid = data.status.toLowerCase() === 'paid';
  const color = isPaid ? '#16a34a' : '#dc2626'; // Green or Red
  const title = isPaid ? 'Withdrawal Processed' : 'Withdrawal Request Update';
  const message = isPaid
    ? 'Great news! Your withdrawal request has been processed and paid.'
    : 'We wanted to update you regarding your recent withdrawal request.';

  const content = `
    <h2 style="margin: 0 0 16px 0; color: ${color}; font-size: 20px;">${title}</h2>
    <p style="margin: 0 0 16px 0; color: #334155; font-size: 15px;">
      ${message}
    </p>
    
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${color};">
        ${generateTable([
    { label: "Status", value: data.status.toUpperCase() },
    { label: "Amount", value: data.amount },
    ...(data.referralCode ? [{ label: "Referral Code", value: data.referralCode }] : []),
  ])}
    </div>

    ${data.note ? `
      <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; text-transform: uppercase;">Admin Note</h3>
          <p style="margin: 0; color: #334155; font-size: 15px; white-space: pre-wrap;">${data.note}</p>
      </div>
    ` : ''}

    <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.5;">
      Thank you for your partnership with Waseet.
    </p>
  `;

  return commonLayout(content);
};
