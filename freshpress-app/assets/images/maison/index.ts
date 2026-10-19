/**
 * Lovable Maison template images — bundled local assets.
 * Used across hero sections, service cards, and editorial strips.
 */

export const MaisonImages = {
  // Full-bleed hero (living room — main hero)
  hero: require('./no-revisions-qYODM2MGLWs-unsplash.jpg'),
  // Featured service section (architecture / clean lines)
  featuredService: require('./img5.jpg'),
  // Services grid cards
  washFold: require('./img-1.png'),
  dryCleaning: require('./img-2.png'),
  ironing: require('./img-3.png'),
  shoeClean: require('./img-4.png'),
  premium: require('./img-5.png'),
  // Shop cards background
  shop1: require('./photo-1600210492486-724fe5c67fb0.jpg'),
  shop2: require('./photo-1586023492125-27b2c045efd7.jpg'),
  shop3: require('./photo-1584100936595-c0654b55a2e2.jpg'),
  // About strip / editorial
  about: require('./photo-1616486338812-3dadae4b4ace.jpg'),
  // Lifestyle grid (Instagram-style)
  grid1: require('./photo-1618221195710-dd6b41faaea6.jpg'),
  grid2: require('./photo-1600210492486-724fe5c67fb0.jpg'),
  grid3: require('./photo-1600585154340-be6161a56a0c.jpg'),
  grid4: require('./photo-1586023492125-27b2c045efd7.jpg'),
  grid5: require('./photo-1565193566173-7a0ee3dbe261.jpg'),
  grid6: require('./photo-1578500494198-246f612d3b3d.jpg'),
  // Auth / onboarding
  authBg: require('./photo-1598300042247-d088f8ab3a91.jpg'),
  onboarding1: require('./photo-1618221195710-dd6b41faaea6.jpg'),
  onboarding2: require('./photo-1600607687939-ce8a6c25118c.jpg'),
  onboarding3: require('./photo-1524484485831-a92ffc0de03f.jpg'),
} as const;

export type MaisonImageKey = keyof typeof MaisonImages;
