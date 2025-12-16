/**
 * Fly2Any Email Template System v2.0
 * Ultra-Premium / Apple-Class Level 6
 *
 * Production-ready HTML email templates
 */

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════

const TOKENS = {
  colors: {
    primary: '#E74035',
    primaryHover: '#D63930',
    accent: '#F7C928',
    textPrimary: '#0A0A0A',
    textBody: '#1C1C1C',
    textSecondary: '#6B6B6B',
    textMuted: '#9F9F9F',
    background: '#FAFAFA',
    card: '#FFFFFF',
    border: '#E6E6E6',
    success: '#27C56B',
    warning: '#FFC043',
    error: '#E5484D',
  },
  fonts: {
    stack: "-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, Arial, sans-serif",
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
};

// ═══════════════════════════════════════════════════════════════
// BASE WRAPPER
// ═══════════════════════════════════════════════════════════════

export function baseWrapper(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Fly2Any</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #1A1A1A !important; }
      .dark-card { background-color: #222222 !important; }
      .dark-text { color: #FAFAFA !important; }
      .dark-text-secondary { color: #9F9F9F !important; }
    }
    @media only screen and (max-width: 620px) {
      .mobile-full { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${TOKENS.colors.background}; font-family: ${TOKENS.fonts.stack}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: ${TOKENS.colors.background};">${preheader}</div>` : ''}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="dark-bg">
    <tr>
      <td align="center" style="padding: ${TOKENS.spacing.lg} ${TOKENS.spacing.md};" class="mobile-padding">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="mobile-full" style="max-width: 600px;">
          <tr>
            <td style="background-color: ${TOKENS.colors.card}; border-radius: ${TOKENS.radius.lg}; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05);" class="dark-card">

              ${content}

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

export const components = {
  logo: () => `
    <tr>
      <td align="center" style="padding: ${TOKENS.spacing.xl} ${TOKENS.spacing.xl} ${TOKENS.spacing.lg};">
        <img src="https://www.fly2any.com/logo-email.png" width="140" height="40" alt="Fly2Any" style="display: block; border: 0;" />
      </td>
    </tr>`,

  headline: (text: string, subtitle?: string) => `
    <tr>
      <td style="padding: 0 ${TOKENS.spacing.xl} ${TOKENS.spacing.md}; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${TOKENS.colors.textPrimary}; line-height: 1.2;" class="dark-text">${text}</h1>
        ${subtitle ? `<p style="margin: ${TOKENS.spacing.sm} 0 0; font-size: 16px; color: ${TOKENS.colors.textSecondary}; line-height: 1.5;" class="dark-text-secondary">${subtitle}</p>` : ''}
      </td>
    </tr>`,

  paragraph: (text: string) => `
    <tr>
      <td style="padding: 0 ${TOKENS.spacing.xl} ${TOKENS.spacing.md};">
        <p style="margin: 0; font-size: 16px; color: ${TOKENS.colors.textBody}; line-height: 1.6;" class="dark-text">${text}</p>
      </td>
    </tr>`,

  cta: (text: string, url: string, secondary = false) => `
    <tr>
      <td align="center" style="padding: ${TOKENS.spacing.md} ${TOKENS.spacing.xl} ${TOKENS.spacing.lg};">
        <a href="${url}" target="_blank" style="
          display: inline-block;
          padding: 16px 32px;
          background-color: ${secondary ? 'transparent' : TOKENS.colors.primary};
          color: ${secondary ? TOKENS.colors.primary : '#FFFFFF'};
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border-radius: ${TOKENS.radius.md};
          border: ${secondary ? `2px solid ${TOKENS.colors.primary}` : 'none'};
          min-width: 200px;
          text-align: center;
        ">${text}</a>
      </td>
    </tr>`,

  divider: () => `
    <tr>
      <td style="padding: 0 ${TOKENS.spacing.xl};">
        <div style="height: 1px; background-color: ${TOKENS.colors.border};"></div>
      </td>
    </tr>`,

  spacer: (height = '24px') => `
    <tr><td style="height: ${height};"></td></tr>`,

  flightCard: (data: { origin: string; destination: string; date?: string; time?: string; airline?: string; flightNumber?: string; price?: string }) => `
    <tr>
      <td style="padding: 0 ${TOKENS.spacing.xl} ${TOKENS.spacing.lg};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #FAFAFA 0%, #F2F2F2 100%); border-radius: ${TOKENS.radius.md}; border: 1px solid ${TOKENS.colors.border};">
          <tr>
            <td style="padding: ${TOKENS.spacing.lg};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40%" style="text-align: left;">
                    <p style="margin: 0; font-size: 14px; color: ${TOKENS.colors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                    <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700; color: ${TOKENS.colors.textPrimary};">${data.origin}</p>
                  </td>
                  <td width="20%" style="text-align: center; vertical-align: middle;">
                    <img src="https://www.fly2any.com/email/plane-icon.png" width="32" height="32" alt="→" style="display: inline-block;" />
                  </td>
                  <td width="40%" style="text-align: right;">
                    <p style="margin: 0; font-size: 14px; color: ${TOKENS.colors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;">To</p>
                    <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700; color: ${TOKENS.colors.textPrimary};">${data.destination}</p>
                  </td>
                </tr>
                ${data.date || data.airline ? `
                <tr>
                  <td colspan="3" style="padding-top: ${TOKENS.spacing.md}; border-top: 1px solid ${TOKENS.colors.border}; margin-top: ${TOKENS.spacing.md};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        ${data.date ? `<td style="font-size: 14px; color: ${TOKENS.colors.textSecondary};">📅 ${data.date}${data.time ? ` at ${data.time}` : ''}</td>` : ''}
                        ${data.airline ? `<td style="text-align: right; font-size: 14px; color: ${TOKENS.colors.textSecondary};">✈️ ${data.airline}${data.flightNumber ? ` ${data.flightNumber}` : ''}</td>` : ''}
                      </tr>
                    </table>
                  </td>
                </tr>` : ''}
                ${data.price ? `
                <tr>
                  <td colspan="3" style="padding-top: ${TOKENS.spacing.md}; text-align: center;">
                    <span style="font-size: 32px; font-weight: 700; color: ${TOKENS.colors.primary};">${data.price}</span>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`,

  infoBox: (title: string, items: { label: string; value: string }[]) => `
    <tr>
      <td style="padding: 0 ${TOKENS.spacing.xl} ${TOKENS.spacing.lg};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8F9FA; border-radius: ${TOKENS.radius.md};">
          <tr>
            <td style="padding: ${TOKENS.spacing.lg};">
              <p style="margin: 0 0 ${TOKENS.spacing.sm}; font-size: 14px; font-weight: 600; color: ${TOKENS.colors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;">${title}</p>
              ${items.map(item => `
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px;">
                  <tr>
                    <td style="font-size: 14px; color: ${TOKENS.colors.textSecondary};">${item.label}</td>
                    <td style="text-align: right; font-size: 14px; font-weight: 600; color: ${TOKENS.colors.textPrimary};">${item.value}</td>
                  </tr>
                </table>
              `).join('')}
            </td>
          </tr>
        </table>
      </td>
    </tr>`,

  alert: (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const colors = {
      success: { bg: '#ECFDF5', text: '#065F46', icon: '✓' },
      warning: { bg: '#FFFBEB', text: '#92400E', icon: '⚠' },
      error: { bg: '#FEF2F2', text: '#991B1B', icon: '!' },
      info: { bg: '#EFF6FF', text: '#1E40AF', icon: 'i' },
    };
    const c = colors[type];
    return `
    <tr>
      <td style="padding: 0 ${TOKENS.spacing.xl} ${TOKENS.spacing.md};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${c.bg}; border-radius: ${TOKENS.radius.sm};">
          <tr>
            <td style="padding: ${TOKENS.spacing.md}; font-size: 14px; color: ${c.text};">
              <strong style="margin-right: 8px;">${c.icon}</strong> ${text}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  },

  footer: (includeUnsubscribe = false) => `
    <tr>
      <td style="padding: ${TOKENS.spacing.lg} ${TOKENS.spacing.xl}; border-top: 1px solid ${TOKENS.colors.border};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 13px; color: ${TOKENS.colors.textMuted}; line-height: 1.6;">
                Fly2Any Inc. • Global Travel Platform<br>
                <a href="https://www.fly2any.com/support" style="color: ${TOKENS.colors.textSecondary}; text-decoration: none;">Support</a> •
                <a href="https://www.fly2any.com/privacy" style="color: ${TOKENS.colors.textSecondary}; text-decoration: none;">Privacy</a> •
                <a href="https://www.fly2any.com/terms" style="color: ${TOKENS.colors.textSecondary}; text-decoration: none;">Terms</a>
                ${includeUnsubscribe ? `<br><a href="{{unsubscribe_url}}" style="color: ${TOKENS.colors.textMuted}; text-decoration: underline;">Unsubscribe</a>` : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`,
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildEmail(sections: string[], preheader?: string): string {
  const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${sections.join('')}</table>`;
  return baseWrapper(content, preheader);
}

export { TOKENS };
