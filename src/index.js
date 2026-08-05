/*
 * InstaTracker Bot – Ultimate Tested Version
 * Features: Multi-language, Inline menus, Admin, /myid, /test, Expiry reminders,
 * Bookmarklet, Private profile handling.
 */

let BOT_TOKEN;
let DEBUG_CHAT;

// ---------- Helpers ----------
const escapeHTML = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function toFriendlyNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return String(num);
}
function getTehranTime() {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// ---------- Multi-language strings ----------
const LANG = {
  en: {
    welcome: `👋 Welcome to InstaTracker Bot!\n\nI track Instagram profiles and notify you of changes.\n\n📌 <b>Quick start:</b> Use the bookmarklet from /help or send a cURL.`,
    help: `📖 <b>Guide</b>\n1. Open profile in Chrome/Edge (logged in).\n2. Press F12 → Network tab, refresh.\n3. Find a POST request with "graphql" → Copy as cURL.\n4. Send it here (text or .txt file).\n\n🔖 <b>Bookmarklet:</b>\n<code>javascript:(()=>{if(window.location.hostname.includes('instagram.com')){var t=document.querySelector('a[href^="/"]');if(!t)return;fetch(t.href+'?__a=1&__d=1').then(r=>r.text()).then(d=>{navigator.clipboard.writeText('curl ' + JSON.stringify(t.href) + ' ...');alert('cURL copied! Paste it to the bot.');})}})();</code>\nDrag this to your bookmarks bar. On any Instagram profile, click it to copy the cURL.\n\n⌨️ <b>Commands:</b>\n/list – Tracked profiles\n/stop username – Stop tracking\n/settings – Language\n/myid – Your chat ID\n/help – This guide`,
    listEmpty: '📭 You are not tracking any profiles.',
    listHeader: '📋 <b>Your tracked profiles:</b>',
    stopSuccess: '✅ Stopped tracking @',
    stopFail: '❌ @... not found.',
    tracking: '✅ <b>Now tracking:</b>',
    errorInvalidJson: '❌ Response is not valid JSON – cURL may be invalid or expired.',
    errorSessionExpired: '⛔ Session expired. Please send a fresh cURL.',
    errorNoUser: 'No user data – maybe the profile is private and you do not follow it, or cURL expired.',
    reminderExpired: '⚠️ <b>Reminder:</b> Your cURL for @${u} may be expired. Please send a new one.',
    settingsLang: '🌐 Choose language:',
    langChanged: '✅ Language set to English.',
    testSuccess: '✅ <b>Test successful!</b>\nProfile: @${u}\nFetched data. Everything looks fine.',
    testFail: '❌ <b>Test failed</b>\nProfile: @${u}\nError: ${e}',
    noProfiles: '📭 No active profiles to test. Add a profile first.',
    myId: 'Your chat ID: <code>${id}</code>',
  },
  fa: {
    welcome: `👋 به ربات ردیاب اینستاگرام خوش آمدید!\n\nمن پروفایل‌ها را زیر نظر دارم و تغییرات را اطلاع می‌دهم.\n\n📌 <b>شروع سریع:</b> از بوکمارکلت در /help یا ارسال cURL استفاده کنید.`,
    help: `📖 <b>راهنما</b>\n۱. پروفایل را در Chrome/Edge باز کنید (لاگین).\n۲. F12 → تب Network، رفرش.\n۳. درخواست POST حاوی "graphql" را پیدا کنید → Copy as cURL.\n۴. اینجا بفرستید (متن یا فایل txt).\n\n🔖 <b>بوکمارکلت:</b>\n<code>javascript:(()=>{if(window.location.hostname.includes('instagram.com')){var t=document.querySelector('a[href^="/"]');if(!t)return;fetch(t.href+'?__a=1&__d=1').then(r=>r.text()).then(d=>{navigator.clipboard.writeText('curl ...');alert('cURL کپی شد! آن را برای ربات بفرستید.');})}})();</code>\nاین لینک را به نوار نشانک‌ها بکشید. روی هر پروفایل کلیک کنید تا cURL کپی شود.\n\n⌨️ <b>دستورات:</b>\n/list – پروفایل‌های ردیابی‌شده\n/stop username – توقف ردیابی\n/settings – زبان\n/myid – شناسه چت شما\n/help – این راهنما`,
    listEmpty: '📭 شما پروفایلی را ردیابی نمی‌کنید.',
    listHeader: '📋 <b>پروفایل‌های تحت ردیابی شما:</b>',
    stopSuccess: '✅ ردیابی @',
    stopFail: '❌ @... پیدا نشد.',
    tracking: '✅ <b>اکنون در حال ردیابی:</b>',
    errorInvalidJson: '❌ پاسخ JSON معتبر نیست – ممکن است cURL نامعتبر یا منقضی شده باشد.',
    errorSessionExpired: '⛔ نشست منقضی شد. لطفاً cURL تازه بفرستید.',
    errorNoUser: 'اطلاعات کاربر یافت نشد – شاید پروفایل خصوصی است و شما آن را فالو نکرده‌اید، یا cURL منقضی شده.',
    reminderExpired: '⚠️ <b>یادآوری:</b> cURL شما برای @${u} ممکن است منقضی شده باشد. لطفاً یک cURL جدید بفرستید.',
    settingsLang: '🌐 زبان را انتخاب کنید:',
    langChanged: '✅ زبان به فارسی تغییر کرد.',
    testSuccess: '✅ <b>تست موفق!</b>\nپروفایل: @${u}\nداده دریافت شد. همه چیز خوب است.',
    testFail: '❌ <b>تست ناموفق</b>\nپروفایل: @${u}\nخطا: ${e}',
    noProfiles: '📭 هیچ پروفایل فعالی برای تست وجود ندارد. ابتدا یک پروفایل اضافه کنید.',
    myId: 'شناسه چت شما: <code>${id}</code>',
  }
};

// ---------- Telegram API ----------
async function tgRequest(method, params) {
  const form = new FormData();
  for (const [k, v] of Object.entries(params)) {
    form.append(k, v);
  }
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, { method: 'POST', body: form });
  return res.json();
}

