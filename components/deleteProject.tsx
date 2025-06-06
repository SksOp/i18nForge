import { useRouter } from 'next/navigation';
import React from 'react';

import { deleteProjectQuery } from '@/repository/tanstack/queries/project.query';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

function DeleteProject({ id }: { id: string }) {
  const router = useRouter();
  const { mutationFn, mutationKey } = deleteProjectQuery(id);

  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    mutationFn,
    mutationKey,
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      router.push('/home');
    },
    onError: () => {
      toast.error('Failed to delete the project.');
    },
  });

  return (
    <Card className="border border-red-600 bg-red-50 p-4 flex flex-col gap-3  mt-4">
      <h3 className="text-red-600 text-md font-semibold ">Danger Zone</h3>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-fit ">
              Delete Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete this project?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-700">
              This action <span className="font-semibold text-red-600">cannot</span> be undone. This
              will permanently delete the project and remove all associated data.
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive" disabled={isDeleting} onClick={() => deleteProject()}>
                {isDeleting ? 'Deleting...' : 'Yes, delete project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

export default DeleteProject;
