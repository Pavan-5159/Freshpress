import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

const router = Router();

// Static service type shortcuts for the home screen quick-filter row
const SERVICE_TYPES = [
  { id: 'wash-fold',  name: 'Wash & Fold', icon: '🧺' },
  { id: 'dry-clean',  name: 'Dry Clean',   icon: '👔' },
  { id: 'ironing',    name: 'Ironing',     icon: '👕' },
  { id: 'shoe-clean', name: 'Shoe Clean',  icon: '👟' },
  { id: 'premium',    name: 'Premium',     icon: '✨' },
];

/**
 * GET /api/v1/home
 *
 * Query params:
 *   lat      – user latitude  (default: Pune centre 18.5204)
 *   lng      – user longitude (default: Pune centre 73.8567)
 *   cityId   – city UUID      (default: Pune seed id)
 *   radiusKm – search radius in km (default: 10)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      lat      = '18.5204',
      lng      = '73.8567',
      cityId   = 'c1000000-0000-0000-0000-000000000001',
      radiusKm = '10',
    } = req.query as Record<string, string>;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radius  = parseFloat(radiusKm);

    // ── Banners ───────────────────────────────────────────────────────────────
    const now = new Date();
    const banners = await prisma.homeBanner.findMany({
      where: {
        isActive:  true,
        validFrom: { lte: now },
        validTo:   { gte: now },
        OR: [{ cityId: null }, { cityId }],
      },
      orderBy: { displayOrder: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        subtitle: true,
        imageUrl: true,
        deepLink: true,
      },
    });

    // ── Nearby shops (Haversine distance using lat/lng columns) ───────────────
    // PostGIS isn't enabled in this setup, so we use the Haversine formula
    // via a raw query over our lat/lng float columns.
    // The formula returns distance in kilometres.
    const shops = await prisma.$queryRaw<any[]>`
      SELECT
        s.id,
        s.name,
        s.slug,
        s."logoUrl",
        s."bannerUrl",
        s."ratingAvg",
        s."ratingCount",
        s."isOpen",
        s."addressLine",
        s."cityName",
        s.lat,
        s.lng,
        -- Haversine distance in km
        ROUND(
          (6371 * ACOS(
            COS(RADIANS(${userLat})) *
            COS(RADIANS(s.lat)) *
            COS(RADIANS(s.lng) - RADIANS(${userLng})) +
            SIN(RADIANS(${userLat})) *
            SIN(RADIANS(s.lat))
          ))::numeric, 1
        ) AS "distanceKm",
        MIN(sv."turnaroundHours") AS "minTurnaroundHours",
        ARRAY_AGG(DISTINCT sc.name ORDER BY sc.name) AS "serviceCategories"
      FROM shops s
      LEFT JOIN shop_service_categories sc
        ON sc."shopId" = s.id AND sc."isAvailable" = TRUE
      LEFT JOIN shop_services sv
        ON sv."shopId" = s.id AND sv."isAvailable" = TRUE
      WHERE
        s.status    = 'ACTIVE'
        AND s."cityId" = ${cityId}
        AND s.lat IS NOT NULL
        AND s.lng IS NOT NULL
        AND s.lat BETWEEN ${userLat - radius / 111.0} AND ${userLat + radius / 111.0}
        AND s.lng BETWEEN ${userLng - radius / 111.0} AND ${userLng + radius / 111.0}
      GROUP BY s.id
      HAVING
        6371 * ACOS(
          COS(RADIANS(${userLat})) *
          COS(RADIANS(s.lat)) *
          COS(RADIANS(s.lng) - RADIANS(${userLng})) +
          SIN(RADIANS(${userLat})) *
          SIN(RADIANS(s.lat))
        ) <= ${radius}
      ORDER BY "distanceKm" ASC
      LIMIT 20
    `;

    const payload = {
      banners,
      shops: shops.map((s: any) => ({
        id: s.id,
        name: s.name,
        coverPhotoUrl: s.bannerUrl || s.logoUrl || '',
        address: `${s.addressLine}, ${s.cityName}`,
        latitude: s.lat,
        longitude: s.lng,
        distanceKm: parseFloat(s.distanceKm),
        serviceTypes: s.serviceCategories || [],
        averageRating: s.ratingAvg,
        reviewCount: s.ratingCount,
        turnaroundHours: s.minTurnaroundHours || 24,
        operatingHours: {
          open: '08:00',
          close: '20:00'
        },
        isOpen: s.isOpen
      })),
      serviceTypes: SERVICE_TYPES,
      totalShops: shops.length,
    };

    res.json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
});

export default router;
