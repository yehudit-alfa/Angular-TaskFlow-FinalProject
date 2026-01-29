import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private location = inject(Location);

  get isLogged() {
    return !!this.auth.getToken();
  }

  get userName() {
    const u = this.auth.getUser();
    return u ? u.name : '';
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
