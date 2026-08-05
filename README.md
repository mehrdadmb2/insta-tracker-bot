# 📸 InstaTracker Bot

A **Cloudflare Workers** Telegram bot that tracks Instagram profiles and notifies you of changes (bio, name, followers, profile picture, etc.).  
Supports both **public** and **private** profiles (as long as your account follows them).  
Fully multi-language (English 🇬🇧 / Persian 🇮🇷) with inline keyboards and admin panel.

---

## ✨ Features

- 🔍 Track any Instagram profile via a single cURL command
- 📱 Receive real‑time notifications on changes (with Tehran time)
- 🌐 Bilingual (EN/FA) with easy language switch
- 📁 Accept long cURLs as `.txt` file uploads
- 🛡️ Admin panel (`/admin`) with user management and broadcast
- ⏱️ Automatic expiry reminders for stale cURLs
- 🚀 Runs on Cloudflare Workers (free tier) with D1 database
- 🔖 Bookmarklet for one‑click cURL copy (no manual DevTools!)

---

## 🚀 Quick Start

### 1. Clone & Deploy
```bash
git clone https://github.com/your-username/insta-tracker-bot.git
cd insta-tracker-bot
npm install -g wrangler   # if not installed
wrangler login
```

### 2. Set up D1 Database
```bash
wrangler d1 create insta-db
```
Copy the `database_id` and paste it into `wrangler.toml` (or `wrangler.example.toml` → rename).

### 3. Create Tables
```bash
wrangler d1 execute insta-db --remote --file=schema.sql
```

### 4. Set Secrets (Never commit tokens!)
```bash
wrangler secret put BOT_TOKEN
wrangler secret put DEBUG_CHATID   # (optional, for admin)
```

### 5. Deploy
```bash
wrangler deploy
```

### 6. Activate Webhook
Open `https://your-worker.workers.dev/init` in your browser.

### 7. Add a Cron Trigger
In Cloudflare Dashboard → Workers & Pages → your worker → Triggers → Add Cron: `*/10 * * * *`

---

## 📖 How to Use

### For Users
1. **Get a cURL**:
   - Open the Instagram profile in Chrome/Edge (logged in).
   - Press F12 → Network tab → refresh.
   - Find the `graphql` POST request (Status 200) → right‑click → **Copy as cURL**.
   - Paste the copied text directly in the bot, or save it as a `.txt` file and send the file.

   **💡 Tip:** Use the built‑in **bookmarklet** (from `/help`) to copy the cURL with one click!

2. **Commands**:
   - `/list` – View your tracked profiles
   - `/stop username` – Stop tracking a profile
   - `/settings` – Change language
   - `/myid` – Get your chat ID
   - `/help` – Full guide with bookmarklet code

### For Admins (if `DEBUG_CHATID` is set)
- `/admin users` – List all active users
- `/admin user <chatid>` – See a user’s tracked profiles
- `/admin stop <chatid> <username>` – Remove a profile for a user
- `/admin broadcast <message>` – Send a message to all users
- `/admin test` – Test a random profile to verify everything works

---

## 🧩 Customization

- **Language strings** are in the `LANG` object inside `src/index.js`. Add new languages easily.
- **Bookmarklet** is generated from the code in `/help`. Feel free to modify its behavior.

---

## 📦 Dependencies

None. The bot uses only standard Cloudflare Workers APIs.

---

## 🙏 Credits

Created by [Your Name].  
Original idea from the awesome Cloudflare Workers + Telegram community.

---

## 📝 License

MIT – feel free to use and modify.
```

---

## مرحله ۷: آپلود روی GitHub

1. در ترمینال (در پوشه پروژه) یک مخزن گیت بسازید:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: InstaTracker bot"
   ```

2. به GitHub بروید و یک مخزن **جدید** و **عمومی** (Public) بسازید.  
   (اگر SSH یا HTTPS را بلدید، origin را اضافه کنید. اگر نه، راحت‌ترین راه استفاده از GitHub CLI یا دسکتاپ است.)

3. با استفاده از SSH (یا HTTPS) ریپو را متصل کنید:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/insta-tracker-bot.git
   git branch -M main
   git push -u origin main
 
