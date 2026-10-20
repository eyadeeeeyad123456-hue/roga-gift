const asset = 'assets/';
const ADMIN_PIN = '20101123';
let currentPin = sessionStorage.getItem('farah-admin-pin') || '';

// قاعدة بيانات التعديلات المتزامنة
let siteData = {
  texts: {},
  stickers: {}
};

const photos = {
  'صغيره': [
    '856426665_2542465899592265_4044566569153877343_n.jpg',
    '856457946_1671003321363337_447046625197626160_n.jpg',
    '857105014_1158775210050398_852885003007119755_n.jpg',
    '857533633_1407710377710464_1425798621110083885_n.jpg',
    '857729018_1389336436518223_1745719943304563592_n.jpg',
    '858109959_1663637738630025_3111281783997900434_n.jpg'
  ],
  flowers: [
    '854662734_1127144263177332_6852178466772657907_n.jpg',
    '854818012_1850228033085954_7487919489779559021_n.jpg',
    '855628682_1113604941553800_6910572382082486181_n.jpg',
    '856528577_1384257921437597_9190928272106567976_n.jpg',
    '856903868_4608105769484073_1076365432945637209_n.jpg',
    '857155008_2006325973385098_4488613201468730290_n.jpg',
    '858979371_29404712385799253_7185505421027550022_n.jpg',
    '859289740_1752920472432714_6624261383314688264_n.jpg'
  ]
};

const labels = {
  flowers: [
    'ورد… لأجل عيونك ورضاك',
    'الورد ما يهدى إلا للورد ✿',
    'عسى الرضا يسكن قلبك',
    'اعتذار من القلب 🤍',
    'لأنك تستاهلي كل الجمال',
    'يا وردة مكانها دايم في القلب',
    'حقك على راسي وعيني',
    'عسى الضحكة ترجع لملامحك'
  ]
};

const defaultCaptions = {
  'صغيره': [
    'ضحكتك اللي ترد الروح 🤍',
    'يا عسى هالوجه ما يشوف ضيقة',
    'جمال ونقاء ماله مثيل',
    'الملامح اللي ما تهون علي أبدًا',
    'ابتسامتك تسعد يومي كله',
    'حقك علي يا أجمل وأطيب قلب 🎀'
  ]
};

// إنشاء معرض الصور
function makePhotos(folder, el) {
  if (!el || !photos[folder]) return;
  el.innerHTML = '';
  photos[folder].forEach((file, i) => {
    const fig = document.createElement('figure');
    const defaultText = folder === 'صغيره'
      ? defaultCaptions['صغيره'][i % defaultCaptions['صغيره'].length]
      : labels[folder][i % labels[folder].length];
    
    const editKey = `photo-${folder}-${i}`;
    const savedText = siteData.texts[editKey] || localStorage.getItem(`farah-edit-${editKey}`) || defaultText;
    
    fig.className = 'photo';
    fig.style.setProperty('--rot', `${[-3, 2, -1, 3, -2, 1][i % 6]}deg`);
    fig.innerHTML = `
      <img loading="lazy" src="${asset}${folder === 'flowers' ? 'ورد' : 'صغيره'}/${file}" alt="ذكرى روجا">
      <figcaption data-editable data-edit-key="${editKey}">${savedText}</figcaption>
    `;
    el.append(fig);
  });
}

