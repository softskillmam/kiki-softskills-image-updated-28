
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, DollarSign, TrendingUp, Gift } from 'lucide-react';
import AdminSearchableTab from '@/components/AdminSearchableTab';

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  total_bonus_paid: number;
}

interface Referral {
  id: string;
  referrer_email: string;
  referred_user_email: string;
  status: string;
  referral_bonus: number;
  created_at: string;
  order_id: string | null;
}

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    pending_referrals: 0,
    completed_referrals: 0,
    total_bonus_paid: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    setFilteredReferrals(referrals);
  }, [referrals]);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          status,
          referral_bonus,
          created_at,
          order_id,
          referrer:profiles!referrals_referrer_id_fkey(email),
          referred_user:profiles!referrals_referred_user_id_fkey(email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referrals:', error);
        toast({
          title: "Error",
          description: "Failed to fetch referrals.",
          variant: "destructive",
        });
        return;
      }

      const formattedReferrals = data?.map(referral => ({
        id: referral.id,
        referrer_email: (referral.referrer as any)?.email || 'Unknown',
        referred_user_email: (referral.referred_user as any)?.email || 'Unknown',
        status: referral.status,
        referral_bonus: Number(referral.referral_bonus) || 0,
        created_at: referral.created_at,
        order_id: referral.order_id
      })) || [];

      setReferrals(formattedReferrals);

      // Calculate stats
      const totalReferrals = formattedReferrals.length;
      const pendingReferrals = formattedReferrals.filter(r => r.status === 'pending').length;
      const completedReferrals = formattedReferrals.filter(r => r.status === 'completed').length;
      const totalBonusPaid = formattedReferrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.referral_bonus, 0);

      setStats({
        total_referrals: totalReferrals,
        pending_referrals: pendingReferrals,
        completed_referrals: completedReferrals,
        total_bonus_paid: totalBonusPaid
      });

    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referrals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReferralSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredReferrals(referrals);
      return;
    }
    
    const filtered = referrals.filter(referral =>
      referral.referrer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referred_user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReferrals(filtered);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_referrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending_referrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Referrals</CardTitle>
            <Gift className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed_referrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonus Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.total_bonus_paid.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Management</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminSearchableTab 
            onSearch={handleReferralSearch}
            placeholder="Search by referrer email, referred user, or status..."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bonus Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Order ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">{referral.referrer_email}</TableCell>
                    <TableCell>{referral.referred_user_email}</TableCell>
                    <TableCell>
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.status === 'completed' ? (
                        <span className="font-medium text-green-600">₹{referral.referral_bonus}</span>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {referral.order_id ? (
                        <span className="text-xs font-mono">{referral.order_id.slice(0, 8)}...</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReferrals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No referrals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AdminSearchableTab>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralManagement;
