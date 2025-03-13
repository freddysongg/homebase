'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        // router.push('/dashboard');
        window.location.replace('/dashboard');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
