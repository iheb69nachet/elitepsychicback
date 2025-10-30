
import { AppDataSource } from "../data-source";
import { Package } from "../entities/Package";
import { Transaction, TransactionStatus } from "../entities/Transaction";
import { User } from "../entities/User";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const packageRepository = AppDataSource.getRepository(Package);
const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

export class PackageService {
  getAllPackages(): Promise<Package[]> {
    return packageRepository.find();
  }

  createPackage(name: string, price: number, color: string): Promise<Package> {
    const newPackage = new Package();
    newPackage.name = name;
    newPackage.price = price;
    newPackage.color = color;
    return packageRepository.save(newPackage);
  }

  async createStripeSession(packageId: number, userId: number): Promise<Stripe.Checkout.Session> {
    const packageToPurchase = await packageRepository.findOne({ where: { id: packageId } });
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!packageToPurchase) {
      throw new Error('Package not found');
    }
    if (!user) {
      throw new Error('User not found');
    }

    // Create a pending transaction
    const transaction = new Transaction();
    transaction.user = user;
    transaction.package = packageToPurchase;
    transaction.amount = packageToPurchase.price;
    transaction.status = TransactionStatus.PENDING;
    await transactionRepository.save(transaction);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: packageToPurchase.name,
            },
            unit_amount: packageToPurchase.price * 100, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/success?transactionId=${transaction.id}`,
      cancel_url: `http://localhost:3000/cancel?transactionId=${transaction.id}`,
      metadata: {
        transactionId: transaction.id,
      },
    });

    // Update the transaction with the Stripe session ID
    transaction.stripeSessionId = session.id;
    await transactionRepository.save(transaction);

    return session;
  }
}
