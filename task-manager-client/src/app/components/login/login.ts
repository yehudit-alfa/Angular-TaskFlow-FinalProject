import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth as AuthService } from '../../services/auth';
import { TeamsService } from '../../services/teams';
import { ProjectsService } from '../../services/projects';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
private fb = inject(FormBuilder);
private authService = inject(AuthService)
private teamsService = inject(TeamsService);
private projectsService = inject(ProjectsService);
private router = inject(Router);
private cdr = inject(ChangeDetectorRef); 
loginForm!: FormGroup;
 message: string | null = null;
ngOnInit()
{
  this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
}
onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          this.authService.setUser(response.user);
          if (response.user) this.authService.setUser(response.user);
          
          // Clear caches on login
          this.teamsService.invalidateCache();
          this.projectsService.invalidateCache();
          
          this.router.navigate(['/teams']);
        },
       error: (err: HttpErrorResponse) => {
  let friendlyMsg = 'משהו השתבש, נסי שוב מאוחר יותר';
  
  if (err.status === 401) {
    friendlyMsg = 'האימייל או הסיסמה אינם נכונים';
  } else if (err.status === 404) {
    friendlyMsg = 'נראה שאת עדיין לא רשומה במערכת';
  } else if (err.error?.message) {
    friendlyMsg = err.error.message;
  }
  
  this.showMessage(friendlyMsg);
}
      });
    } 
  }
  goToRegister() {
    this.router.navigate(['/register']);
  }

showMessage(msg: string) {
    this.message = msg;
    
    // 3. הפתרון: מכריח את אנגולר לרענן את ה-HTML מיד
    this.cdr.detectChanges(); 

    setTimeout(() => {
      this.message = null;
      this.cdr.detectChanges(); // מרענן שוב כשההודעה נעלמת
    }, 6000); // הגדלתי ל-6 שניות כדי שיהיה זמן לקרוא
  }
}
