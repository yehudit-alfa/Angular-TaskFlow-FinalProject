import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/projects';

  // Cache for projects
  private projectsCache = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsCache.asObservable();

  // GET /api/projects - with caching
getProjects(): Observable<Project[]> {
  return this.http.get<Project[]>(this.apiUrl).pipe(
    tap(data => {
      this.projectsCache.next(data); // זה יעדכן את כל מי שמאזין מיד
    })
  );
}

createProject(teamId: string, name: string, description?: string): Observable<Project> {
  return this.http.post<Project>(this.apiUrl, { teamId, name, description }).pipe(
    tap(newProject => {
      // במקום להוסיף ידנית, פשוט ננקה את ה-Cache כדי שהקריאה הבאה תביא נתונים טריים
      // או שנוסיף רק אם הוא באמת לא קיים שם
      const current = this.projectsCache.value;
      if (!current.find(p => p.id === newProject.id)) {
        this.projectsCache.next([...current, newProject]);
      }
    })
  );
}

  // DELETE /api/projects/:id - delete a project
  deleteProject(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}`).pipe(
      tap(() => {
        const current = this.projectsCache.value;
        const updated = current.filter(p => p.id !== projectId);
        this.projectsCache.next(updated);
      })
    );
  }

  // Invalidate cache
  invalidateCache() {
    this.projectsCache.next([]);
  }
}