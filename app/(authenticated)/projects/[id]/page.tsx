'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import Layout from '@/layout/layout';
import { dashboardQuery, projectQuery } from '@/state/query/project';
import { useQuery } from '@tanstack/react-query';

import DashboardMain from '@/components/dashboard-main';
import DashboardSettings from '@/components/dashboard-settings';
import DashboardTranslation from '@/components/dashboard-translation';
import DeleteProject from '@/components/deleteProject';
import Spinner from '@/components/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function DashboardPage() {
  const params = useParams();
  const { data: project, isLoading, error } = useQuery(projectQuery(params.id as string));
  const { data: dashboard, isLoading: dashboardLoading } = useQuery(
    dashboardQuery(params.id as string),
  );

  console.log('dashboard', dashboard);

  if (isLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const InfoTile = ({ title, value, subtitle, icon }) => (
    <div className="bg-white rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white flex gap-4">
          <TabsTrigger
            value="overview"
            className="cursor-pointer border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-black hover:border-b-black focus:border-b-black shadow-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="translations"
            className="cursor-pointer border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-black hover:border-b-black focus:border-b-black shadow-none"
          >
            Translations
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="cursor-pointer border-0 data-[state=active]:border-b-2 data-[state=active]:border-b-black hover:border-b-black focus:border-b-black shadow-none"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <DashboardMain data={dashboard} />
        </TabsContent>
        <TabsContent value="translations">
          {' '}
          <DashboardTranslation id={project.id} />{' '}
        </TabsContent>
        <TabsContent value="settings">
          <DashboardSettings id={project.id} />
          <DeleteProject id={project.id} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

export default DashboardPage;
