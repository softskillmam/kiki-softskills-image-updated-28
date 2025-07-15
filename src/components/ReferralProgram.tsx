
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Users, DollarSign, Gift, Trophy } from 'lucide-react';

interface ReferralData {
  referral_code: string;
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  total_bonus: number;
  recent_referrals: Array<{
    id: string;
    referred_user_email: string;
    status: string;
    referral_bonus: number;
    created_at: string;
  }>;
}

const ReferralProgram = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralUrl, setReferralUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReferralData();
    }
  }, [isAuthenticated, user]);

  const fetchReferralData = async () => {
    try {
      console.log('Fetching referral data for user:', user?.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load referral data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Profile data:', profile);

      // If no referral code exists, we might need to generate one
      if (!profile?.referral_code) {
        console.log('No referral code found, generating one...');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ referral_code: await generateReferralCode() })
          .eq('id', user?.id)
          .select('referral_code')
          .single();

        if (updateError) {
          console.error('Error updating profile with referral code:', updateError);
          return;
        }
        
        profile.referral_code = updatedProfile.referral_code;
      }

      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          status,
          referral_bonus,
          created_at,
          referred_user_id,
          profiles!referrals_referred_user_id_fkey(email)
        `)
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        return;
      }

      const totalReferrals = referrals?.length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const totalBonus = referrals?.reduce((sum, r) => sum + (Number(r.referral_bonus) || 0), 0) || 0;

      const recent_referrals = referrals?.slice(0, 5).map(r => ({
        id: r.id,
        referred_user_email: (r.profiles as any)?.email || 'Unknown',
        status: r.status,
        referral_bonus: Number(r.referral_bonus) || 0,
        created_at: r.created_at
      })) || [];

      setReferralData({
        referral_code: profile?.referral_code || '',
        total_referrals: totalReferrals,
        pending_referrals: pendingReferrals,
        completed_referrals: completedReferrals,
        total_bonus: totalBonus,
        recent_referrals
      });

      if (profile?.referral_code) {
        const fullUrl = `${window.location.protocol}//${window.location.host}/?ref=${profile.referral_code}`;
        setReferralUrl(fullUrl);
        console.log('Generated referral URL:', fullUrl);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    // Generate a simple referral code (you can make this more sophisticated)
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const copyReferralUrl = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const shareReferral = () => {
    if (navigator.share && referralUrl) {
      navigator.share({
        title: 'Join KIKI Learning Hub',
        text: 'Join KIKI Learning Hub using my referral link and get amazing courses!',
        url: referralUrl,
      });
    } else {
      copyReferralUrl();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-2xl mb-6">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Refer Friends & Earn Rewards
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Please log in to access your referral program and start earning rewards!
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-2xl mb-6">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Loading your referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-2xl mb-6">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Refer Friends & Earn Rewards
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share KIKI Learning Hub with your friends and earn 10% bonus for every successful referral!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-kiki-purple-600" />
                  Your Referral Link
                </CardTitle>
                <CardDescription>
                  Share this link with friends to start earning rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={referralUrl || 'Generating your referral link...'} 
                    readOnly 
                    className="flex-1 font-mono text-sm" 
                    placeholder="Your referral link will appear here"
                  />
                  <Button onClick={copyReferralUrl} variant="outline" disabled={!referralUrl}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button onClick={shareReferral} className="bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600" disabled={!referralUrl}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="text-center p-4 bg-kiki-purple-50 rounded-lg">
                  <p className="text-sm text-kiki-purple-700">
                    <strong>Your Referral Code:</strong> {referralData?.referral_code || 'Generating...'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {referralData?.recent_referrals && referralData.recent_referrals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralData.recent_referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-kiki-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-kiki-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{referral.referred_user_email}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                          {referral.status === 'completed' && (
                            <span className="text-sm font-medium text-green-600">
                              +₹{referral.referral_bonus}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Referral Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-kiki-purple-600" />
                    <span className="text-sm">Total Referrals</span>
                  </div>
                  <span className="font-bold">{referralData?.total_referrals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{referralData?.completed_referrals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Total Earnings</span>
                  </div>
                  <span className="font-bold text-green-600">₹{referralData?.total_bonus || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">How it works</h3>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Share your referral link</li>
                  <li>• Friend signs up and makes a purchase</li>
                  <li>• You earn 10% of their purchase amount</li>
                  <li>• Bonus is credited automatically</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;
