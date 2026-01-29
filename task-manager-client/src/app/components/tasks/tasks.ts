import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks';
import { ProjectsService } from '../../services/projects';
import { Task } from '../../models/task';
import { CommentsComponent } from '../comments/comments';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentsComponent], 
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css']
})
export class TasksComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);
  private cdr = inject(ChangeDetectorRef);

  projectName: string = ''; 
  projectId: string | null = null;
  
  backlogTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  isModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  editingTask: Task | null = null;
  newTask: Task = this.getEmptyTask(); 
  message: string | null = null;
  messageType: 'success' | 'error' | 'default' = 'default';
  // comments modal
  commentsModalOpen = false;
  selectedTaskForComments: Task | null = null;

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    this.loadProjectName();
    if (this.projectId) {
      this.subscribeToTaskUpdates();
      this.loadTasks();
    }
  }

  getEmptyTask(status: Task['status'] = 'backlog'): Task {
    return {
      projectId: this.projectId ?? '',
      title: '',
      description: '',
      priority: 'medium',
      status: status
    };
  }

  loadProjectName() {
    this.projectsService.getProjects().subscribe(projects => {
      // שימוש ב-== כדי להשוות מספר למחרוזת בביטחון
      const currentProject = projects.find(p => p.id == this.projectId);
      this.projectName = currentProject ? currentProject.name : 'פרויקט';
    });
  }

  loadTasks() {
    
    if (!this.projectId) return;
    this.tasksService.getTasks(this.projectId).subscribe({
      next: (tasks) => {
        // סינון נכון לכל המערכים
        this.backlogTasks = tasks.filter(t => t.status === 'backlog' || !t.status);
        this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        this.doneTasks = tasks.filter(t => t.status === 'done');
        this.cdr.detectChanges();
      },
      error: (err) => this.showMessage('שגיאה בטעינת משימות')
    });
  }

  // Subscribe to task updates via Observable for real-time filtering
  private subscribeToTaskUpdates() {
    if (!this.projectId) return;
    this.tasksService.getTasksCache(this.projectId).subscribe({
      next: (tasks) => {
        this.backlogTasks = tasks.filter(t => t.status === 'backlog' || !t.status);
        this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        this.doneTasks = tasks.filter(t => t.status === 'done');
        this.cdr.detectChanges();
      }
    });
  }

  openComments(task: Task) {
    if (!task.id) return;
    this.selectedTaskForComments = task;
    this.commentsModalOpen = true;
  }

  closeComments() {
    this.commentsModalOpen = false;
    this.selectedTaskForComments = null;
  }

  openAddTaskModal(status: Task['status'] = 'backlog') {
    this.newTask = this.getEmptyTask(status);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openEditTaskModal(task: Task) {
    this.editingTask = { ...task };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingTask = null;
  }

  saveEditTask() {
    if (!this.editingTask || !this.editingTask.id || !this.editingTask.title.trim()) return;

    this.tasksService.updateTask(this.editingTask.id, {
      title: this.editingTask.title,
      description: this.editingTask.description,
      priority: this.editingTask.priority,
      status: this.editingTask.status
    }).subscribe({
      next: () => {
        this.showMessage('משימה עודכנה בהצלחה!', 'success');
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Update task error:', err);
        this.showMessage('שגיאה בעדכון המשימה', 'error');
      }
    });
  }

  saveTask() {
    if (!this.newTask.title.trim() || !this.projectId) return;

    const taskData: Task = {
      ...this.newTask,
      projectId: this.projectId
    };

    this.tasksService.createTask(taskData).subscribe({
      next: () => {
        this.showMessage('משימה נוצרה בהצלחה!', 'success');
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Create task error:', err);
        this.showMessage('שגיאה בשמירת המשימה', 'error');
      }
    });
  }

 moveTask(task: Task, newStatus: Task['status']) {
  const taskId = task.id;
  if (!taskId) {
    console.error("לא נמצא ID למשימה:", task);
    return;
  }

    this.tasksService.updateTask(taskId, { status: newStatus }).subscribe({
    next: () => {
      task.status = newStatus; 
      this.showMessage('משימה עודכנה בהצלחה!', 'success');
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('שגיאה בעדכון הסטטוס', err);
      this.showMessage('לא ניתן לעדכן את המשימה', 'error');
    }
  });
}

// פונקציית מחיקה (DELETE)
deleteTask(task: Task) {
  const taskId = task.id;
  if (!taskId) return;
  if (confirm('בטוח שברצונך למחוק את המשימה?')) {
    this.tasksService.deleteTask(taskId).subscribe({
      next: () => {
        this.showMessage('משימה נמחקה בהצלחה!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete task error:', err);
        this.showMessage('שגיאה במחיקה', 'error');
      }
    });
  }
}

showMessage(msg: string, type?: 'success' | 'error') {
  this.message = msg;
  this.messageType = type || 'default';
  setTimeout(() => (this.message = null), 4000);
}
}