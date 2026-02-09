import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../../services/projects';
import { FormsModule, NgForm } from '@angular/forms';
import { Project } from '../../models/project';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css']
})
export class ProjectsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  teamId: string | null = null;
  projects: Project[] = [];
  newProjectName: string = '';
  newProjectDescription: string = '';
  message: string | null = null;
  messageType: 'success' | 'error' | 'default' = 'default';
  validationAttempted: boolean = false;
  isCreatingProject = false;

  ngOnInit() {
    this.teamId = this.route.snapshot.paramMap.get('teamId');

    this.projectsService.projects$.subscribe(data => {
      this.projects = data.filter(p => String(p.team_id) === String(this.teamId));
      this.cdr.detectChanges();
    });

    this.projectsService.getProjects().subscribe();
  }

  onCreateProject(form: NgForm) {
    form.control.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    this.validationAttempted = true;

    if (!this.teamId) {
      return;
    }

    if (this.isCreatingProject || !this.newProjectName.trim()) {
      return;
    }

    this.isCreatingProject = true;
    this.projectsService.createProject(this.teamId, this.newProjectName, this.newProjectDescription).subscribe({
      next: () => {
        this.newProjectName = '';
        this.newProjectDescription = '';
        this.validationAttempted = false;
        this.isCreatingProject = false;
        this.showMessage('פרויקט נוצר בהצלחה!', 'success');
      },
      error: (err) => {
        this.isCreatingProject = false;
        this.showMessage('שגיאה ביצירת פרויקט', 'error');
      }
    });
  }

  loadProjects() {
    this.projectsService.getProjects().subscribe({
      next: (data) => {
        this.projects = data.filter(p => String(p.team_id) === String(this.teamId));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showMessage('שגיאה בטעינת פרויקטים', 'error');
      }
    });
  }

  onDeleteProject(projectId: string) {
    if (confirm('למחוק את הפרויקט?')) {
      this.projectsService.deleteProject(projectId).subscribe({
        next: () => {
          this.showMessage('נמחק בהצלחה', 'success');
          this.projects = this.projects.filter(p => p.id !== projectId);
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.showMessage('שגיאה במחיקת פרויקט', 'error');
        }
      });
    }
  }

  closeCreateProjectModal() {
    this.newProjectName = '';
    this.newProjectDescription = '';
  }

  goToTasks(projectId: string) {
    this.router.navigate(['/tasks', projectId]);
  }

  showMessage(msg: string, type?: 'success' | 'error') {
    this.message = msg;
    this.messageType = type || 'default';
    setTimeout(() => (this.message = null), 3000);
  }
}
