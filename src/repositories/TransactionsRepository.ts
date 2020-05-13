import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const { income, outcome } = transactions.reduce(
      (preVal, elem) => {
        if (elem.type === 'income') {
          preVal.income += elem.value;
        } else if (elem.type === 'outcome') {
          preVal.outcome += elem.value;
        }

        return preVal;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
