import { prisma } from '../config/database';

export interface CreateAddressData {
  userId: string;
  tag: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  tag?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  isDefault?: boolean;
}

/** Get all addresses for a user */
export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

/** Create a new address for a user */
export async function createAddress(data: CreateAddressData) {
  // If this is the first address or isDefault is true, ensure only one default
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: data.userId },
      data: { isDefault: false },
    });
  }

  const count = await prisma.address.count({ where: { userId: data.userId } });

  return prisma.address.create({
    data: {
      ...data,
      isDefault: data.isDefault ?? count === 0, // make default if it's the first address
    },
  });
}

/** Get a single address by ID, ensuring ownership */
export async function getAddressById(addressId: string, userId: string) {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });
  if (!address) throw new Error('Address not found');
  if (address.userId !== userId) throw new Error('Unauthorized');
  return address;
}

/** Update an address */
export async function updateAddress(addressId: string, userId: string, data: UpdateAddressData) {
  const address = await getAddressById(addressId, userId);

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

/** Delete an address */
export async function deleteAddress(addressId: string, userId: string) {
  const address = await getAddressById(addressId, userId);
  await prisma.address.delete({ where: { id: addressId } });
  return address;
}
