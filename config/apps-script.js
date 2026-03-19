/**
 * Intuitive Workout — Email Signup Handler
 *
 * Deploy as Google Apps Script web app:
 * 1. Open script.google.com → New project
 * 2. Paste this entire file
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL → paste into website/index.html
 */

var SHEET_ID = '1VW4cmMVB3sM11EJEjh_iF6aXqzGDXdAJo-BrYT_3vkQ';
var SENDER_EMAIL = 'jan@intuitive-workout.com';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').trim().toLowerCase();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ result: 'error', message: 'Invalid email address' });
    }

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var existing = sheet.getRange('A:A').getValues().flat();

    // Check for duplicate
    if (existing.indexOf(email) !== -1) {
      return jsonResponse({ result: 'success', message: 'Already registered' });
    }

    // Append row
    sheet.appendRow([email, new Date().toISOString(), 'website']);

    // Send welcome email
    var plainText = 'Thanks for signing up.\n\nThe book isn\'t ready yet. When it is, you\'ll be the first to know.\n\nIn the meantime, I post about the ideas behind it on Instagram: https://instagram.com/intuitiveworkout\n\nJan\nintuitive-workout.com';
    GmailApp.sendEmail(email, "You're in.", plainText, {
      from: SENDER_EMAIL,
      htmlBody: getWelcomeEmail(),
      name: 'Jan Nenning'
    });

    return jsonResponse({ result: 'success' });

  } catch (err) {
    return jsonResponse({ result: 'error', message: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({ status: 'ok', service: 'intuitive-workout-signups' });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getWelcomeEmail() {
  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>',
    '<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: Georgia, \'Times New Roman\', serif;">',
    '',
    '<!-- Wrapper -->',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5;">',
    '<tr><td align="center" style="padding: 48px 20px;">',
    '',
    '<!-- Email container -->',
    '<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">',
    '',
    '<!-- Logo -->',
    '<tr><td style="padding-bottom: 40px; text-align: center;">',
    '  <span style="font-family: Georgia, serif; font-size: 16px; color: #1A1A1A; letter-spacing: 0.02em;">',
    '    <span style="font-weight: 300;">Intuitive</span><span style="font-weight: 700;">Workout</span>',
    '  </span>',
    '</td></tr>',
    '',
    '<!-- Divider -->',
    '<tr><td style="padding-bottom: 40px;">',
    '  <div style="width: 32px; height: 3px; background-color: #C4622D; margin: 0 auto;"></div>',
    '</td></tr>',
    '',
    '<!-- Body -->',
    '<tr><td style="color: #1A1A1A; font-size: 16px; line-height: 1.75;">',
    '  <p style="margin: 0 0 24px;">Thanks for signing up.</p>',
    '  <p style="margin: 0 0 24px;">The book isn\'t ready yet. When it is, you\'ll be the first to know.</p>',
    '  <p style="margin: 0 0 24px;">In the meantime, I post about the ideas behind it on <a href="https://instagram.com/intuitiveworkout" style="color: #C4622D; text-decoration: none;">Instagram</a>.</p>',
    '  <p style="margin: 0;">Jan</p>',
    '</td></tr>',
    '',
    '<!-- Footer -->',
    '<tr><td style="padding-top: 48px; text-align: center;">',
    '  <p style="margin: 0; font-size: 12px; color: #8A8A8A; font-family: -apple-system, Arial, sans-serif;">',
    '    <a href="https://intuitive-workout.com" style="color: #8A8A8A; text-decoration: none;">intuitive-workout.com</a>',
    '  </p>',
    '</td></tr>',
    '',
    '</table>',
    '</td></tr>',
    '</table>',
    '</body></html>'
  ].join('\n');
}
