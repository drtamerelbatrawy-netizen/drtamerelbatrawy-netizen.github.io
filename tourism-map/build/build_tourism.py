"""يبني data/units.js و data/tourism.js من ملفات CSV في هذا المجلد.
الاستخدام:  python build_tourism.py <مسار units.js من برنامج السكان>
عند صدور تقرير وزارة السياحة الجديد: حدّث regions_2025.csv (أو انسخه باسم السنة الجديدة وغيّر YEAR) و anchors.csv ثم شغّل السكربت."""
import sys, os, csv, json
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
YEAR = 2025
REG_CSV = os.path.join(HERE, f'regions_{YEAR}.csv')
ANC_CSV = os.path.join(HERE, 'anchors.csv')

def num(x):
    x = (x or '').strip()
    return float(x) if x else None

def load_units(path):
    s = open(path, encoding='utf-8').read()
    s = s[s.index('{'):].rstrip().rstrip(';')
    return json.loads(s)

def main(units_js):
    pd = load_units(units_js)
    meta_pop = pd['meta']
    units = [u for u in pd['units'] if u['level'] in ('region', 'gov', 'city')]
    by = {u['id']: u for u in units}
    kids = {}
    for u in units: kids.setdefault(u['parent'], []).append(u)
    regs = {r['id']: r for r in csv.DictReader(open(REG_CSV, encoding='utf-8-sig'))}
    anc = list(csv.DictReader(open(ANC_CSV, encoding='utf-8-sig')))

    def region_of(u):
        while u['level'] != 'region': u = by[u['parent']]
        return u['id']

    T = {}
    # ---- region rows (all official)
    for rid, r in regs.items():
        t = {k: num(v) for k, v in r.items() if k not in ('id', 'name')}
        t['conf'] = 'official'
        T[rid] = t

    # ---- anchors
    A = {}
    metro = {}
    for a in anc:
        u = by[a['unit_id']]; rid = region_of(u); R = T[rid]
        spv = R['dom_spend_m'] / R['dom_visitors_k']
        if a['kind'] == 'official':
            A[u['id']] = dict(dv=num(a['dom_visitors_k']), ds=num(a['dom_spend_m']), conf='official', basis=a['basis'])
        elif a['kind'] == 'share2023':
            dv = R['dom_visitors_k'] * num(a['dom_visitors_k']) / float(a['note'])
            A[u['id']] = dict(dv=dv, ds=None, rid=rid, conf='anchored', basis=a['basis'] + f" ({a['dom_visitors_k']} ألف من {a['note']} ألف في 2023)؛ الإنفاق بمتوسط إنفاق السائح في باقي المنطقة (بعد المدن المنشورة)")
        elif a['kind'] == 'metro':
            _, key, w = a['note'].split(':'); metro.setdefault(key, []).append((u['id'], float(w), a['basis']))
    METRO_TOTAL = {'DMM': (5900, 8000)}
    for key, lst in metro.items():
        tv, ts = METRO_TOTAL[key]; W = sum(w for _, w, _ in lst)
        for uid, w, basis in lst:
            A[uid] = dict(dv=tv * w / W, ds=ts * w / W, conf='anchored', basis=basis)

    # spend for 2023-share anchors: average spend per visitor in the region outside the officially published cities/metros
    for uid, a in A.items():
        if a['ds'] is None:
            R = T[a['rid']]
            offs = [b for k, b in A.items() if b['ds'] is not None and region_of(by[k]) == a['rid']]
            a['ds'] = a['dv'] * (R['dom_spend_m'] - sum(b['ds'] for b in offs)) / (R['dom_visitors_k'] - sum(b['dv'] for b in offs))
    for a in A.values(): a.pop('rid', None)
    # ---- 2021 official governorate figures (MoT tourism statistics 2021, sheets D5/I6)
    G21 = {r['unit_id']: r for r in csv.DictReader(open(os.path.join(HERE, 'governorates_2021.csv'), encoding='utf-8-sig'))}

    # ---- allocate per region
    # 1) anchors (2025 official cities, Dammam metro, 2023 city shares) are fixed;
    # 2) the rest of the region is split between the governorates named in the 2021 tables and "other",
    #    in proportion to their official 2021 tourists (spending: 2021 spending);
    # 3) "other" is spread over the remaining governorates by population.
    for rid in regs:
        R = T[rid]; govs = kids.get(rid, [])
        fixed_v = fixed_s = 0; gA = {}
        for g in govs:
            if g['id'] in A:
                fixed_v += A[g['id']]['dv']; fixed_s += A[g['id']]['ds']; continue
            cs = [c for c in kids.get(g['id'], []) if c['id'] in A]
            gA[g['id']] = cs
            fixed_v += sum(A[c['id']]['dv'] for c in cs); fixed_s += sum(A[c['id']]['ds'] for c in cs)
        resid_v = R['dom_visitors_k'] - fixed_v; resid_s = R['dom_spend_m'] - fixed_s
        assert resid_v >= -1 and resid_s >= -1, (rid, resid_v, resid_s)
        named = [g for g in govs if g['id'] not in A and not gA[g['id']] and g['id'] in G21]
        oth = G21.get('OTHER_' + rid)
        wv = {g['id']: float(G21[g['id']]['dom_tourists']) for g in named}
        ws = {g['id']: float(G21[g['id']]['dom_spend_sar']) for g in named}
        ov = float(oth['dom_tourists']) if oth else 0; os_ = float(oth['dom_spend_sar']) if oth else 0
        Wv = sum(wv.values()) + ov or 1; Ws = sum(ws.values()) + os_ or 1
        free = {}
        for g in govs:
            if g['id'] in A or g in named: continue
            free[g['id']] = max(g['pop'] - sum(c['pop'] for c in gA[g['id']]), 0)
        F = sum(free.values()) or 1
        other_v = resid_v * ov / Wv; other_s = resid_s * os_ / Ws
        if not free:   # nobody to take "other": give it back to the named ones
            other_v = other_s = 0; Wv -= ov; Ws -= os_
        for g in govs:
            gid = g['id']
            if gid in A:
                t = dict(A[gid]); gv, gs = t['dv'], t['ds']; acs = []; gfree = g['pop']
            elif g in named:
                gv = resid_v * wv[gid] / Wv; gs = resid_s * ws[gid] / Ws
                t = dict(dv=gv, ds=gs, conf='share21', basis=f"حصتها الرسمية من سياح المنطقة وإنفاقهم في إحصاءات وزارة السياحة 2021 ({int(wv[gid]):,} سائح محلي في 2021) مطبقة على باقي رقم المنطقة 2025 بعد المدن المنشورة")
                acs = []; gfree = g['pop']
            else:
                acs = gA[gid]
                sh = free[gid] / F
                gv = sum(A[c['id']]['dv'] for c in acs) + other_v * sh; gs = sum(A[c['id']]['ds'] for c in acs) + other_s * sh
                if acs:
                    t = dict(dv=gv, ds=gs, conf='partial', basis='المدينة الرئيسية رسمية/مرجعية + نصيب باقي المحافظة من فئة «أخرى» في المنطقة حسب السكان')
                else:
                    t = dict(dv=gv, ds=gs, conf='estimate', basis='نصيب من فئة «محافظات أخرى» في المنطقة (حصتها الرسمية 2021) موزعة حسب عدد السكان')
                gfree = free[gid]
            if gid in G21:
                r21 = G21[gid]; t['y2021'] = {k: float(r21[k]) for k in ('dom_tourists', 'dom_spend_sar', 'inb_tourists', 'inb_spend_sar')}
            T[gid] = t
            ac_ids = {c['id'] for c in acs}
            rest_v = gv - sum(A[c]['dv'] for c in ac_ids); rest_s = gs - sum(A[c]['ds'] for c in ac_ids)
            for c in kids.get(gid, []):
                if c['id'] in ac_ids:
                    T[c['id']] = dict(A[c['id']])
                else:
                    sh = c['pop'] / gfree if gfree else 0
                    T[c['id']] = dict(dv=rest_v * sh, ds=rest_s * sh, conf='estimate', basis='نصيب المدينة من سياح محافظتها حسب عدد السكان')
        if oth:
            T[rid]['other2021'] = {'dom_tourists': ov, 'inb_tourists': float(oth['inb_tourists'])}
    for k, t in T.items():
        for f in ('dv', 'ds'):
            if f in t and t[f] is not None: t[f] = round(t[f], 1)
    for rid in regs:
        T[rid]['dv'] = T[rid]['dom_visitors_k']; T[rid]['ds'] = T[rid]['dom_spend_m']
    for r in csv.DictReader(open(os.path.join(HERE, f'rooms_split_{YEAR}.csv'), encoding='utf-8-sig')):
        T[r['id']]['rooms_hotel'] = num(r['rooms_hotel']); T[r['id']]['rooms_apt'] = num(r['rooms_apt'])
    for r in csv.DictReader(open(os.path.join(HERE, 'regions_extra.csv'), encoding='utf-8-sig')):
        T[r['id']]['extra'] = {k: num(v) for k, v in r.items() if k != 'id'}
    for r in csv.DictReader(open(os.path.join(HERE, 'destinations.csv'), encoding='utf-8-sig')):
        T[r['unit_id']]['dest'] = {k: (num(v) if k not in ('unit_id', 'dest_name') else v) for k, v in r.items() if k != 'unit_id'}

    # ---- write units.js (regions/govs/cities only, no districts) and tourism.js
    pdo = {'meta': {'base_year': meta_pop['base_year'], 'default_growth': meta_pop['default_growth'], 'national': meta_pop['national']}, 'units': units}
    for u in units: u.pop('children', None)
    with open(os.path.join(ROOT, 'data', 'units.js'), 'w', encoding='utf-8') as f:
        f.write('window.KSA_DATA=' + json.dumps(pdo, ensure_ascii=False, separators=(',', ':')) + ';')
    nat = json.load(open(os.path.join(HERE, 'national.json'), encoding='utf-8'))
    with open(os.path.join(ROOT, 'data', 'tourism.js'), 'w', encoding='utf-8') as f:
        f.write('window.TOUR_DATA=' + json.dumps({'year': YEAR, 'national': nat, 't': T}, ensure_ascii=False, separators=(',', ':')) + ';')
    # checks
    for rid in regs:
        sg = sum(T[g['id']]['dv'] for g in kids.get(rid, []))
        print(rid, regs[rid]['name'], 'region', T[rid]['dv'], 'sum govs', round(sg))

if __name__ == '__main__':
    main(sys.argv[1])
