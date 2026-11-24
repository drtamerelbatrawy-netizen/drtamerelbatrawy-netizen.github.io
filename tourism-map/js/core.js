/* ==========================================================================
   تليسكوب السوق السعودي – المؤشرات السياحية: النواة (نموذج البيانات)
   الوحدات (مملكة/منطقة/محافظة/مدينة) في شجرة واحدة مأخوذة من برنامج السكان،
   والمؤشرات السياحية من data/tourism.js (يُولَّد بسكربت build/build_tourism.py).
   ========================================================================== */
(function () {
  'use strict';
  const D = window.KSA_DATA, TD = window.TOUR_DATA;
  const LS_KEY = 'ksa-tourism-settings-v1';
  const YEAR = TD.year;
  const NAT = TD.national;

  const LEVELS = {
    country: { name: 'المملكة', plural: 'المملكة', child: 'region' },
    region: { name: 'منطقة', plural: 'المناطق', child: 'gov' },
    gov: { name: 'محافظة', plural: 'المحافظات', child: 'city' },
    city: { name: 'مدينة / تجمع', plural: 'المدن والتجمعات', child: null },
  };
  const CONF = {
    official: { t: 'رسمي', c: 'off', d: 'رقم منشور كما هو من وزارة السياحة' },
    anchored: { t: 'مرجعي', c: 'mid', d: 'مبني على أرقام رسمية للمدينة/الحاضرة مع توزيع بنسب منشورة' },
    share21: { t: 'حصة رسمية 2021', c: 'mid', d: 'حصة المحافظة الرسمية من سياح منطقتها في إحصاءات وزارة السياحة 2021 مطبقة على رقم المنطقة 2025' },
    partial: { t: 'رسمي جزئياً', c: 'mid', d: 'المدينة الرئيسية رسمية والباقي تقدير' },
    estimate: { t: 'تقدير', c: 'est', d: 'غير منشور على هذا المستوى: نصيب من رقم المنطقة («محافظات أخرى») حسب عدد السكان' },
  };

  function loadSettings() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (e) { s = {}; }
    return { basemap: s.basemap || 'none', metric: s.metric || 'dv' };
  }
  const settings = loadSettings();
  function saveSettings() { try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch (e) { } }

  // ------------------------------------------------------------ tree
  const units = new Map();
  const country = { id: 'KSA', level: 'country', name: 'المملكة العربية السعودية', parent: null, pop: D.meta.national.pop, children: [] };
  units.set('KSA', country);
  D.units.forEach(u => { u.children = []; u.t = TD.t[u.id] || null; units.set(u.id, u); });
  D.units.forEach(u => { const p = units.get(u.parent); if (p) p.children.push(u); });
  const dvOf = u => (u.t && u.t.dv) || 0;
  units.forEach(u => u.children.sort((a, b) => dvOf(b) - dvOf(a)));
  country.area = 0; country.children.forEach(r => country.area += r.area || 0);

  function regionOf(u) { while (u && u.level !== 'region') u = units.get(u.parent); return u || null; }
  function ancestors(u) { const out = []; while (u) { out.unshift(u); u = units.get(u.parent); } return out; }

  // population in the data year (census 2022 × 2.5% a year, same rule as the population map)
  const popFactor = Math.pow(1 + D.meta.default_growth, YEAR - D.meta.base_year);

  const REGION_KEYS = ['inb_visits_k', 'inb_spend_main_m', 'inb_spend_sec_m', 'inb_spend_m', 'total_spend_m', 'jobs_k', 'facilities', 'rooms', 'rooms_hotel', 'rooms_apt'];
  const cache = new Map();
  /** Tourism profile of a unit: values in units (visitors, SAR), plus confidence. */
  function profile(u) {
    if (cache.has(u.id)) return cache.get(u.id);
    let p;
    if (u.level === 'country') {
      p = { dv: 0, ds: 0, iv: 0, is: 0, ts: 0, jobs: 0, fac: 0, rooms: 0, roomsH: 0, roomsA: 0, pop: 0, occN: 0, adrN: 0 };
      u.children.forEach(r => {
        const q = profile(r);
        ['dv', 'ds', 'iv', 'is', 'ts', 'jobs', 'fac', 'rooms', 'roomsH', 'roomsA', 'pop'].forEach(k => p[k] += q[k] || 0);
      });
      p.occ = NAT.y2025.occ / 100; p.adr = NAT.y2025.adr; p.revpar = NAT.y2025.revpar;
      p.conf = 'official'; p.inbOfficial = true; p.hospOfficial = true;
      p.inbTourists = NAT.y2025.inb_m * 1e6;
    } else {
      const t = u.t || {};
      p = { dv: (t.dv || 0) * 1e3, ds: (t.ds || 0) * 1e6, conf: t.conf || 'estimate', basis: t.basis || '', pop: u.pop * popFactor, dest: t.dest || null, y2021: t.y2021 || null, extra: t.extra || null };
      if (u.level === 'region') {
        Object.assign(p, {
          iv: t.inb_visits_k * 1e3, is: t.inb_spend_m * 1e6, isMain: t.inb_spend_main_m * 1e6, isSec: t.inb_spend_sec_m * 1e6,
          ts: t.total_spend_m * 1e6, jobs: t.jobs_k * 1e3, fac: t.facilities, rooms: t.rooms, roomsH: t.rooms_hotel, roomsA: t.rooms_apt,
          occ: t.occupancy_pct / 100, adr: t.adr_sar, revpar: t.revpar_sar, dv2023: t.dom_visitors_2023_k ? t.dom_visitors_2023_k * 1e3 : null,
          inbOfficial: true, hospOfficial: true,
        });
      } else {
        p.region = regionOf(u);
        p.inbOfficial = false; p.hospOfficial = false;
      }
    }
    p.spv = p.dv ? p.ds / p.dv : null;
    p.dvpc = p.pop ? p.dv / p.pop : null;
    p.year = YEAR;
    cache.set(u.id, p);
    return p;
  }

  // ------------------------------------------------------------ choropleth metrics
  // levels: where the figure is published. Below that, the map colours each unit by its region's value.
  const METRICS = {
    dv: { label: 'السياح المحليون', fmt: v => fmtCompact(v), get: p => p.dv },
    ds: { label: 'إنفاق السياحة المحلية (ريال)', fmt: v => fmtCompact(v), get: p => p.ds },
    dvpc: { label: 'سياح محليون لكل ساكن', fmt: v => v == null ? '—' : v.toFixed(2), get: p => p.dvpc },
    spv: { label: 'متوسط إنفاق السائح المحلي (ريال)', fmt: v => fmtInt(v), get: p => p.spv },
    iv: { label: 'زيارات السياح الوافدين', fmt: v => fmtCompact(v), get: p => p.iv, levels: ['region'] },
    is: { label: 'إنفاق السياح الوافدين (ريال)', fmt: v => fmtCompact(v), get: p => p.is, levels: ['region'] },
    ts: { label: 'إجمالي الإنفاق السياحي (ريال)', fmt: v => fmtCompact(v), get: p => p.ts, levels: ['region'] },
    rooms: { label: 'غرف الضيافة المرخصة', fmt: v => fmtInt(v), get: p => p.rooms, levels: ['region'] },
    fac: { label: 'مرافق الضيافة المرخصة', fmt: v => fmtInt(v), get: p => p.fac, levels: ['region'] },
    occ: { label: 'نسبة الإشغال', fmt: v => fmtPct(v, 0), get: p => p.occ, levels: ['region'] },
    adr: { label: 'متوسط سعر الغرفة اليومي (ريال)', fmt: v => fmtInt(v), get: p => p.adr, levels: ['region'] },
    jobs: { label: 'الوظائف السياحية', fmt: v => fmtCompact(v), get: p => p.jobs, levels: ['region'] },
  };

  const nf0 = new Intl.NumberFormat('ar-SA-u-nu-latn', { maximumFractionDigits: 0 });
  function fmtInt(v) { return v == null || isNaN(v) ? '—' : nf0.format(Math.round(v)); }
  function fmtPct(v, d = 1) { return v == null || isNaN(v) ? '—' : (v * 100).toFixed(d) + '٪'; }
  function fmtCompact(v) {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e9) return (v / 1e9).toFixed(v >= 1e10 ? 1 : 2) + ' مليار';
    if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 1 : 2) + ' مليون';
    if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e5 ? 0 : 1) + ' ألف';
    return fmtInt(v);
  }

  const modules = [], listeners = [];
  window.KSA = {
    YEAR, NAT, LEVELS, CONF, METRICS, units, country, settings, saveSettings,
    profile, regionOf, ancestors, fmtInt, fmtPct, fmtCompact,
    registerModule(m) { modules.push(m); listeners.forEach(fn => fn('modules')); },
    modules, onChange(fn) { listeners.push(fn); }, emit(w) { listeners.forEach(fn => fn(w)); },
  };
})();
