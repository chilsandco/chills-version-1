// One sharp line per product, condensed from its WooCommerce story. The full
// text stays in WooCommerce and opens from "Read the full story".
export const STORIES: Record<string, string> = {
  '2048': 'Some identities aren’t chosen. They’re built, one line of code at a time.',
  '2031': 'For everyone who has fought timing closure, and won.',
  '2026': 'Made only for black, where the orange type hits hardest.',
  '2011': 'Frameworks come and go. The developer mindset doesn’t.',
  '1961': 'Some essentials never need to shout.',
  '1952': 'Nothing great ships in a single release.',
  '1923': 'Every great idea now begins with a prompt.',
  '1918': 'Every project starts the same way: a blank editor, waiting.',
  '1896': 'Anyone can write code. The best write software that outlives them.',
  '1890': 'Every digital system has a heartbeat. It’s called a clock cycle.',
  '1885': 'Perfection isn’t released. It’s refined.',
  '1813': 'Great ideas get tested, broken and rebuilt long before anyone notices.',
  '1801': 'Some people hear a heartbeat. A VLSI engineer sees a clock signal.',
  '1779': 'Every developer once promised to just fix one bug.',
  '1755': 'The future belongs to those who understand change.',
  '1683': 'Not every victory is won on a battlefield. Some take the long way home.',
  '1608': 'The beautiful chaos of chip design, mapped onto the human brain.',
  '1592': 'Great code is rarely written alone anymore.',
  '1571': 'The best performance tuning happens while you sleep.',
  '1505': 'The quiet standard that connects everything.',
  '1479': 'Step away from the ticket queue. One block at a time.',
  '1452': 'Every connection is planned, except the ones that matter most.',
  '1447': 'The most powerful tool in engineering is the word no.',
  '1426': 'The developer’s worst-kept secret: the perfectly engineered prompt.',
  '1421': 'A quiet nod to who really wrote that code.',
  '1364': 'Everything feels original, until you check the stack.',
  '1325': 'Named for the layer that keeps everything stable.',
  '1320': 'Back to a stable state. Everything cleared.',
  '1315': 'The steady, calm hum of a system running well.',
  '1311': 'When everything fails: halt, isolate, rebuild from zero.',
  '1306': 'All of computing rests on one flawless structure.',
  '1301': 'Built on what doesn’t change.',
  '1296': 'Power only what matters. Switch off the rest.',
  '1291': 'No heavy abstractions. Just direct, efficient work.',
  '1286': 'You don’t need to see inside to know it works.',
  '1281': 'In production it’s a bug. In culture, it’s how we get better.',
  '1276': 'Momentum, made visible.',
  '1267': 'Real engineering happens quietly.',
  '1261': 'Drop the layers. Get closer to the metal.',
  '1256': 'The best systems feel simple.',
  '1134': 'Stress-tested and ready to go live.',
  '1128': 'Constant, reliable and always there.',
  '1115': 'Steady rules keep everything in harmony.',
  '1110': 'The layer that carries all the power.',
  '1105': 'Less glare. More focus.',
  '1092': 'Every crash leaves a trail. Follow it.',
  '1081': 'A weathered texture that creeps in slowly, like the bug it’s named after.',
  '1059': 'When things run hot, know when to ease off.',
  '1053': 'Find the message in the noise.',
  '1047': 'A clean slate, before anything is assigned.',
  '1041': 'The lowest energy. The steadiest state.',
  '1008': 'Stay cool when the system pushes its limits.',
  '1003': 'Some colours never go out of style.',
  '991': 'Not every statement needs to be loud.',
  '827': 'The one workout developers never signed up for: merge conflicts.',
  '817': 'It starts with one timing violation at 2 AM.',
  '810': 'Every sprint is a race against time. Only one can win.',
  '790': 'The editor that shaped a generation of developers.',
  '770': 'More than a brand. A community of people who build.',
  '761': 'For the days when the only status update is no.',
  '754': 'Broken production? Mysterious code at 2 AM? Probably Claude.',
  '753': 'For most people an ECG measures life. For a VLSI engineer, timing.',
  '719': 'Every machine needs a restart. So do you.',
  '710': 'Technology isn’t built alone.',
};

/** Four at-a-glance specs, read from the product's own description. */
export function keySpecs(description: string, fit?: string) {
  const d = description || '';
  const specs: { label: string; value: string }[] = [];
  const gsm = d.match(/(\d{3}(?:\s*[–-]\s*\d{3})?)\s*GSM/i);
  if (gsm) specs.push({ label: 'Weight', value: `${gsm[1].replace(/\s/g, '')} GSM` });
  const fabric =
    /twintex/i.test(d) ? 'TwinTex' :
    /double pique/i.test(d) ? 'Double pique' :
    /(\d{2})%\s*cotton,\s*(\d{2})%\s*poly/i.test(d) ? d.match(/(\d{2})%\s*cotton,\s*(\d{2})%\s*poly/i)!.slice(1).join('/') + ' blend' :
    /poly-?cotton/i.test(d) ? 'Polycotton' :
    /100%\s*(premium\s*)?cotton|premium 100% cotton/i.test(d) ? '100% cotton' : null;
  if (fabric) specs.push({ label: 'Fabric', value: fabric });
  const cut = /oversized/i.test(fit || '') || /oversized/i.test(d) ? 'Oversized' : /relaxed/i.test(d) ? 'Relaxed' : /regular/i.test(fit || d) ? 'Regular' : null;
  if (cut) specs.push({ label: 'Fit', value: cut });
  const finish =
    /sun-?faded/i.test(d) ? 'Sun-faded' :
    /acid|stone wash/i.test(d) ? 'Washed' :
    /bio-?wash/i.test(d) ? 'Bio-washed' :
    /dtf/i.test(d) ? 'DTF print' : null;
  if (finish) specs.push({ label: 'Finish', value: finish });
  return specs;
}
