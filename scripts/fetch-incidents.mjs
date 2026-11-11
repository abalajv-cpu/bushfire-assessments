// Fetches current bushfire incidents from the public feeds of Australian fire services
// and writes them, normalised, to src/data/incidents.json.
// Runs before every build (see package.json). If a feed is down, the last good data for
// that state is kept and marked stale, so a failed feed never breaks the build.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../src/data/incidents.json', import.meta.url));
const UA = 'Mozilla/5.0 (compatible; bushfire-site-feed-reader)';
const LEVELS = ['Emergency Warning', 'Watch and Act', 'Advice'];

const SOURCES = [
  { state: 'NSW', name: 'New South Wales', agency: 'NSW Rural Fire Service', site: 'https://www.rfs.nsw.gov.au/fire-information/fires-near-me',
    url: 'https://www.rfs.nsw.gov.au/feeds/majorIncidents.json', parse: parseNSW },
  { state: 'QLD', name: 'Queensland', agency: 'Queensland Fire Department', site: 'https://www.fire.qld.gov.au/Current-Incidents',
    url: 'https://publiccontent-gis-psba-qld-gov-au.s3.amazonaws.com/content/Feeds/BushfireCurrentIncidents/bushfireAlert.json', parse: parseQLD },
  { state: 'VIC', name: 'Victoria', agency: 'VicEmergency', site: 'https://emergency.vic.gov.au/respond/',
    url: 'https://emergency.vic.gov.au/public/osom-geojson.json', parse: parseVIC },
  { state: 'WA', name: 'Western Australia', agency: 'Emergency WA', site: 'https://www.emergency.wa.gov.au/',
    url: 'https://api.emergency.wa.gov.au/v1/incidents', parse: parseWA },
  { state: 'SA', name: 'South Australia', agency: 'SA Country Fire Service', site: 'https://www.cfs.sa.gov.au/warnings-restrictions/warnings/incidents-warnings/',
    url: 'https://data.eso.sa.gov.au/prod/cfs/criimson/cfs_current_incidents.json', parse: parseSA },
  { state: 'ACT', name: 'Australian Capital Territory', agency: 'ACT Emergency Services Agency', site: 'https://esa.act.gov.au/',
    url: 'https://esa.act.gov.au/feeds/currentincidents.xml', parse: parseACT, text: true },
  // No usable public feed found: the page links to the official site instead.
  { state: 'TAS', name: 'Tasmania', agency: 'Tasmania Fire Service', site: 'https://www.fire.tas.gov.au/' },
  { state: 'NT', name: 'Northern Territory', agency: 'Bushfires NT / SecureNT', site: 'https://securent.nt.gov.au/alerts' },
];

const level = (s) => LEVELS.find((l) => l.toLowerCase() === String(s ?? '').trim().toLowerCase()) ?? null;
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const titleCase = (s) => clean(s).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const iso = (d) => { const t = new Date(d); return Number.isNaN(t.getTime()) ? null : t.toISOString(); };
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/,/g, '')); return Number.isFinite(n) ? n : null; };
function firstPoint(g) {
  if (!g) return null;
  if (g.type === 'Point') return g.coordinates;
  if (g.type === 'GeometryCollection') { for (const x of g.geometries) { const p = firstPoint(x); if (p) return p; } return null; }
  let c = g.coordinates; while (Array.isArray(c) && Array.isArray(c[0])) c = c[0];
  return Array.isArray(c) ? c : null;
}
const isBushfire = (s) => /bush|grass|scrub|forest|vegetation/i.test(s ?? '') && !/hazard reduction|planned|burn off|prescribed/i.test(s ?? '');

