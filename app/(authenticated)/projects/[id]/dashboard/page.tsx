'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import Layout from '@/layout/layout';
import { projectQuery } from '@/state/query/project';
import { useQuery } from '@tanstack/react-query';

import DashboardSettings from '@/components/dashboard-settings';
import DeleteProject from '@/components/deleteProject';
import Spinner from '@/components/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function DashboardPage() {
  const params = useParams();
  const { data: project, isLoading, error } = useQuery(projectQuery(params.id as string));
  if (isLoading) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <InfoTile
              title="Total Keys"
              value={100}
              subtitle="Translation keys"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              }
            />

            <InfoTile
              title="Languages"
              value={2}
              subtitle="Active languages"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              }
            />

            <InfoTile
              title="Completion"
              value={`69%`}
              subtitle={`${69} of ${100} done`}
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>
        </TabsContent>
        <TabsContent value="translations"></TabsContent>
        <TabsContent value="settings">
          <DashboardSettings id={project.id} />
          <DeleteProject id={project.id} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

export default DashboardPage;
