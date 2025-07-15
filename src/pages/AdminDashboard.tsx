
import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import UserManagement from '@/components/UserManagement';
import CourseManagement from '@/components/CourseManagement';
import EnrollmentManagement from '@/components/EnrollmentManagement';
import HomepageContentManagement from '@/components/HomepageContentManagement';
import CouponManagement from '@/components/CouponManagement';
import AdminNotifications from '@/components/AdminNotifications';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else if (!loading) {
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-kiki-purple-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<AdminNotifications />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/courses" element={<CourseManagement />} />
            <Route path="/enrollments" element={<EnrollmentManagement />} />
            <Route path="/homepage" element={<HomepageContentManagement />} />
            <Route path="/coupons" element={<CouponManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
