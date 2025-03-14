'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Separator } from '@/components/ui/separator';
import { jwtDecode } from 'jwt-decode';

const formSchema = z.object({
  name: z.string().min(2, 'Home name must be at least 2 characters'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required')
  }),
  code: z.string().default(() => Math.random().toString(36).substring(2, 8).toUpperCase())
});

const joinFormSchema = z.object({
  code: z.string().min(6, 'Home code must be 6 characters').max(6, 'Home code must be 6 characters')
});

interface Home {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  code: string;
  members: Array<{ _id: string; name: string }>;
}

const Homes = () => {
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      code: Math.random().toString(36).substring(2, 8).toUpperCase()
    }
  });

  const joinForm = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      code: ''
    }
  });

  const fetchHomes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      // Get user ID from token
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      // First get user's household
      const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await userResponse.json();

      if (userData.data.household_id) {
        // Fetch household details
        const householdResponse = await fetch(
          `http://localhost:5001/api/households/${userData.data.household_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!householdResponse.ok) {
          throw new Error('Failed to fetch household details');
        }

        const householdData = await householdResponse.json();
        setHomes([householdData.data]);
      } else {
        setHomes([]);
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching homes:', error);
      const err = error as Error;
      setError(err.message || 'Failed to fetch homes');
      setHomes([]);
    }
  };

  useEffect(() => {
    const checkUserHome = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found. Please log in again.');
        }

        // Get user ID from token
        const decodedToken = jwtDecode(token) as { id: string };
        const userId = decodedToken.id;

        // Fetch user details to get household ID
        const userResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details.');
        }

        const userData = await userResponse.json();

        // If user has a household, redirect to it
        if (userData.data.household_id) {
          const householdResponse = await fetch(
            `http://localhost:5001/api/households/${userData.data.household_id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!householdResponse.ok) {
            throw new Error('Failed to fetch household details.');
          }

          const householdData = await householdResponse.json();
          router.push(`/homes/${householdData.data.house_code}`);
        }
      } catch (error) {
        console.error('Error checking user home:', error);
        const err = error as Error;
        setError(err.message || 'Failed to check user home');
      }
    };

    checkUserHome();
  }, [router]);

  useEffect(() => {
    const initializeHomes = async () => {
      try {
        await fetchHomes();
      } catch (error) {
        console.error('Error initializing homes:', error);
        const err = error as Error;
        setError(err.message || 'Failed to initialize homes');
      }
    };

    initializeHomes();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      const createHomeResponse = await fetch('http://localhost:5001/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          house_code: values.code,
          name: values.name,
          address: values.address, // Send address as an object
          members: [userId]
        })
      });

      if (!createHomeResponse.ok) {
        const errorData = await createHomeResponse.json();
        throw new Error(errorData.message || 'Failed to create home');
      }

      const homeData = await createHomeResponse.json();

      const updateUserResponse = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          household_id: homeData.data._id
        })
      });

      if (!updateUserResponse.ok) {
        const errorData = await updateUserResponse.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      setSuccessMessage('Home created successfully!');
      setTimeout(() => {
        window.location.replace(`/homes/${values.code}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating home:', error);
      const err = error as Error;
      setError(err.message || 'An error occurred while creating the home.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHome = async (values: z.infer<typeof joinFormSchema>) => {
    if (!values.code.trim()) {
      setError('Please enter a valid home code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      // Get user ID from token
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      // Send join request directly without verification
      const response = await fetch('http://localhost:5001/api/households/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          homeCode: values.code, // Use homeCode instead of house_code
          userId // Use userId instead of user_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join household.');
      }

      const data = await response.json();
      setSuccessMessage(`Successfully joined home: ${data.data.name}`);

      // Clear the form
      joinForm.reset();

      setTimeout(() => {
        window.location.replace(`/homes/${values.code}`); // Redirect to home details
      }, 1000);
    } catch (error) {
      console.error('Error joining home:', error);
      const err = error as Error;
      setError(err.message || 'An error occurred while joining the home.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error}</div>
      )}
      {successMessage && (
        <div className="bg-green-500/15 text-green-500 px-4 py-2 rounded-md">{successMessage}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Home</CardTitle>
            <CardDescription>Set up a new household</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter home name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Home'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Existing Home</CardTitle>
            <CardDescription>Join an existing household using a home code</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...joinForm}>
              <form onSubmit={joinForm.handleSubmit(handleJoinHome)} className="space-y-6">
                <FormField
                  control={joinForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter home code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join Home'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Your Homes</CardTitle>
          <CardDescription>Manage your household memberships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homes.map((home) => (
              <Card key={home._id} className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg">{home.name}</CardTitle>
                  <CardDescription>
                    {home.address.street}, {home.address.city}, {home.address.state}{' '}
                    {home.address.zip}, {home.address.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Home Code:</span> {home.code}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Members:</span>{' '}
                      {home.members.map((member) => member.name).join(', ')}
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => router.push(`/homes/${home.code}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Homes;
