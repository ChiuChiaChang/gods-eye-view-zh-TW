// Traditional Chinese UI layer for the ChiuChiaChang fork.
// Version: 1.0.0
// Keeps upstream application logic/data untouched and translates only curated UI text.

export const GEV_ZH_TW_VERSION = '1.0.1';
export const GEV_LANGUAGE_STORAGE_KEY = 'gev:ui-language:v1';

const TEXT = Object.freeze({
  "NO PLACE LEFT BEHIND": "無處遺漏",
  "ACTIVE STYLE": "目前風格",
  "NORMAL": "一般",
  "LOADING LIVE DATA": "正在載入即時資料",
  "syncing road network": "正在同步道路網路",
  "loading frames": "正在載入畫面",
  "VISUAL PRESETS": "視覺預設",
  "Normal": "一般",
  "Anime": "動漫",
  "Noir": "黑白電影",
  "Snow": "雪景",
  "MAP SOURCE": "地圖來源",
  "Style": "風格",
  "LOCATION": "位置",
  "📍 Location: --": "📍 位置：--",
  "Landmark: --": "地標：--",
  "DISPLAY": "顯示",
  "Layout": "版面",
  "Tactical": "戰術",
  "Operator": "操作員",
  "Minimal": "精簡",
  "DETECT": "偵測",
  "Density": "密度",
  "Allocation": "配置",
  "Elastic": "彈性",
  "Weighted": "加權",
  "Fade": "淡出",
  "Outside": "外部",
  "PARAMETERS": "參數",
  "Models": "模型",
  "Proximity": "鄰近",
  "All": "全部",
  "Scope": "視野框",
  "Feather": "柔邊",
  "Draw": "繪圖",
  "Shape": "形狀",
  "Area": "區域",
  "Line": "線段",
  "Pin": "圖釘",
  "Primary": "主要",
  "Amber": "琥珀",
  "Cyan": "青色",
  "Green": "綠色",
  "Red": "紅色",
  "Clear": "清除",
  "Celestial": "天體",
  "Clean UI": "簡潔介面",
  "Bloom": "光暈",
  "Sharpen": "銳化",
  "EXIT CLEAN VIEW": "離開簡潔介面",
  "DATA LAYERS": "資料圖層",
  "CCTV OFF": "CCTV 關閉",
  "CCTV ON": "CCTV 開啟",
  "NEAREST": "最近",
  "PREV": "上一個",
  "NEXT": "下一個",
  "FOCUS": "聚焦",
  "COVERAGE OFF": "覆蓋範圍關閉",
  "COVERAGE ON": "覆蓋範圍開啟",
  "AUTO HOP OFF": "自動切換關閉",
  "AUTO HOP ON": "自動切換開啟",
  "PROJECTION ON": "投影開啟",
  "PROJECTION OFF": "投影關閉",
  "CALIBRATION": "校正",
  "ADJUST": "調整",
  "SAVE CAL": "儲存校正",
  "RESET CAL": "重設校正",
  "SCENE SUMMARY": "場景摘要",
  "SCENES": "場景",
  "NEW": "新增",
  "DEL": "刪除",
  "CAPTURE SHOT": "擷取鏡頭",
  "UPDATE SHOT": "更新鏡頭",
  "START": "開始",
  "STOP": "停止",
  "EXPORT PRESETS": "匯出預設",
  "IMPORT": "匯入",
  "RUN LOG": "執行紀錄",
  "Ready": "就緒",
  "CONTEXT": "情境",
  "RADIO": "無線電",
  "RADIO READY": "無線電就緒",
  "ENABLE": "啟用",
  "DISABLE": "停用",
  "VOLUME": "音量",
  "CONTACTS": "即時目標",
  "SPACE MISSIONS": "太空任務",
  "SELECT CONTEXT": "選擇情境",
  "CONTACTS — nearest planes · vessels · sites": "即時目標 — 最近的飛機 · 船舶 · 設施",
  "SPACE MISSIONS — launches & orbital assets": "太空任務 — 發射任務與軌道資產",
  "COCKPIT": "駕駛艙",
  "SEARCH NEARBY SITES": "搜尋附近設施",
  "CONTACTS CONTEXT OFF": "即時目標情境關閉",
  "SELECT CONTACTS TO LOAD OBSERVED / MAPPED PROXIMITY": "選擇即時目標以載入觀測／地圖鄰近資訊",
  "AVAILABLE MISSIONS": "可用任務",
  "SELECT A MISSION TO INSPECT": "選擇要查看的任務",
  "LOADING 30-DAY MISSION INDEX": "正在載入 30 天任務索引",
  "TAB PREVIEWS · ENTER / SPACE SELECTS": "TAB 預覽 · ENTER / SPACE 選取",
  "OFF": "關閉",
  "STATION TAG": "電台標籤",
  "NO STATION SELECTED": "尚未選擇電台",
  "Enable Radio, then choose a globe marker or use next.": "啟用無線電後，選擇地球上的標記或使用「下一個」。",
  "DIRECTORY BAND": "目錄頻段",
  "DRAG TO TUNE": "拖曳調台",
  "ALL · DRAG THE NEEDLE": "全部 · 拖曳指針",
  "SNAPS TO AVAILABLE STATIONS": "自動吸附至可用電台",
  "PLAY": "播放",
  "Radio off": "無線電關閉",
  "STATION SITE": "電台網站",
  "DIRECTORY: RADIO BROWSER": "目錄：RADIO BROWSER",
  "MISSION CONTROL · FIRST LAUNCH": "任務控制 · 首次啟動",
  "Choose your first view": "選擇第一個視角",
  "It feels like a forbidden cockpit—then you realize the sources are public and the data is real.": "它看起來像一個不該被看見的控制台，但其實資料來源都是公開的，而且資料是真實的。",
  "LIVE CONTACTS": "即時目標",
  "Aircraft, vessels and nearby intelligence": "飛機、船舶與附近情報",
  "Launches, spacecraft and orbital context": "發射任務、太空載具與軌道資訊",
  "ENVIRONMENTAL": "環境監測",
  "EARTH WATCH": "地球監測",
  "ACTIVE EVENTS": "即時事件",
  "Live earthquakes and active fires, from USGS and NASA": "來自 USGS 與 NASA 的即時地震與火災資訊",
  "EXPLORE MANUALLY": "手動探索",
  "Begin with a clean globe": "從乾淨的地球開始",
  "Don't show this again": "不要再顯示",
  "ESC to dismiss": "按 ESC 關閉",
  "Tip: the GEV MIC button in the dock lets you talk to the map.": "提示：使用控制列中的 GEV MIC 按鈕，即可用語音操作地圖。",
  "POWER UP": "功能設定",
  "POWERED UP": "功能已就緒",
  "GROUND STATION · PROVIDER SETTINGS": "地面站 · 服務提供者設定",
  "Power up the globe": "啟用更多地球功能",
  "The globe already flies keyless. Every key below switches on another real feed — paste one and it's saved into this app's local configuration, then the server restarts itself. Server-side keys stay on this machine; Google Maps and Cesium ion run in the browser and must be provider-restricted. Keys you configured elsewhere are shown but never touched.": "即使沒有 API Key，地球功能仍可運作。下方每一組金鑰都能啟用額外的即時資料來源；貼上後會儲存在本機設定，伺服器會自動重新啟動。伺服器端金鑰只留在這台電腦；Google Maps 與 Cesium ion 會在瀏覽器端使用，請務必在服務提供者端限制使用範圍。從其他位置設定的金鑰只會顯示狀態，不會被修改。",
  "SAVE KEYS": "儲存金鑰",
  "ESC to close": "按 ESC 關閉",
  "The Google Maps key buys the photorealistic planet — everything else stacks on top.": "Google Maps 金鑰可啟用擬真的 3D 地球；其他資料來源會疊加在其上。",
  "browser-side": "瀏覽器端",
  "configured externally": "由外部設定",
  "MANAGE ↗": "管理 ↗",
  "GET KEY ↗": "取得金鑰 ↗",
  "REMOVE": "移除",
  "Saving…": "正在儲存…",
  "Paste at least one key first.": "請先貼上至少一組金鑰。",
  "FIRST PERSON": "第一人稱",
  "LEVEL": "水平",
  "GROUND SPEED": "地速",
  "ALTITUDE": "高度",
  "CURRENT": "目前",
  "AIRCRAFT": "飛機",
  "LIVE TRACK · COURSE ALIGNED": "即時追蹤 · 航向對齊",
  "CONTACT": "目標",
  "CONTACTS · 250 KM": "即時目標 · 250 KM",
  "CONTEXT ONLY": "僅情境資訊",
  "NEAREST OBSERVED / MAPPED": "最近觀測／地圖目標",
  "NO AVAILABLE EXAMPLE": "目前沒有可用目標",
  "AVAILABLE INPUTS ONLY · NOT AN ALL-CLEAR": "僅顯示目前可取得資料 · 不代表區域安全",
  "ESTIMATED FLIGHT PLAN": "預估航程",
  "ROUTE DATA UNAVAILABLE": "航線資料無法取得",
  "FROM": "出發",
  "TO": "抵達",
  "UNKNOWN": "未知",
  "LIVE SIGNALS": "即時訊號",
  "OBSERVED / MAPPED PINGS": "觀測／地圖訊號",
  "ACQUIRING REGIONAL NEWS": "正在取得區域新聞",
  "RESOLVING REGION": "正在解析區域",
  "TEMP": "溫度",
  "WIND": "風速",
  "SKY": "天空",
  "PRECIP": "降雨",
  "SOURCE-BACKED EVENTS · NO SYNTHETIC NEWS": "來源可追溯事件 · 無合成新聞",
  "NEWS": "新聞",
  "LOCAL": "當地",
  "READY": "就緒",
  "RESET": "重設",
  "EXIT COCKPIT": "離開駕駛艙",
  "Flights": "民航班機",
  "Military": "軍用航空",
  "Military Aircraft": "軍用航空器",
  "Earthquakes": "地震",
  "ALPR Cameras": "車牌辨識攝影機",
  "Satellites": "衛星",
  "Rocket Launches": "火箭發射",
  "Traffic": "交通",
  "Radio": "無線電",
  "Transit": "大眾運輸",
  "Bikeshare": "共享單車",
  "Directions": "路線",
  "AIS Live Vessels": "AIS 即時船舶",
  "Vessels": "船舶",
  "Military Installations": "軍事設施",
  "Military Awareness": "軍事態勢",
  "Datacenters": "資料中心",
  "Dams": "水壩",
  "Submarine Cables": "海底電纜",
  "FIRMS Active Fires": "FIRMS 活躍火災",
});

