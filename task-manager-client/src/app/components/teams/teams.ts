// import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { TeamsService } from '../../services/teams';
// import { Auth, UserInfo } from '../../services/auth';
// import { Team } from '../../models/team';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-teams',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './teams.html',
//   styleUrls: ['./teams.css'],
//   changeDetection: ChangeDetectionStrategy.Default
// })
// export class TeamsComponent implements OnInit {
//   private teamsService = inject(TeamsService);
//   private authService = inject(Auth);
//   private router = inject(Router);
  
//   teams$ = this.teamsService.teams$;
//   teams: Team[] = [];
//   allUsers: UserInfo[] = [];
//   newTeamName: string = '';
//   showAddUserModal: boolean = false;
//   selectedTeamId: string | null = null;
//   selectedUserId: string = '';
//   message: string | null = null;
//   messageType: 'success' | 'error' | 'default' = 'default';

//   ngOnInit() {
//     // Subscribe to cache updates - shows data immediately when it changes
//     this.teamsService.teams$.subscribe(data => {
//       // Ensure all teams have members_count
//       this.teams = data.map(t => ({
//         ...t,
//         members_count: t.members_count || 1
//       }));
//     });
    
//     // Fetch from server
//     this.teamsService.getTeams().subscribe({
//       next: (data) => {
//         // Ensure all teams have members_count for safety
//         this.teams = data.map(t => ({
//           ...t,
//           members_count: t.members_count || 1
//         }));
//       },
//       error: (err) => {
//         console.error('Failed to load teams', err);
//         this.showMessage('שגיאה בטעינת צוותים', 'error');
//       }
//     });
//   }

//   loadTeams() {
//     this.teamsService.getTeams().subscribe({
//       error: (err) => {
//         console.error('Failed to load teams', err);
//         this.showMessage('שגיאה בטעינת צוותים', 'error');
//       }
//     });
//   }

//   onCreateTeam() {
//     if (this.newTeamName.trim()) {
//       this.teamsService.createTeam(this.newTeamName).subscribe({
//         next: (newTeam) => {
//           this.newTeamName = '';
//           this.closeAddTeamModal();
//           this.showMessage('צוות נוצר בהצלחה!', 'success');
//         },
//         error: (err) => {
//           console.error('Create team error:', err);
//           this.showMessage('שגיאה ביצירת צוות', 'error');
//         }
//       });
//     }
//   }

//   onAddMember() {
//     if (this.selectedTeamId && this.selectedUserId) {
//       this.teamsService.addMemberById(this.selectedTeamId, this.selectedUserId).subscribe({
//         next: () => {
//           this.showMessage('משתמש נוסף בהצלחה!', 'success');
//           this.selectedUserId = '';
//           this.showAddUserModal = false;
//           this.selectedTeamId = null;
//         },
//         error: (err) => {
//           console.error('Add member error:', err);
//           this.showMessage('שגיאה בהוספת משתמש', 'error');
//         }
//       });
//     }
//   }

//   viewProjects(teamId: string) {
//     this.router.navigate(['/projects', teamId]);
//   }

//   showMessage(msg: string, type?: 'success' | 'error') {
//     this.message = msg;
//     this.messageType = type || 'default';
//     setTimeout(() => (this.message = null), 4000);
//   }

//   closeAddTeamModal() {
//     this.newTeamName = '';
//   }
// }

// import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  ngOnInit(): void {
    // הוספת סוג נתונים (Team[]) כדי להעלים את השגיאה מהתמונה שלך
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
      error: (err: any) => console.error('שגיאה בטעינת משתמשים', err)
    });
  }

  loadTeams(): void {
    this.teamsService.getTeams().subscribe({
      error: (err: any) => {
        console.error('Failed to load teams', err);
        this.showMessage('שגיאה בטעינת צוותים', 'error');
      }
    });
  }

openAddMemberModal(teamId: string): void {
  this.selectedTeamId = teamId;
  this.showAddUserModal = true;
  this.selectedUserId = '';

  this.teamsService.getTeamMembers(teamId).subscribe({
    next: (currentMembers: any[]) => {
      // הדפסה לבדיקה - תפתחי F12 ותראי אם ה-ID נראה אותו דבר בשניהם
      this.filteredUsers = this.allUsers.filter((user: User) => {
        // שימוש ב- == במקום === כדי להתעלם מהבדלי טקסט/מספר
        // ושימוש ב- .toString() לביטחון מקסימלי
        const isAlreadyInTeam = currentMembers.some((member: any) => 
          String(member.id) === String(user.id)
        );
        
        return !isAlreadyInTeam;
      });

      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('שגיאה:', err);
      this.filteredUsers = [...this.allUsers];
      this.cdr.detectChanges();
    }
  });
}

  onCreateTeam(): void {
    if (this.newTeamName.trim()) {
      this.teamsService.createTeam(this.newTeamName).subscribe({
        next: () => {
          this.newTeamName = '';
          this.showMessage('צוות נוצר בהצלחה!', 'success');
        },
        error: (err: any) => this.showMessage('שגיאה ביצירת צוות', 'error')
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
    }, 4000);
  }

  closeAddTeamModal(): void {
    this.newTeamName = '';
  }
}