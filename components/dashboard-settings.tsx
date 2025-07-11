'use client';

import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

import { getContributorsQuery } from '@/repository/tanstack/queries/collab.query';
import { useQuery } from '@tanstack/react-query';
import { Copy, Plus } from 'lucide-react';
import { toast } from 'sonner';

import Spinner from './spinner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

function DashboardSettings({ id }: { id: string }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmailInput, setCurrentEmailInput] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteLinks, setInviteLinks] = useState<string[]>([]);
  const { data: session } = useSession();
  const { data: contributors, isLoading, isError } = useQuery(getContributorsQuery(id));

  const handleAddCollaborator = async () => {
    let allEmails = [...emails];
    const trimmed = currentEmailInput.trim();

    // Add the current input if it's not empty and valid
    if (
      trimmed &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed) &&
      !emails.includes(trimmed)
    ) {
      allEmails.push(trimmed);
    }

    if (!allEmails.length) {
      toast.error('Please enter at least one valid email');
      return;
    }

    if (allEmails.includes(session?.user?.email || '')) {
      toast.error('You cannot invite yourself.');
      return;
    }

    setIsSendingInvite(true);
    try {
      const res = await fetch(`/api/contributor/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, emails: allEmails }),
      });

      if (!res.ok) throw new Error('Failed to send invite');
      const data = await res.json();
      const links = data.contributors?.map((c) => c.colabLink).filter(Boolean);
      if (links?.length) {
        setInviteLinks(links);
      }
      setEmails([]);
      setCurrentEmailInput('');
      toast.success('Invite link sent!');
    } catch (err) {
      toast.error('Failed to send invites');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const deleteCollaborator= async (contributorId:string)=>{
    try {
      const res = await fetch(`/api/contributor?projectId=${id}`, {
        method: 'DELETE',
        body: JSON.stringify({contributorId: contributorId }),
      });
      if (!res.ok) throw new Error('Failed to delete collaborator');
      toast.success('Collaborator removed successfully');
      return true;
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      toast.error('Failed to remove collaborator');
      return false;
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  if (isError) return <p>Failed to load contributors.</p>;
  console.log('contributors', contributors);

  return (
    <Card className="w-full p-4 flex flex-col gap-4 ">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between ">
          <CardTitle>Team Members</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4" /> Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collaborators</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-wrap items-center gap-2 border px-2 py-2 rounded min-h-[48px]">
                  {emails.map((email, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 text-sm px-3 py-1 rounded-full flex items-center"
                    >
                      {email}
                      <button
                        onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <input
                    className="flex-1 border-none outline-none bg-transparent text-sm"
                    placeholder="Enter email(s)..."
                    value={currentEmailInput}
                    onChange={(e) => setCurrentEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const trimmed = currentEmailInput.trim().replace(/,+$/, '');
                        if (
                          trimmed &&
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed) &&
                          !emails.includes(trimmed)
                        ) {
                          setEmails([...emails, trimmed]);
                          setCurrentEmailInput('');
                        } else if (trimmed) {
                          toast.error('Invalid or duplicate email');
                        }
                      }
                    }}
                  />
                </div>
              </div>
              {inviteLinks.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {inviteLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className=" dark:bg-gray-800 p-2 rounded flex items-center justify-between"
                    >
                      <span className="text-sm break-all text-gray-900 dark:text-gray-100">{link}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(link);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => handleAddCollaborator()} disabled={isSendingInvite}>
                  {isSendingInvite ? 'Sending...' : 'Send Invite Link'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Invite your team member to collaborate.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-0">
        {contributors?.contributors?.map((member) => (
          <div key={member.name} className="flex items-center gap-4 p-4 border-b last:border-b-0">
        <Avatar>
          <AvatarImage src={'/placeholder'} alt="User" />
          <AvatarFallback className="text-xs">{member.email[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <h3 className="text-sm font-normal">{member.id}</h3>
            <Badge variant="outline">{member.status}</Badge>
          </div>
          <p className="text-xs font-normal">{member.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {member.status != "active" && (    
            <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(member.colabLink);
            toast.success('Invite link copied to clipboard');
          }}
            >
          <Copy className="h-4 w-4" />
          Copy Invite Link
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
            onClick={async () => {
          if (
            window.confirm(
              `Are you sure you want to remove ${member.email} from the project?`
            )
          ) {
            const result = await deleteCollaborator(member.id);
            if (result) {
              toast.success('Collaborator removed');
            } else {
              toast.error('Failed to remove collaborator');
            }
          }
            }}
            title="Remove collaborator"
          >
            <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
            >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
            </svg>
            Delete
          </Button>
        </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default DashboardSettings;
