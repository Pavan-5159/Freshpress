import { prisma } from '../config/database';

/**
 * Get wallet details and recent transactions for a user
 */
export async function getWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0
      },
      include: {
        transactions: true
      }
    });
  }

  return wallet;
}

/**
 * Top up the wallet balance
 */
export async function topUpWallet(userId: string, amount: number) {
  if (amount <= 0) {
    throw new Error('Top-up amount must be greater than zero.');
  }

  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
  }

  const currentBalance = Number(wallet.balance);
  const newBalance = currentBalance + amount;

  const updatedWallet = await prisma.$transaction(async (tx) => {
    // Update balance
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance }
    });

    // Create transaction record
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: amount,
        closingBalance: newBalance,
        referenceType: 'TOP_UP',
        description: 'Wallet top-up'
      }
    });

    // Return the updated wallet with transactions
    return tx.wallet.findUnique({
      where: { id: wallet.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
  });

  return updatedWallet;
}