const ATTR = Object.freeze({
  "Visible map targets": "可見地圖目標",
  "Globe actions": "地球操作",
  "Clear selected data layers": "清除已選資料圖層",
  "Turn off all selected data layers": "關閉所有已選資料圖層",
  "Copy share link": "複製分享連結",
  "Tilt map to oblique view": "將地圖傾斜為斜視角",
  "Toggle straight-down and tilted map views": "切換垂直俯視與傾斜地圖視角",
  "Reset map to north up": "將地圖重設為北向上",
  "Reset map bearing to north": "將地圖方位重設為北方",
  "Reset to full globe view": "重設為完整地球視角",
  "Reset camera and return to full globe view": "重設攝影機並返回完整地球視角",
  "Navigation, voice, and visual preset controls": "導航、語音與視覺預設控制",
  "Expand Visual Presets": "展開視覺預設",
  "Pin visual presets": "固定視覺預設",
  "Keep visual presets open": "保持視覺預設開啟",
  "Map source": "地圖來源",
  "Expand LOCATION": "展開位置",
  "Collapse panel": "收合面板",
  "Pin location tray": "固定位置面板",
  "Keep location tray open": "保持位置面板開啟",
  "Search any location": "搜尋任意位置",
  "Search any location...": "搜尋任意位置...",
  "Search location by name or coordinates": "依名稱或座標搜尋位置",
  "Intelligence HUD (H)": "情報 HUD (H)",
  "HUD layout": "HUD 版面",
  "Detection Overlay (D)": "偵測覆蓋層 (D)",
  "Detection overlay": "偵測覆蓋層",
  "Detection label density": "偵測標籤密度",
  "Detection label allocation": "偵測標籤配置",
  "Detection fade distance": "偵測淡出距離",
  "Detection opacity outside the keyhole": "視野框外的偵測透明度",
  "3D model coverage": "3D 模型顯示範圍",
  "Scope edge feather": "視野框邊緣柔化",
  "Shape to draw": "繪製形狀",
  "Label (optional)": "標籤（選填）",
  "Label for the drawn shape": "繪製形狀的標籤",
  "Colour of the drawn shape": "繪製形狀的顏色",
  "Remove every mark from the board": "移除所有繪製標記",
  "Hide UI chrome": "隱藏介面控制項",
  "Return UI controls": "返回介面控制項",
  "CCTV feed frame": "CCTV 即時畫面",
  "CCTV camera": "CCTV 攝影機",
  "Scene recipe": "場景設定",
  "Context mode": "情境模式",
  "CONTACTS": "即時目標",
  "Available Space Missions": "可用太空任務",
  "Internet radio companion": "網路無線電",
  "Close key setup": "關閉金鑰設定",
  "Aircraft cockpit view": "飛機駕駛艙視角",
  "Cockpit vision style": "駕駛艙視覺風格",
  "Current aircraft heading": "目前飛機航向",
  "Contact cockpit summary": "駕駛艙目標摘要",
  "Nearby cohort counts": "附近目標數量",
  "Cockpit briefing carousel": "駕駛艙簡報輪播",
  "Estimated flight plan": "預估航程",
  "Cockpit briefing controls": "駕駛艙簡報控制",
  "Latest regional news": "最新區域新聞",
  "Location-based information": "依位置取得的資訊",
  "Cockpit display and Radio controls": "駕駛艙顯示與無線電控制",
  "View switcher": "視角切換",
  "Reset cockpit to full globe view": "將駕駛艙重設為完整地球視角",
  "Exit cockpit and return to full globe view": "離開駕駛艙並返回完整地球視角",
  "Exit cockpit view": "離開駕駛艙視角",
});

