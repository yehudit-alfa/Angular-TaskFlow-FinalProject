import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  public auth = inject(Auth);
  private router = inject(Router);
  private location = inject(Location);

  currentUser: User | null = null;

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.auth.refreshUser();
  }

  get isLogged() {
    return !!this.auth.getToken();
  }

  get userName() {
    return this.currentUser ? this.currentUser.name : '';
  }

  get userInitials() {
    const name = this.userName || '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0,1).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }

  get avatarColor() {
    const letters = this.userInitials || 'A';
    const colors = ['#60A5FA','#7C3AED','#34D399','#F59E0B','#FB7185','#F97316','#38BDF8'];
    let code = 0;
    for (let i=0;i<letters.length;i++) code += letters.charCodeAt(i);
    return colors[code % colors.length];
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goBack() {
    this.location.back();
  }
}
