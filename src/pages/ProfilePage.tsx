"use client"
import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/sonner';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    college_name: '',
    graduation_year: '',
    phone: '',
    linkedin_url: '',
    github_url: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setProfile({
        name: data.name || '',
        college_name: data.college_name || '',
        graduation_year: data.graduation_year?.toString() || '',
        phone: data.phone || '',
        linkedin_url: data.linkedin_url || '',
        github_url: data.github_url || ''
      });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        college_name: profile.college_name,
        graduation_year: parseInt(profile.graduation_year) || null,
        phone: profile.phone,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url
      })
      .eq('user_id', user?.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        My Profile
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>

          <div>
            <Label>College Name</Label>
            <Input
              value={profile.college_name}
              onChange={(e) => setProfile({ ...profile, college_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Graduation Year</Label>
            <Input
              type="number"
              value={profile.graduation_year}
              onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div>
            <Label>LinkedIn URL</Label>
            <Input
              value={profile.linkedin_url}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
            />
          </div>

          <div>
            <Label>GitHub URL</Label>
            <Input
              value={profile.github_url}
              onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
            />
          </div>

          <Button onClick={handleSave} className="w-full bg-green-600 text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