// إنشاء الملصقات الإضافية
const transparentFolder = 'assets/هيلو كيتي/صور بدون خلفية/';
const extraStickerConfigs = [
  { id: 'sticker-extra-0', file: '03_هيلو_كيتي_سيلفي_جوال.png', host: '#memories', left: '81%', top: '24%', rot: '-8deg' },
  { id: 'sticker-extra-1', file: '06_رأس_هيلو_كيتي.png', host: '#memories', left: '8%', top: '62%', rot: '10deg' },
  { id: 'sticker-extra-2', file: '07_هيلو_كيتي_حلاوة_شريطة_صفراء.png', host: '#albums', left: '80%', top: '35%', rot: '8deg' },
  { id: 'sticker-extra-3', file: '09_هيلو_كيتي_غمزة_شريطة_جمجمة.png', host: '#albums', left: '6%', top: '75%', rot: '-8deg' },
  { id: 'sticker-extra-4', file: '10_هيلو_كيتي_واقفة_فستان_وردي.png', host: '.notes', left: '75%', top: '9%', rot: '6deg' },
  { id: 'sticker-extra-5', file: '12_هيلو_كيتي_تطل_من_شريطة_وردية.png', host: '#albums', left: '10%', top: '16%', rot: '-6deg' },
  { id: 'sticker-extra-6', file: '14_رأس_هيلو_كيتي_مائل.png', host: '#music', left: '9%', top: '70%', rot: '11deg' },
  { id: 'sticker-extra-7', file: 'CITYPNG_Hello_Kitty_Cute_Red_Bow_no_bg.png', host: '.grown', left: '7%', top: '12%', rot: '8deg' },
  { id: 'sticker-extra-8', file: '04_ملامح_وشريطة_هيلو_كيتي.png', host: '.letter', left: '80%', top: '12%', rot: '-8deg' }
];

function initExtraStickers() {
  extraStickerConfigs.forEach(({ id, file, host, left, top, rot }) => {
    const parent = document.querySelector(host);
    if (!parent || parent.querySelector(`[data-sticker-id="${id}"]`)) return;
    const sticker = document.createElement('img');
    sticker.className = 'admin-sticker extra-sticker';
    sticker.dataset.stickerId = id;
    sticker.src = transparentFolder + file;
    sticker.alt = 'ملصق Hello Kitty';
    sticker.style.left = left;
    sticker.style.top = top;
    sticker.style.transform = `rotate(${rot})`;
    parent.append(sticker);
  });
}

// تنسيق الوقت (دقائق:ثواني)
function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// الأغاني المفضلة من مجلد اغاني تحبها
const songs = [
  { 
    title: 'أنا حنيت', 
    artist: 'ماجد المهندس', 
    file: 'ماجد المهندس - انا حنيت.mp3', 
    cover: 'assets/اغاني تحبها/انا حنيت.jpg' 
  },
  { 
    title: 'Mind Over Matter', 
    artist: 'Young the Giant', 
    file: 'mind over matter.mp3', 
    cover: 'assets/اغاني تحبها/mind over matter.jpeg' 
  },
  { 
    title: 'Impossible', 
    artist: 'James Arthur', 
    file: 'James Arthur - Impossible .mp3', 
    cover: 'assets/اغاني تحبها/impossible.jpg' 
  }
];

const audio = document.querySelector('#audio');
const music = document.querySelector('.music');
const art = document.querySelector('.album-art');
const title = document.querySelector('.track-title');
const artist = document.querySelector('.track-artist');
const now = document.querySelector('.now-playing');
const play = document.querySelector('.play-toggle');
let chosen = 0;

