'use client';

import { useState, useEffect } from 'react';
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
  FormMessage,
  FormDescription
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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface ChoreAssignee {
  _id: string;
  name: string;
}

interface HouseholdMember {
  _id: string;
  name: string;
}

interface Chore {
  _id: string;
  name: string;
  description: string;
  assigned_to: ChoreAssignee[];
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed';
  rotation: boolean;
  recurring: {
    is_recurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | null;
    end_date: string | null;
  };
}

const formSchema = z.object({
  name: z.string().min(1, 'Chore name is required'),
  description: z.string().optional(),
  assigned_to: z.array(z.string()).min(1, 'Assign to at least one person'),
  due_date: z
    .date({
      required_error: 'Due date is required'
    })
    .default(new Date()),
  rotation: z.boolean().default(false),
  recurring: z.object({
    is_recurring: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).nullable(),
    end_date: z.date().nullable()
  })
});

const ChoreComponent = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      assigned_to: [],
      due_date: new Date(),
      rotation: false,
      recurring: {
        is_recurring: false,
        frequency: null,
        end_date: null
      }
    }
  });

  const fetchChores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5001/api/chores', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch chores');

      const data = await response.json();
      setChores(data.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chores';
      console.error(errorMessage);
    }
  };

  const fetchHouseholdMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Get user ID from token
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      // Get user data with household ID
      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');
      const userData = await userResponse.json();
      const householdId = userData.data.household_id;

      if (!householdId) throw new Error('No household found');

      // Fetch household details
      const householdResponse = await fetch(`http://localhost:5001/api/households/${householdId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!householdResponse.ok) throw new Error('Failed to fetch household members');
      const householdData = await householdResponse.json();
      setHouseholdMembers(householdData.data.members);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch members';
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchChores();
    fetchHouseholdMembers();
  }, []);

  const handleCreateChore = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch('http://localhost:5001/api/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create chore');
      }

      const createdChore = await response.json();
      // Update the chores list immediately
      setChores((prevChores) => [...prevChores, createdChore.data]);

      // Reset form
      form.reset();
      setErrorMessage('');
    } catch (error) {
      console.error('Error creating chore:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create chore');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    choreId: string,
    newStatus: 'pending' | 'in-progress' | 'completed'
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://localhost:5001/api/chores/${choreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update chore status');
      }

      fetchChores();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update chore status';
      console.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Chore</CardTitle>
          <CardDescription>Create a new chore for your household</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && <div className="text-red-500 text-sm mb-4">{errorMessage}</div>}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateChore)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chore Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter chore name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                        defaultValue={field.value?.[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
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

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value && 'text-muted-foreground'
                              }`}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="rotation"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel>Enable Rotation</FormLabel>
                        <FormDescription>
                          Automatically rotate this chore among household members
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurring.is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel>Make Recurring</FormLabel>
                        <FormDescription>Set this chore to repeat automatically</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('recurring.is_recurring') && (
                  <div className="space-y-4 pl-6">
                    <FormField
                      control={form.control}
                      name="recurring.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurring.end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value && 'text-muted-foreground'
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Add Chore'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Chore List</CardTitle>
          <CardDescription>View and manage household chores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chores.map((chore) => (
                  <TableRow key={chore._id}>
                    <TableCell className="font-medium">{chore.name}</TableCell>
                    <TableCell>{chore.description}</TableCell>
                    <TableCell>{chore.assigned_to.map((user) => user.name).join(', ')}</TableCell>
                    <TableCell>{new Date(chore.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={chore.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            chore._id,
                            value as 'pending' | 'in-progress' | 'completed'
                          )
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChoreComponent;
