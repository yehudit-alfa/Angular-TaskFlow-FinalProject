
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TeamsService } from '../../services/teams';
import { Auth } from '../../services/auth';
import { Team } from '../../models/team';
import { Router } from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class TeamsComponent implements OnInit {
  private teamsService = inject(TeamsService);
  private authService = inject(Auth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  teams: Team[] = [];
  allUsers: User[] = []; 
  filteredUsers: User[] = []; 
  
  newTeamName: string = '';
  showAddUserModal: boolean = false;
  selectedTeamId: string | null = null;
  selectedUserId: string = '';
  message: string | null = null;
  messageType: 'success' | 'error' | 'default' = 'default';
  validationAttempted: boolean = false;
  isCreatingTeam = false;

  ngOnInit(): void {
    this.teamsService.teams$.subscribe((data: Team[]) => {
      this.teams = data.map((t: Team) => ({ 
        ...t, 
        members_count: t.members_count || 1 
      }));
      this.cdr.detectChanges();
    });
    
    this.loadTeams();
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.teamsService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.allUsers = users;
        this.cdr.detectChanges();
      },
      error: () => this.showMessage('שגיאה בטעינת משתמשים', 'error')
    });
  }

  loadTeams(): void {
    this.teamsService.getTeams().subscribe({
      next: (data: Team[]) => {
        this.teams = data.map((t: Team) => ({
          ...t,
          members_count: t.members_count || 1
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMessage('שגיאה בטעינת צוותים', 'error');
      }
    });
  }

  openAddMemberModal(teamId: string): void {
    this.selectedTeamId = teamId;
    this.showAddUserModal = true;
    this.selectedUserId = '';

    this.teamsService.getTeamMembers(teamId).subscribe({
      next: (currentMembers: User[]) => {
        this.filteredUsers = this.allUsers.filter((user: User) => {
          const isAlreadyInTeam = currentMembers.some((member: User) =>
            String(member.id) === String(user.id)
          );

          return !isAlreadyInTeam;
        });

        this.cdr.detectChanges();
      },
      error: () => {
        this.filteredUsers = [...this.allUsers];
        this.cdr.detectChanges();
      }
    });
  }

  onCreateTeam(form: NgForm): void {
    form.control.markAllAsTouched();

    if (form.invalid) {
      return;
    }

    this.validationAttempted = true;

    if (this.isCreatingTeam || !this.newTeamName.trim()) {
      return;
    }

    if (this.newTeamName.trim()) {
      this.isCreatingTeam = true;
      this.teamsService.createTeam(this.newTeamName).subscribe({
        next: () => {
          this.newTeamName = '';
          this.validationAttempted = false;
          this.isCreatingTeam = false;
          this.showMessage('צוות נוצר בהצלחה!', 'success');
        },
        error: () => {
          this.isCreatingTeam = false;
          this.showMessage('שגיאה ביצירת צוות', 'error');
        }
      });
    }
  }

onAddMember() {
  if (this.selectedTeamId && this.selectedUserId) {
    this.teamsService.addMemberById(this.selectedTeamId, this.selectedUserId).subscribe({
      next: () => {
        this.showMessage('משתמש נוסף בהצלחה!', 'success');
        
        // השלב הקריטי: במקום רק לסגור, אנחנו מפעילים שוב את הסינון
        // כדי שהמשתמש שהרגע הוספנו יימחק מהרשימה הנפתחת
        if (this.selectedTeamId) {
          this.openAddMemberModal(this.selectedTeamId); 
        }

        this.selectedUserId = '';
        this.showAddUserModal = false; // או להשאיר פתוח אם רוצים להוסיף עוד
      },
      error: (err) => this.showMessage('שגיאה בהוספת משתמש', 'error')
    });
  }
}

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.selectedUserId = '';
    this.selectedTeamId = null;
    this.cdr.detectChanges();
  }

  viewProjects(teamId: string): void {
    this.router.navigate(['/projects', teamId]);
  }

  showMessage(msg: string, type: 'success' | 'error' | 'default' = 'default'): void {
    this.message = msg;
    this.messageType = type;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.message = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  closeAddTeamModal(): void {
    this.newTeamName = '';
  }
}