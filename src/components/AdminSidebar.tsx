
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut,
  Bell,
  Home,
  Ticket
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { 
      icon: Bell, 
      label: 'Dashboard', 
      path: '/admin',
      description: 'View notifications and overview'
    },
    { 
      icon: Users, 
      label: 'Users', 
      path: '/admin/users',
      description: 'Manage user accounts'
    },
    { 
      icon: BookOpen, 
      label: 'Courses', 
      path: '/admin/courses',
      description: 'Manage course content'
    },
    { 
      icon: GraduationCap, 
      label: 'Enrollments', 
      path: '/admin/enrollments',
      description: 'Track student enrollments'
    },
    { 
      icon: Home, 
      label: 'Homepage', 
      path: '/admin/homepage',
      description: 'Manage homepage content'
    },
    { 
      icon: Ticket, 
      label: 'Coupons', 
      path: '/admin/coupons',
      description: 'Manage discount coupons'
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  isActive 
                    ? 'bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <Card className="bg-gradient-to-br from-kiki-purple-50 to-kiki-blue-50 border-kiki-purple-200">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-3">
                <strong>KIKI Learning Hub</strong> Admin Dashboard
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full border-kiki-purple-200 text-kiki-purple-700 hover:bg-kiki-purple-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
