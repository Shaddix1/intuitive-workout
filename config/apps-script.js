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
    var type = data.type || 'signup';

    if (type === 'contact') {
      return handleContact(data);
    }

    return handleSignup(data);

  } catch (err) {
    return jsonResponse({ result: 'error', message: err.toString() });
  }
}

function handleSignup(data) {
  var email = (data.email || '').trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ result: 'error', message: 'Invalid email address' });
  }

  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  var existing = sheet.getRange('A:A').getValues().flat();

  if (existing.indexOf(email) !== -1) {
    return jsonResponse({ result: 'success', message: 'Already registered' });
  }

  sheet.appendRow([email, new Date().toISOString(), 'website']);

  var plainText = [
    'Here\'s the first chapter.',
    '',
    '---',
    '',
    'BEFORE',
    '',
    'Screen all day. Vibe coding, music, videogames. Somewhere in the afternoon my neck had been stiff long enough that my body started doing something about it without asking me first. Slow rolls. Head tilting one way, then the other. The small maintenance work that happens on its own when you\'ve been sitting too long.',
    '',
    'The sun was out. Window open. I went to the garden.',
    '',
    'It is thanks to Fiona that I write this down.',
    '',
    'She asked what I was doing. Some kind of slow movement, stretching into whatever position felt right, nothing I could name or explain.',
    '',
    '"Is that Qi Gong?"',
    '',
    'It wasn\'t Qi Gong. I had no idea what it was. It just felt good.',
    '',
    '"No one taught you this?"',
    '',
    'No one taught me this.',
    '',
    'She kept watching. Over the following weeks she started to notice what happened on the days I didn\'t do it. "You should do your intuitive thingy," she said once. "You\'re in a way better mood whenever you do." And then, after a while: "You should write about this. I\'m sure it would help people."',
    '',
    'I thought she was being kind. But she kept coming back to it, and eventually I started to see what she was seeing. Not a program or a framework. Something that had grown on its own, and the more it grew, the more naturally it fit into my life.',
    '',
    'I\'m still not entirely sure Fiona\'s right. But I\'m glad she said something.',
    '',
    '---',
    '',
    'This book is not a plan. There are no weeks, no phases, nothing to complete. If you\'re looking for a 12-week transformation, I\'m genuinely not the right person. If you\'ve done the twelve weeks more than once and it still didn\'t hold. If you\'ve never done the twelve weeks at all. This might be for you.',
    '',
    'What I can offer is how I got here. Whether any of it is useful, whether any of it is yours, I can\'t tell you.',
    '',
    'To get there, I need to start with what I was seeing in other people.',
    '',
    '---',
    '',
    'CHAPTER 1: THE GRIND',
    'The pattern I watched hundreds of times. And the question it eventually forced.',
    '',
    'I was working as a personal trainer in Vienna.',
    '',
    'I saw the same pattern so many times I started to recognize it within the first session.',
    '',
    'Someone comes in with a genuine goal, usually a number or a size or a before-and-after they\'ve been carrying around for a while. They put in the work and the results come quickly at first, the way they always do when the body hasn\'t been asked much lately. The first few months there\'s real movement. And then somewhere around the six-month mark, life gets in the way: a work stretch, a trip, two bad weeks that bleed into each other. The structure breaks.',
    '',
    'The missed sessions aren\'t the worst part. The person decides they\'ve failed.',
    '',
    '---',
    '',
    'Let me call her Anna.',
    '',
    'She came to me in her early twenties, organized and committed, the kind of person who did exactly what you asked between sessions. She had a specific goal and she went after it properly. By the halfway point she\'d made enough progress to decide she could continue on her own. Sessions cost money, she\'d learned the fundamentals, and honestly I thought she\'d manage. She left.',
    '',
    'A few months later she was back with the weight she\'d lost and the same energy, same approach. She hit her goal again in twelve weeks and then stopped coming.',
    '',
    'About a year later I ran into her at the train station. It was brief, a little awkward. She was training again.',
    '',
    'I don\'t know what happened after that. But Anna wasn\'t unusual. She was the most common client I ever coached.',
    '',
    'There was another kind too. Not the people who\'d been at it seriously and stopped. They\'d built something, even if it hadn\'t lasted. These were the ones who came in twice in January, a New Year\'s resolution probably, and were never seen again. No dramatic stopping. The membership just sat in the system.',
    '',
    '---',
    '',
    'A Norwegian study that tracked gym members across a full year found that only 37% maintained a regular habit. The rest dropped off at consistent points: three months, six months, twelve. It\'s common enough that the fitness industry is, in ways not always fully conscious, structured around that cycle: sell the hope, absorb the dropout, sell it again. Not a conspiracy. Just what happens when you offer a solution to a problem that hasn\'t been correctly named.',
    '',
    'The psychologists Edward Deci and Richard Ryan identified the mechanism decades ago, in work that became the most cited framework in exercise science. When motivation comes from outside, it dissolves when the outside thing goes away. A deadline, a program, a number on the scale. When it comes from inside, it doesn\'t. The difference sounds simple and isn\'t.',
    '',
    'Fitness apps moved the external coach into the phone. Research tracking large groups of users found the same pattern across platforms: logging food triggered shame, performance notifications triggered disappointment, and when the emotional weight got heavy enough, people deleted the app rather than keep falling short of it. The dynamic stayed the same.',
    '',
    '---',
    '',
    'There\'s nothing inherently wrong with structured training. I did it for years and I got a lot from it: the programs, the progression, the discipline of showing up to the same thing consistently.',
    '',
    'It\'s been sold as the only way, the thing you commit to or you\'re not serious. And for most people that\'s where it breaks down. Not the exercises. The relationship.',
    '',
    'When you\'ve tried three programs and quit all three, the obvious conclusion is that you\'re the kind of person who quits. But there\'s another reading: the framework was wrong for you.',
    '',
    'What if the problem isn\'t you?',
    '',
    '---',
    '',
    'The rest of the book picks up here.',
    'https://jannenning.gumroad.com/l/intuitive-workout',
    '',
    'Jan',
    'intuitive-workout.com'
  ].join('\n');

  GmailApp.sendEmail(email, 'The first chapter.', plainText, {
    from: SENDER_EMAIL,
    htmlBody: getWelcomeEmail(),
    name: 'Jan Nenning'
  });

  return jsonResponse({ result: 'success' });
}

