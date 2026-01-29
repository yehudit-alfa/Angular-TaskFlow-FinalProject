import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/tasks';

  // Cache for tasks by projectId
  private tasksCache = new Map<string, BehaviorSubject<Task[]>>();

  // GET /api/tasks?projectId=... - with caching
  getTasks(projectId: string): Observable<Task[]> {
    // Initialize cache for this projectId if not exists
    if (!this.tasksCache.has(projectId)) {
      this.tasksCache.set(projectId, new BehaviorSubject<Task[]>([]));
    }

    const cache = this.tasksCache.get(projectId)!;

    // Always fetch from server and update cache
    return this.http.get<Task[]>(`${this.apiUrl}?projectId=${projectId}`).pipe(
      tap(data => {
        cache.next(data);
      })
    );
  }

  // Get task cache observable for subscribing to updates
  getTasksCache(projectId: string): Observable<Task[]> {
    if (!this.tasksCache.has(projectId)) {
      this.tasksCache.set(projectId, new BehaviorSubject<Task[]>([]));
    }
    return this.tasksCache.get(projectId)!.asObservable();
  }

  // POST /api/tasks - create new task
  createTask(taskData: Task): Observable<Task> {
    return this.http.post<any>(this.apiUrl, taskData).pipe(
      tap(newTask => {
        // Ensure the returned task has all required fields with defaults
        const completeTask: Task = {
          id: newTask.id,
          projectId: taskData.projectId,
          title: newTask.title,
          description: newTask.description || '',
          status: newTask.status || taskData.status || 'backlog',
          priority: newTask.priority || taskData.priority || 'medium',
          assignee_id: newTask.assignee_id,
          due_date: newTask.due_date,
          order_index: newTask.order_index || 0,
          created_at: newTask.created_at,
          updated_at: newTask.updated_at
        };
        
        const projectId = taskData.projectId;
        if (projectId && this.tasksCache.has(projectId)) {
          const cache = this.tasksCache.get(projectId)!;
          cache.next([...cache.value, completeTask]);
        }
      })
    );
  }

  // PATCH /api/tasks/:id - update task fields
  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}`, updates).pipe(
      tap(updatedTask => {
        // Update all caches that might contain this task
        this.tasksCache.forEach(cache => {
          const index = cache.value.findIndex(t => t.id === taskId);
          if (index !== -1) {
            const updated = [...cache.value];
            updated[index] = updatedTask;
            cache.next(updated);
          }
        });
      })
    );
  }

  // DELETE /api/tasks/:id - delete task
  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${taskId}`).pipe(
      tap(() => {
        // Remove from all caches
        this.tasksCache.forEach(cache => {
          const filtered = cache.value.filter(t => t.id !== taskId);
          cache.next(filtered);
        });
      })
    );
  }

  // Invalidate cache for a project
  invalidateCache(projectId: string) {
    if (this.tasksCache.has(projectId)) {
      this.tasksCache.get(projectId)!.next([]);
    }
  }
}