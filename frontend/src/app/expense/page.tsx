"use client";

import { useState, useEffect } from "react";

interface ExpenseType {
  _id: string;
  amount: number;
  description: string;
}

export default function ExpensePage() {
  const [expenses, setExpenses] = useState<ExpenseType[]>([]); 
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchExpenses() {
      const response = await fetch("http://localhost:50001/api/expenses");
      if (response.ok) {
        const data: ExpenseType[] = await response.json(); 
        setExpenses(data);
      }
    }
    fetchExpenses();
  }, []);

  const addExpense = async () => {
    const response = await fetch("http://localhost:50001/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), description }),
    });

    if (response.ok) {
      const newExpense: ExpenseType = await response.json(); 
      setExpenses([...expenses, newExpense]); 
      setAmount("");
      setDescription("");
    } else {
      alert("Failed to add expense");
    }
  };

  return (
    <div>
      <h1>Expense Tracker</h1>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={addExpense}>Add Expense</button>

      <ul>
        {expenses.map((expense) => (
          <li key={expense._id}>
            ${expense.amount} - {expense.description}
          </li>
        ))}
      </ul>
    </div>
  );
}