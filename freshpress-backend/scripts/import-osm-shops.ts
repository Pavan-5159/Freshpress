import axios from 'axios';
import { PrismaClient, ShopSource } from '@prisma/client';

const prisma = new PrismaClient();

// Mumbai bounding box for testing
const BBOX = "18.9,72.8,19.2,73.0";

const OVERPASS_QUERY = `
[out:json];
node["shop"~"laundry|dry_cleaning|convenience"]
  (${BBOX});
out body;
`;

async function main() {
  console.log('Fetching shops from OSM Overpass API...');
  try {
    const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(OVERPASS_QUERY)}`, {
      headers: {
        'User-Agent': 'FreshPressApp/1.0 (test)'
      }
    });

    const elements = response.data.elements;
    console.log(`Found ${elements.length} shops in OSM.`);

    let created = 0;
    let updated = 0;

    for (const node of elements) {
      if (!node.lat || !node.lon) continue;

      const name = node.tags?.name || 'Unnamed Shop';
      const address = node.tags?.['addr:full'] || 
                      [node.tags?.['addr:street'], node.tags?.['addr:city']].filter(Boolean).join(', ') ||
                      'Unknown Address';
      const category = node.tags?.shop || 'laundry';

      const existingShop = await prisma.shop.findUnique({
        where: { osmId: node.id.toString() }
      });

      const data = {
        name,
        addressLine: address,
        cityName: node.tags?.['addr:city'] || 'Mumbai', // Defaulting for seed
        state: node.tags?.['addr:state'] || 'MH',
        pincode: node.tags?.['addr:postcode'] || '000000',
        slug: `shop-${node.id}`,
        lat: node.lat,
        lng: node.lon,
        source: ShopSource.OSM_IMPORT,
        isClaimed: false,
        category,
        // Since cityId might be required by existing logic, we might need a dummy city or leave it null if made optional. 
        // We made it optional in the schema.
      };

      if (existingShop) {
        await prisma.shop.update({
          where: { id: existingShop.id },
          data
        });
        updated++;
      } else {
        await prisma.shop.create({
          data: {
            ...data,
            osmId: node.id.toString(),
          }
        });
        created++;
      }
    }

    console.log(`Import complete. Created: ${created}, Updated: ${updated}`);
  } catch (error) {
    console.error('Failed to import OSM shops:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
