export interface Task {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'in-progress' | 'done';
  assignee_id?: string;
  due_date?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}
