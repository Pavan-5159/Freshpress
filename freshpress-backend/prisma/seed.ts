/**
 * Prisma Seed — FreshPress Home Page Data
 *
 * Populates: cities, shop-owner users, shops, service categories,
 *            services, and home banners.
 *
 * Run with:  npx prisma db seed
 */

import { PrismaClient, ShopStatus, PricingModel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database…');

  // ── 1. City ─────────────────────────────────────────────────────────────────
  const pune = await prisma.city.upsert({
    where: { id: 'c1000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Pune',
      state: 'Maharashtra',
      deliveryRadiusKm: 10,
      baseDeliveryPaise: 4000,
      perKmPaise: 500,
    },
  });
  console.log(`  ✔ City: ${pune.name}`);

  // ── 2. Shop owner users ──────────────────────────────────────────────────────
  const ownerData = [
    { id: 'u1000000-0000-0000-0000-000000000001', phone: '+919876500001', name: 'Ramesh Kumar', email: 'ramesh@freshpress.app' },
    { id: 'u1000000-0000-0000-0000-000000000002', phone: '+919876500002', name: 'Priya Sharma', email: 'priya@freshpress.app' },
    { id: 'u1000000-0000-0000-0000-000000000003', phone: '+919876500003', name: 'Suresh Patel', email: 'suresh@freshpress.app' },
    { id: 'u1000000-0000-0000-0000-000000000004', phone: '+919876500004', name: 'Anjali Singh', email: 'anjali@freshpress.app' },
    { id: 'u1000000-0000-0000-0000-000000000005', phone: '+919876500005', name: 'Vikram Mehta', email: 'vikram@freshpress.app' },
  ];

  for (const owner of ownerData) {
    await prisma.user.upsert({
      where: { id: owner.id },
      update: {},
      create: { ...owner, role: 'SHOP_OWNER' },
    });
  }
  console.log(`  ✔ ${ownerData.length} shop owner users`);

  // ── 3. Shops ─────────────────────────────────────────────────────────────────
  const shopData = [
    {
      id: 's1000000-0000-0000-0000-000000000001',
      ownerId: 'u1000000-0000-0000-0000-000000000001',
      cityId: pune.id,
      name: 'FreshPress Express',
      slug: 'freshpress-express-1',
      description: 'Premium laundry and dry cleaning service with same-day delivery in Koregaon Park.',
      phone: '+919000000001',
      addressLine: 'Shop 4, Lane 5, Koregaon Park',
      cityName: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      lat: 18.5362,
      lng: 73.8938,
      status: ShopStatus.ACTIVE,
      isOpen: true,
      logoUrl: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=400&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=400&fit=crop',
      ratingAvg: 4.5,
      ratingCount: 162,
      totalOrders: 1240,
    },
    {
      id: 's1000000-0000-0000-0000-000000000002',
      ownerId: 'u1000000-0000-0000-0000-000000000002',
      cityId: pune.id,
      name: 'CleanCraft Laundry',
      slug: 'cleancraft-laundry',
      description: 'Expert dry cleaning and garment care in Baner. We handle delicate fabrics with care.',
      phone: '+919000000002',
      addressLine: '12, Baner Road, Near Orchid Hotel',
      cityName: 'Pune',
      state: 'Maharashtra',
      pincode: '411045',
      lat: 18.5590,
      lng: 73.7898,
      status: ShopStatus.ACTIVE,
      isOpen: true,
      logoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1200&h=400&fit=crop',
      ratingAvg: 4.3,
      ratingCount: 98,
      totalOrders: 876,
    },
    {
      id: 's1000000-0000-0000-0000-000000000003',
      ownerId: 'u1000000-0000-0000-0000-000000000003',
      cityId: pune.id,
      name: 'Sparkle Wash & Fold',
      slug: 'sparkle-wash-fold',
      description: 'Affordable wash, fold and iron services in Viman Nagar. Quick 24-hour turnaround.',
      phone: '+919000000003',
      addressLine: 'Plot 7, Viman Nagar, Near Phoenix Mall',
      cityName: 'Pune',
      state: 'Maharashtra',
      pincode: '411014',
      lat: 18.5679,
      lng: 73.9145,
      status: ShopStatus.ACTIVE,
      isOpen: true,
      logoUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=400&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=1200&h=400&fit=crop',
      ratingAvg: 4.7,
      ratingCount: 231,
      totalOrders: 2100,
    },
    {
      id: 's1000000-0000-0000-0000-000000000004',
      ownerId: 'u1000000-0000-0000-0000-000000000004',
      cityId: pune.id,
      name: 'Royal Dry Cleaners',
      slug: 'royal-dry-cleaners',
      description: 'Premium dry cleaning for suits, sarees and delicate garments in Aundh.',
      phone: '+919000000004',
      addressLine: '23, ITI Road, Aundh',
      cityName: 'Pune',
      state: 'Maharashtra',
      pincode: '411007',
      lat: 18.5590,
      lng: 73.8070,
      status: ShopStatus.ACTIVE,
      isOpen: false,
      logoUrl: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=400&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1558618047-f4e80d449d5b?w=1200&h=400&fit=crop',
      ratingAvg: 4.1,
      ratingCount: 67,
      totalOrders: 543,
    },
    {
      id: 's1000000-0000-0000-0000-000000000005',
      ownerId: 'u1000000-0000-0000-0000-000000000005',
      cityId: pune.id,
      name: 'QuickPress Kothrud',
      slug: 'quickpress-kothrud',
      description: 'Fast ironing and pressing service in Kothrud. Get your clothes pressed in 2 hours.',
      phone: '+919000000005',
      addressLine: '45, Paud Road, Kothrud',
      cityName: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      lat: 18.5074,
      lng: 73.8074,
      status: ShopStatus.ACTIVE,
      isOpen: true,
      logoUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=400&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1603217039863-aa0c865404f7?w=1200&h=400&fit=crop',
      ratingAvg: 4.6,
      ratingCount: 189,
      totalOrders: 1560,
    },
  ];

  for (const shop of shopData) {
    await prisma.shop.upsert({
      where: { id: shop.id },
      update: {},
      create: shop,
    });
  }
  console.log(`  ✔ ${shopData.length} shops`);

  // ── 4. Service categories ────────────────────────────────────────────────────
  const categoryData = [
    { id: 'sc10-0001-0000-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000001', name: 'Washing',      displayOrder: 1 },
    { id: 'sc10-0001-0000-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000001', name: 'Dry Cleaning',  displayOrder: 2 },
    { id: 'sc10-0001-0000-0000-000000000003', shopId: 's1000000-0000-0000-0000-000000000001', name: 'Ironing',       displayOrder: 3 },
    { id: 'sc10-0002-0000-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000002', name: 'Dry Cleaning',  displayOrder: 1 },
    { id: 'sc10-0002-0000-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000002', name: 'Washing',       displayOrder: 2 },
    { id: 'sc10-0003-0000-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000003', name: 'Washing',       displayOrder: 1 },
    { id: 'sc10-0003-0000-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000003', name: 'Ironing',       displayOrder: 2 },
    { id: 'sc10-0004-0000-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000004', name: 'Dry Cleaning',  displayOrder: 1 },
    { id: 'sc10-0005-0000-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000005', name: 'Ironing',       displayOrder: 1 },
  ];

  for (const cat of categoryData) {
    await prisma.shopServiceCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log(`  ✔ ${categoryData.length} service categories`);

  // ── 5. Services ──────────────────────────────────────────────────────────────
  const serviceData = [
    // FreshPress Express
    { id: 'sv10-0001-0001-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000001', name: 'Cotton Shirt – Wash & Fold',  pricingModel: PricingModel.PER_ITEM, pricePaise: 4900,  turnaroundHours: 24, displayOrder: 1 },
    { id: 'sv10-0001-0001-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000001', name: 'Trouser – Wash & Fold',        pricingModel: PricingModel.PER_ITEM, pricePaise: 5900,  turnaroundHours: 24, displayOrder: 2 },
    { id: 'sv10-0001-0001-0000-000000000003', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000001', name: 'General Clothes – Per Kg',    pricingModel: PricingModel.PER_KG,   pricePaise: 8000,  turnaroundHours: 24, displayOrder: 3 },
    { id: 'sv10-0001-0002-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000002', name: 'Suit – Dry Clean',            pricingModel: PricingModel.PER_ITEM, pricePaise: 29900, turnaroundHours: 48, displayOrder: 1 },
    { id: 'sv10-0001-0002-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000002', name: 'Saree – Dry Clean',           pricingModel: PricingModel.PER_ITEM, pricePaise: 24900, turnaroundHours: 48, displayOrder: 2 },
    { id: 'sv10-0001-0003-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000003', name: 'Shirt – Iron Only',           pricingModel: PricingModel.PER_ITEM, pricePaise: 1900,  turnaroundHours: 12, displayOrder: 1 },
    { id: 'sv10-0001-0003-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000001', categoryId: 'sc10-0001-0000-0000-000000000003', name: 'Trouser – Iron Only',         pricingModel: PricingModel.PER_ITEM, pricePaise: 2500,  turnaroundHours: 12, displayOrder: 2 },
    // CleanCraft
    { id: 'sv10-0002-0001-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000002', categoryId: 'sc10-0002-0000-0000-000000000001', name: 'Blazer – Dry Clean',          pricingModel: PricingModel.PER_ITEM, pricePaise: 34900, turnaroundHours: 48, displayOrder: 1 },
    { id: 'sv10-0002-0001-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000002', categoryId: 'sc10-0002-0000-0000-000000000001', name: 'Woollen Sweater – Dry Clean', pricingModel: PricingModel.PER_ITEM, pricePaise: 19900, turnaroundHours: 48, displayOrder: 2 },
    { id: 'sv10-0002-0002-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000002', categoryId: 'sc10-0002-0000-0000-000000000002', name: 'Bedsheet – Wash',             pricingModel: PricingModel.PER_ITEM, pricePaise: 9900,  turnaroundHours: 24, displayOrder: 1 },
    // Sparkle
    { id: 'sv10-0003-0001-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000003', categoryId: 'sc10-0003-0000-0000-000000000001', name: 'General Laundry – Per Kg',   pricingModel: PricingModel.PER_KG,   pricePaise: 7000,  turnaroundHours: 24, displayOrder: 1 },
    { id: 'sv10-0003-0001-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000003', categoryId: 'sc10-0003-0000-0000-000000000001', name: 'Jeans – Wash',               pricingModel: PricingModel.PER_ITEM, pricePaise: 6900,  turnaroundHours: 24, displayOrder: 2 },
    { id: 'sv10-0003-0002-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000003', categoryId: 'sc10-0003-0000-0000-000000000002', name: 'Full Set Iron (10 clothes)',  pricingModel: PricingModel.PER_ITEM, pricePaise: 14900, turnaroundHours: 12, displayOrder: 1 },
    // QuickPress
    { id: 'sv10-0005-0001-0000-000000000001', shopId: 's1000000-0000-0000-0000-000000000005', categoryId: 'sc10-0005-0000-0000-000000000001', name: 'Express Iron – 2 Hours',     pricingModel: PricingModel.PER_ITEM, pricePaise: 2900,  turnaroundHours: 2,  displayOrder: 1 },
    { id: 'sv10-0005-0001-0000-000000000002', shopId: 's1000000-0000-0000-0000-000000000005', categoryId: 'sc10-0005-0000-0000-000000000001', name: 'Bulk Iron – Per Kg',          pricingModel: PricingModel.PER_KG,   pricePaise: 3500,  turnaroundHours: 6,  displayOrder: 2 },
  ];

  for (const svc of serviceData) {
    await prisma.shopService.upsert({
      where: { id: svc.id },
      update: {},
      create: svc,
    });
  }
  console.log(`  ✔ ${serviceData.length} shop services`);

  // ── 6. Home banners ──────────────────────────────────────────────────────────
  await prisma.homeBanner.deleteMany({});
  await prisma.homeBanner.createMany({
    data: [
      {
        title: 'First Order Free Delivery',
        subtitle: 'Use code FIRST50 for ₹50 off',
        imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1200&h=400&fit=crop&q=80',
        deepLink: 'freshpress://coupon/FIRST50',
        cityId: pune.id,
        displayOrder: 1,
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Express Dry Cleaning',
        subtitle: 'Ready in 24 hours — book now',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&q=80',
        deepLink: 'freshpress://shops?category=dry-clean',
        cityId: pune.id,
        displayOrder: 2,
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Premium Shoe Cleaning',
        subtitle: 'Sneakers, formal, heels — we clean all',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop&q=80',
        deepLink: 'freshpress://shops?category=shoe-clean',
        cityId: pune.id,
        displayOrder: 3,
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('  ✔ 3 home banners');

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
