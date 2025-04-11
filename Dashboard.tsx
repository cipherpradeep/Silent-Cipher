// src/pages/Dashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface StatCard {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats: StatCard[] = [
    { name: 'Total patients', value: '3,343', icon: UserGroupIcon, change: '+12.2K' },
    { name: "Today's appointments", value: '13', icon: CalendarIcon, change: '+5.4K' },
    { name: 'Medical Records', value: '9,234', icon: DocumentTextIcon, change: '+7.8K' },
    { name: 'Emergency cases', value: '3', icon: ExclamationTriangleIcon, change: '-2.5K' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.firstName}!</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <stat.icon className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <p className="text-gray-500 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {/* Sample activity - replace with your data */}
          <div className="border-b pb-4">
            <p className="font-medium">New patient registration</p>
            <p className="text-sm text-gray-500">10 minutes ago</p>
          </div>
          {/* Add more activities here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;