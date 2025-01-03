

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    website: string;
  }
  
  export async function getUsers(): Promise<User[]> {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: 3600 
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const users = await response.json();
      
     
      if (!Array.isArray(users)) {
        throw new Error('Invalid response format');
      }
  
      return users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        website: user.website
      }));
  
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }