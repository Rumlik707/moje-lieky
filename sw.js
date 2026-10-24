// Moje lieky – offline režim.
// Appka sa uloží do telefónu, takže funguje aj bez internetu.
// Pri pripojení si vždy najprv skúsi stiahnuť najnovšiu verziu.
// Ak zmeníš ikonky alebo tento súbor, zvýš číslo verzie nižšie.
const VERSION = 'v13';
const APP = 'moje-lieky-app-' + VERSION;
const FONTS = 'moje-lieky-fonts';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(APP).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('moje-lieky-app-') && k !== APP).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stránka: najprv internet (max. 3 s), inak uložená verzia.
async function page(req) {
  const cache = await caches.open(APP);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 3000))
    ]);
    if (res && res.ok) cache.put('index.html', res.clone());
    return res;
  } catch (e) {
    return (await cache.match('index.html')) || (await cache.match('./')) || Response.error();
  }
}

// Písmo z Google Fonts: uloží sa pri prvom spustení s internetom.
async function font(req) {
  const cache = await caches.open(FONTS);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || net;
}

// Ostatné súbory appky: uložená verzia, inak internet.
async function asset(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) (await caches.open(APP)).put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') { e.respondWith(page(req)); return; }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') { e.respondWith(font(req)); return; }
  if (url.origin === self.location.origin) { e.respondWith(asset(req)); }
});

// Ťuknutie na oznámenie: Užil som / O 15 min / otvoriť appku.
async function inbox(fn) {
  const c = await caches.open('lieky-inbox');
  const r = await c.match('inbox');
  let box = { take: [], snooze: [] };
  try { if (r) box = await r.json(); } catch (e) {}
  fn(box);
  await c.put('inbox', new Response(JSON.stringify(box), { headers: { 'Content-Type': 'application/json' } }));
}
async function tellClients() {
  const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  list.forEach(c => c.postMessage({ type: 'inbox' }));
  return list;
}
self.addEventListener('notificationclick', e => {
  const n = e.notification, d = n.data || {};
  n.close();
  if (e.action === 'take' && d.keys) {
    const now = new Date(), t = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    e.waitUntil(inbox(b => b.take.push({ date: d.date, keys: d.keys, t })).then(tellClients).then(() =>
      self.registration.showNotification('Zapísané ✓', { body: 'Dávka o ' + t + ' je odkliknutá.', tag: 'lieky-ok', icon: 'icon-192.png', badge: 'icon-192.png', silent: true })
        .then(() => new Promise(r => setTimeout(r, 2500))).then(() => self.registration.getNotifications({ tag: 'lieky-ok' })).then(l => l.forEach(x => x.close()))));
    return;
  }
  if (e.action === 'snooze' && d.keys) {
    e.waitUntil(inbox(b => b.snooze.push({ date: d.date, keys: d.keys, until: Date.now() + 15 * 60000 })).then(tellClients));
    return;
  }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow('./') : null;
  }));
});
