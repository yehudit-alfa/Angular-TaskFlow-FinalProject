export interface User {
  id: string;
  name: string;
  email?: string;
}
export interface LoginCredentials {
  email: string;
  password?: string; 
}
export interface AuthResponse {
  token: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  members_count: number;
}

export interface Project {
  id: string;
  team_id: string;
  name: string;
  description?: string;
}

export interface Task {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'in-progress' | 'done';
}