function parseNSW(j) {
  return j.features.map((f) => {
    const p = f.properties, field = (k) => clean((p.description.match(new RegExp(`${k}:\\s*([^<]*)`, 'i')) || [])[1]);
    if (!/yes/i.test(field('FIRE')) || !isBushfire(field('TYPE'))) return null;
    const m = p.pubDate.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+) (AM|PM)/); // dd/mm/yyyy, UTC
    const h = m ? (+m[4] % 12) + (m[7] === 'PM' ? 12 : 0) : 0;
    const pt = firstPoint(f.geometry);
    return { id: 'nsw-' + p.guid.split('/').pop(), name: titleCase(p.title), location: titleCase(field('LOCATION').replace(/,?\s*NSW\s*\d{4}$|\s+\d{4}$/i, '')), area: field('COUNCIL AREA'),
      level: level(p.category), status: field('STATUS'), type: field('TYPE'), sizeHa: num(field('SIZE')),
      updated: m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], h, +m[5], +m[6])).toISOString() : null, lat: pt?.[1] ?? null, lng: pt?.[0] ?? null };
  });
}
function parseQLD(j) {
  return j.features.map((f) => {
    const p = f.properties;
    if (!/fire/i.test(p.EventType ?? '') || /permitted burn/i.test(p.GroupedType ?? '') || /hazard reduction/i.test(p.CallToAction ?? '')) return null;
    const lvl = level(p.WarningLevel), cta = clean(p.CallToAction);
    return { id: 'qld-' + p.UniqueID, name: clean(p.WarningArea || p.WarningTitle), location: clean(String(p.Header ?? '').split(/\r?\n/)[0]), area: null,
      level: lvl, status: cta.length <= 40 ? titleCase(cta) : 'Smoke may affect the area', type: lvl ? 'Bushfire warning' : 'Vegetation fire', sizeHa: null,
      updated: iso(p.ItemDateTimeLocal_ISO), lat: p.Latitude ?? null, lng: p.Longitude ?? null };
  });
}
function parseVIC(j) {
  return j.features.map((f) => {
    const p = f.properties, pt = firstPoint(f.geometry);
    const incident = p.feedType === 'incident' && p.category1 === 'Fire' && isBushfire(p.category2);
    const warning = p.feedType === 'warning' && /fire/i.test(p.category2 ?? '') && level(p.category1);
    if (!incident && !warning) return null;
    return { id: 'vic-' + p.id, name: clean(p.sourceTitle || p.location), location: clean(p.location), area: null,
      level: warning ? level(p.category1) : null, status: clean(p.status), type: warning ? 'Bushfire warning' : clean(p.category2), sizeHa: num(p.size),
      updated: iso(p.updated ?? p.created), lat: pt?.[1] ?? null, lng: pt?.[0] ?? null };
  });
}
function parseWA(j) {
  return j.incidents.map((p) => {
    if (!isBushfire(p['incident-type'])) return null;
    const suburbs = (p.suburbs ?? []).map(titleCase).join(', ');
    return { id: 'wa-' + p.id, name: suburbs || titleCase(p.location?.value), location: titleCase(p.location?.value), area: (p.lga ?? []).map(titleCase).join(', ') || null,
      level: null, status: clean(p['incident-status']), type: clean(p['incident-type']), sizeHa: num(p['area-burnt']),
      updated: iso(p['updated-date-time']), lat: p.location?.latitude ?? null, lng: p.location?.longitude ?? null };
  });
}
function parseSA(j) {
  const list = Array.isArray(j) ? j : j.incidents ?? [];
  return list.map((p) => {
    if (!isBushfire(p.Type)) return null;
    const [lat, lng] = String(p.Location ?? '').split(',').map(Number);
    const d = String(p.Date ?? '').match(/(\d+)\/(\d+)\/(\d+)/);
    return { id: 'sa-' + p.IncidentNo, name: titleCase(p.Location_name), location: titleCase(p.Location_name), area: clean(p.Region) || null,
      level: level(p.Level_name ?? p.Level), status: titleCase(p.Status), type: titleCase(p.Type), sizeHa: null,
      updated: d ? iso(`${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}T${p.Time || '00:00'}:00+10:30`) : null,
      lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null };
  });
}
function parseACT(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, it]) => {
    const tag = (t) => clean((it.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1]).replace(/&#xD;/g, '');
    const desc = (k) => clean((it.match(new RegExp(`${k}:\\s*([^\\n&]*)`)) || [])[1]);
    if (!isBushfire(tag('type'))) return null;
    const [lat, lng] = tag('georss:point').split(' ').map(Number);
    const u = desc('Updated').match(/(\d+) (\w+) (\d+) (\d+:\d+:\d+)/);
    return { id: 'act-' + tag('guid'), name: titleCase(desc('Suburb') || tag('title')), location: titleCase(desc('Location')), area: null,
      level: null, status: desc('Status'), type: titleCase(tag('type')), sizeHa: null,
      updated: u ? iso(`${u[1]} ${u[2]} ${u[3]} ${u[4]} GMT+1100`) : null, lat: lat || null, lng: lng || null };
  });
}

