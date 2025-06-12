'use client';

import React, { useState } from 'react';

import { getFileDiff } from '@/utils/computeFileDiffs';

import { Button } from './ui/button';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

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
    <>
      <DialogContent className="max-w-4xl overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review Changes</DialogTitle>
        </DialogHeader>

        <Button variant="ghost" size="sm" onClick={() => setExpanded((x) => !x)}>
          {expanded ? 'Collapse All' : 'Expand All'}
        </Button>

        <div className="space-y-6">
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

        <div className="flex gap-4 items-center pt-4">
          <div className="flex-1 gap-2">
            <label>Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-2 gap-2">
            <label>Commit Message</label>
            <input
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
      </DialogContent>
    </>
  );
}

export default TranslationCommitDiff;
