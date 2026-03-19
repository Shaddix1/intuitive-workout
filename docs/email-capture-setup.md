# Email Capture — Apps Script Deployment

The Google Sheet and CLI auth are already set up. This guide covers the one manual step: deploying the Apps Script.

## Sheet
- **Name:** Intuitive Workout - Signups
- **URL:** https://docs.google.com/spreadsheets/d/1VW4cmMVB3sM11EJEjh_iF6aXqzGDXdAJo-BrYT_3vkQ/edit
- **Headers:** email | timestamp | source

## Deploy the Apps Script

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Name it "Intuitive Workout - Signups"
3. Delete the default code, paste the contents of `config/apps-script.js`
4. Click **Deploy** → **New deployment**
5. Click the gear icon → select **Web app**
6. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy**
8. Google will ask you to authorize — click through the permissions
9. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`)
10. Give the URL to Claude Code to paste into `website/index.html`

## How it works

- Visitor enters email on the website → form POSTs to the Apps Script URL
- Script validates, checks for duplicates, writes to the Sheet, sends welcome email
- Welcome email comes from `jan@intuitive-workout.com` (already set up as Gmail alias)
- Website shows confirmation message without reloading
