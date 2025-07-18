'use client';

import React, { useState } from 'react';

import { getFileDiff } from '@/utils/computeFileDiffs';

import { Button } from './ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function TranslationCommitDiff({
  changedFiles,
  branches,
  defaultBranch,
  onConfirm,
  onCancel,
}: {
  changedFiles: { path: string; oldContent: string; newContent: string; diffsOnly: string[] }[];
  branches: string[];
  defaultBranch: string;
  onConfirm: (branch: string, message: string) => void;
  onCancel: () => void;
}) {
  const [branch, setBranch] = useState(defaultBranch);
  const [msg, setMsg] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleConfirm = () => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    onConfirm(branch, trimmed);
  };

  return (
    <DialogContent className="max-w-md overflow-auto max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Review Changes</DialogTitle>
      </DialogHeader>
      <div className="flex gap-4 items-center pt-4">
        <div className="flex flex-col gap-2 w-1/3">
          <Label>Branch</Label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {branches?.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2 w-2/3">
          <Label>Commit Message</Label>
          <Input
            className="border rounded px-2 py-1 w-full"
            placeholder="Enter commit message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!msg.trim()}>
          Commit
        </Button>
      </DialogFooter>

      <Button variant="ghost" size="sm" onClick={() => setExpanded((x) => !x)}>
        {expanded ? 'Collapse All' : 'Expand All'}
      </Button>

      <div className="space-y-6 max-h-[200px] overflow-y-auto">
        {changedFiles.map(({ path, diffsOnly }) => (
          <details key={path} open={expanded}>
            <summary className="font-semibold">{path}</summary>
            <pre className="text-sm rounded bg-muted p-2 overflow-auto max-h-[300px]">
              {diffsOnly.map((line, idx) => (
                <div
                  key={idx}
                  className={`whitespace-pre-wrap ${
                    line.startsWith('+')
                      ? 'bg-green-100 text-green-800'
                      : line.startsWith('-')
                        ? 'bg-red-100 text-red-800'
                        : ''
                  }`}
                >
                  <span className="font-mono">{line}</span>
                </div>
              ))}
            </pre>
          </details>
        ))}
      </div>
    </DialogContent>
  );
}

export default TranslationCommitDiff;
