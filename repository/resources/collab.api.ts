export const fetchContributions = async (projectId: string) => {
  try {
    const response = await fetch(`/api/contributor?projectId=${projectId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch contributions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contributions:', error);
    throw error;
  }
};

export const addContributor = async ({
  projectId,
  contributorEmails,
}: {
  projectId: string;
  contributorEmails: string[];
}) => {
  const res = await fetch(`/api/contributor/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, emails: contributorEmails }),
  });

  if (!res.ok) {
    throw new Error('Failed to send invites');
  }

  return res.json();
};

export const deleteContributor = async (projctId: string, contributorId: string) => {
  try {
    const res = await fetch(`/api/contributor?projectId=${projctId}`, {
      method: 'DELETE',
      body: JSON.stringify({ contributorId: contributorId }),
    });
    if (!res.ok) {
      throw new Error('Failed to delete contributor');
    }
    return await res.json();
  } catch (error) {
    console.error('Error deleting contributor:', error);
    throw error;
  }
};
