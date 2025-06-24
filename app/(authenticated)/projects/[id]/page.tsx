'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';

import Layout from '@/layout/layout';
import { dashboardQuery, projectQuery } from '@/state/query/project';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Home } from 'lucide-react';

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
    <div className=" rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
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
      <div className="mt-2 px-10">
        <div className="flex items-center justify-start gap-1 mb-4">
          <Link href="/home">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4" />
          <h4 className="text-sm font-bold ">{project.name}</h4>
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className=" flex gap-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <DashboardMain data={dashboard} />
          </TabsContent>
          <TabsContent value="translations">
            <DashboardTranslation id={project.id} />{' '}
          </TabsContent>
          <TabsContent value="settings">
            <div className="mt-3">
              <DashboardSettings id={project.id} />
              <DeleteProject id={project.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default DashboardPage;
