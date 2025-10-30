
import { Request, Response } from "express";
import { StripeService } from "../services/StripeService";

const stripeService = new StripeService();

export class StripeController {
  async handleSuccess(req: Request, res: Response): Promise<void> {
    const { transactionId } = req.query;
    if (!transactionId) {
      res.status(400).send("Transaction ID missing");
      return;
    }
    try {
      await stripeService.handleSuccessfulPayment(Number(transactionId));
      res.status(200).send("Payment successful and transaction updated");
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async handleCancel(req: Request, res: Response): Promise<void> {
    const { transactionId } = req.query;
    if (!transactionId) {
      res.status(400).send("Transaction ID missing");
      return;
    }
    try {
      await stripeService.handleCancelledPayment(Number(transactionId));
      res.status(200).send("Payment cancelled and transaction updated");
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      const transactions = await stripeService.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}