function setupAudioPlayer() {
  const trackList = document.querySelector('.track-list');
  if (trackList) {
    trackList.innerHTML = songs.map((s, i) => {
      const editKey = `song-${i}`;
      const saved = siteData.texts[editKey] || `${s.title} — ${s.artist}`;
      return `<button data-song="${i}" data-editable data-edit-key="${editKey}">${saved}</button>`;
    }).join('');
  }

  const progressEl = document.querySelector('.progress');
  const progPin = document.querySelector('.prog-pin');
  const currTimeEl = document.querySelector('.curr-time');
  const totalTimeEl = document.querySelector('.total-time');
  const recordWrap = document.querySelector('.record-wrap');

  function chooseSong(i) {
    chosen = i;
    const s = songs[i];
    const trackBtn = document.querySelector(`[data-song="${i}"]`);
    const editedLabel = trackBtn?.textContent.split(' — ');
    audio.src = asset + 'اغاني تحبها/' + s.file;
    art.src = s.cover;
    title.textContent = editedLabel?.[0] || s.title;
    artist.textContent = editedLabel?.[1] || s.artist;
    now.textContent = 'الآن تدور الأغنية ♫';
    document.querySelectorAll('[data-song]').forEach(b => b.classList.toggle('active', +b.dataset.song === i));
    if (currTimeEl) currTimeEl.textContent = '0:00';
  }

  chooseSong(0);

  document.querySelectorAll('[data-song]').forEach(b => {
    b.onclick = () => {
      if (document.body.classList.contains('admin-mode')) return;
      chooseSong(+b.dataset.song);
      audio.play().catch(() => {});
    };
  });

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  if (play) play.onclick = togglePlay;
  if (recordWrap) recordWrap.onclick = togglePlay;

  audio.onplay = () => {
    music?.classList.add('playing');
    if (play) play.textContent = 'إيقاف مؤقت ❚❚';
  };
  audio.onpause = () => {
    music?.classList.remove('playing');
    if (play) play.textContent = 'تشغيل ♫';
  };

  audio.ontimeupdate = () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    const prog = document.querySelector('.progress span');
    if (prog) prog.style.width = percent + '%';
    if (progPin) progPin.style.left = percent + '%';
    if (currTimeEl) currTimeEl.textContent = formatTime(audio.currentTime);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
  };

  audio.onloadedmetadata = () => {
    if (totalTimeEl && audio.duration) totalTimeEl.textContent = formatTime(audio.duration);
  };

  audio.onended = () => chooseSong((chosen + 1) % songs.length);

  // السحب والتقديم في الأغنية
  let isSeekingSong = false;
  function seekSongByEvent(e) {
    if (!audio.duration || !progressEl) return;
    const rect = progressEl.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  }

  if (progressEl) {
    progressEl.addEventListener('click', seekSongByEvent);
    progressEl.addEventListener('pointerdown', e => {
      isSeekingSong = true;
      progressEl.setPointerCapture(e.pointerId);
      seekSongByEvent(e);
    });
    progressEl.addEventListener('pointermove', e => {
      if (isSeekingSong) seekSongByEvent(e);
    });
    progressEl.addEventListener('pointerup', () => { isSeekingSong = false; });
  }
}

// التعديلات والحفظ في السيرفر والمزامنة السحابية (Supabase & Local)
const body = document.body;
const adminPanel = document.querySelector('.admin-panel');
const syncStatus = document.querySelector('#sync-status');
const saveToast = document.querySelector('#save-toast');
let saveTimeout = null;
let supabaseClient = null;

function showToast(msg) {
  if (!saveToast) return;
  saveToast.textContent = msg;
  saveToast.classList.add('show');
  setTimeout(() => saveToast.classList.remove('show'), 2800);
}

// الإعدادات السحابية الافتراضية المؤكدة لـ Supabase
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://abcdtwfxrsqxqleurqrm.supabase.co',
  anonKey: 'sb_publishable_kVkV7thwGdBi6wydgLCSNA_VtqUnWh4',
  tableName: 'site_data',
  recordId: 'rouja_scrapbook'
};

const isLocalServer = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.port === '4173';
};

// قراءة إعدادات Supabase
function getSupabaseSettings() {
  const local = localStorage.getItem('farah_supabase_config');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.anonKey) return parsed;
    } catch (e) {}
  }
  if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url && window.SUPABASE_CONFIG.anonKey) {
    return window.SUPABASE_CONFIG;
  }
  return DEFAULT_SUPABASE_CONFIG;
}

