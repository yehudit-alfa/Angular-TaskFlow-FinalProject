import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Team } from '../models/team';
import { User } from '../models/user';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/teams';

  // Cache for teams
  private teamsCache = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsCache.asObservable();

  // GET /api/teams - with caching
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl).pipe(
      tap(data => {
        this.teamsCache.next(data);
      })
    );
  }

  // POST /api/teams - create new team and update cache
  createTeam(name: string): Observable<Team> {
    return this.http.post<any>(this.apiUrl, { name }).pipe(
      tap(newTeam => {
        // Server doesn't return members_count, so add it (user is creator with 1 member)
        const teamWithCount: Team = {
          ...newTeam,
          members_count: 1
        };
        const current = this.teamsCache.value;
        this.teamsCache.next([...current, teamWithCount]);
      })
    );
  }

  // POST /api/teams/:teamId/members - add member by userId
  addMemberById(teamId: string, userId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/${teamId}/members`, { 
      userId,
      role: 'member'
    }).pipe(
      tap(() => {
        // Update member count in cache
        const current = this.teamsCache.value;
        const updated = current.map(t => 
          t.id === teamId 
            ? { ...t, members_count: (t as any).members_count + 1 }
            : t
        );
        this.teamsCache.next(updated);
      })
    );
  }

getAllUsers(): Observable<User[]> {
  return this.http.get<User[]>('http://localhost:3000/api/users');
}

// הוסיפי את הפונקציה הזו בתוך ה-TeamsService
getTeamMembers(teamId: string): Observable<User[]> {
  return this.http.get<User[]>(`${this.apiUrl}/${teamId}/members`);
}
  // Invalidate cache when needed
  invalidateCache() {
    this.teamsCache.next([]);
  }
}