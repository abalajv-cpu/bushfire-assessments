// Writes this week's "Bushfire update" article from src/data/incidents.json.
// One article per week (file named for the Monday), rewritten on every run so it stays current.
// The text is assembled from the feed data only: nothing is invented.
// Set ROUNDUP_DRAFT=true to write articles as drafts (not published) for manual review.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DATA = fileURLToPath(new URL('../src/data/incidents.json', import.meta.url));
const DIR = fileURLToPath(new URL('../src/content/articles/', import.meta.url));
const { generatedAt, sources, incidents, hotspots } = JSON.parse(readFileSync(DATA, 'utf8'));
const draft = process.env.ROUNDUP_DRAFT === 'true';

const TZ = 'Australia/Sydney';
const now = new Date(generatedAt);
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(now).map((p) => [p.type, p.value]));
const today = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day));
const back = (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday) + 7) % 7;
const monday = new Date(today.getTime() - back * 864e5);
const ymd = (d) => d.toISOString().slice(0, 10);
const longDate = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const asAt = now.toLocaleString('en-AU', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const count = (list, lvl) => list.filter((i) => i.level === lvl).length;
const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim() || '-';

const ew = count(incidents, 'Emergency Warning'), wa = count(incidents, 'Watch and Act'), adv = count(incidents, 'Advice');
const live = sources.filter((s) => s.ok);
const missing = sources.filter((s) => !s.ok);

let md = `---
title: "Bushfire update: week of ${longDate(monday)}"
description: "Current bushfires across Australia as at ${longDate(today)}: ${plural(incidents.length, 'incident')} listed by state fire services, with ${ew} at Emergency Warning and ${wa} at Watch and Act."
date: ${ymd(monday)}
updated: ${now.toISOString()}
category: "Bushfire updates"
draft: ${draft}
---

As at ${asAt}, state fire services were listing **${plural(incidents.length, 'bushfire and grass fire incident')}** across ${live.map((s) => s.name).join(', ').replace(/, ([^,]*)$/, ' and $1')}.

`;
md += ew + wa + adv === 0
  ? 'No incidents were at a warning level when this update was generated.\n\n'
  : `Of those, **${ew}** ${ew === 1 ? 'was' : 'were'} at Emergency Warning, **${wa}** at Watch and Act and **${adv}** at Advice.\n\n`;
md += `> This is an automated summary of public fire service data and can be out of date within minutes. It is not a warning service. In an emergency call Triple Zero (000), and always check your state fire service for current warnings.\n\n`;
md += `See the [live current bushfires page](/bushfires/) for the latest list.\n\n`;

for (const s of live) {
  const list = incidents.filter((i) => i.state === s.state);
  md += `## ${s.name}\n\n`;
  if (!list.length) { md += `${s.agency} was not listing any bushfire or grass fire incidents.\n\n`; continue; }
  const lv = ['Emergency Warning', 'Watch and Act', 'Advice'].map((l) => [l, count(list, l)]).filter(([, n]) => n);
  md += `${s.agency} was listing ${plural(list.length, 'incident')}${lv.length ? `, including ${lv.map(([l, n]) => `${n} at ${l}`).join(', ')}` : ', none at a warning level'}.\n\n`;
  const warned = list.filter((i) => i.level);
  const rows = (warned.length ? warned : [...list].sort((a, b) => (b.sizeHa ?? 0) - (a.sizeHa ?? 0))).slice(0, 8);
  md += `| Incident | Alert level | Status | Size |\n| --- | --- | --- | --- |\n`;
  for (const i of rows) md += `| ${cell(i.name)}${i.area ? ` (${cell(i.area)})` : ''} | ${i.level ?? '-'} | ${cell(i.status)} | ${i.sizeHa ? `${i.sizeHa.toLocaleString('en-AU')} ha` : '-'} |\n`;
  md += `\n${warned.length ? 'Incidents at a warning level are shown.' : 'The largest listed incidents are shown.'} Source: [${s.agency}](${s.site}).\n\n`;
}

if (hotspots?.total) {
  const order = sources.map((s) => s.state).filter((st) => hotspots.byState[st]);
  md += `## Satellite hotspots\n\nSatellites recorded **${hotspots.total.toLocaleString('en-AU')} fire hotspot detections** across Australia in the 24 hours before this update. Hotspots are heat detections, not confirmed bushfires. One fire is usually detected many times, and the count includes planned burns and other heat sources. They are the only data shown here for states without an incident feed.\n\n`;
  md += `| State or territory | Hotspots in 24 hours |\n| --- | --- |\n`;
  for (const st of order) md += `| ${sources.find((s) => s.state === st).name} | ${hotspots.byState[st].toLocaleString('en-AU')} |\n`;
  md += `\nSource: [${hotspots.name}](${hotspots.site}), ${hotspots.agency}. Hotspot data is not real time and must not be used for safety decisions.\n\n`;
}

if (missing.length) {
  md += `## Other states and territories\n\nIncident data was not available for ${missing.map((s) => s.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} when this update was generated. Check the official sources:\n\n`;
  md += missing.map((s) => `- [${s.agency}](${s.site})`).join('\n') + '\n\n';
}

md += `## Building or renovating in a bushfire prone area?\n\nA Bushfire Attack Level (BAL) assessment tells you how your home needs to be built. Read [what a BAL rating is](/blog/what-is-a-bal-rating/) or see our [BAL assessment service](/services/bal-assessment/).\n`;

mkdirSync(DIR, { recursive: true });
const file = `${DIR}bushfire-update-${ymd(monday)}.md`;
writeFileSync(file, md);
console.log(`[roundup] wrote ${file}${draft ? ' (draft)' : ''}`);
