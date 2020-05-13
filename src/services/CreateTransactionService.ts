import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (!(type === 'income' || type === 'outcome')) {
      throw new AppError('Type is not correct.', 403);
    }

    const transactions = await transactionRepository.find();

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance(transactions);

      if (value > total) {
        throw new AppError('You do not have this amount', 400);
      }
    }

    let categorySaved = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categorySaved) {
      categorySaved = categoryRepository.create({ title: category });
      await categoryRepository.save(categorySaved);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categorySaved.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
