import { Component, inject, OnInit } from '@angular/core'; // הוספתי OnInit
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth as AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true, // ודאי שזה קיים אם זו קומפוננטה עצמאית
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register{
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  registerForm!: FormGroup;
  errorMessage: string = ''; // הוספתי כדי שלא יהיה אדום ב-HTML
  message: string | null = null;

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('שולח נתונים...', this.registerForm.value);
      
      // כאן היה הבלגן בסוגריים - סידרתי לך את זה:
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          console.log('הרשמה הצליחה, מבצע התחברות אוטומטית...');
          
          this.authService.login({ 
            email: this.registerForm.value.email, 
            password: this.registerForm.value.password 
          }).subscribe({
            next: (loginResponse) => {
              this.authService.setToken(loginResponse.token);
              this.router.navigate(['/teams']);
            },
            error: (loginErr) => {
              this.router.navigate(['/login']);
            }
          });
        }, // סגירת ה-next של ה-register
        error: (err) => {
          this.showMessage(err.error?.message || 'ההרשמה נכשלה');
        }
      }); // סגירת ה-subscribe של ה-register
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = null), 4000);
  }
}