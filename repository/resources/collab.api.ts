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

    return null;
  } catch (error) {
    console.error('Error fetching contributions:', error);
    throw error;
  }
};
