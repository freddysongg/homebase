'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { jwtDecode } from 'jwt-decode';

interface Split {
  user_id: { _id: string; name: string };
  amount: number;
}

interface SplitAmong {
  user: string; // This matches the old implementation
  amount: string;
}

interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: 'rent' | 'utilities' | 'groceries' | 'household' | 'other';
  due_date: string;
  status: 'pending' | 'paid';
  splits: Split[];
  created_by: { _id: string; name: string };
  household_id: string;
  receipt_url: string;
  recurring: {
    is_recurring: boolean;
    frequency: 'weekly' | 'monthly' | 'yearly' | null;
    end_date: string | null;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  category: z.enum(['rent', 'utilities', 'groceries', 'household', 'other']),
  due_date: z.string().min(1, 'Due date is required'),
  paid_by: z.string().min(1, 'Paid by is required')
});

const categories = ['rent', 'utilities', 'groceries', 'household', 'other'] as const;

// Add this type for split mode
type SplitMode = 'none' | 'even' | 'manual';

const ExpenseComponent = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState<{ _id: string; name: string }[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<
    'weekly' | 'monthly' | 'yearly' | null
  >(null);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('none');
  const [totalAmount] = useState<string>('');
  const [splitAmong, setSplitAmong] = useState<SplitAmong[]>([]);
  const [splitEvenly, setSplitEvenly] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'rent',
      due_date: new Date().toISOString().split('T')[0],
      paid_by: ''
    }
  });

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5001/api/expenses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch expenses';
      console.error(errorMessage);
    }
  };

  const fetchHouseholdMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found, user not logged in.');

      // First get the user's ID from token
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      // Fetch user data to get the householdId
      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user details');
      const userData = await userResponse.json();
      const householdId = userData.data?.household_id;

      // Fetch household members using householdId
      const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!householdResponse.ok) throw new Error('Failed to fetch household data');
      const householdData = await householdResponse.json();

      setHouseholdMembers(
        householdData.data.members.map((member: { name: string; _id: string }) => ({
          name: member.name,
          _id: member._id
        }))
      );

      // After fetching members, also fetch expenses
      fetchExpenses();
    } catch (error) {
      console.error('Error fetching household members:', error);
    }
  };

  useEffect(() => {
    fetchHouseholdMembers();
    fetchExpenses();
  }, []);

  // const handleTotalAmountChange = (value: string) => {
  //   const numericValue = value.replace(/[^0-9.]/g, '');
  //   setTotalAmount(numericValue);
  //   setSplitAmong([]);
  // };

  // const handleSplitChange = (index: number, field: keyof SplitAmong, value: string) => {
  //   const updatedSplit = [...splitAmong];
  //   if (field === 'user') {
  //     updatedSplit[index][field] = value;
  //   } else if (field === 'amount') {
  //     updatedSplit[index][field] = value;
  //   }
  //   setSplitAmong(updatedSplit);
  // };

  // Update split amounts when splitting evenly
  useEffect(() => {
    if (splitEvenly && totalAmount && splitAmong.length > 0) {
      const evenAmount = (Number(totalAmount) / splitAmong.length).toFixed(2);
      setSplitAmong((prevSplits) => prevSplits.map((entry) => ({ ...entry, amount: evenAmount })));
    }
  }, [totalAmount, splitAmong.length, splitEvenly]);

  const validateExpense = (values: z.infer<typeof formSchema>) => {
    if (splitMode !== 'none') {
      const splitTotal = Object.values(splitAmounts).reduce(
        (sum, amount) => sum + (parseFloat(amount) || 0),
        0
      );

      const totalAmt = parseFloat(values.amount);

      if (Math.abs(splitTotal - totalAmt) > 0.01) {
        setErrorMessage('Split amounts must equal the total amount');
        return false;
      }
    }
    return true;
  };

  const handleSplitModeChange = (mode: SplitMode) => {
    setSplitMode(mode);
    if (mode === 'none') {
      setSplitAmong([]);
    } else if (mode === 'even') {
      // Create even splits for all household members
      const amount = form.getValues('amount');
      if (amount && householdMembers.length > 0) {
        const evenAmount = (Number(amount) / householdMembers.length).toFixed(2);
        setSplitAmong(
          householdMembers.map((member) => ({
            user: member._id,
            amount: evenAmount
          }))
        );
        setSplitEvenly(true);
      }
    } else {
      // For manual mode, initialize empty splits for all members
      setSplitAmong(
        householdMembers.map((member) => ({
          user: member._id,
          amount: ''
        }))
      );
      setSplitEvenly(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!validateExpense(values)) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      // Convert split amounts to the format expected by the API
      const splits =
        splitMode === 'none'
          ? []
          : Object.entries(splitAmounts).map(([userId, amount]) => ({
              user_id: userId,
              amount: parseFloat(amount)
            }));

      const newExpense = {
        title: values.title,
        description: values.description || '',
        amount: parseFloat(values.amount),
        category: values.category,
        due_date: values.due_date,
        paid_by: values.paid_by,
        splits,
        recurring: {
          is_recurring: isRecurring,
          frequency: isRecurring ? recurringFrequency : null,
          end_date: isRecurring ? recurringEndDate : null
        }
      };

      const response = await fetch('http://localhost:5001/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }

      const createdExpense = await response.json();
      setExpenses((prevExpenses) => [...prevExpenses, createdExpense.data]);

      // Reset form and state
      form.reset();
      setSplitMode('none');
      setSplitAmounts({});
      setIsRecurring(false);
      setRecurringFrequency(null);
      setRecurringEndDate('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error creating expense:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (expenseId: string, newStatus: 'pending' | 'paid') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://localhost:5001/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update expense status');

      fetchExpenses();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update expense status';
      console.error(errorMessage);
    }
  };

  const ErrorMessage = () =>
    errorMessage ? <div className="text-red-500 text-sm mt-2">{errorMessage}</div> : null;

  const renderSplitAmounts = () => (
    <div className="space-y-2">
      {householdMembers.map((member) => (
        <div key={member._id} className="flex items-center gap-4">
          <span className="min-w-[120px] text-sm font-medium">{member.name}</span>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={splitAmounts[member._id] || ''}
            onChange={(e) => {
              setSplitAmounts((prev: Record<string, string>) => ({
                ...prev,
                [member._id]: e.target.value
              }));
            }}
            disabled={splitMode === 'even'}
            className="max-w-[150px]"
          />
        </div>
      ))}
    </div>
  );

  const calculateSplitTotal = () => {
    return Object.values(splitAmounts)
      .reduce((sum: number, amount: string) => sum + (parseFloat(amount) || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>Create a new expense for your household</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Expense title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paid_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid By</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select who paid" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {householdMembers.map((member) => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-medium">Split Options</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={splitMode === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSplitModeChange('none')}
                    >
                      No Split
                    </Button>
                    <Button
                      type="button"
                      variant={splitMode === 'even' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSplitModeChange('even')}
                    >
                      Split Evenly
                    </Button>
                    <Button
                      type="button"
                      variant={splitMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSplitModeChange('manual')}
                    >
                      Manual Split
                    </Button>
                  </div>
                </div>

                {splitMode !== 'none' && (
                  <>
                    {renderSplitAmounts()}
                    <div className="flex justify-between text-sm">
                      <span>Total Amount: ${form.getValues('amount') || '0.00'}</span>
                      <span>Split Total: ${calculateSplitTotal()}</span>
                    </div>
                  </>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Add Expense'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>View and manage your household expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Split Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{new Date(expense.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.created_by.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {expense.splits.map((split) => (
                          <div key={split.user_id._id} className="text-sm">
                            <span className="font-medium">{split.user_id.name}:</span>{' '}
                            <span className="text-muted-foreground">
                              ${split.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                        {expense.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(
                            expense._id,
                            expense.status === 'paid' ? 'pending' : 'paid'
                          )
                        }
                      >
                        Mark as {expense.status === 'paid' ? 'Pending' : 'Paid'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {errorMessage && <ErrorMessage />}
    </div>
  );
};

export default ExpenseComponent;
