export const deleteProjectApi = async (id: string) => {
  try {
    const response = await fetch(`/api/project/${id}`, {
      method: 'DELETE',
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
