import { Component, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth as AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  registerForm!: FormGroup;
  errorMessage: string | null = null;
  message: string | null = null;
  isSubmitting = false;

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.isSubmitting || this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.authService.login({
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        }).subscribe({
          next: (loginResponse) => {
            this.authService.setToken(loginResponse.token);
            this.authService.refreshUser();
            this.router.navigate(['/teams']);
            this.isSubmitting = false;
          },
          error: () => {
            this.router.navigate(['/login']);
            this.isSubmitting = false;
          }
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          if (error?.status === 409) {
            this.errorMessage = 'כתובת האימייל הזו כבר רשומה במערכת';
          } else {
            this.errorMessage = error?.error?.message || 'ההרשמה נכשלה';
          }
          this.isSubmitting = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = null), 4000);
  }
}