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
    GmailApp.sendEmail(email, "You're in.", '', {
      from: SENDER_EMAIL,
      htmlBody: getWelcomeEmail()
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
    '<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A; line-height: 1.7;">',
    '  <p style="margin: 0 0 24px;">Thanks for signing up.</p>',
    '  <p style="margin: 0 0 24px;">The book isn\'t ready yet. When it is, you\'ll be the first to know.</p>',
    '  <p style="margin: 0 0 24px;">In the meantime, I post about the ideas behind it on <a href="https://instagram.com/intuitiveworkout" style="color: #C4622D;">Instagram</a>.</p>',
    '  <p style="margin: 0;">Jan</p>',
    '</div>'
  ].join('\n');
}
