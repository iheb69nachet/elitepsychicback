
import { AppDataSource } from "../data-source";
import { Transaction, TransactionStatus } from "../entities/Transaction";
import { User } from "../entities/User";

const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

export class StripeService {
  async handleSuccessfulPayment(transactionId: number): Promise<void> {
    const transaction = await transactionRepository.findOne({
      where: { id: transactionId },
      relations: ["user", "package"],
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    transaction.status = TransactionStatus.COMPLETED;
    await transactionRepository.save(transaction);

    const user = transaction.user;
    const pkg = transaction.package;

    user.balance = Number(user.balance) + Number(pkg.balance);
    await userRepository.save(user);
  }

  async handleCancelledPayment(transactionId: number): Promise<void> {
    const transaction = await transactionRepository.findOne({ where: { id: transactionId } });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    transaction.status = TransactionStatus.FAILED;
    await transactionRepository.save(transaction);
  }





  async getAllTransactions(): Promise<Transaction[]> {
    return transactionRepository.find({
      relations: ["user", "package"],
    });
  }
}
