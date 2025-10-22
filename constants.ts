import { LookType } from './types';

export const STYLE_OPTIONS: { [key in LookType]: string[] } = {
  [LookType.HIJAB]: ['Gaya Jalanan Urban', 'Minimalis ala Korea', 'Kasual Elegan', 'Bohemian Chic', 'Office Look Profesional', 'Smart Casual Modern'],
  [LookType.NON_HIJAB]: ['Minimalis Elegan', 'Soft Preppy', 'Akademia Klasik', 'Bisnis Kasual nan Anggun', 'Estetika Grunge Lembut', 'Y2K Revival', 'Streetwear Kontemporer'],
};

export const CLOTHING_OPTIONS: { [key in LookType]: string[] } = {
  [LookType.HIJAB]: [
    'Gaun flowy panjang dipadukan dengan kardigan rajut longgar.',
    'Setelan blazer oversized dengan celana wide-leg.',
    'Sweater rajut yang dimasukkan ke dalam rok plisket panjang.',
    'Gaya tumpuk: tunik di atas kemeja lengan panjang dan celana jeans.',
    'Kemeja flanel oversized sebagai outer dengan kaus dan celana kargo.',
    'Abaya modern dengan detail bordir minimalis.',
    'Blus bahan crinkle dengan rok A-line.',
  ],
  [LookType.NON_HIJAB]: [
    'Slip dress elegan berbahan satin dengan lengan panjang.',
    'Turtleneck berbahan rajut dipadukan dengan rok mini motif tartan.',
    'Kemeja klasik berkancing dengan celana high-waisted bahan katun.',
    'Sweater oversized yang nyaman dengan celana jeans model lurus.',
    'Kaus band vintage dipasangkan dengan rok kulit dan sepatu bot.',
    'Crop top dengan celana parachute low-rise.',
    'Corset top dipadukan dengan celana jeans baggy.',
    'Setelan vest dan celana bahan linen.',
  ],
};

export const HIJAB_STYLE_OPTIONS: string[] = [
  'Hijab bahan matte yang dililit rapi dan sederhana.',
  'Hijab sifon yang flowy dan menjuntai elegan.',
  'Gaya turban modern menggunakan bahan sutra.',
  'Lilitan kasual menggunakan scarf katun bertekstur.',
  'Pashmina yang dililit sederhana di leher untuk gaya effortless.',
  'Gaya hijab plisket yang memberikan volume.',
  'Hijab pashmina inner yang praktis dan modern.',
  'Gaya Melayu yang menutupi dada dengan juntaian anggun.',
];

export const HAIR_STYLE_OPTIONS: string[] = [
  'Potongan Butterfly Cut bervolume dengan gelombang lembut.',
  'Rambut lurus dan sleek ala "glass hair" dengan potongan bob yang tajam.',
  'Cepol tinggi berantakan (messy bun) dengan poni tirai yang membingkai wajah.',
  'Gelombang panjang dan lembut ala "beachy waves".',
  'Potongan pixie cut yang edgy dan modern.',
  'Potongan Wolf Cut dengan layer yang dinamis.',
  'Rambut dikepang model "bubble braids".',
  'Potongan shaggy modern dengan banyak tekstur.',
];