function handleContact(data) {
  var email = (data.email || '').trim().toLowerCase();
  var message = (data.message || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ result: 'error', message: 'Invalid email address' });
  }

  if (!message) {
    return jsonResponse({ result: 'error', message: 'Message is required' });
  }

  var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  var contactSheet = spreadsheet.getSheetByName('Contact');

  if (!contactSheet) {
    contactSheet = spreadsheet.insertSheet('Contact');
    contactSheet.appendRow(['email', 'message', 'timestamp']);
  }

  contactSheet.appendRow([email, message, new Date().toISOString()]);

  // Notify Jan
  GmailApp.sendEmail(SENDER_EMAIL, 'New message from ' + email, message, {
    replyTo: email,
    name: 'Intuitive Workout Contact'
  });

  return jsonResponse({ result: 'success' });
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
  var p  = 'style="margin: 0 0 22px; font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A;"';
  var pl = 'style="margin: 0;       font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A;"';
  var br = '<tr><td style="padding-bottom: 28px;"><div style="width: 20px; height: 2px; background-color: #C4622D;"></div></td></tr>';
  var hr = '<tr><td style="padding: 48px 0;"><div style="border-top: 1px solid #E2DDD8;"></div></td></tr>';

  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <style>',
    '    @import url(\'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap\');',
    '  </style>',
    '</head>',
    '<body style="margin: 0; padding: 0; background-color: #FAF8F5;">',

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5;">',
    '<tr><td align="center" style="padding: 56px 20px 72px;">',

    '<table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">',

    // Logo
    '<tr><td style="padding-bottom: 48px; text-align: center;">',
    '  <span style="font-family: \'Playfair Display\', Georgia, serif; font-size: 18px; color: #1A1A1A; letter-spacing: 0.03em;">',
    '    <span style="font-weight: 400;">Intuitive</span><span style="font-weight: 700;">Workout</span>',
    '  </span>',
    '</td></tr>',

    // Terracotta rule
    '<tr><td style="padding-bottom: 48px; text-align: center;">',
    '  <div style="width: 32px; height: 3px; background-color: #C4622D; margin: 0 auto;"></div>',
    '</td></tr>',

    // Intro
    '<tr><td style="padding-bottom: 48px;">',
    '  <p style="margin: 0 0 18px; font-family: \'Inter\', -apple-system, Arial, sans-serif; font-size: 15px; font-weight: 300; line-height: 1.75; color: #4A4744;">Thanks for signing up. The first chapter is right below.</p>',
    '  <p style="margin: 0;       font-family: \'Inter\', -apple-system, Arial, sans-serif; font-size: 15px; font-weight: 300; line-height: 1.75; color: #4A4744;">Jan</p>',
    '</td></tr>',

    hr,

    // "Before" label
    '<tr><td style="padding-bottom: 32px;">',
    '  <p style="margin: 0; font-family: \'Playfair Display\', Georgia, serif; font-size: 12px; font-weight: 400; letter-spacing: 0.20em; text-transform: uppercase; color: #C4622D;">Before</p>',
    '</td></tr>',

    // Opening text
    '<tr><td style="padding-bottom: 16px;">',
    '  <p ' + p  + '>Screen all day. Vibe coding, music, videogames. Somewhere in the afternoon my neck had been stiff long enough that my body started doing something about it without asking me first. Slow rolls. Head tilting one way, then the other. The small maintenance work that happens on its own when you\'ve been sitting too long.</p>',
    '  <p ' + p  + '>The sun was out. Window open. I went to the garden.</p>',
    '  <p ' + p  + '>It is thanks to Fiona that I write this down.</p>',
    '  <p ' + p  + '>She asked what I was doing. Some kind of slow movement, stretching into whatever position felt right, nothing I could name or explain.</p>',
    '  <p ' + p  + '>"Is that Qi Gong?"</p>',
    '  <p ' + p  + '>It wasn\'t Qi Gong. I had no idea what it was. It just felt good.</p>',
    '  <p ' + p  + '>"No one taught you this?"</p>',
    '  <p ' + p  + '>No one taught me this.</p>',
    '  <p ' + p  + '>She kept watching. Over the following weeks she started to notice what happened on the days I didn\'t do it. "You should do your intuitive thingy," she said once. "You\'re in a way better mood whenever you do." And then, after a while: "You should write about this. I\'m sure it would help people."</p>',
    '  <p ' + p  + '>I thought she was being kind. But she kept coming back to it, and eventually I started to see what she was seeing. Not a program or a framework. Something that had grown on its own, and the more it grew, the more naturally it fit into my life.</p>',
    '  <p style="margin: 0 0 36px; font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A;">I\'m still not entirely sure Fiona\'s right. But I\'m glad she said something.</p>',
    '</td></tr>',

    br,

    '<tr><td style="padding-bottom: 16px;">',
    '  <p ' + p  + '>This book is not a plan. There are no weeks, no phases, nothing to complete. If you\'re looking for a 12-week transformation, I\'m genuinely not the right person. If you\'ve done the twelve weeks more than once and it still didn\'t hold. If you\'ve never done the twelve weeks at all. This might be for you.</p>',
    '  <p ' + p  + '>What I can offer is how I got here. Whether any of it is useful, whether any of it is yours, I can\'t tell you.</p>',
    '  <p ' + pl + '>To get there, I need to start with what I was seeing in other people.</p>',
    '</td></tr>',

    hr,

    // Chapter 1 heading
    '<tr><td style="padding-bottom: 10px;">',
    '  <p style="margin: 0; font-family: \'Playfair Display\', Georgia, serif; font-size: 12px; font-weight: 400; letter-spacing: 0.20em; text-transform: uppercase; color: #C4622D;">Chapter 1</p>',
    '</td></tr>',
    '<tr><td style="padding-bottom: 14px;">',
    '  <h2 style="margin: 0; font-family: \'Playfair Display\', Georgia, serif; font-size: 28px; font-weight: 700; color: #1A1A1A; letter-spacing: -0.01em; line-height: 1.2;">The Grind</h2>',
    '</td></tr>',
    '<tr><td style="padding-bottom: 40px;">',
    '  <p style="margin: 0; font-family: Georgia, \'Times New Roman\', serif; font-size: 15px; font-style: italic; color: #7A7470; line-height: 1.65;">The pattern I watched hundreds of times. And the question it eventually forced.</p>',
    '</td></tr>',

    // Chapter 1 text
    '<tr><td style="padding-bottom: 16px;">',
    '  <p ' + p  + '>I was working as a personal trainer in Vienna.</p>',
    '  <p ' + p  + '>I saw the same pattern so many times I started to recognize it within the first session.</p>',
    '  <p ' + p  + '>Someone comes in with a genuine goal, usually a number or a size or a before-and-after they\'ve been carrying around for a while. They put in the work and the results come quickly at first, the way they always do when the body hasn\'t been asked much lately. The first few months there\'s real movement. And then somewhere around the six-month mark, life gets in the way: a work stretch, a trip, two bad weeks that bleed into each other. The structure breaks.</p>',
    '  <p style="margin: 0 0 36px; font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A;">The missed sessions aren\'t the worst part. The person decides they\'ve failed.</p>',
    '</td></tr>',

    br,

    '<tr><td style="padding-bottom: 16px;">',
    '  <p ' + p  + '>Let me call her Anna.</p>',
    '  <p ' + p  + '>She came to me in her early twenties, organized and committed, the kind of person who did exactly what you asked between sessions. She had a specific goal and she went after it properly. By the halfway point she\'d made enough progress to decide she could continue on her own. Sessions cost money, she\'d learned the fundamentals, and honestly I thought she\'d manage. She left.</p>',
    '  <p ' + p  + '>A few months later she was back with the weight she\'d lost and the same energy, same approach. She hit her goal again in twelve weeks and then stopped coming.</p>',
    '  <p ' + p  + '>About a year later I ran into her at the train station. It was brief, a little awkward. She was training again.</p>',
    '  <p ' + p  + '>I don\'t know what happened after that. But Anna wasn\'t unusual. She was the most common client I ever coached.</p>',
    '  <p style="margin: 0 0 36px; font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A;">There was another kind too. Not the people who\'d been at it seriously and stopped. They\'d built something, even if it hadn\'t lasted. These were the ones who came in twice in January, a New Year\'s resolution probably, and were never seen again. No dramatic stopping. The membership just sat in the system.</p>',
    '</td></tr>',

    br,

    '<tr><td style="padding-bottom: 16px;">',
    '  <p ' + p  + '>A Norwegian study that tracked gym members across a full year found that only 37% maintained a regular habit. The rest dropped off at consistent points: three months, six months, twelve. It\'s common enough that the fitness industry is, in ways not always fully conscious, structured around that cycle: sell the hope, absorb the dropout, sell it again. Not a conspiracy. Just what happens when you offer a solution to a problem that hasn\'t been correctly named.</p>',
    '  <p ' + p  + '>The psychologists Edward Deci and Richard Ryan identified the mechanism decades ago, in work that became the most cited framework in exercise science. When motivation comes from outside, it dissolves when the outside thing goes away. A deadline, a program, a number on the scale. When it comes from inside, it doesn\'t. The difference sounds simple and isn\'t.</p>',
    '  <p style="margin: 0 0 36px; font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A;">Fitness apps moved the external coach into the phone. Research tracking large groups of users found the same pattern across platforms: logging food triggered shame, performance notifications triggered disappointment, and when the emotional weight got heavy enough, people deleted the app rather than keep falling short of it. The dynamic stayed the same.</p>',
    '</td></tr>',

    br,

    '<tr><td style="padding-bottom: 64px;">',
    '  <p ' + p  + '>There\'s nothing inherently wrong with structured training. I did it for years and I got a lot from it: the programs, the progression, the discipline of showing up to the same thing consistently.</p>',
    '  <p ' + p  + '>It\'s been sold as the only way, the thing you commit to or you\'re not serious. And for most people that\'s where it breaks down. Not the exercises. The relationship.</p>',
    '  <p ' + p  + '>When you\'ve tried three programs and quit all three, the obvious conclusion is that you\'re the kind of person who quits. But there\'s another reading: the framework was wrong for you.</p>',
    '  <p style="margin: 0; font-family: Georgia, \'Times New Roman\', serif; font-size: 17px; line-height: 1.85; color: #1A1A1A; font-style: italic;">What if the problem isn\'t you?</p>',
    '</td></tr>',

    hr,

    // CTA
    '<tr><td style="text-align: center; padding-bottom: 64px;">',
    '  <p style="margin: 0 0 28px; font-family: \'Inter\', -apple-system, Arial, sans-serif; font-size: 15px; font-weight: 300; color: #4A4744; line-height: 1.75;">The rest of the book picks up here.</p>',
    '  <a href="https://jannenning.gumroad.com/l/intuitive-workout" style="display: inline-block; font-family: \'Inter\', -apple-system, Arial, sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #FAF8F5; background-color: #1A1A1A; padding: 15px 32px; text-decoration: none;">Get the Book &middot; $9.90</a>',
    '</td></tr>',

    // Footer
    '<tr><td style="text-align: center;">',
    '  <p style="margin: 0; font-family: -apple-system, Arial, sans-serif; font-size: 12px; color: #9A9490;">',
    '    <a href="https://intuitive-workout.com" style="color: #9A9490; text-decoration: none;">intuitive-workout.com</a>',
    '  </p>',
    '</td></tr>',

    '</table>',
    '</td></tr>',
    '</table>',
    '</body></html>'
  ].join('\n');
}
