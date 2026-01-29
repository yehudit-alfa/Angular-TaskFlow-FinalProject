import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../../services/projects';
import { FormsModule } from '@angular/forms';
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

ngOnInit() {
  this.teamId = this.route.snapshot.paramMap.get('teamId');
  
  // האזנה אחת בלבד ל-Cache
  this.projectsService.projects$.subscribe(data => {
    // סינון הפרויקטים של הצוות הספציפי
    this.projects = data.filter(p => String(p.team_id) === String(this.teamId));
    // זה יפתור את הבעיה שהפרויקטים לא מופיעים מיד
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  });

  // טעינה ראשונית מהשרת
  this.projectsService.getProjects().subscribe();
}

onCreateProject() {
  if (this.newProjectName.trim() && this.teamId) {
    this.projectsService.createProject(this.teamId, this.newProjectName, this.newProjectDescription).subscribe({
      next: () => {
        // שימי לב: מחקנו את ה-this.projects = [...this.projects, newProj] מכאן!
        // ה-Service כבר מעדכן את ה-Cache, וה-subscribe ב-ngOnInit יעדכן את המסך לבד.
        this.newProjectName = '';
        this.newProjectDescription = '';
        this.showMessage('פרויקט נוצר בהצלחה!', 'success');
      }
    });
  }
}

  loadProjects() {
    this.projectsService.getProjects().subscribe({
      error: (err) => {
        console.error('Error loading projects', err);
        this.showMessage('שגיאה בטעינת פרויקטים', 'error');
      }
    });
  }

//   onCreateProject() {
//     if (this.newProjectName.trim() && this.teamId) {
//       this.projectsService.createProject(this.teamId, this.newProjectName, this.newProjectDescription).subscribe({
//         next: () => {
//           this.newProjectName = '';
//           this.newProjectDescription = '';
//           this.closeCreateProjectModal();
//           this.showMessage('פרויקט נוצר בהצלחה!', 'success');
//         },
//         error: (err) => {
//           console.error('Create project error:', err);
//           this.showMessage('שגיאה ביצירת פרויקט', 'error');
//         }
//       });
//     }
//   }

// onDeleteProject(projectId: string) {
//   if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט הזה?')) {
//     this.projectsService.deleteProject(projectId).subscribe({
//       next: () => {
//         this.showMessage('פרויקט נמחק בהצלחה!', 'success');
//         this.loadProjects(); // <--- מושך מחדש את הנתונים ומעדכן את ה-UI מיד
//       },
//       error: (err) => {
//         console.error('Delete error:', err);
//         this.showMessage('שגיאה במחיקת פרויקט', 'error');
//       }
//     });
//   }
// }
// בתוך projects.component.ts

onDeleteProject(projectId: string) {
  if (confirm('למחוק את הפרויקט?')) {
    this.projectsService.deleteProject(projectId).subscribe({
      next: () => {
        this.showMessage('נמחק בהצלחה', 'success');
        
        // במקום לחכות ללחיצה הבאה, אנחנו מעדכנים את המערך המקומי מיד
        this.projects = this.projects.filter(p => p.id !== projectId);
        
        // מודיעים לאנגולר: "השתנה פה משהו, תרענני עכשיו!"
        this.cdr.markForCheck(); 
        this.cdr.detectChanges();
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
    setTimeout(() => (this.message = null), 4000);
  }
}