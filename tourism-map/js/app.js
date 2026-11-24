/* ==========================================================================
   تليسكوب السوق السعودي – الخريطة واللوحة الجانبية
   ========================================================================== */
(function () {
  'use strict';
  const K = window.KSA, G = window.KSA_GEO;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------- official governorate boundaries (optional file)
  if (G.governorates_official) {
    const feats = G.governorates_official.features;
    const govs = [...K.units.values()].filter(u => u.level === 'gov' && u.pt).sort((a, b) => b.pop - a.pop);
    const owner = new Map();   // feature index -> gov
    // pass 0: governorates whose seat coordinates are off, linked by geoBoundaries shapeName
    const PIN = {
      G1_5: 'Ad Diriyah', G1_21: 'Al Hariq', G2_1: 'Jiddah', G2_6: 'Bahrah', G3_8: 'Wadi Al Fara', G5_5: 'Al Jubayl Governorate',
      G6_4: 'Bishah', G6_16: 'Al Harjah', G7_6: 'Haqil', G10_17: 'Al Harth', G12_7: 'Al Qara', G12_10: 'Al Hajrah',
    };
    govs.forEach(u => { const n = PIN[u.id]; if (!n) return; const i = feats.findIndex(f => f.properties && f.properties.shapeName === n); if (i >= 0 && !owner.has(i)) owner.set(i, u); });
    const pinned = new Set(owner.values());
    // pass 1: polygon that contains the seat; if several seats share one polygon, the most populous wins
    govs.filter(u => !pinned.has(u)).forEach(u => { const i = feats.findIndex((f, k) => !owner.has(k) && pointInGeom(u.pt, f.geometry)); if (i >= 0 && !owner.has(i)) owner.set(i, u); });
    // pass 2: seat fell just outside (coast, simplified edge): nearest free polygon within ~25 km
    const taken = new Set(owner.values());
    govs.filter(u => !taken.has(u)).forEach(u => {
      let best = -1, bd = 0.25;
      feats.forEach((f, i) => { if (owner.has(i)) return; const d = distToGeom(u.pt, f.geometry); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) { owner.set(best, u); taken.add(u); }
    });
    const out = [];
    owner.forEach((u, i) => { out.push({ type: 'Feature', id: u.id, properties: { id: u.id }, geometry: feats[i].geometry }); u.area = geoArea(feats[i].geometry); u.officialGeom = true; });
    govs.filter(u => !taken.has(u)).forEach(u => { const old = G.governorates.features.find(x => x.id === u.id); if (old) out.push(old); });
    G.governorates = { type: 'FeatureCollection', features: out };
  }
  function distToGeom(pt, g) {
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    let m = Infinity;
    polys.forEach(p => p.forEach(r => { for (let i = 0; i < r.length - 1; i++) m = Math.min(m, segDist(pt, r[i], r[i + 1])); }));
    return m;
  }
  function segDist(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
    let t = L2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
    const x = a[0] + t * dx - p[0], y = a[1] + t * dy - p[1];
    return Math.sqrt(x * x + y * y);
  }
  function pointInRing(pt, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function pointInGeom(pt, g) {
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    return polys.some(p => pointInRing(pt, p[0]) && !p.slice(1).some(h => pointInRing(pt, h)));
  }
  function geoArea(g) {
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    let a = 0;
    polys.forEach(p => p.forEach((ring, k) => {
      let s = 0;
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i], [x2, y2] = ring[i + 1];
        s += (x2 - x1) * Math.PI / 180 * (2 + Math.sin(y1 * Math.PI / 180) + Math.sin(y2 * Math.PI / 180));
      }
      a += (k ? -1 : 1) * Math.abs(s * 6378.137 * 6378.137 / 2);
    }));
    return Math.round(a * 100) / 100;
  }

  // ---------------------------------------------------------------- map
  const map = L.map('map', { zoomControl: false, minZoom: 4, maxZoom: 18, preferCanvas: false, zoomSnap: 0.5 })
    .fitBounds([[16.3, 34.5], [32.2, 55.7]]);
  L.control.zoom({ position: 'topleft' }).addTo(map);
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

  const BASEMAPS = {
    // keyless Esri tiles: work when the page is opened as a local file (OSM/CARTO refuse file:// pages)
    osm: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri, HERE, Garmin, © OpenStreetMap' }),
    light: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, attribution: 'Esri, HERE, Garmin, © OpenStreetMap' }),
    sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri World Imagery' }),
  };
  let baseLayer = null;
  function setBasemap(k) {
    if (baseLayer) map.removeLayer(baseLayer);
    if (!BASEMAPS[k]) k = 'none';
    baseLayer = k === 'none' ? null : BASEMAPS[k].addTo(map);
    K.settings.basemap = k; K.saveSettings();
    document.querySelectorAll('[data-basemap]').forEach(b => b.classList.toggle('on', b.dataset.basemap === k));
  }
  setBasemap(K.settings.basemap);

  map.createPane('polys'); map.getPane('polys').style.zIndex = 410;
  map.createPane('outlines'); map.getPane('outlines').style.zIndex = 420; map.getPane('outlines').style.pointerEvents = 'none';
  map.createPane('points'); map.getPane('points').style.zIndex = 430;
  map.createPane('labels'); map.getPane('labels').style.zIndex = 440; map.getPane('labels').style.pointerEvents = 'none';

  // sequential palette (sand → deep teal), 7 classes
  const PAL = ['#f3efe2', '#e2e3c6', '#bfd8b0', '#8cc2a2', '#55a395', '#2c7f80', '#165a66'];
  let breaks = {};
  const metric = () => K.METRICS[K.settings.metric];
  const published = (m, level) => !m.levels || m.levels.includes(level);
  /** value used for colouring: below the published level, the unit takes its region's value */
  function valueFor(u) {
    const m = metric();
    if (!published(m, u.level)) { const r = K.regionOf(u); return r ? m.get(K.profile(r)) : null; }
    return m.get(K.profile(u));
  }
  function computeBreaks(level, inView) {
    const m = metric();
    const lv = published(m, level) ? level : 'region';
    let pool = [...K.units.values()].filter(u => u.level === lv);
    if (inView && lv === level && layers[level]) {
      const vb = map.getBounds(), ids = new Set();
      layers[level].eachLayer(l => { if (vb.intersects(l.getBounds())) ids.add(l.feature.id); });
      if (ids.size >= 8) pool = pool.filter(u => ids.has(u.id));
    }
    const vals = pool.map(u => m.get(K.profile(u))).filter(v => v != null && isFinite(v) && v > 0).sort((a, b) => a - b);
    if (!vals.length) return [];
    const q = [];
    for (let i = 1; i < PAL.length; i++) q.push(vals[Math.min(vals.length - 1, Math.floor(i * vals.length / PAL.length))]);
    return q;
  }
  function colorFor(u) {
    const v = valueFor(u);
    if (v == null || !isFinite(v)) return '#d9d9d9';
    const b = breaks[u.level] || [];
    let i = 0; while (i < b.length && v >= b[i]) i++;
    return PAL[i];
  }

  let selected = K.country;
  const layers = {};
  function styleFn(level) {
    return f => {
      const u = K.units.get(f.id);
      const isSel = selected && selected.id === u.id;
      const inSel = selected && selected.level !== 'country' && isAncestor(selected, u);
      return {
        pane: 'polys', color: isSel ? '#d9480f' : '#ffffff', weight: isSel ? 3 : 1.2,
        fillColor: colorFor(u), fillOpacity: inSel || isSel || !selected || selected.level === 'country' ? 0.75 : 0.45, opacity: 1,
      };
    };
  }
  function isAncestor(a, u) { let x = u; while (x) { if (x.id === a.id) return true; x = K.units.get(x.parent); } return false; }
  function makeLayer(level, fc) {
    return L.geoJSON(fc, {
      pane: 'polys', style: styleFn(level),
      onEachFeature: (f, l) => {
        const u = K.units.get(f.id);
        if (!u) return;
        l.on('mouseover', e => { hover(u, e); l.setStyle({ weight: 3, color: '#d9480f' }); });
        l.on('mouseout', () => { hideHover(); layers[level].resetStyle(l); });
        l.on('mousemove', e => moveHover(e));
        l.on('click', e => { L.DomEvent.stopPropagation(e); select(u, { fly: true }); });
      },
    });
  }
  layers.region = makeLayer('region', G.regions);
  layers.gov = makeLayer('gov', G.governorates);
  layers.city = makeLayer('city', { type: 'FeatureCollection', features: G.cities.features.filter(f => K.units.has(f.id)) });
  const regionOutline = L.geoJSON(G.regions, { pane: 'outlines', style: { color: '#33415c', weight: 1.6, fill: false, opacity: 0.8 }, interactive: false });

  // city markers: every census settlement, sized by domestic tourists; ringed when the ministry publishes hotel data for it
  const cityWithPoly = new Set(G.cities.features.map(f => f.id));
  const cityMarkers = L.layerGroup();
  [...K.units.values()].filter(u => u.level === 'city').forEach(u => {
    const hasDest = u.t && u.t.dest;
    const mk = L.circleMarker([u.pt[1], u.pt[0]], { pane: 'points', radius: 3, weight: hasDest ? 2.5 : 1, color: hasDest ? '#1b2433' : '#fff', fillColor: '#d9480f', fillOpacity: 0.85 });
    mk.unit = u;
    mk.on('mouseover', e => hover(u, e)); mk.on('mouseout', hideHover); mk.on('mousemove', moveHover);
    mk.on('click', e => { L.DomEvent.stopPropagation(e); select(u, { fly: true }); });
    cityMarkers.addLayer(mk);
  });
  function sizeMarkers() {
    const z = map.getZoom();
    cityMarkers.eachLayer(mk => {
      const v = K.profile(mk.unit).dv;
      const r = Math.max(2.5, Math.sqrt(v) / 60 * Math.pow(1.35, z - 7));
      mk.setRadius(Math.min(r, 40));
      const show = !(cityWithPoly.has(mk.unit.id) && z >= 10.5);
      mk.setStyle({ opacity: show ? 1 : 0, fillOpacity: show ? 0.85 : 0, interactive: show });
      if (mk._path) mk._path.style.pointerEvents = show ? 'auto' : 'none';
    });
  }

  // labels: name + value of the current metric
  const labelLayer = L.layerGroup().addTo(map);
  function centroidOf(level, id) {
    const u = K.units.get(id);
    if (level === 'gov' && u.officialGeom) { const f = G.governorates.features.find(x => x.id === id); if (f) { const lp = labelPoint(f); if (pointInGeom([lp[1], lp[0]], f.geometry) || !pointInGeom(u.pt, f.geometry)) return lp; } }
    if (u.pt) return [u.pt[1], u.pt[0]];
    const lyr = layers[level].getLayers().find(l => l.feature.id === id);
    return lyr ? lyr.getBounds().getCenter() : null;
  }
  const REGION_LABEL_PT = {};
  K.country.children.forEach(r => { REGION_LABEL_PT[r.id] = labelPoint(G.regions.features.find(f => f.id === r.id)); });
  function labelPoint(f) {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    let best = null, bestN = 0;
    polys.forEach(p => { if (p[0].length > bestN) { bestN = p[0].length; best = p[0]; } });
    let x = 0, y = 0; best.forEach(c => { x += c[0]; y += c[1]; });
    return [y / best.length, x / best.length];
  }
  function drawLabels() {
    labelLayer.clearLayers();
    const z = map.getZoom(), b = map.getBounds().pad(0.1), m = metric();
    let list = [];
    if (z < 6.5) list = K.country.children.map(u => [u, REGION_LABEL_PT[u.id]]);
    else if (z < 9) list = [...K.units.values()].filter(u => u.level === 'gov' && (z >= 7.5 || u.pop > 150000)).map(u => [u, centroidOf('gov', u.id)]);
    else list = [...K.units.values()].filter(u => u.level === 'city' && u.pop > (z < 10 ? 60000 : z < 11.5 ? 15000 : 3000)).map(u => [u, [u.pt[1], u.pt[0]]]);
    const boxes = [];
    list = list.filter(([u, p]) => p && b.contains(p)).sort((x, y) => K.profile(y[0]).dv - K.profile(x[0]).dv);
    list.forEach(([u, p]) => {
      const pt = map.latLngToContainerPoint(p), w = Math.max(u.name.length * 6.5, 40) / 2 + 4, h = 15;
      const bx = [pt.x - w, pt.y - h, pt.x + w, pt.y + h];
      if (u.level !== 'region' && boxes.some(o => bx[0] < o[2] && bx[2] > o[0] && bx[1] < o[3] && bx[3] > o[1])) return;
      boxes.push(bx);
      const own = published(m, u.level);
      const val = own ? m.fmt(m.get(K.profile(u))) : '';
      L.marker(p, { pane: 'labels', interactive: false, icon: L.divIcon({ className: 'lbl lbl-' + u.level, html: `<b>${esc(u.name)}</b>${val ? `<span>${val}</span>` : ''}`, iconSize: null }) }).addTo(labelLayer);
    });
  }

  function currentMode() {
    const z = map.getZoom();
    if (z < 6.5) return 'region';
    if (z < 9) return 'gov';
    return 'city';
  }
  let lastMode = null;
  function refreshLayers(force) {
    const mode = currentMode();
    if (mode !== lastMode || force) {
      ['region', 'gov', 'city'].forEach(l => map.removeLayer(layers[l]));
      map.removeLayer(cityMarkers);
      if (mode === 'region') layers.region.addTo(map);
      if (mode === 'gov') layers.gov.addTo(map);
      if (mode === 'city') { layers.gov.addTo(map); layers.city.addTo(map); cityMarkers.addTo(map); }
      if (mode !== 'region') regionOutline.addTo(map); else map.removeLayer(regionOutline);
      lastMode = mode;
      renderLegend();
    }
    sizeMarkers();
    drawLabels();
    document.querySelectorAll('.zoom-steps li').forEach(li => li.classList.toggle('on', li.dataset.m === mode));
  }
  map.on('zoomend', () => refreshLayers());
  map.on('moveend', () => {
    if (currentMode() === 'city') { breaks.city = computeBreaks('city', true); layers.city.setStyle(styleFn('city')); renderLegend(); }
    drawLabels();
  });
  map.on('click', () => select(K.country, { fly: false }));
  function restyle() {
    ['region', 'gov', 'city'].forEach(l => breaks[l] = computeBreaks(l, l === 'city'));
    ['region', 'gov', 'city'].forEach(l => layers[l].setStyle(styleFn(l)));
    renderLegend(); sizeMarkers(); drawLabels();
  }

  // ---------------------------------------------------------------- hover card
  const hov = $('#hover');
  function confTag(c) { const x = K.CONF[c] || K.CONF.estimate; return `<i class="tag ${x.c}" title="${esc(x.d)}">${x.t}</i>`; }
  function hover(u, e) {
    const p = K.profile(u), m = metric();
    const own = published(m, u.level);
    hov.innerHTML = `<div class="h-lvl">${K.LEVELS[u.level].name}</div><div class="h-name">${esc(u.name)}</div>
      <div class="h-pop">${K.fmtCompact(p.dv)} <small>سائح محلي ${confTag(p.conf)}</small></div>
      ${K.settings.metric !== 'dv' ? `<div class="h-m">${m.label}: ${own ? m.fmt(m.get(p)) : 'لا يُنشر لهذا المستوى (المنطقة: ' + m.fmt(valueFor(u)) + ')'}</div>` : ''}`;
    hov.hidden = false; moveHover(e);
  }
  function moveHover(e) {
    const pt = e.containerPoint || map.latLngToContainerPoint(e.latlng);
    hov.style.left = (pt.x + 14) + 'px'; hov.style.top = (pt.y + 14) + 'px';
  }
  function hideHover() { hov.hidden = true; }

  // ---------------------------------------------------------------- legend
  function renderLegend() {
    const level = lastMode || 'region', m = metric(), b = breaks[level] || [];
    const own = published(m, level);
    const rows = PAL.map((c, i) => {
      const lo = i === 0 ? null : b[i - 1], hi = b[i];
      const txt = lo == null ? `أقل من ${m.fmt(hi)}` : hi == null ? `${m.fmt(lo)} فأكثر` : `من ${m.fmt(lo)} إلى ${m.fmt(hi)}`;
      return `<div class="lg-row"><i style="background:${c}"></i><span>${txt}</span></div>`;
    }).join('');
    $('#legend').innerHTML = `<div class="lg-title">${m.label}<small> · ${K.LEVELS[level].plural}${level === 'city' && own ? ' في النطاق المعروض' : ''} · ${K.YEAR}</small></div>
      ${own ? '' : `<div class="lg-warn">لا يُنشر هذا المؤشر إلا على مستوى المنطقة؛ اللون هنا = قيمة المنطقة.</div>`}${rows}
      ${level === 'city' ? '<div class="lg-row"><i class="dot"></i><span>مدينة (الحجم حسب السياح المحليين)</span></div><div class="lg-row"><i class="dot ring"></i><span>وجهة لها بيانات فنادق منشورة</span></div>' : ''}`;
  }

  // ---------------------------------------------------------------- selection
  function boundsOf(u) {
    if (u.level === 'country') return L.latLngBounds([[16.3, 34.5], [32.2, 55.7]]);
    const lyr = layers[u.level] && layers[u.level].getLayers().find(l => l.feature.id === u.id);
    if (lyr) return lyr.getBounds();
    if (u.pt) return L.latLng(u.pt[1], u.pt[0]).toBounds(u.pop > 50000 ? 16000 : 6000);
    return null;
  }
  function select(u, opt = {}) {
    selected = u;
    if (opt.fly) {
      const b = boundsOf(u);
      if (b) {
        const target = { region: 6.5, gov: 9, city: 10.5 }[u.level];
        const z = Math.min(Math.max(map.getBoundsZoom(b, false, [40, 40]), target || 4), 12.5);
        map.flyTo(b.getCenter(), u.level === 'country' ? 5 : z, { duration: 0.8 });
      }
    }
    ['region', 'gov', 'city'].forEach(l => layers[l].setStyle(styleFn(l)));
    renderPanel(u);
    try { history.replaceState(null, '', '#' + u.id); } catch (e) { }
  }

  // ---------------------------------------------------------------- panel
  const SRC = {
    mot: 'وزارة السياحة – التقرير الإحصائي السنوي 2025 (مسح السياحة المحلية DTS ومسح الزوار الدوليين IVS)',
    mot23: 'وزارة السياحة – التقرير الإحصائي السنوي 2023',
    gastat: 'الهيئة العامة للإحصاء – إحصاءات المنشآت السياحية (الربع الرابع 2025)',
    rooms: 'وزارة السياحة/الهيئة العامة للإحصاء 2025 (توزيع الغرف فنادق/شقق كما نشرته صحيفة الوطن)',
    dest: 'وزارة السياحة: الغرف ربع 1 2026 (صحيفة اليوم)، المرافق يونيو 2026 (صحيفة سبق)، الإشغال النصف الأول 2024 و2025',
  };
  let activeTab = 'sum';
  const N = K.NAT;
  function bar(parts, fmt = K.fmtInt) {
    const t = parts.reduce((a, p) => a + p.v, 0) || 1;
    return `<div class="sbar">${parts.map(p => `<span style="width:${(p.v / t * 100).toFixed(2)}%;background:${p.c}" title="${esc(p.l)}"></span>`).join('')}</div>
      <div class="sbar-legend">${parts.map(p => `<div><i style="background:${p.c}"></i>${esc(p.l)} <b>${fmt(p.v)}</b> <em>${K.fmtPct(p.v / t)}</em></div>`).join('')}</div>`;
  }
  const COLS = ['#2c7f80', '#e8a33d', '#6a5acd', '#c2528b', '#98a6b8', '#55a395'];
  function tbl(head, rows) {
    return `<table class="tbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td>${i === 0 ? c : c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function kpi(label, val, sub, flag) {
    return `<div${flag ? ' class="inh"' : ''}><span>${label}</span><b>${val}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  }
  function rankList(u, getter, fmt, title, id) {
    const kids = u.children.slice().sort((a, b) => (getter(K.profile(b)) || 0) - (getter(K.profile(a)) || 0));
    if (!kids.length) return '';
    const max = getter(K.profile(kids[0])) || 1;
    return `<h3>${title} <small>(${kids.length})</small>${id ? ` <button class="lnk" id="${id}" title="تصدير الجدول">⬇ CSV</button>` : ''}</h3>
      ${kids.length > 12 ? '<input class="filter" id="kidFilter" placeholder="تصفية بالاسم…">' : ''}
      <ol class="kids">${kids.map(c => {
        const p = K.profile(c), v = getter(p) || 0;
        return `<li data-id="${c.id}" data-n="${esc(c.name)}"><span class="k-n">${esc(c.name)} ${c.level !== 'region' ? confTag(p.conf) : ''}${c.t && c.t.dest ? ' <i class="tag hot" title="بيانات فنادق منشورة">🏨</i>' : ''}</span>
          <span class="k-v">${fmt(v)}</span><span class="k-b"><i style="width:${(v / max * 100).toFixed(1)}%"></i></span></li>`;
      }).join('')}</ol>`;
  }
  function regionCtx(u, what) {
    const r = K.regionOf(u);
    return `<div class="notice">لا تنشر وزارة السياحة ${what} على مستوى ${K.LEVELS[u.level].name === 'محافظة' ? 'المحافظات' : 'المدن'}، والأرقام أدناه لمنطقة <a data-id="${r.id}">${esc(r.name)}</a> كاملة للاسترشاد فقط، ولم نقسّمها حتى لا نختلق أرقاماً.</div>`;
  }

  function tabSummary(u, p) {
    const anc = K.ancestors(u), parent = anc.length > 1 ? anc[anc.length - 2] : null, pp = parent ? K.profile(parent) : null;
    const isReg = u.level === 'region' || u.level === 'country';
    const rp = isReg ? p : K.profile(K.regionOf(u));
    const inh = !isReg ? ' (المنطقة)' : '';
    return `
      <div class="hero">
        <div class="hero-n">${K.fmtInt(p.dv)}</div>
        <div class="hero-l">سائح محلي (زائر بمبيت) · ${K.YEAR} ${confTag(p.conf)}</div>
        <div class="hero-s">أنفقوا ${K.fmtCompact(p.ds)} ريال · ${K.fmtInt(p.spv)} ريال للسائح · ${p.dvpc != null ? p.dvpc.toFixed(2) : '—'} سائح لكل ساكن</div>
      </div>
      <div class="kpis k3">
        ${kpi(u.level === 'country' ? 'السياح الوافدون' : 'زيارات الوافدين' + inh, K.fmtCompact(u.level === 'country' ? p.inbTourists : rp.iv), u.level === 'country' ? `${K.fmtCompact(p.iv)} زيارة للمناطق` : '', !isReg)}
        ${kpi('إنفاق الوافدين' + inh, K.fmtCompact(rp.is) + ' ريال', '', !isReg)}
        ${kpi('إجمالي الإنفاق السياحي' + inh, K.fmtCompact(rp.ts) + ' ريال', '', !isReg)}
        ${kpi('غرف الضيافة المرخصة' + inh, K.fmtInt(rp.rooms), `${K.fmtInt(rp.fac)} مرفق`, !isReg)}
        ${kpi('نسبة الإشغال' + inh, K.fmtPct(rp.occ, 0), `سعر الغرفة ${K.fmtInt(rp.adr)} ريال`, !isReg)}
        ${kpi('الوظائف السياحية' + inh, K.fmtCompact(rp.jobs), '', !isReg)}
      </div>
      ${!isReg ? `<p class="muted">المربعات المظللة أرقام المنطقة كاملة لأن الوزارة لا تنشرها لما دونها.</p>` : ''}
      ${u.level === 'country' ? `<h3>تطور أعداد السياح 2019–2025</h3>${seriesChart()}
        <h3>الربع الأول 2026 (مؤشرات أولية)</h3>${tbl(['المؤشر', 'القيمة', 'التغير السنوي'], [
          ['السياح الوافدون', N.q1_2026.inb_m + ' مليون', N.q1_2026.inb_chg + '٪'], ['السياح المحليون', N.q1_2026.dom_m + ' مليون', '+' + N.q1_2026.dom_chg + '٪'],
          ['إجمالي الإنفاق', N.q1_2026.spend_b + ' مليار ريال', N.q1_2026.spend_chg + '٪'], ['إشغال الفنادق', N.q1_2026.occ_hotels + '٪', ''], ['مرافق الضيافة المرخصة', K.fmtInt(N.q1_2026.facilities), '']])}
        <p class="muted">المصدر: وزارة السياحة، المؤشرات الأولية للربع الأول 2026 (من تقرير المكتب «التقرير السياحي الشامل 2026»).</p>` : ''}
      ${pp ? `<p class="muted">حصة ${esc(u.name)} من السياح المحليين في ${esc(parent.level === 'country' ? 'المملكة' : parent.name)}: <b>${K.fmtPct(p.dv / pp.dv)}</b> · من سكانها: ${K.fmtPct(p.pop / pp.pop)}</p>` : ''}
      ${p.y2021 ? y21Block(u, p) : ''}
      ${u.level !== 'region' && u.level !== 'country' ? `<details class="notes" open><summary>كيف حُسب رقم السياح المحليين هنا؟</summary><p class="muted">${esc(K.CONF[p.conf].d)}.<br>${esc(p.basis)}</p></details>` : ''}
      ${u.children.length ? rankList(u, q => q.dv, K.fmtCompact, `${K.LEVELS[u.children[0].level].plural} حسب السياح المحليين`, 'csvBtn') : ''}
      ${u.level === 'gov' ? `<p class="muted">المدن والتجمعات المدرجة (2,500 نسمة فأكثر) فقط؛ الباقي قرى وهجر.</p>` : ''}`;
  }

  function y21Block(u, p) {
    const y = p.y2021;
    return `<h3>آخر أرقام رسمية منشورة للمحافظة (2021)</h3>${tbl(['', 'محليون', 'وافدون'], [
      ['عدد السياح', K.fmtInt(y.dom_tourists), K.fmtInt(y.inb_tourists)],
      ['الإنفاق (ريال)', K.fmtCompact(y.dom_spend_sar), K.fmtCompact(y.inb_spend_sar)],
      ['ريال/سائح', y.dom_tourists ? K.fmtInt(y.dom_spend_sar / y.dom_tourists) : '—', y.inb_tourists ? K.fmtInt(y.inb_spend_sar / y.inb_tourists) : '—']])}
      <p class="muted">وزارة السياحة – إحصاءات السياحة 2021 (المحافظات الرئيسة). عام جائحة: أعداد الوافدين فيه منخفضة جداً ولا تصلح للمقارنة، لكنها آخر رقم رسمي منشور على مستوى المحافظة.</p>`;
  }
  function seriesChart() {
    const S = N.series, W = 330, H = 150, pad = 26, n = S.years.length;
    const max = Math.max(...S.dom_m.map((v, i) => v + S.inb_m[i]));
    const bw = (W - pad) / n * 0.62;
    const bars = S.years.map((y, i) => {
      const x = pad + i * (W - pad) / n, hd = S.dom_m[i] / max * (H - 30), hi = S.inb_m[i] / max * (H - 30);
      return `<rect x="${x}" y="${H - 18 - hd}" width="${bw}" height="${hd}" fill="${COLS[0]}"><title>${y} محليون ${S.dom_m[i]} مليون</title></rect>
        <rect x="${x}" y="${H - 18 - hd - hi}" width="${bw}" height="${hi}" fill="${COLS[1]}"><title>${y} وافدون ${S.inb_m[i]} مليون</title></rect>
        <text x="${x + bw / 2}" y="${H - 5}" text-anchor="middle" class="py-l">${y}</text>
        <text x="${x + bw / 2}" y="${H - 22 - hd - hi}" text-anchor="middle" class="py-l">${(S.dom_m[i] + S.inb_m[i]).toFixed(1)}</text>`;
    }).join('');
    return `<svg class="pyramid" viewBox="0 0 ${W} ${H}" direction="ltr">${bars}</svg>
      <div class="sbar-legend small"><div><i style="background:${COLS[0]}"></i>سياح محليون (مليون)</div><div><i style="background:${COLS[1]}"></i>سياح وافدون (مليون)</div></div>`;
  }
  function tabDomestic(u, p) {
    let h = `<div class="kpis">
      ${kpi('السياح المحليون', K.fmtInt(p.dv), K.CONF[p.conf].t)}
      ${kpi('الإنفاق', K.fmtCompact(p.ds) + ' ريال', K.CONF[p.conf].t)}
      ${kpi('متوسط إنفاق السائح', K.fmtInt(p.spv) + ' ريال')}
      ${kpi('سياح لكل ساكن', p.dvpc != null ? p.dvpc.toFixed(2) : '—', `السكان ${K.fmtCompact(p.pop)} (تقدير ${K.YEAR})`)}
    </div>`;
    if (u.level === 'country') {
      h += `<h3>المقارنة مع 2023</h3>${tbl(['المؤشر', '2023', K.YEAR, 'التغير'], [
        ['السياح المحليون (مليون)', N.y2023.dom_m, N.y2025.dom_m, K.fmtPct(N.y2025.dom_m / N.y2023.dom_m - 1)],
        ['الإنفاق المحلي (مليار ريال)', N.y2023.dom_spend_b, N.y2025.dom_spend_b, K.fmtPct(N.y2025.dom_spend_b / N.y2023.dom_spend_b - 1)],
        ['متوسط مدة الإقامة (ليلة)', N.y2023.dom_alos, '—', ''],
      ])}
      <h3>الغرض من الرحلة ${K.YEAR}</h3>${tbl(['الغرض', 'سياح (مليون)', 'إنفاق (مليار ريال)', 'ريال/سائح'], N.dom_purpose_2025.map(r => [r[0], r[1], r[2], K.fmtInt(r[2] * 1e3 / r[1])]))}
      <h3>نوع السكن ${K.YEAR}</h3>${bar(N.dom_accom_2025.map((r, i) => ({ l: r[0], v: r[1] * 1e6, c: COLS[i] })), K.fmtCompact)}`;
    }
    if (u.level === 'region' && p.dv2023) {
      h += `<h3>المقارنة مع 2023</h3>${tbl(['', '2023', K.YEAR, 'التغير'], [['السياح المحليون', K.fmtCompact(p.dv2023), K.fmtCompact(p.dv), K.fmtPct(p.dv / p.dv2023 - 1)]])}`;
    }
    if (u.level === 'country' || u.level === 'region') {
      h += rankList(u, q => q.ds, v => K.fmtCompact(v), `${K.LEVELS[u.children[0].level].plural} حسب الإنفاق المحلي (ريال)`);
      h += rankList(u, q => q.spv, K.fmtInt, 'متوسط إنفاق السائح المحلي (ريال)');
    } else if (u.children.length) {
      h += rankList(u, q => q.ds, v => K.fmtCompact(v), 'المدن حسب الإنفاق المحلي (ريال)');
    }
    h += `<details class="notes"><summary>المصدر والتعريف</summary><ul>
      <li>${SRC.mot}. السائح المحلي = زائر مقيم بالمملكة بات ليلة على الأقل خارج مكان إقامته المعتاد، ويُحسب في المنطقة التي زارها.</li>
      <li>الأرقام الرسمية منشورة للمناطق الـ13 ولخمس مدن فقط (الرياض، مكة المكرمة، جدة، حاضرة الدمام، المدينة المنورة).</li>
      <li>الطائف والأحساء وأبها وبريدة: حصتها من منطقتها في تقرير 2023 مطبقة على أرقام 2025.</li>
      <li>المحافظات الـ28 التي تنشر لها الوزارة أرقاماً في إحصاءات 2021 (مثل العلا وينبع وخميس مشيط وأملج): حصتها الرسمية من منطقتها في 2021 مطبقة على باقي رقم المنطقة 2025.</li>
      <li>باقي المحافظات: نصيبها من فئة «أخرى» في المنطقة موزعاً حسب السكان؛ والمدن داخل المحافظة حسب السكان. هذه تقديرات للاسترشاد.</li></ul></details>`;
    return h;
  }

  function tabInbound(u, p) {
    if (u.level === 'gov' || u.level === 'city') {
      const r = K.regionOf(u), rp = K.profile(r);
      return regionCtx(u, 'بيانات السياح الوافدين') + `<div class="kpis">
        ${kpi('زيارات الوافدين للمنطقة', K.fmtCompact(rp.iv), '', true)}${kpi('إنفاقهم', K.fmtCompact(rp.is) + ' ريال', '', true)}</div>
        ${p.y2021 ? y21Block(u, p) : (u.level === 'city' && K.units.get(u.parent).t && K.units.get(u.parent).t.y2021 ? `<p class="muted">لمحافظة ${esc(K.units.get(u.parent).name)} أرقام رسمية لعام 2021: <a data-id="${u.parent}">اعرضها</a>.</p>` : '')}`;
    }
    let h = '';
    if (u.level === 'country') {
      h += `<div class="kpis">
        ${kpi('السياح الوافدون', K.fmtInt(p.inbTourists), 'رسمي')}
        ${kpi('إنفاقهم', K.fmtCompact(N.y2025.inb_spend_b * 1e9) + ' ريال', 'رسمي')}
        ${kpi('متوسط إنفاق السائح', K.fmtInt(N.y2025.inb_spend_b * 1e9 / p.inbTourists) + ' ريال')}
        ${kpi('زيارات المناطق', K.fmtCompact(p.iv), 'السائح قد يزور أكثر من منطقة')}</div>
      <h3>المقارنة مع 2023</h3>${tbl(['المؤشر', '2023', K.YEAR, 'التغير'], [
        ['الوافدون (مليون)', N.y2023.inb_m, N.y2025.inb_m, K.fmtPct(N.y2025.inb_m / N.y2023.inb_m - 1)],
        ['إنفاقهم (مليار ريال)', N.y2023.inb_spend_b, N.y2025.inb_spend_b, K.fmtPct(N.y2025.inb_spend_b / N.y2023.inb_spend_b - 1)],
        ['متوسط مدة الإقامة (ليلة)', N.y2023.inb_alos, '—', '']])}
      <h3>الغرض من الزيارة ${K.YEAR}</h3>${tbl(['الغرض', 'سياح (مليون)', 'إنفاق (مليار ريال)'], N.inb_purpose_2025)}

      <h3>وسيلة القدوم</h3>${bar(N.inb_transport_2025.map((r, i) => ({ l: r[0], v: r[1] * 1e6, c: COLS[i] })), K.fmtCompact)}
      <h3>نوع السكن</h3>${bar(N.inb_accom_2025.map((r, i) => ({ l: r[0], v: r[1] * 1e6, c: COLS[i] })), K.fmtCompact)}
      <h3>أكبر الأسواق المصدّرة ${K.YEAR}</h3>${tbl(['الدولة', 'سياح (مليون)', 'إنفاق (مليار ريال)', 'ريال/سائح'], N.inb_markets_2025.map(r => [r[0], r[1], r[2], K.fmtInt(r[2] * 1e3 / r[1])]))}
      <h3>الأقاليم المصدّرة ${K.YEAR}</h3>${tbl(['الإقليم', 'سياح (مليون)', 'إنفاق (مليار ريال)'], N.inb_origin_2025)}
      <h3>الحج والعمرة</h3>${tbl(['', 'العدد'], [['حجاج 1446هـ (2025)', K.fmtInt(N.hajj['2025'])], ['حجاج 1447هـ (2026)', K.fmtInt(N.hajj['2026'])], ['منهم من الخارج 2026', K.fmtInt(N.hajj['2026_foreign'])]])}
      ${tbl(['2025', 'معتمرو الخارج', 'معتمرو الداخل'], N.umrah_2025.map(r => [r[0], K.fmtInt(r[1]), K.fmtInt(r[2])]))}
      <p class="muted">الحج والعمرة: الهيئة العامة للإحصاء. الأسواق والأقاليم: وزارة السياحة 2025.</p>`;
      h += rankList(u, q => q.iv, K.fmtCompact, 'المناطق حسب زيارات الوافدين');
      h += rankList(u, q => q.is, K.fmtCompact, 'المناطق حسب إنفاق الوافدين (ريال)');
    } else {
      const cp = K.profile(K.country);
      h += `<div class="kpis">
        ${kpi('زيارات الوافدين', K.fmtInt(p.iv), 'رسمي')}
        ${kpi('حصة المنطقة من الزيارات', K.fmtPct(p.iv / cp.iv))}
        ${kpi('إنفاق الوافدين', K.fmtCompact(p.is) + ' ريال', 'رسمي')}
        ${kpi('حصة المنطقة من الإنفاق', K.fmtPct(p.is / cp.is))}</div>
      <h3>الإنفاق حسب نوع الوجهة</h3>${bar([{ l: 'وجهة رئيسية', v: p.isMain, c: COLS[0] }, { l: 'وجهة ثانوية', v: p.isSec, c: COLS[1] }], K.fmtCompact)}
      <h3>الإنفاق المحلي مقابل الوافد</h3>${bar([{ l: 'سياحة محلية', v: p.ds, c: COLS[0] }, { l: 'سياحة وافدة', v: p.is, c: COLS[1] }], K.fmtCompact)}
      <div class="notice">لا تنشر الوزارة بيانات الوافدين لما دون المنطقة، لذا لا يظهر هذا التبويب بأرقام للمحافظات والمدن.</div>`;
    }
    h += `<details class="notes"><summary>المصدر والتعريف</summary><ul><li>${SRC.mot}.</li>
      <li>«الزيارات» تُعد لكل منطقة زارها السائح (رئيسية أو ثانوية)، لذا مجموعها (${K.fmtCompact(K.profile(K.country).iv)}) أكبر من عدد الوافدين (${N.y2025.inb_m} مليون).</li></ul></details>`;
    return h;
  }

  function destBlock(d) {
    return `<h3>بيانات الضيافة المنشورة للوجهة: ${esc(d.dest_name)}</h3><div class="kpis">
      ${kpi('الغرف المرخصة', K.fmtInt(d.rooms), d.rooms_hotel ? `فنادق ${K.fmtInt(d.rooms_hotel)} · شقق وأخرى ${K.fmtInt(d.rooms_other)}` : 'الربع الأول 2026')}
      ${kpi('المرافق المرخصة', K.fmtInt(d.facilities), d.fac_hotel ? `فنادق ${K.fmtInt(d.fac_hotel)} · شقق وأخرى ${K.fmtInt(d.fac_other)}` : 'يونيو 2026')}
      ${kpi('الإشغال النصف الأول 2025', d.occ_h1_2025 != null ? d.occ_h1_2025 + '٪' : '—', d.occ_h1_2024 != null ? `2024: ${d.occ_h1_2024}٪` : '')}
    </div><p class="muted">المصدر: ${SRC.dest}. أرقام منقولة عن بيانات الوزارة كما نشرتها الصحف، وفتراتها مختلفة.</p>`;
  }
  function tabHosp(u, p) {
    let h = '';
    const d = u.t && u.t.dest;
    if (u.level === 'gov' || u.level === 'city') {
      if (d) h += destBlock(d);
      const kidsDest = u.level === 'gov' ? u.children.filter(c => c.t && c.t.dest) : [];
      kidsDest.forEach(c => h += destBlock(c.t.dest));
      const r = K.regionOf(u), rp = K.profile(r);
      h += regionCtx(u, d || kidsDest.length ? 'إحصاءات الضيافة كاملة' : 'إحصاءات الضيافة') + hospCore(rp, true);
      const others = [...K.units.values()].filter(x => x.level === 'city' && x.t && x.t.dest && K.regionOf(x) === r && x !== u && !kidsDest.includes(x));
      if (others.length) h += `<p class="muted">وجهات في المنطقة لها بيانات فنادق: ${others.map(x => `<a data-id="${x.id}">${esc(x.t.dest.dest_name)}</a>`).join('، ')}</p>`;
      return h;
    }
    h += hospCore(p, false);
    if (u.level === 'country') {
      const q = N.gastat_q, n = N.y2025, s = N.h1_2026;
      h += `<h3>فنادق مقابل شقق مخدومة ومرافق أخرى (${K.YEAR})</h3>${tbl(['', 'فنادق', 'شقق وأخرى'], [
        ['المرافق', K.fmtInt(n.fac_hotels), K.fmtInt(n.fac_other)], ['الغرف', K.fmtInt(n.rooms_hotels), K.fmtInt(n.rooms_other)],
        ['الإشغال', n.occ_hotels + '٪', n.occ_other + '٪'], ['متوسط سعر الغرفة', n.adr_hotels + ' ريال', n.adr_other + ' ريال'], ['العائد لكل غرفة متاحة', n.revpar_hotels + ' ريال', n.revpar_other + ' ريال']])}
      <h3>الهيئة العامة للإحصاء: الربع الرابع</h3>${tbl(['المؤشر', ...q.labels], [
        ['إشغال الفنادق', ...q.occ_hotels.map(v => v + '٪')], ['إشغال الشقق والأخرى', ...q.occ_other.map(v => v + '٪')],
        ['سعر الغرفة – فنادق', ...q.adr_hotels.map(v => v + ' ريال')], ['سعر الغرفة – شقق', ...q.adr_other.map(v => v + ' ريال')],
        ['مدة الإقامة – فنادق (ليلة)', ...q.alos_hotels], ['مدة الإقامة – شقق (ليلة)', ...q.alos_other],
        ['المرافق المرخصة', ...q.facilities.map(K.fmtInt)], ['العاملون في الأنشطة السياحية', ...q.employees.map(K.fmtInt)], ['منهم سعوديون', ...q.employees_saudi.map(K.fmtInt)]])}
      <h3>أحدث تحديث: منتصف 2026</h3><p class="muted">${K.fmtInt(s.facilities)} مرفقاً مرخصاً (فنادق ${K.fmtInt(s.fac_hotels)} · شقق وأخرى ${K.fmtInt(s.fac_other)})، ${K.fmtInt(s.rooms)} غرفة، إشغال ${s.occ}٪، سعر الغرفة ${s.adr} ريال (وزارة السياحة، النصف الأول 2026 كما نشرته صحيفتا الوطن وسبق).</p>`;
      h += rankList(u, q2 => q2.rooms, K.fmtInt, 'المناطق حسب الغرف المرخصة');
      h += rankList(u, q2 => q2.occ, v => K.fmtPct(v, 0), 'المناطق حسب نسبة الإشغال');
      h += rankList(u, q2 => q2.adr, K.fmtInt, 'المناطق حسب متوسط سعر الغرفة (ريال)');
    } else {
      const x = p.extra;
      if (x) {
        h += `<h3>فنادق مقابل شقق مخدومة – الربع الثالث 2025</h3>${tbl(['', 'فنادق', 'شقق مخدومة'], [['الإشغال', x.occ_hotel_q3_2025 + '٪', x.occ_apt_q3_2025 + '٪'], ['متوسط السعر اليومي', x.adr_hotel_q3_2025 + ' ريال', x.adr_apt_q3_2025 + ' ريال']])}
          <p class="muted">الهيئة العامة للإحصاء، إحصاءات المنشآت السياحية للربع الثالث 2025 (موسم صيفي منخفض للسياحة الدينية).</p>`;
        if (x.hotels_2019) h += `<h3>الفنادق المصنفة حسب النجوم (تراخيص 2019)</h3>${tbl(['5★', '4★', '3★', '2★', '1★', 'الفنادق', 'الغرف'], [[x.h5_2019, x.h4_2019, x.h3_2019, x.h2_2019, x.h1_2019, K.fmtInt(x.hotels_2019), K.fmtInt(x.hotel_rooms_2019)]])}<p class="muted">وزارة السياحة، الإدارة العامة للتراخيص (تحديث 12/2019) – بيانات قديمة لهيكل التصنيف فقط.</p>`;
      }
      const nowFac = N.h1_2026.fac_by_region[u.id];
      if (nowFac) h += `<p class="muted">تحديث منتصف 2026: ${K.fmtInt(nowFac)} مرفقاً مرخصاً (${K.fmtPct(nowFac / p.fac - 1)} عن 2025).</p>`;
      const ds = [...K.units.values()].filter(x => x.level === 'city' && x.t && x.t.dest && K.regionOf(x) === u);
      ds.forEach(c => h += destBlock(c.t.dest));
    }
    h += `<details class="notes"><summary>المصدر والتعريف</summary><ul><li>${SRC.mot} (صفحات المناطق).</li><li>توزيع الغرف فنادق/شقق: ${SRC.rooms}.</li><li>${SRC.gastat}.</li>
      <li>الإشغال = الغرف المشغولة ÷ المتاحة. العائد لكل غرفة متاحة (RevPAR) = متوسط السعر × الإشغال تقريباً.</li></ul></details>`;
    return h;
  }
  function hospCore(p, inh) {
    return `<div class="kpis">
      ${kpi('مرافق الضيافة المرخصة', K.fmtInt(p.fac), '', inh)}
      ${kpi('الغرف المرخصة', K.fmtInt(p.rooms), '', inh)}
      ${kpi('نسبة الإشغال', K.fmtPct(p.occ, 0), '', inh)}
      ${kpi('متوسط سعر الغرفة', K.fmtInt(p.adr) + ' ريال', `العائد/غرفة متاحة ${K.fmtInt(p.revpar)} ريال`, inh)}
      ${kpi('الوظائف السياحية المباشرة', K.fmtInt(p.jobs), '', inh)}
      ${kpi('غرف لكل 1,000 سائح', p.dv + (p.iv || 0) ? K.fmtInt(p.rooms / ((p.dv + (p.iv || 0)) / 1000)) : '—', 'محلي + وافد', inh)}
    </div>
    ${p.roomsH ? `<h3>الغرف: فنادق مقابل شقق مخدومة</h3>${bar([{ l: 'فنادق', v: p.roomsH, c: COLS[0] }, { l: 'شقق مخدومة ومرافق أخرى', v: p.roomsA, c: COLS[1] }])}` : ''}`;
  }

  function renderPanel(u) {
    const p = K.profile(u);
    const anc = K.ancestors(u);
    const tabs = [{ id: 'sum', title: 'ملخص' }, { id: 'dom', title: 'السياحة المحلية' }, { id: 'inb', title: 'الوافدون' }, { id: 'hosp', title: 'الإيواء والضيافة' }]
      .concat(K.modules.map(m => ({ id: m.id, title: m.title })));
    if (!tabs.find(t => t.id === activeTab)) activeTab = 'sum';
    const body = activeTab === 'sum' ? tabSummary(u, p) : activeTab === 'dom' ? tabDomestic(u, p) : activeTab === 'inb' ? tabInbound(u, p) : activeTab === 'hosp' ? tabHosp(u, p) : '<div id="modBody"></div>';
    $('#panel').innerHTML = `
      <nav class="crumbs">${anc.map((a, i) => i < anc.length - 1 ? `<a data-id="${a.id}">${esc(a.level === 'country' ? 'المملكة' : a.name)}</a><span>›</span>` : '').join('')}</nav>
      <div class="ph"><div><div class="lvl">${K.LEVELS[u.level].name} ${u.level === 'country' || u.level === 'region' ? '<span class="tag off">رسمي</span>' : confTag(p.conf)}</div><h2>${esc(u.name)}</h2></div></div>
      <div class="tabs">${tabs.map(t => `<button data-tab="${t.id}" class="${t.id === activeTab ? 'on' : ''}">${esc(t.title)}</button>`).join('')}</div>
      ${body}`;
    const m = K.modules.find(x => x.id === activeTab); if (m) m.render(u, p, $('#modBody'));
    $('#panel').scrollTop = 0;
    const kf = $('#kidFilter');
    if (kf) kf.addEventListener('input', () => { const q = kf.value.trim(); document.querySelectorAll('.kids li').forEach(li => li.hidden = q && !li.dataset.n.includes(q)); });
    const cb = $('#csvBtn'); if (cb) cb.addEventListener('click', () => exportCSV(u));
  }
  $('#panel').addEventListener('click', e => {
    const t = e.target.closest('[data-id]');
    if (t && (t.tagName === 'LI' || t.tagName === 'A')) { select(K.units.get(t.dataset.id), { fly: true }); return; }
    const tb = e.target.closest('[data-tab]');
    if (tb) { activeTab = tb.dataset.tab; renderPanel(selected); }
  });

  function exportCSV(u) {
    const head = ['المستوى', 'الاسم', 'الجهة الأعلى', `السياح المحليون ${K.YEAR}`, 'الإنفاق المحلي (ريال)', 'ريال/سائح', 'سياح لكل ساكن', 'نوع الرقم',
      'زيارات الوافدين', 'إنفاق الوافدين (ريال)', 'إجمالي الإنفاق (ريال)', 'مرافق الضيافة', 'الغرف', 'الإشغال٪', 'سعر الغرفة', 'الوظائف'];
    const lines = [head];
    u.children.forEach(c => {
      const p = K.profile(c), reg = c.level === 'region';
      lines.push([K.LEVELS[c.level].name, c.name, u.level === 'country' ? 'المملكة' : u.name, Math.round(p.dv), Math.round(p.ds), Math.round(p.spv || 0), p.dvpc != null ? p.dvpc.toFixed(3) : '', K.CONF[p.conf].t,
        reg ? p.iv : '', reg ? p.is : '', reg ? p.ts : '', reg ? p.fac : '', reg ? p.rooms : '', reg ? Math.round(p.occ * 100) : '', reg ? p.adr : '', reg ? p.jobs : '']);
    });
    const csv = '﻿' + lines.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `سياحة_${u.name}_${K.YEAR}.csv`; a.click();
  }

  // ---------------------------------------------------------------- search
  const all = [...K.units.values()].filter(u => u.level !== 'country');
  const norm = s => s.replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  all.forEach(u => u._n = norm(u.name));
  const sIn = $('#search'), sRes = $('#searchRes');
  sIn.addEventListener('input', () => {
    const q = norm(sIn.value.trim());
    if (q.length < 2) { sRes.hidden = true; return; }
    const order = { region: 0, gov: 1, city: 2 };
    const hits = all.filter(u => u._n.includes(q)).sort((a, b) => (a._n.startsWith(q) ? 0 : 1) - (b._n.startsWith(q) ? 0 : 1) || order[a.level] - order[b.level] || b.pop - a.pop).slice(0, 14);
    sRes.innerHTML = hits.length ? hits.map(u => {
      const par = K.units.get(u.parent);
      return `<li data-id="${u.id}"><b>${esc(u.name)}</b><small>${K.LEVELS[u.level].name}${par && par.level !== 'country' ? ' · ' + esc(par.name) : ''}</small></li>`;
    }).join('') : '<li class="none">لا نتائج</li>';
    sRes.hidden = false;
  });
  sRes.addEventListener('click', e => {
    const li = e.target.closest('li[data-id]'); if (!li) return;
    sRes.hidden = true; sIn.value = ''; select(K.units.get(li.dataset.id), { fly: true });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sRes.hidden = true; });

  // ---------------------------------------------------------------- controls
  const mSel = $('#metric');
  mSel.innerHTML = `<optgroup label="متاح لكل المستويات">${Object.entries(K.METRICS).filter(([, m]) => !m.levels).map(([k, m]) => `<option value="${k}">${m.label}</option>`).join('')}</optgroup>
    <optgroup label="منشور على مستوى المناطق فقط">${Object.entries(K.METRICS).filter(([, m]) => m.levels).map(([k, m]) => `<option value="${k}">${m.label}</option>`).join('')}</optgroup>`;
  if (!K.METRICS[K.settings.metric]) K.settings.metric = 'dv';
  mSel.value = K.settings.metric;
  mSel.addEventListener('change', () => { K.settings.metric = mSel.value; K.saveSettings(); restyle(); });
  document.querySelectorAll('[data-basemap]').forEach(b => b.addEventListener('click', () => setBasemap(b.dataset.basemap)));
  document.querySelectorAll('.zoom-steps li').forEach(li => li.addEventListener('click', () => map.setZoom(+li.dataset.z)));
  $('#aboutBtn').addEventListener('click', () => $('#about').showModal());
  $('#aboutClose').addEventListener('click', () => $('#about').close());
  K.onChange(() => { restyle(); renderPanel(selected); });
  function updateHeader() {
    $('#yearBadge').textContent = K.YEAR;
    $('#kpiTotal').textContent = K.NAT.y2025.tourists_m + ' مليون';
    $('#kpiSpend').textContent = K.NAT.y2025.spend_b + ' مليار ريال';
  }
  $('#panelToggle').addEventListener('click', () => document.body.classList.toggle('panel-open'));

  // ---------------------------------------------------------------- go
  ['region', 'gov', 'city'].forEach(l => breaks[l] = computeBreaks(l));
  refreshLayers(true);
  updateHeader();
  const start = K.units.get(decodeURIComponent(location.hash.slice(1))) || K.country;
  select(start, { fly: start !== K.country });
  window.KSA_MAP = { map, select, layers };
})();