const REVERSE_TEXT = new Map(Object.entries(TEXT).map(([en, zh]) => [zh, en]));
const REVERSE_ATTR = new Map(Object.entries(ATTR).map(([en, zh]) => [zh, en]));
const textState = new WeakMap();
const attrState = new WeakMap();

let currentLanguage = 'zh-TW';
let observer = null;
let applying = false;

function normalizeLanguage(value) {
  return value === 'en' ? 'en' : 'zh-TW';
}

function safeStoredLanguage() {
  try {
    return normalizeLanguage(globalThis.localStorage?.getItem?.(GEV_LANGUAGE_STORAGE_KEY));
  } catch {
    return 'zh-TW';
  }
}

function rememberLanguage(language) {
  try {
    globalThis.localStorage?.setItem?.(GEV_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage may be blocked; the current page can still switch language.
  }
}

function splitOuterWhitespace(value) {
  const match = String(value ?? '').match(/^(\s*)([\s\S]*?)(\s*)$/);
  return { lead: match?.[1] || '', core: match?.[2] || '', tail: match?.[3] || '' };
}

function zhDynamic(text) {
  let match = text.match(/^POWER UP · (\d+) KEYS? WAITING$/);
  if (match) return `功能設定 · 還有 ${match[1]} 個金鑰`;

  match = text.match(/^Error:\s*(.+)$/);
  if (match) return `錯誤：${match[1]}`;

  match = text.match(/^Location:\s*(.+)$/);
  if (match) return `位置：${match[1]}`;

  match = text.match(/^Landmark:\s*(.+)$/);
  if (match) return `地標：${match[1]}`;

  if (text === 'Starting live contacts…') return '正在啟動即時目標…';
  if (text === 'Opening space missions…') return '正在開啟太空任務…';
  if (text === 'Scanning active events…') return '正在掃描即時事件…';
  if (text === 'Initializing photorealistic world...') return '正在初始化擬真 3D 世界...';

  return text;
}

function translateText(source) {
  if (currentLanguage === 'en') return source;
  return TEXT[source] ?? zhDynamic(source);
}

function translateAttr(source) {
  if (currentLanguage === 'en') return source;
  return ATTR[source] ?? TEXT[source] ?? zhDynamic(source);
}

function processTextNode(node) {
  if (!node?.nodeValue) return;
  const { lead, core, tail } = splitOuterWhitespace(node.nodeValue);
  if (!core) return;

  const previous = textState.get(node);
  let source = previous?.source ?? core;
  if (!previous || core !== previous.rendered) {
    source = REVERSE_TEXT.get(core) ?? core;
  }

  const rendered = translateText(source);
  textState.set(node, { source, rendered });
  if (core !== rendered) node.nodeValue = `${lead}${rendered}${tail}`;
}

function processAttribute(element, name) {
  if (!element?.hasAttribute?.(name)) return;
  const raw = element.getAttribute(name);
  if (!raw) return;

  let states = attrState.get(element);
  if (!states) {
    states = new Map();
    attrState.set(element, states);
  }
  const previous = states.get(name);
  let source = previous?.source ?? raw;
  if (!previous || raw !== previous.rendered) {
    source = REVERSE_ATTR.get(raw) ?? REVERSE_TEXT.get(raw) ?? raw;
  }

  const rendered = translateAttr(source);
  states.set(name, { source, rendered });
  if (raw !== rendered) element.setAttribute(name, rendered);
}

function processElement(element) {
  if (!element || element.nodeType !== 1) return;
  for (const name of ['aria-label', 'title', 'placeholder']) {
    processAttribute(element, name);
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (!node.parentElement?.closest?.('#gev-language-toggle')) processTextNode(node);
    node = walker.nextNode();
  }

  for (const child of element.querySelectorAll?.('[aria-label], [title], [placeholder]') || []) {
    for (const name of ['aria-label', 'title', 'placeholder']) {
      processAttribute(child, name);
    }
  }
}

function renderLanguageToggle() {
  const button = document.getElementById('gev-language-toggle');
  if (!button) return;
  const isZh = currentLanguage === 'zh-TW';
  const text = isZh ? '繁中 · EN' : 'EN · 繁中';
  const ariaLabel = isZh ? '切換為 English' : 'Switch to Traditional Chinese';
  const title = isZh ? 'Switch to English' : '切換為繁體中文';

  // Do not write identical DOM values. MutationObserver watches this page, and
  // repeatedly setting the same text/attributes can create a self-sustaining
  // mutation loop that starves application startup.
  if (button.textContent !== text) button.textContent = text;
  if (button.getAttribute('aria-label') !== ariaLabel)
    button.setAttribute('aria-label', ariaLabel);
  if (button.getAttribute('title') !== title)
    button.setAttribute('title', title);
  if (button.dataset.language !== currentLanguage)
    button.dataset.language = currentLanguage;
}

function installToggle() {
  if (document.getElementById('gev-language-toggle')) return;
  const button = document.createElement('button');
  button.id = 'gev-language-toggle';
  button.type = 'button';
  button.addEventListener('click', () => {
    setUiLanguage(currentLanguage === 'zh-TW' ? 'en' : 'zh-TW');
  });

  const style = document.createElement('style');
  style.id = 'gev-zh-tw-style';
  style.textContent = `
    html[lang="zh-TW"] body {
      font-family: Inter, "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif;
    }
    #gev-language-toggle {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 12000;
      min-width: 78px;
      padding: 7px 10px;
      border: 1px solid rgba(95, 231, 255, .55);
      border-radius: 8px;
      background: rgba(5, 13, 22, .78);
      color: #dffbff;
      font: 600 11px/1.1 "JetBrains Mono", "Microsoft JhengHei", monospace;
      letter-spacing: .04em;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 18px rgba(58, 207, 255, .12);
      cursor: pointer;
    }
    #gev-language-toggle:hover,
    #gev-language-toggle:focus-visible {
      border-color: rgba(129, 239, 255, .95);
      background: rgba(8, 24, 36, .92);
      outline: none;
    }
    html[lang="zh-TW"] .panel-title,
    html[lang="zh-TW"] .pp-header-label,
    html[lang="zh-TW"] .first-run-kicker,
    html[lang="zh-TW"] .key-setup-kicker {
      letter-spacing: .08em;
    }
  `;
  document.head.append(style);
  document.body.append(button);
  renderLanguageToggle();
}

function applyDocument() {
  applying = true;
  try {
    document.documentElement.lang = currentLanguage;
    document.title =
      currentLanguage === 'zh-TW'
        ? "God's Eye View · 繁體中文"
        : "God's Eye View";
    processElement(document.body);
    renderLanguageToggle();
  } finally {
    applying = false;
  }
}

export function setUiLanguage(language, { persist = true } = {}) {
  currentLanguage = normalizeLanguage(language);
  if (persist) rememberLanguage(currentLanguage);
  applyDocument();
  globalThis.dispatchEvent?.(
    new CustomEvent('gev:languagechange', {
      detail: { language: currentLanguage, version: GEV_ZH_TW_VERSION },
    }),
  );
}

export function getUiLanguage() {
  return currentLanguage;
}

export function initTraditionalChineseUi() {
  currentLanguage = safeStoredLanguage();
  installToggle();
  applyDocument();

  observer?.disconnect?.();
  observer = new MutationObserver((mutations) => {
    if (applying) return;
    applying = true;
    try {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          if (!mutation.target.parentElement?.closest?.('#gev-language-toggle')) {
            processTextNode(mutation.target);
          }
          continue;
        }
        if (mutation.type === 'attributes') {
          // The language switch owns its own accessible labels. Never feed its
          // mutations back into the localization observer.
          if (mutation.target?.id !== 'gev-language-toggle')
            processAttribute(mutation.target, mutation.attributeName);
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE && node.id !== 'gev-language-toggle')
            processElement(node);
        }
      }
    } finally {
      applying = false;
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-label', 'title', 'placeholder'],
  });

  return {
    get language() {
      return currentLanguage;
    },
    version: GEV_ZH_TW_VERSION,
    setLanguage: setUiLanguage,
    destroy() {
      observer?.disconnect?.();
      observer = null;
      document.getElementById('gev-language-toggle')?.remove();
      document.getElementById('gev-zh-tw-style')?.remove();
    },
  };
}
