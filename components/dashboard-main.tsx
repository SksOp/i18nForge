'use client';

import { motion } from 'framer-motion';
import { Clock, Code, GitCommit, Languages, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DashboardData = {
  dashboard: {
    commits: number;
    collaborators: number;
    languages: number;
  };
  commits?: Array<{
    author: string;
    date: string;
    message: string;
    githubPreviewUri: string;
    sha: string;
  }>;
  collaborators?: {
    contributors: number;
  };
  llmUsage?: {
    tokenUsed: number;
    tokenAllowed: number;
    tokenLeft: number;
    tokenResetAt: string;
  };
  languages?: {
    language: string[];
  };
  totalKeys?: number;
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function DashboardMain({ data }: { data: DashboardData }) {
  const { dashboard, commits = [], collaborators, llmUsage, languages, totalKeys } = data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Stats Grid */}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={fadeIn}>
        {/* <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                        <Code className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalKeys}</div>
                        <p className="text-xs text-muted-foreground">Translation keys in project</p>
                    </CardContent>
                </Card> */}

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages?.language?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {languages?.language?.join(', ') || 'No languages'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaborators?.contributors || 0}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LLM Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{llmUsage?.tokenUsed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {llmUsage?.tokenLeft || 0} tokens remaining
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeIn}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Commits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commits?.length > 0 ? (
                commits.map((commit, index) => (
                  <motion.div
                    key={commit.sha}
                    className="flex items-start pb-4 border-b last:border-b-0 last:pb-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <GitCommit className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{commit.message}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>{commit.author}</span>
                        <span className="mx-1">•</span>
                        <span>{getTimeAgo(commit.date)}</span>
                        <span className="mx-1">•</span>
                        <a
                          href={commit.githubPreviewUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View on GitHub
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
