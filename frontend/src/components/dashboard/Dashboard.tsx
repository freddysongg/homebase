'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, DollarSign, CheckSquare, TrendingUp, Calendar } from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import ChoreChart from './ChoreChart';

interface Chore {
  _id: string;
  name: string;
  assigned_to: { _id: string; name: string }[];
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  due_date: string;
  status: 'pending' | 'paid';
  created_by: { name: string };
}

interface Member {
  _id: string;
  name: string;
  lastActive?: Date;
}

interface Household {
  _id: string;
  name: string;
  members: Member[];
}

const Dashboard = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      // Fetch user's household
      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');

      const userData = await userResponse.json();
      const householdId = userData.data.household_id;

      if (!householdId) {
        setLoading(false);
        return;
      }

      // Fetch household details
      const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!householdResponse.ok) throw new Error('Failed to fetch household data');

      const householdData = await householdResponse.json();
      setHousehold(householdData.data);

      // Fetch chores
      const choresResponse = await fetch('http://localhost:5001/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!choresResponse.ok) throw new Error('Failed to fetch chores');

      const choresData = await choresResponse.json();
      setChores(choresData.data);

      // Fetch expenses
      const expensesResponse = await fetch('http://localhost:5001/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!expensesResponse.ok) throw new Error('Failed to fetch expenses');

      const expensesData = await expensesResponse.json();
      setExpenses(expensesData.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to HomeBase</CardTitle>
            <CardDescription>Join or create a household to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/homes">Get Started</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses
    .filter((expense) => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{household.name}</h1>
          <p className="text-muted-foreground">Dashboard Overview</p>
        </div>
        <Button asChild variant="outline">
          <a href="/homes">Manage Household</a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Pending: ${pendingExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chores</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chores.filter((chore) => chore.status !== 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Total: {chores.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{household.members.length}</div>
            <p className="text-xs text-muted-foreground">
              Active Today:{' '}
              {
                household.members.filter(
                  (m) =>
                    m.lastActive &&
                    new Date(m.lastActive).toDateString() === new Date().toDateString()
                ).length
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chores.length > 0
                ? `${((chores.filter((c) => c.status === 'completed').length / chores.length) * 100).toFixed(1)}%`
                : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="chores">Chores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense._id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="text-sm text-muted-foreground">{expense.created_by.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${expense.amount}</p>
                      <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Chores</CardTitle>
                <CardDescription>Tasks that need attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chores
                  .filter((chore) => chore.status !== 'completed')
                  .slice(0, 5)
                  .map((chore) => (
                    <div key={chore._id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{chore.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {chore.assigned_to.map((user) => user.name).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(chore.due_date).toLocaleDateString()}
                        </p>
                        <Badge
                          variant={
                            chore.status === 'completed'
                              ? 'default'
                              : chore.status === 'in-progress'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {chore.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analytics</CardTitle>
              <CardDescription>Financial trends and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseChart expenses={expenses} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chores">
          <Card>
            <CardHeader>
              <CardTitle>Chore Analytics</CardTitle>
              <CardDescription>Task completion and distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ChoreChart chores={chores} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
