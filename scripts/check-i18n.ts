import fs from 'node:fs';

function flat(obj: any, p = '', out: Record<string,string> = {}) {
  for (const k in obj) {
    const key = p ? `${p}.${k}` : k;
    if (obj[k] && typeof obj[k] === 'object') flat(obj[k], key, out);
    else out[key] = String(obj[k]);
  }
  return out;
}

try {
  const it = flat(JSON.parse(fs.readFileSync('messages/it.json','utf8')));
  const en = flat(JSON.parse(fs.readFileSync('messages/en.json','utf8')));

  const missing = Object.keys(it).filter(k => !(k in en));
  if (missing.length) {
    console.error('Missing EN keys:\n' + missing.map(k => ` - ${k}`).join('\n'));
    process.exit(1);
  }
  console.log('i18n OK');
} catch (error) {
  console.error('Error checking i18n:', error);
  process.exit(1);
}
