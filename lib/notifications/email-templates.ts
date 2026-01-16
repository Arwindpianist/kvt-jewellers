/**
 * Branded email templates for KVT Jewellers
 * Maintains consistent luxury jewelry brand identity across all emails
 */

export interface EmailTemplateOptions {
  title: string;
  greeting?: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
  showOrderDetails?: boolean;
}

/**
 * Base email template with KVT Jewellers branding
 */
export function getBrandedEmailTemplate(options: EmailTemplateOptions): string {
  const {
    title,
    greeting = "",
    content,
    buttonText,
    buttonUrl,
    footerText,
  } = options;

  // Brand colors
  const brandColor = "#521540"; // Primary brand color
  const goldColor = "#B8860B"; // Gold accent
  const lightGray = "#f5f5f5";
  const textColor = "#333333";
  const mutedText = "#666666";

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - KVT Jewellers</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', 'Arial', sans-serif; background-color: #f9f9f9; line-height: 1.6; color: ${textColor};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9f9f9;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <!-- Main Container -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">
                      KVT Jewellers
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 400;">
                      Premium Gold & Silver Jewelry
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    ${greeting ? `<p style="margin: 0 0 20px 0; font-size: 16px; color: ${textColor}; font-weight: 500;">${greeting}</p>` : ""}
                    
                    <h2 style="margin: 0 0 20px 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 24px; font-weight: 600; color: ${brandColor};">
                      ${title}
                    </h2>
                    
                    <div style="color: ${textColor}; font-size: 15px; line-height: 1.8;">
                      ${content}
                    </div>

                    ${buttonText && buttonUrl ? `
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${buttonUrl}" 
                               style="display: inline-block; background-color: ${goldColor}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                              ${buttonText}
                            </a>
                          </td>
                        </tr>
                      </table>
                    ` : ""}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: ${lightGray}; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
                    ${footerText ? `
                      <p style="margin: 0 0 15px 0; color: ${mutedText}; font-size: 14px; line-height: 1.6;">
                        ${footerText}
                      </p>
                    ` : ""}
                    <p style="margin: 0; color: ${mutedText}; font-size: 12px;">
                      © ${new Date().getFullYear()} KVT Jewellers. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0 0; color: ${mutedText}; font-size: 12px;">
                      <a href="mailto:support@kvtjewellers.com" style="color: ${brandColor}; text-decoration: none;">support@kvtjewellers.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Order items table template
 */
export function getOrderItemsTable(orderItems: Array<{
  name: string;
  quantity: number;
  price: number;
  total: number;
}>): string {
  const brandColor = "#521540";
  const goldColor = "#B8860B";
  const lightGray = "#f5f5f5";

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #e0e0e0; color: #333;">${item.name}</td>
      <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e0e0e0; color: #333;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e0e0e0; color: #333;">$${item.total.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const total = orderItems.reduce((sum, item) => sum + item.total, 0);

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #ffffff;">
      <thead>
        <tr style="background-color: ${lightGray};">
          <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: ${brandColor}; border-bottom: 2px solid ${goldColor};">Product</th>
          <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: ${brandColor}; border-bottom: 2px solid ${goldColor};">Quantity</th>
          <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: ${brandColor}; border-bottom: 2px solid ${goldColor};">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 16px 8px; text-align: right; font-weight: 700; font-size: 16px; color: ${brandColor}; border-top: 2px solid ${goldColor};">
            Total
          </td>
          <td style="padding: 16px 8px; text-align: right; font-weight: 700; font-size: 16px; color: ${brandColor}; border-top: 2px solid ${goldColor};">
            $${total.toFixed(2)}
          </td>
        </tr>
      </tfoot>
    </table>
  `;
}
