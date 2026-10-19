import { prisma } from '../config/database';
import axios from 'axios';
import { ShopSource } from '@prisma/client';

/** List active shops, optionally filtered by city slug or ID */
export async function listShops(city?: string) {
  return prisma.shop.findMany({
    where: {
      status: 'ACTIVE',
      ...(city ? { cityName: { contains: city, mode: 'insensitive' } } : {}),
    },
    include: {
      serviceCategories: {
        where: { isAvailable: true },
        select: { name: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
    orderBy: { ratingAvg: 'desc' },
  });
}

/** Get nearby shops using Haversine formula */
export async function getNearbyShops(lat: number, lng: number, radiusKm: number, category?: string) {
  return prisma.$queryRaw`
    SELECT * FROM (
      SELECT *, (
        6371 * acos(
          cos(radians(${lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(lat))
        )
      ) AS distance_km
      FROM "shops"
      WHERE (${category || null}::text IS NULL OR category = ${category || null})
        AND status = 'ACTIVE'
    ) AS nearby_shops
    WHERE distance_km < ${radiusKm}
    ORDER BY distance_km ASC;
  `;
}

/** Get a single shop by ID including its service categories */
export async function getShopById(shopId: string) {
  return prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      serviceCategories: {
        where: { isAvailable: true },
        include: {
          services: {
            where: { isAvailable: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });
}

/** Get services for a specific shop, optionally filtered by category name */
export async function getShopServices(shopId: string, category?: string) {
  return prisma.shopService.findMany({
    where: {
      shopId,
      isAvailable: true,
      ...(category
        ? { category: { name: { contains: category, mode: 'insensitive' } } }
        : {}),
    },
    include: { category: true },
    orderBy: [{ category: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
  });
}

/** Get active home banners, optionally filtered by cityId */
export async function getBanners(cityId?: string) {
  const now = new Date();
  return prisma.homeBanner.findMany({
    where: {
      isActive:  true,
      validFrom: { lte: now },
      validTo:   { gte: now },
      OR: [{ cityId: null }, ...(cityId ? [{ cityId }] : [])],
    },
    orderBy: { displayOrder: 'asc' },
    take: 5,
  });
}

/** 
 * Register a new vendor shop
 * Geocodes the address, checks for duplicates, and creates a record if no duplicate is found.
 */
export async function registerVendorShop(data: {
  name: string;
  addressLine: string;
  category?: string;
  cityName?: string;
  state?: string;
  pincode?: string;
  ownerId: string;
}) {
  // 1. Geocode the address using Nominatim
  let lat = 0;
  let lng = 0;
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: data.addressLine, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'FreshPress-App/1.0' }
    });
    if (response.data && response.data.length > 0) {
      lat = parseFloat(response.data[0].lat);
      lng = parseFloat(response.data[0].lon);
    }
  } catch (error) {
    console.error('Nominatim geocoding failed', error);
  }

  // 2. Dedup Check (Look for OSM_IMPORT shops within 100m)
  if (lat && lng) {
    const nearbyOsmShops = await prisma.$queryRaw<any[]>`
      SELECT * FROM (
        SELECT *, (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(lat)) *
            cos(radians(lng) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(lat))
          )
        ) AS distance_km
        FROM "shops"
        WHERE source = 'OSM_IMPORT' AND "isClaimed" = false
      ) AS nearby_osm_shops
      WHERE distance_km < 0.1
      ORDER BY distance_km ASC;
    `;

    // Simple string match on name
    const normalizedNewName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const shop of nearbyOsmShops) {
      const normalizedExistingName = shop.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedExistingName.includes(normalizedNewName) || normalizedNewName.includes(normalizedExistingName)) {
        return { duplicateCandidate: shop }; // Found a match!
      }
    }
  }

  // 3. Create the shop
  const shop = await prisma.shop.create({
    data: {
      name: data.name,
      addressLine: data.addressLine,
      category: data.category,
      cityName: data.cityName || 'Unknown',
      state: data.state || 'Unknown',
      pincode: data.pincode || '000000',
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      lat,
      lng,
      ownerId: data.ownerId,
      source: ShopSource.VENDOR,
      isClaimed: true,
    }
  });

  return { shop };
}

/** Claim an existing OSM_IMPORT shop */
export async function claimShop(shopId: string, ownerId: string) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw new Error('Shop not found');
  if (shop.isClaimed || shop.source !== 'OSM_IMPORT') {
    throw new Error('Shop cannot be claimed');
  }

  return prisma.shop.update({
    where: { id: shopId },
    data: {
      isClaimed: true,
      ownerId: ownerId,
      source: ShopSource.VENDOR,
    }
  });
}