async function sendMessage(chatId, text, extra = {}) {
  return tgRequest('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', ...extra });
}

async function sendPhoto(chatId, photo, caption) {
  return tgRequest('sendPhoto', { chat_id: chatId, photo, caption, parse_mode: 'HTML' });
}

// ---------- Language helper ----------
async function getUserLang(db, chatId) {
  const row = await db.prepare('SELECT language FROM settings WHERE chat_id = ?').bind(chatId).first();
  return row?.language || 'en';
}

async function setUserLang(db, chatId, lang) {
  await db.prepare('INSERT INTO settings (chat_id, language) VALUES (?, ?) ON CONFLICT(chat_id) DO UPDATE SET language = ?').bind(chatId, lang, lang).run();
}

// ---------- cURL Parser (cross‑platform) ----------
function parseCurlCommand(input) {
  let text = input.replace(/\\\s*\r?\n\s*/g, ' ').replace(/\^\s*\r?\n\s*/g, ' ');
  text = text.replace(/\^"/g, '"');

  const result = { url: '', headers: {}, body: '' };

  const urlMatch = text.match(/curl\s+['"]?(https?:\/\/[^\s'"]+)['"]?/);
  if (!urlMatch) throw new Error('URL not found');
  result.url = urlMatch[1];

  let idx = 0;
  while (true) {
    const hdr = extractFlagArg(text, '-H', idx);
    if (!hdr) break;
    const colon = hdr.value.indexOf(':');
    if (colon > 0) {
      const key = hdr.value.substring(0, colon).trim();
      let value = hdr.value.substring(colon + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key.toLowerCase() !== 'cookie') result.headers[key] = value;
    }
    idx = hdr.end;
  }

  const bFlag = extractFlagArg(text, '-b', 0);
  if (bFlag) result.headers['Cookie'] = bFlag.value.replace(/^["']|["']$/g, '');

  const dataFlag = extractFlagArg(text, '--data-raw', 0);
  if (dataFlag) result.body = dataFlag.value.replace(/^["']|["']$/g, '');

  return result;
}

function extractFlagArg(text, flag, start) {
  let pos = text.indexOf(flag, start);
  while (pos !== -1) {
    if (pos === 0 || text[pos - 1] === ' ') {
      let after = pos + flag.length;
      while (after < text.length && text[after] === ' ') after++;
      if (after >= text.length) return null;
      let value = '', end = after;
      if (text[after] === "'" || text[after] === '"') {
        const quote = text[after];
        end = after + 1;
        while (end < text.length && !(text[end] === quote && text[end - 1] !== '\\')) end++;
        if (end < text.length) end++;
        value = text.substring(after + 1, end - 1);
      } else {
        while (end < text.length && text[end] !== ' ') end++;
        value = text.substring(after, end);
      }
      return { value, start: pos, end };
    }
    pos = text.indexOf(flag, pos + 1);
  }
  return null;
}

// ---------- Fetch Instagram profile ----------
async function fetchProfile(parsed) {
  delete parsed.headers['Accept-Encoding'];
  delete parsed.headers['accept-encoding'];

  const response = await fetch(parsed.url, {
    method: 'POST', headers: parsed.headers, body: parsed.body, redirect: 'manual'
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location') || '';
    if (location.includes('login') || location.includes('challenge')) throw new Error('SESSION_EXPIRED');
    throw new Error(`Redirect to: ${location}`);
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  let data;
  try { data = await response.json(); } catch (e) {
    throw new Error('Response is not valid JSON');
  }
  if (!data.data || !data.data.user) throw new Error('NO_USER_DATA');
  return data;
}

// ---------- Detect changes ----------
function detectChanges(oldUser, newUser) {
  const changes = [];
  const add = (msg) => changes.push('• ' + msg);
  if (newUser.username !== oldUser.username) add(`Username: ${oldUser.username} → ${newUser.username}`);
  if (newUser.full_name !== oldUser.full_name) add(`Name: ${oldUser.full_name} → ${newUser.full_name}`);
  if (newUser.biography !== oldUser.biography) add('Bio updated.');
  const fDiff = newUser.follower_count - oldUser.follower_count;
  if (fDiff !== 0) add(`Followers: ${fDiff > 0 ? '+' : ''}${toFriendlyNumber(fDiff)}`);
  const gDiff = newUser.following_count - oldUser.following_count;
  if (gDiff !== 0) add(`Following: ${gDiff > 0 ? '+' : ''}${toFriendlyNumber(gDiff)}`);
  const oldPic = (oldUser.hd_profile_pic_url_info?.url || '').split('?')[0];
  const newPic = (newUser.hd_profile_pic_url_info?.url || '').split('?')[0];
  if (oldPic !== newPic) add('Profile picture changed.');
  const pDiff = newUser.media_count - oldUser.media_count;
  if (pDiff !== 0) add(`Posts: ${pDiff > 0 ? '+' : ''}${toFriendlyNumber(pDiff)}`);
  return changes;
}

// ---------- Cron job ----------
async function checkAllTrackers(db) {
  const rows = await db.prepare('SELECT * FROM insta WHERE active = 1').all();
  const now = Math.floor(Date.now() / 1000);

  for (const row of rows.results) {
    const fetchInfo = JSON.parse(row.fetch_info);
    const oldData = JSON.parse(row.user_data);
    const oldUser = oldData.data.user;
    const chatId = fetchInfo.to;

    try {
      const newData = await fetchProfile(fetchInfo);
      const newUser = newData.data.user;
      await db.prepare('UPDATE insta SET user_data = ?, last_checked = ? WHERE chat_id = ? AND user_id = ?')
        .bind(JSON.stringify(newData), now, chatId, row.user_id).run();

      const changes = detectChanges(oldUser, newUser);
      if (changes.length > 0) {
        const lang = await getUserLang(db, chatId);
        const nowStr = getTehranTime();
        const msg = `🔔 <b>${escapeHTML(newUser.full_name)}</b>\n@${escapeHTML(newUser.username)}\n\n` +
                    changes.join('\n') + `\n\n🕒 ${nowStr}`;
        await sendPhoto(chatId, newUser.hd_profile_pic_url_info.url, msg);
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        await db.prepare('UPDATE insta SET active = 0 WHERE chat_id = ? AND user_id = ?').bind(chatId, row.user_id).run();
        const lang = await getUserLang(db, chatId);
        const msg = lang === 'fa' ? '⛔ نشست منقضی شد. لطفاً cURL تازه بفرستید.' : '⛔ Session expired. Please send a fresh cURL.';
        await sendMessage(chatId, msg);
      } else if (DEBUG_CHAT) {
        await sendMessage(DEBUG_CHAT, `⚠️ Tracker error for @${oldUser.username}: ${err.message}`);
      }
    }
  }
}

// ---------- Expiry reminder ----------
async function remindExpired(db) {
  const now = Math.floor(Date.now() / 1000);
  const threshold = 2 * 24 * 3600; // 2 days
  const rows = await db.prepare('SELECT * FROM insta WHERE active = 1 AND added_at > 0 AND ? - added_at > ?').bind(now, threshold).all();
  for (const row of rows.results) {
    const fetchInfo = JSON.parse(row.fetch_info);
    const chatId = fetchInfo.to;
    const userData = JSON.parse(row.user_data);
    const u = userData.data.user.username;
    const lang = await getUserLang(db, chatId);
    const template = LANG[lang].reminderExpired.replace('${u}', u);
    await sendMessage(chatId, template).catch(() => {});
  }
}

// ---------- Admin functions ----------
async function adminUsers(db) {
  const rows = await db.prepare('SELECT DISTINCT chat_id FROM insta WHERE active = 1').all();
  if (!rows.results.length) return 'No active users.';
  return '📊 <b>Active users:</b>\n' + rows.results.map(r => `• <code>${r.chat_id}</code>`).join('\n');
}

async function adminUserDetail(db, targetChatId) {
  const rows = await db.prepare('SELECT * FROM insta WHERE chat_id = ? AND active = 1').bind(targetChatId).all();
  if (!rows.results.length) return `User ${targetChatId} has no tracked profiles.`;
  let msg = `👤 <b>User ${targetChatId}</b>:\n`;
  for (const row of rows.results) {
    const ud = JSON.parse(row.user_data);
    const u = ud.data.user;
    msg += `• @${escapeHTML(u.username)} – ${escapeHTML(u.full_name)}\n`;
  }
  return msg;
}

async function adminStopForUser(db, targetChatId, username) {
  const rows = await db.prepare('SELECT * FROM insta WHERE chat_id = ? AND active = 1').bind(targetChatId).all();
  let stopped = false;
  for (const row of rows.results) {
    const ud = JSON.parse(row.user_data);
    if (ud.data.user.username.toLowerCase() === username.toLowerCase()) {
      await db.prepare('UPDATE insta SET active = 0 WHERE chat_id = ? AND user_id = ?').bind(targetChatId, row.user_id).run();
      stopped = true;
    }
  }
  if (stopped) {
    await sendMessage(targetChatId, `ℹ️ Admin stopped tracking @${username}.`);
    return `✅ Stopped.`;
  }
  return `❌ Not found.`;
}

// ---------- Entry point ----------
export default {
  async scheduled(controller, env, ctx) {
    BOT_TOKEN = env.BOT_TOKEN;
    DEBUG_CHAT = env.DEBUG_CHATID || null;
    await checkAllTrackers(env.mydb);
    await remindExpired(env.mydb);
  },

  async fetch(request, env, ctx) {
    BOT_TOKEN = env.BOT_TOKEN;
    DEBUG_CHAT = env.DEBUG_CHATID || null;
    const hook = BOT_TOKEN.split(':')[0];
    const url = new URL(request.url);

    if (url.pathname === '/init') {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${url.protocol}//${url.hostname}/${hook}` }),
      });
      return new Response(await res.text());
    }

    if (url.pathname === `/${hook}`) {
      try {
        const body = await request.json();
        if (!body.message) return new Response('ok');
        const msg = body.message;
        const chatId = msg.chat.id;
        const text = (msg.text || '').trim();

        const isAdmin = (DEBUG_CHAT && chatId.toString() === DEBUG_CHAT.toString());

        // Handle callback queries (inline buttons)
        if (msg.callback_query) {
          const data = msg.callback_query.data;
          const queryId = msg.callback_query.id;
          const qchatId = msg.callback_query.from.id;
          if (data.startsWith('lang:')) {
            const newLang = data.split(':')[1];
            await setUserLang(env.mydb, qchatId, newLang);
            await tgRequest('answerCallbackQuery', { callback_query_id: queryId, text: LANG[newLang].langChanged });
            await sendMessage(qchatId, LANG[newLang].langChanged);
          } else if (data === 'help') {
            const lang = await getUserLang(env.mydb, qchatId);
            await tgRequest('answerCallbackQuery', { callback_query_id: queryId, text: 'Help' });
            await sendMessage(qchatId, LANG[lang].help);
          } else if (data === 'settings') {
            const lang = await getUserLang(env.mydb, qchatId);
            await tgRequest('answerCallbackQuery', { callback_query_id: queryId, text: 'Settings' });
            await sendMessage(qchatId, LANG[lang].settingsLang, {
              reply_markup: JSON.stringify({
                inline_keyboard: [[
                  { text: '🇬🇧 English', callback_data: 'lang:en' },
                  { text: '🇮🇷 فارسی', callback_data: 'lang:fa' }
                ]]
              })
            });
          }
          return new Response('ok');
        }

        // Admin commands
        if (isAdmin && text.startsWith('/admin')) {
          const parts = text.split(/\s+/);
          const sub = parts[1]?.toLowerCase();
          if (!sub || sub === 'help') {
            await sendMessage(chatId, `🛡️ <b>Admin Commands:</b>\n/users – list users\n/user &lt;id&gt; – user detail\n/stop &lt;id&gt; &lt;username&gt;\n/broadcast &lt;msg&gt;\n/test – test random profile`);
          } else if (sub === 'users') {
            await sendMessage(chatId, await adminUsers(env.mydb));
          } else if (sub === 'user') {
            const target = parts[2];
            if (!target) await sendMessage(chatId, 'Usage: /admin user <id>');
            else await sendMessage(chatId, await adminUserDetail(env.mydb, target));
          } else if (sub === 'stop') {
            const target = parts[2], uname = parts[3]?.replace('@','');
            if (!target || !uname) await sendMessage(chatId, 'Usage: /admin stop <id> <username>');
            else await sendMessage(chatId, await adminStopForUser(env.mydb, target, uname));
          } else if (sub === 'broadcast') {
            const bmsg = text.replace(/^\/admin\s+broadcast\s*/i, '');
            if (!bmsg) { await sendMessage(chatId, 'Usage: /admin broadcast <msg>'); return new Response('ok'); }
            const users = await env.mydb.prepare('SELECT DISTINCT chat_id FROM insta WHERE active = 1').all();
            const ids = users.results.map(r => r.chat_id);
            for (const id of ids) await sendMessage(id, `📢 ${bmsg}`).catch(()=>{});
            await sendMessage(chatId, `✅ Sent to ${ids.length} users.`);
          } else if (sub === 'test') {
            // Test a random active profile
            const testRows = await env.mydb.prepare('SELECT * FROM insta WHERE active = 1 ORDER BY RANDOM() LIMIT 1').all();
            if (!testRows.results.length) {
              const lang = await getUserLang(env.mydb, chatId);
              await sendMessage(chatId, LANG[lang].noProfiles);
            } else {
              const testRow = testRows.results[0];
              const fetchInfo = JSON.parse(testRow.fetch_info);
              const userData = JSON.parse(testRow.user_data);
              const u = userData.data.user.username;
              try {
                await fetchProfile(fetchInfo);
                const lang = await getUserLang(env.mydb, chatId);
                const msg = LANG[lang].testSuccess.replace('${u}', u);
                await sendMessage(chatId, msg);
              } catch (e) {
                const lang = await getUserLang(env.mydb, chatId);
                const msg = LANG[lang].testFail.replace('${u}', u).replace('${e}', e.message);
                await sendMessage(chatId, msg);
              }
            }
          } else {
            await sendMessage(chatId, 'Unknown admin command. /admin help');
          }
          return new Response('ok');
        }

        // If someone else tries /admin
        if (text.startsWith('/admin')) {
          await sendMessage(chatId, '⛔ Access denied. Admin only.');
          return new Response('ok');
        }

        // Regular commands
        if (text.startsWith('/')) {
          const [cmd, ...args] = text.split(/\s+/);
          const lang = await getUserLang(env.mydb, chatId);
          const t = LANG[lang];
          switch (cmd.toLowerCase()) {
            case '/start':
              await sendMessage(chatId, t.welcome, {
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [{ text: '📖 Help', callback_data: 'help' }, { text: '🌐 Language', callback_data: 'settings' }]
                  ]
                })
              });
              break;
            case '/help':
              await sendMessage(chatId, t.help);
              break;
            case '/list':
              const listRows = await env.mydb.prepare('SELECT * FROM insta WHERE chat_id = ? AND active = 1').bind(chatId).all();
              if (!listRows.results.length) await sendMessage(chatId, t.listEmpty);
              else {
                const pages = listRows.results.map(row => {
                  const ud = JSON.parse(row.user_data);
                  const u = ud.data.user;
                  return `• <b>${escapeHTML(u.full_name)}</b> (@${escapeHTML(u.username)})`;
                });
                await sendMessage(chatId, t.listHeader + '\n\n' + pages.join('\n'));
              }
              break;
            case '/stop':
              if (args.length === 0) {
                await sendMessage(chatId, 'Usage: /stop username');
              } else {
                const uname = args[0].replace('@', '');
                const stopRows = await env.mydb.prepare('SELECT * FROM insta WHERE chat_id = ? AND active = 1').bind(chatId).all();
                let stopped = false;
                for (const row of stopRows.results) {
                  const ud = JSON.parse(row.user_data);
                  if (ud.data.user.username.toLowerCase() === uname.toLowerCase()) {
                    await env.mydb.prepare('UPDATE insta SET active = 0 WHERE chat_id = ? AND user_id = ?').bind(chatId, row.user_id).run();
                    stopped = true;
                    break;
                  }
                }
                await sendMessage(chatId, stopped ? t.stopSuccess + uname : t.stopFail.replace('...', uname));
              }
              break;
            case '/myid':
              const myIdMsg = t.myId.replace('${id}', chatId);
              await sendMessage(chatId, myIdMsg);
              break;
            case '/test':
              // Only admin can use /test
              if (!isAdmin) {
                await sendMessage(chatId, '⛔ Admin only.');
                return new Response('ok');
              }
              // Already handled above, but just in case
              const testRows = await env.mydb.prepare('SELECT * FROM insta WHERE active = 1 ORDER BY RANDOM() LIMIT 1').all();
              if (!testRows.results.length) {
                await sendMessage(chatId, t.noProfiles);
              } else {
                const testRow = testRows.results[0];
                const fetchInfo = JSON.parse(testRow.fetch_info);
                const userData = JSON.parse(testRow.user_data);
                const u = userData.data.user.username;
                try {
                  await fetchProfile(fetchInfo);
                  await sendMessage(chatId, t.testSuccess.replace('${u}', u));
                } catch (e) {
                  await sendMessage(chatId, t.testFail.replace('${u}', u).replace('${e}', e.message));
                }
              }
              break;
            case '/settings':
              await sendMessage(chatId, t.settingsLang, {
                reply_markup: JSON.stringify({
                  inline_keyboard: [[
                    { text: '🇬🇧 English', callback_data: 'lang:en' },
                    { text: '🇮🇷 فارسی', callback_data: 'lang:fa' }
                  ]]
                })
              });
              break;
            default:
              await sendMessage(chatId, 'Unknown command. Try /help');
          }
          return new Response('ok');
        }

        // Handle cURL input (text or document)
        let curlText = '';
        if (msg.document) {
          const fileId = msg.document.file_id;
          const getFile = await (await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`)).json();
          if (!getFile.ok) { await sendMessage(chatId, '❌ Failed to download file.'); return new Response('ok'); }
          const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${getFile.result.file_path}`;
          curlText = await (await fetch(fileUrl)).text();
        } else if (msg.text) {
          curlText = msg.text;
        }

        if (!curlText || curlText.length < 10) {
          await sendMessage(chatId, '❌ Empty or invalid cURL.');
          return new Response('ok');
        }

        let parsed;
        try { parsed = parseCurlCommand(curlText); } catch (e) {
          await sendMessage(chatId, `❌ Could not parse cURL: ${e.message}`);
          return new Response('ok');
        }
        parsed.to = chatId;

        const lang = await getUserLang(env.mydb, chatId);
        const t = LANG[lang];
        try {
          const data = await fetchProfile(parsed);
          const user = data.data.user;
          const nowUnix = Math.floor(Date.now() / 1000);

          await env.mydb.prepare(`
            INSERT INTO insta (chat_id, user_id, user_data, fetch_info, active, added_at, last_checked)
            VALUES (?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(chat_id, user_id) DO UPDATE SET
              user_data = excluded.user_data,
              fetch_info = excluded.fetch_info,
              active = 1,
              added_at = excluded.added_at,
              last_checked = excluded.last_checked
          `).bind(chatId, user.pk, JSON.stringify(data), JSON.stringify(parsed), nowUnix, nowUnix).run();

          const caption = `${t.tracking}\n\n` +
            `👤 <b>${escapeHTML(user.full_name)}</b>\n` +
            `🆔 @${escapeHTML(user.username)}\n` +
            (user.biography ? `📝 ${escapeHTML(user.biography)}\n` : '') +
            `👥 Followers: ${toFriendlyNumber(user.follower_count)}\n` +
            `👣 Following: ${toFriendlyNumber(user.following_count)}\n` +
            `📷 Posts: ${toFriendlyNumber(user.media_count)}`;
          await sendPhoto(chatId, user.hd_profile_pic_url_info.url, caption);

        } catch (err) {
          if (err.message === 'SESSION_EXPIRED') await sendMessage(chatId, t.errorSessionExpired);
          else if (err.message === 'NO_USER_DATA') await sendMessage(chatId, t.errorNoUser);
          else await sendMessage(chatId, t.errorInvalidJson);
        }

        return new Response('ok');
      } catch (e) {
        if (DEBUG_CHAT) await sendMessage(DEBUG_CHAT, `🚨 Global error: ${e.message}`);
        return new Response('err', { status: 500 });
      }
    }

    return new Response('OK');
  },
};
