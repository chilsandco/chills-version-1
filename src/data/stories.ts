// One sharp line per product, condensed from its WooCommerce story. The full
// text stays in WooCommerce and opens from "Read the full story".
export const STORIES: Record<string, string> = {
  '16': 'Some identities aren’t chosen. They’re built, one line of code at a time.',
  '36': 'For everyone who has fought timing closure, and won.',
  '45': 'Made only for black, where the orange type hits hardest.',
  '54': 'Frameworks come and go. The developer mindset doesn’t.',
  '68': 'Some essentials never need to shout.',
  '77': 'Nothing great ships in a single release.',
  '86': 'Every great idea now begins with a prompt.',
  '110': 'Every project starts the same way: a blank editor, waiting.',
  '140': 'Anyone can write code. The best write software that outlives them.',
  '165': 'Every digital system has a heartbeat. It’s called a clock cycle.',
  '174': 'Perfection isn’t released. It’s refined.',
  '185': 'Great ideas get tested, broken and rebuilt long before anyone notices.',
  '198': 'Some people hear a heartbeat. A VLSI engineer sees a clock signal.',
  '207': 'Every developer once promised to just fix one bug.',
  '222': 'The future belongs to those who understand change.',
  '231': 'Not every victory is won on a battlefield. Some take the long way home.',
  '240': 'The beautiful chaos of chip design, mapped onto the human brain.',
  '276': 'Great code is rarely written alone anymore.',
  '282': 'The best performance tuning happens while you sleep.',
  '315': 'The quiet standard that connects everything.',
  '330': 'Step away from the ticket queue. One block at a time.',
  '350': 'Every connection is planned, except the ones that matter most.',
  '364': 'The most powerful tool in engineering is the word no.',
  '373': 'The developer’s worst-kept secret: the perfectly engineered prompt.',
  '379': 'A quiet nod to who really wrote that code.',
  '393': 'Everything feels original, until you check the stack.',
  '402': 'Named for the layer that keeps everything stable.',
  '411': 'Back to a stable state. Everything cleared.',
  '420': 'The steady, calm hum of a system running well.',
  '429': 'When everything fails: halt, isolate, rebuild from zero.',
  '438': 'All of computing rests on one flawless structure.',
  '446': 'Built on what doesn’t change.',
  '455': 'Power only what matters. Switch off the rest.',
  '464': 'No heavy abstractions. Just direct, efficient work.',
  '473': 'You don’t need to see inside to know it works.',
  '482': 'In production it’s a bug. In culture, it’s how we get better.',
  '491': 'Momentum, made visible.',
  '500': 'Real engineering happens quietly.',
  '508': 'Drop the layers. Get closer to the metal.',
  '517': 'The best systems feel simple.',
  '526': 'Stress-tested and ready to go live.',
  '536': 'Constant, reliable and always there.',
  '546': 'Steady rules keep everything in harmony.',
  '555': 'The layer that carries all the power.',
  '564': 'Less glare. More focus.',
  '573': 'Every crash leaves a trail. Follow it.',
  '582': 'A weathered texture that creeps in slowly, like the bug it’s named after.',
  '591': 'When things run hot, know when to ease off.',
  '600': 'Find the message in the noise.',
  '609': 'A clean slate, before anything is assigned.',
  '618': 'The lowest energy. The steadiest state.',
  '627': 'Stay cool when the system pushes its limits.',
  '636': 'Some colours never go out of style.',
  '645': 'Not every statement needs to be loud.',
  '654': 'The one workout developers never signed up for: merge conflicts.',
  '663': 'It starts with one timing violation at 2 AM.',
  '678': 'Every sprint is a race against time. Only one can win.',
  '687': 'The editor that shaped a generation of developers.',
  '697': 'More than a brand. A community of people who build.',
  '761': 'For the days when the only status update is no.',
  '706': 'Broken production? Mysterious code at 2 AM? Probably Claude.',
  '716': 'For most people an ECG measures life. For a VLSI engineer, timing.',
  '725': 'Every machine needs a restart. So do you.',
  '734': 'Technology isn’t built alone.',
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