async function load(src) {
  const res = await fetch(src.url, { headers: { 'User-Agent': UA, Accept: 'application/json, text/xml, */*' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let buf = Buffer.from(await res.arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = gunzipSync(buf);
  const body = buf.toString('utf8');
  return src.parse(src.text ? body : JSON.parse(body)).filter(Boolean).map((i) => ({ state: src.state, ...i }));
}

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { sources: [], incidents: [] };
const now = new Date().toISOString();
const sources = [], incidents = [];

for (const src of SOURCES) {
  const meta = { state: src.state, name: src.name, agency: src.agency, site: src.site, feed: Boolean(src.url) };
  if (!src.url) { sources.push({ ...meta, ok: false, count: 0, fetchedAt: null }); continue; }
  try {
    const list = await load(src);
    incidents.push(...list);
    sources.push({ ...meta, ok: true, count: list.length, fetchedAt: now });
    console.log(`[incidents] ${src.state}: ${list.length}`);
  } catch (err) {
    const old = previous.incidents.filter((i) => i.state === src.state);
    const oldMeta = previous.sources.find((s) => s.state === src.state);
    incidents.push(...old);
    sources.push({ ...meta, ok: false, count: old.length, fetchedAt: oldMeta?.fetchedAt ?? null });
    console.warn(`[incidents] ${src.state}: feed unavailable (${err.message}); kept ${old.length} earlier entries`);
  }
}

// ---- Satellite hotspots (Digital Earth Australia Hotspots, Geoscience Australia; free, no key) ----
// Heat detections from satellites over the last 24 hours. These are not incidents: they include
// planned burns and other heat sources. Tens of thousands of points, so they are grouped into
// 0.1 degree cells (about 10 km) for the map, and counted per state.
const HOTSPOTS_OUT = fileURLToPath(new URL('../public/data/hotspots.json', import.meta.url));
const HOTSPOT_SOURCE = { name: 'Digital Earth Australia Hotspots', agency: 'Geoscience Australia', site: 'https://hotspots.dea.ga.gov.au/' };
let hotspots = previous.hotspots ?? { ...HOTSPOT_SOURCE, ok: false, fetchedAt: null, total: 0, byState: {} };
try {
  const q = new URLSearchParams({
    service: 'WFS', version: '1.1.0', request: 'GetFeature', typeName: 'public:hotspots_three_days', outputFormat: 'application/json',
    propertyName: 'latitude,longitude,australian_state,hours_since_hotspot',
    cql_filter: 'hours_since_hotspot<24 AND confidence>=50 AND australian_state IS NOT NULL',
  });
  const res = await fetch(`https://hotspots.dea.ga.gov.au/geoserver/wfs?${q}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(180000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { features } = await res.json();
  const cells = new Map(), byState = {};
  for (const f of features) {
    const p = f.properties, st = clean(p.australian_state);
    if (!st) continue;
    byState[st] = (byState[st] ?? 0) + 1;
    const key = `${Math.round(p.latitude * 10)},${Math.round(p.longitude * 10)}`;
    const c = cells.get(key) ?? { n: 0, h: 99 };
    c.n++; c.h = Math.min(c.h, p.hours_since_hotspot);
    cells.set(key, c);
  }
  // [lat, lng, detections, hours since the most recent one]
  const list = [...cells].map(([k, c]) => { const [la, lo] = k.split(',').map(Number); return [la / 10, lo / 10, c.n, Math.round(c.h)]; });
  mkdirSync(fileURLToPath(new URL('../public/data/', import.meta.url)), { recursive: true });
  writeFileSync(HOTSPOTS_OUT, JSON.stringify({ generatedAt: now, cells: list }));
  hotspots = { ...HOTSPOT_SOURCE, ok: true, fetchedAt: now, total: features.length, byState };
  console.log(`[hotspots] ${features.length} detections in ${list.length} map cells`);
} catch (err) {
  hotspots = { ...hotspots, ok: false };
  console.warn(`[hotspots] unavailable (${err.message}); kept earlier data`);
}

const rank = (i) => (i.level ? LEVELS.length - LEVELS.indexOf(i.level) : 0);
incidents.sort((a, b) => rank(b) - rank(a) || String(b.updated).localeCompare(String(a.updated)));
writeFileSync(OUT, JSON.stringify({ generatedAt: now, sources, hotspots, incidents }, null, 1) + '\n');
console.log(`[incidents] wrote ${incidents.length} incidents`);
