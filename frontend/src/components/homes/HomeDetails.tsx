'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const HomeDetails = ({ homeCode }: { homeCode: string }) => {
  const [homeName, setHomeName] = useState<string | null>(null);
  const [homeAddress, setHomeAddress] = useState<{
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  useEffect(() => {
    const fetchHouseholdDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found. Please log in again.');
        }

        // Extract userId from the token
        const decodedToken = jwtDecode(token) as { id: string };
        const userId = decodedToken.id;

        // Fetch user details to get the household ID
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
        console.log('User Data:', userData); // Debugging
        const householdId = userData.data?.household_id;

        if (!householdId) {
          throw new Error('User is not associated with any household.');
        }

        // Fetch the household details using the householdId
        const householdResponse = await fetch(
          `http://localhost:5001/api/households/${householdId}`,
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
        console.log('Household Data:', householdData); // Debugging

        setHomeName(householdData.data.name || 'Unknown Home');
        setHomeAddress(
          householdData.data.address || {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
          }
        );
        setMembers(
          Array.isArray(householdData.data.members)
            ? householdData.data.members.map((member: { name: string }) => member.name)
            : []
        );
      } catch (error) {
        console.error('Error fetching household details:', error);
        setError('Failed to fetch household details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseholdDetails();
  }, [homeCode]);

  const handleLeaveHome = async () => {
    try {
      setIsLeaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found. Please log in again.');
      }

      // Extract userId from token
      const decodedToken = jwtDecode(token) as { id: string };
      const userId = decodedToken.id;

      const userResponse = await fetch('http://localhost:5001/api/households/leaveHousehold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          homeCode,
          userId
        })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Failed to remove member.');
      }

      setLeaveSuccess(true);

      setTimeout(() => {
        // router.push('/homes');
        window.location.replace('/homes');
      }, 1000);
    } catch (error) {
      console.error('Error leaving home:', error);
      setError('Failed to leave home. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Home Details</CardTitle>
          <CardDescription>View and manage your household information</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p>Loading home details...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">{error}</div>
          ) : leaveSuccess ? (
            <div className="space-y-2 text-center p-8">
              <p className="text-green-500 text-xl font-bold">
                You have successfully left the home!
              </p>
              <p className="text-muted-foreground">Redirecting you to the homes page...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Home Name</h3>
                  <p className="text-muted-foreground">{homeName}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-muted-foreground">
                    {homeAddress.street}, {homeAddress.city}, {homeAddress.state} {homeAddress.zip},{' '}
                    {homeAddress.country}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Home Code</h3>
                  <p className="text-muted-foreground">{homeCode}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Members</h3>
                  {members.length === 0 ? (
                    <p className="text-muted-foreground">No members found.</p>
                  ) : (
                    <div className="grid gap-2">
                      {members.map((member, index) => (
                        <div key={index} className="flex items-center gap-2 text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          {member}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => setShowConfirmation(true)}
                  disabled={isLeaving}
                >
                  {isLeaving ? 'Leaving...' : 'Leave Home'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showConfirmation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-0 flex items-center justify-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Are you sure?</CardTitle>
                <CardDescription>
                  Do you really want to leave this home? This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowConfirmation(false);
                    handleLeaveHome();
                  }}
                >
                  Leave Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeDetails;
