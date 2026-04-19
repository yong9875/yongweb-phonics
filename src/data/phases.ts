export interface PhonicsItem {
  id: string;
  display: string;
  ipa: string;
  audioText: string;
  example?: string;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  items: PhonicsItem[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    title: "Foundation",
    description: "26 letters basic sounds",
    items: [
      { id: 'a', display: 'a', ipa: '/æ/', audioText: 'a for apple' },
      { id: 'b', display: 'b', ipa: '/b/', audioText: 'b for bat' },
      { id: 'c', display: 'c', ipa: '/k/', audioText: 'c for cat' },
      { id: 'd', display: 'd', ipa: '/d/', audioText: 'd for dog' },
      { id: 'e', display: 'e', ipa: '/ɛ/', audioText: 'e for egg' },
      { id: 'f', display: 'f', ipa: '/f/', audioText: 'f for fish' },
      { id: 'g', display: 'g', ipa: '/ɡ/', audioText: 'g for goat' },
      { id: 'h', display: 'h', ipa: '/h/', audioText: 'h for hat' },
      { id: 'i', display: 'i', ipa: '/ɪ/', audioText: 'i for igloo' },
      { id: 'j', display: 'j', ipa: '/dʒ/', audioText: 'j for jet' },
      { id: 'k', display: 'k', ipa: '/k/', audioText: 'k for kite' },
      { id: 'l', display: 'l', ipa: '/l/', audioText: 'l for lion' },
      { id: 'm', display: 'm', ipa: '/m/', audioText: 'm for monkey' },
      { id: 'n', display: 'n', ipa: '/n/', audioText: 'n for net' },
      { id: 'o', display: 'o', ipa: '/ɒ/', audioText: 'o for octopus' },
      { id: 'p', display: 'p', ipa: '/p/', audioText: 'p for pig' },
      { id: 'q', display: 'q', ipa: '/kw/', audioText: 'q for queen' },
      { id: 'r', display: 'r', ipa: '/r/', audioText: 'r for rabbit' },
      { id: 's', display: 's', ipa: '/s/', audioText: 's for sun' },
      { id: 't', display: 't', ipa: '/t/', audioText: 't for tiger' },
      { id: 'u', display: 'u', ipa: '/ʌ/', audioText: 'u for umbrella' },
      { id: 'v', display: 'v', ipa: '/v/', audioText: 'v for van' },
      { id: 'w', display: 'w', ipa: '/w/', audioText: 'w for watch' },
      { id: 'x', display: 'x', ipa: '/ks/', audioText: 'x for box' },
      { id: 'y', display: 'y', ipa: '/j/', audioText: 'y for yo-yo' },
      { id: 'z', display: 'z', ipa: '/z/', audioText: 'z for zebra' },
    ]
  },
  {
    id: 2,
    title: "CVC Blending",
    description: "3-letter magic words",
    items: [
      { id: 'cat', display: 'cat', ipa: '/kæt/', audioText: 'c-a-t, cat' },
      { id: 'dog', display: 'dog', ipa: '/dɒɡ/', audioText: 'd-o-g, dog' },
      { id: 'pig', display: 'pig', ipa: '/pɪɡ/', audioText: 'p-i-g, pig' },
      { id: 'hat', display: 'hat', ipa: '/hæt/', audioText: 'h-a-t, hat' },
      { id: 'sun', display: 'sun', ipa: '/sʌn/', audioText: 's-u-n, sun' },
      { id: 'bed', display: 'bed', ipa: '/bɛd/', audioText: 'b-e-d, bed' },
      { id: 'bus', display: 'bus', ipa: '/bʌs/', audioText: 'b-u-s, bus' },
      { id: 'mop', display: 'mop', ipa: '/mɒp/', audioText: 'm-o-p, mop' },
    ]
  },
  {
    id: 3,
    title: "Patterns",
    description: "Digraphs and combinations",
    items: [
      { id: 'sh', display: 'sh', ipa: '/ʃ/', audioText: 'sh for fish' },
      { id: 'ch', display: 'ch', ipa: '/tʃ/', audioText: 'ch for chips' },
      { id: 'th', display: 'th', ipa: '/θ/', audioText: 'th for thin' },
      { id: 'ee', display: 'ee', ipa: '/iː/', audioText: 'e-e for bee' },
      { id: 'ai', display: 'ai', ipa: '/eɪ/', audioText: 'a-i for rain' },
      { id: 'oa', display: 'oa', ipa: '/oʊ/', audioText: 'o-a for boat' },
    ]
  },
  {
    id: 4,
    title: "Rules",
    description: "Magic E and transitions",
    items: [
      { id: 'cake', display: 'cake', ipa: '/keɪk/', audioText: 'c-a-k-e, cake' },
      { id: 'bike', display: 'bike', ipa: '/baɪk/', audioText: 'b-i-k-e, bike' },
      { id: 'hope', display: 'hope', ipa: '/hoʊp/', audioText: 'h-o-p-e, hope' },
      { id: 'note', display: 'note', ipa: '/noʊt/', audioText: 'n-o-t-e, note' },
      { id: 'size', display: 'size', ipa: '/saɪz/', audioText: 's-i-z-e, size' },
    ]
  }
];