// جلب البيانات من Supabase مباشرة
async function fetchFromSupabase(cfg) {
  try {
    const url = `${cfg.url}/rest/v1/${cfg.tableName || 'site_data'}?id=eq.${cfg.recordId || 'rouja_scrapbook'}&select=*`;
    const res = await fetch(url, {
      headers: {
        'apikey': cfg.anonKey,
        'Authorization': 'Bearer ' + cfg.anonKey
      }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('فشل جلب البيانات: ' + res.status);
    }
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
      return rows[0].data;
    }
  } catch (e) {
    // تجاهل في حالة عدم إنشاء الجدول بعد
    return null;
  }
  return {};
}

// حفظ البيانات في Supabase مباشرة
async function upsertToSupabase(cfg, dataToSave) {
  const url = `${cfg.url}/rest/v1/${cfg.tableName || 'site_data'}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': cfg.anonKey,
      'Authorization': 'Bearer ' + cfg.anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id: cfg.recordId || 'rouja_scrapbook',
      data: dataToSave,
      updated_at: new Date().toISOString()
    })
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error('خطأ Supabase: ' + errText);
  }
  return true;
}

// جلب التعديلات
async function loadServerData() {
  // 1. قراءة فورية من التخزين المحلي
  const localCache = localStorage.getItem('farah_cloud_data');
  if (localCache) {
    try {
      siteData = JSON.parse(localCache);
      applyDataToDOM();
    } catch (e) {}
  }

  // 2. إذا كان يعمل على سيرفر محلي خاص Node.js
  if (isLocalServer()) {
    try {
      const res = await fetch('/api/data?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          siteData.texts = data.texts || siteData.texts || {};
          siteData.stickers = data.stickers || siteData.stickers || {};
          localStorage.setItem('farah_cloud_data', JSON.stringify(siteData));
          applyDataToDOM();
          if (syncStatus) syncStatus.textContent = '☁️ متزامن مع السيرفر المحلي';
          return;
        }
      }
    } catch (err) {
      if (syncStatus) syncStatus.textContent = '⚠️ يعمل محلياً';
    }
  }

  // 3. Supabase
  const cfg = getSupabaseSettings();
  if (cfg && cfg.url && cfg.anonKey) {
    try {
      const cloudData = await fetchFromSupabase(cfg);
      if (cloudData && Object.keys(cloudData).length > 0) {
        siteData.texts = cloudData.texts || {};
        siteData.stickers = cloudData.stickers || {};
        localStorage.setItem('farah_cloud_data', JSON.stringify(siteData));
        applyDataToDOM();
        if (syncStatus) syncStatus.textContent = '⚡ متزامن سحابياً (Supabase)';
      }
    } catch (err) {
      console.warn('Supabase fetch:', err);
    }
  }
}

// تطبيق البيانات على الواجهة
function applyDataToDOM() {
  // النصوص
  document.querySelectorAll('[data-editable]').forEach(el => {
    const key = el.dataset.editKey;
    if (key && siteData.texts[key] !== undefined) {
      el.innerHTML = siteData.texts[key];
    }
  });

  // الملصقات
  document.querySelectorAll('.admin-sticker').forEach(sticker => {
    const id = sticker.dataset.stickerId;
    if (id && siteData.stickers[id]) {
      const s = siteData.stickers[id];
      sticker.style.right = 'auto';
      sticker.style.bottom = 'auto';
      if (s.left) sticker.style.left = s.left;
      if (s.top) sticker.style.top = s.top;
      if (s.scale) sticker.style.scale = s.scale;
    }
  });
}

// حفظ البيانات في السيرفر أو في Supabase
async function saveToServer(manual = false) {
  if (syncStatus) syncStatus.textContent = 'جاري المزامنة والحفظ... ⏳';
  
  localStorage.setItem('farah_cloud_data', JSON.stringify(siteData));

  // 1. الحفظ عبر السيرفر المحلي إذا كان يعمل على Node.js
  if (isLocalServer()) {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': currentPin || ADMIN_PIN
        },
        body: JSON.stringify({
          pin: currentPin || ADMIN_PIN,
          texts: siteData.texts,
          stickers: siteData.stickers
        })
      });

      if (res.ok) {
        if (syncStatus) syncStatus.textContent = '☁️ متزامن محلياً (تم الحفظ)';
        if (manual) showToast('تم حفظ التعديلات محلياً بنجاح ☁️');
        return;
      }
    } catch (err) {
      if (syncStatus) syncStatus.textContent = '⚠️ تم الحفظ محلياً على هذا الجهاز';
    }
  }

  // 2. الحفظ في سحابة Supabase مباشرة
  const cfg = getSupabaseSettings();
  if (cfg && cfg.url && cfg.anonKey) {
    try {
      await upsertToSupabase(cfg, siteData);
      if (syncStatus) syncStatus.textContent = '⚡ متزامن سحابياً (Supabase) ✓';
      if (manual) showToast('تم الحفظ في سحابة Supabase بنجاح ⚡☁️');
      return;
    } catch (err) {
      console.warn('Supabase save error:', err);
    }
  }
}

function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToServer(false), 800);
}

// تهيئة العناصر القابلة للتعديل
function prepareEditable() {
  const isAdmin = body.classList.contains('admin-mode');
  let autoIdx = 0;
  document.querySelectorAll('[data-editable]').forEach(el => {
    if (!el.dataset.editKey) {
      el.dataset.editKey = `auto-${autoIdx++}`;
    }
    const key = el.dataset.editKey;
    if (siteData.texts[key] !== undefined) {
      el.innerHTML = siteData.texts[key];
    }
    el.contentEditable = isAdmin ? 'true' : 'false';
  });
}

// رصد التعديلات في النصوص
document.addEventListener('input', e => {
  const el = e.target.closest('[data-editable]');
  if (el && el.dataset.editKey) {
    siteData.texts[el.dataset.editKey] = el.innerHTML;
    debouncedSave();
  }
});

// نافذة رمز الإدارة (PIN Modal)
const pinDialog = document.querySelector('#admin-pin-dialog');
const pinInput = document.querySelector('#admin-pin-input');
const pinError = document.querySelector('#pin-error-msg');
const pinSubmit = document.querySelector('#submit-pin-btn');
const pinClose = document.querySelector('#close-pin-dialog');

function openPinDialog() {
  if (pinDialog) {
    pinDialog.classList.add('show');
    pinDialog.setAttribute('aria-hidden', 'false');
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
    if (pinError) pinError.textContent = '';
  }
}

function closePinDialog() {
  if (pinDialog) {
    pinDialog.classList.remove('show');
    pinDialog.setAttribute('aria-hidden', 'true');
  }
}

if (pinClose) pinClose.onclick = closePinDialog;
if (pinDialog) {
  pinDialog.onclick = e => {
    if (e.target === pinDialog) closePinDialog();
  };
}

function verifyAndEnterAdmin() {
  const entered = (pinInput?.value || '').trim();
  if (entered === ADMIN_PIN) {
    currentPin = ADMIN_PIN;
    sessionStorage.setItem('farah-admin-pin', currentPin);
    closePinDialog();
    enterAdminMode();
    showToast('مرحباً بك في وضع التعديل 🎀✎');
  } else {
    if (pinError) pinError.textContent = 'الرمز غير صحيح، حاول مرة أخرى ❌';
    pinInput?.select();
  }
}

if (pinSubmit) pinSubmit.onclick = verifyAndEnterAdmin;
if (pinInput) {
  pinInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyAndEnterAdmin();
  });
}

function enterAdminMode() {
  adminPanel?.classList.add('open');
  body.classList.add('admin-mode');
  adminPanel?.setAttribute('aria-hidden', 'false');
  prepareEditable();
}

function exitAdminMode() {
  adminPanel?.classList.remove('open');
  body.classList.remove('admin-mode');
  adminPanel?.setAttribute('aria-hidden', 'true');
  prepareEditable();
}

// زر فتح لوحة الإدارة (✎)
document.querySelector('.admin-trigger').onclick = () => {
  if (currentPin === ADMIN_PIN) {
    if (adminPanel?.classList.contains('open')) {
      exitAdminMode();
    } else {
      enterAdminMode();
    }
  } else {
    openPinDialog();
  }
};

// زر إغلاق لوحة الإدارة
document.querySelector('.close-admin').onclick = exitAdminMode;

// زر قفل وضع التعديل
const lockBtn = document.querySelector('#lock-admin');
if (lockBtn) {
  lockBtn.onclick = () => {
    currentPin = '';
    sessionStorage.removeItem('farah-admin-pin');
    exitAdminMode();
    showToast('تم قفل وضع التعديل 🔒');
  };
}

// زر الحفظ اليدوي لجميع الأجهزة
const saveServerBtn = document.querySelector('#save-server-btn');
if (saveServerBtn) {
  saveServerBtn.onclick = () => saveToServer(true);
}

// نافذة إعدادات Supabase
const supabaseDialog = document.querySelector('#supabase-dialog');
const openSupabaseBtn = document.querySelector('#open-supabase-dialog');
const closeSupabaseBtn = document.querySelector('#close-supabase-dialog');
const supabaseUrlInput = document.querySelector('#supabase-url-input');
const supabaseKeyInput = document.querySelector('#supabase-key-input');
const supabaseStatusMsg = document.querySelector('#supabase-status-msg');
const saveSupabaseBtn = document.querySelector('#save-supabase-btn');

if (openSupabaseBtn) {
  openSupabaseBtn.onclick = () => {
    const cfg = getSupabaseSettings() || {};
    if (supabaseUrlInput) supabaseUrlInput.value = cfg.url || '';
    if (supabaseKeyInput) supabaseKeyInput.value = cfg.anonKey || '';
    if (supabaseStatusMsg) {
      supabaseStatusMsg.textContent = 'أدخل الرابط والمفتاح للاتصال بالسحاب';
      supabaseStatusMsg.style.color = '#6b7280';
    }
    supabaseDialog?.classList.add('show');
    supabaseDialog?.setAttribute('aria-hidden', 'false');
  };
}

if (closeSupabaseBtn) {
  closeSupabaseBtn.onclick = () => {
    supabaseDialog?.classList.remove('show');
    supabaseDialog?.setAttribute('aria-hidden', 'true');
  };
}

if (supabaseDialog) {
  supabaseDialog.onclick = e => {
    if (e.target === supabaseDialog) {
      supabaseDialog.classList.remove('show');
      supabaseDialog.setAttribute('aria-hidden', 'true');
    }
  };
}

if (saveSupabaseBtn) {
  saveSupabaseBtn.onclick = async () => {
    const url = (supabaseUrlInput?.value || '').trim();
    const anonKey = (supabaseKeyInput?.value || '').trim();

    if (!url || !anonKey) {
      if (supabaseStatusMsg) {
        supabaseStatusMsg.textContent = '❌ يرجى إدخال الرابط والمفتاح معاً';
        supabaseStatusMsg.style.color = '#ef4444';
      }
      return;
    }

    try {
      const newConfig = {
        url,
        anonKey,
        tableName: 'site_data',
        recordId: 'farah_scrapbook'
      };
      localStorage.setItem('farah_supabase_config', JSON.stringify(newConfig));
      await saveToServer(false);
      showToast('تم حفظ إعدادات السحاب ⚡☁️');
      supabaseDialog?.classList.remove('show');
      supabaseDialog?.setAttribute('aria-hidden', 'true');
    } catch (err) {
      if (supabaseStatusMsg) {
        supabaseStatusMsg.textContent = '❌ ' + (err.message || 'فشل الاتصال');
        supabaseStatusMsg.style.color = '#ef4444';
      }
    }
  };
}

// استعادة النصوص الأصلية
document.querySelector('.reset-data').onclick = async () => {
  if (confirm('هل أنت متأكد من استعادة النصوص الأصلية؟')) {
    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': currentPin || ADMIN_PIN
        },
        body: JSON.stringify({ pin: currentPin || ADMIN_PIN })
      });
    } catch (e) {}
    localStorage.removeItem('farah_cloud_data');
    location.reload();
  }
};

// حفظ واسترجاع ملف JSON كنسخة احتياطية
document.querySelector('#export-data').onclick = () => {
  const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'farah-apology-backup.json';
  a.click();
};

document.querySelector('#import-data').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed) {
        siteData = {
          texts: parsed.texts || {},
          stickers: parsed.stickers || {}
        };
        applyDataToDOM();
        await saveToServer(true);
      }
    } catch (err) {
      alert('الملف غير صالح');
    }
  };
  reader.readAsText(file);
};

// تحريك وتكبير الملصقات
let selectedSticker = null;

function saveStickerState(sticker) {
  const id = sticker.dataset.stickerId;
  if (!id) return;
  siteData.stickers[id] = {
    left: sticker.style.left,
    top: sticker.style.top,
    scale: sticker.style.scale || '1'
  };
  debouncedSave();
}

function resizeSelected(delta) {
  if (!selectedSticker) return;
  const current = parseFloat(selectedSticker.style.scale) || 1;
  selectedSticker.style.scale = Math.max(0.4, Math.min(2.5, current + delta));
  saveStickerState(selectedSticker);
}

document.querySelector('#sticker-smaller').onclick = () => resizeSelected(-0.1);
document.querySelector('#sticker-larger').onclick = () => resizeSelected(0.1);

function setupStickerInteractions() {
  document.querySelectorAll('.admin-sticker').forEach(sticker => {
    sticker.addEventListener('pointerdown', event => {
      if (!body.classList.contains('admin-mode')) return;
      selectedSticker = sticker;
      event.preventDefault();
      const parent = sticker.parentElement;
      const box = parent.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const initialLeft = sticker.offsetLeft;
      const initialTop = sticker.offsetTop;

      sticker.style.right = 'auto';
      sticker.style.bottom = 'auto';
      sticker.style.left = `${initialLeft}px`;
      sticker.style.top = `${initialTop}px`;
      sticker.setPointerCapture(event.pointerId);

      const move = e => {
        sticker.style.left = `${Math.max(0, Math.min(box.width - sticker.offsetWidth, initialLeft + e.clientX - startX))}px`;
        sticker.style.top = `${Math.max(0, Math.min(box.height - sticker.offsetHeight, initialTop + e.clientY - startY))}px`;
      };

      const up = () => {
        saveStickerState(sticker);
        sticker.removeEventListener('pointermove', move);
        sticker.removeEventListener('pointerup', up);
      };

      sticker.addEventListener('pointermove', move);
      sticker.addEventListener('pointerup', up);
    });

    sticker.addEventListener('wheel', event => {
      if (!body.classList.contains('admin-mode')) return;
      event.preventDefault();
      selectedSticker = sticker;
      resizeSelected(event.deltaY > 0 ? -0.1 : 0.1);
    }, { passive: false });
  });
}

// التحكم برحلة الاعتذار (Apology Journey)
const giftContent = document.querySelector('#gift-content');
const sadScene = document.querySelector('.choice-scene');
const giftReveal = document.querySelector('.gift-reveal');
const opening = document.querySelector('.opening');
const noBtn = document.querySelector('.no');
const yesBtn = document.querySelector('.yes');
let noPresses = 0;

function showGift() {
  sadScene?.classList.remove('show');
  giftReveal?.classList.add('show');
  giftReveal?.setAttribute('aria-hidden', 'false');
}

function enterGift() {
  giftReveal?.classList.remove('show');
  giftReveal?.setAttribute('aria-hidden', 'true');
  giftContent?.classList.remove('gift-locked');
  const intro = document.querySelector('#intro');
  if (intro) {
    intro.classList.remove('hidden');
    intro.scrollIntoView({ behavior: 'smooth' });
  }
}

if (yesBtn) {
  yesBtn.onclick = () => {
    if (!body.classList.contains('admin-mode')) showGift();
  };
}

// حركة زر "لسه زعلانة"
function moveNo() {
  const maxOffset = Math.min(window.innerWidth * 0.22, 65);
  const x = Math.random() * (maxOffset * 2) - maxOffset;
  const y = Math.random() * 60 - 30;
  const rot = Math.random() * 16 - 8;
  noBtn.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
}

function dodgeNo() {
  noPresses++;
  opening?.classList.add('no-tried');
  opening?.classList.toggle('start-shown', noPresses % 2 === 0);
  moveNo();
}

if (noBtn) {
  noBtn.onmouseenter = moveNo;
  noBtn.ontouchstart = e => {
    if (body.classList.contains('admin-mode')) return;
    e.preventDefault();
    dodgeNo();
  };
  noBtn.onclick = () => {
    if (body.classList.contains('admin-mode')) return;
    dodgeNo();
    if (noPresses >= 2) {
      sadScene?.classList.add('show');
      sadScene?.setAttribute('aria-hidden', 'false');
    }
  };
}

document.querySelector('.try-yes').onclick = showGift;

// فتح بطاقة الاعتذار
document.querySelector('.open-gift').onclick = () => {
  const card = document.querySelector('.gift-card');
  const line = card.querySelector('.gift-line');
  const subline = card.querySelector('.gift-subline');
  const button = card.querySelector('.open-gift');

  card.querySelector('span').textContent = '🌸';
  line.textContent = 'حقك علي يا روجا 🤍';
  subline.textContent = 'جعله آخر زعل يا رب.. انزلي شوفي الكلام اللي من قلبي 🎀';
  button.style.display = 'none';

  setTimeout(() => {
    enterGift();
  }, 2200);
};

// تكبير الصور Lightbox
const light = document.querySelector('.lightbox');
document.addEventListener('click', e => {
  if (body.classList.contains('admin-mode')) return;
  const p = e.target.closest('.photo');
  if (!p) return;
  const img = p.querySelector('img');
  const fig = p.querySelector('figcaption');
  if (light && img) {
    light.querySelector('img').src = img.src;
    light.querySelector('p').textContent = fig ? fig.textContent : '';
    light.classList.add('show');
  }
});

if (light) {
  light.querySelector('button').onclick = () => light.classList.remove('show');
  light.onclick = e => {
    if (e.target === light) light.classList.remove('show');
  };
}

// كشف بطاقة الوعد الختامي
const revealVideoBtn = document.querySelector('.reveal-video');
if (revealVideoBtn) {
  revealVideoBtn.onclick = () => {
    document.querySelector('.video-before').style.display = 'none';
    const content = document.querySelector('.video-content');
    if (content) {
      content.style.display = 'block';
    }
  };
}

const forgiveBtn = document.querySelector('#forgive-btn');
if (forgiveBtn) {
  forgiveBtn.onclick = () => {
    forgiveBtn.style.display = 'none';
    const msg = document.querySelector('#forgive-msg');
    if (msg) msg.style.display = 'block';
  };
}

// مراقبة ظهور عناصر الصور
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.photo').forEach((p, i) => setTimeout(() => p.classList.add('reveal'), i * 80));
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

// بدء التشغيل
(async function init() {
  initExtraStickers();
  makePhotos('صغيره', document.querySelector('.childhood'));
  makePhotos('flowers', document.querySelector('.album-wall'));
  setupAudioPlayer();
  setupStickerInteractions();
  document.querySelectorAll('.photo-wall').forEach(x => observer.observe(x));

  // جلب البيانات من السيرفر وتطبيقها
  await loadServerData();
  prepareEditable();
})();
