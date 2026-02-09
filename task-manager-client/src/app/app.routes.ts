import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { TeamsComponent } from './components/teams/teams';
import { ProjectsComponent } from './components/projects/projects';
import { TasksComponent } from './components/tasks/tasks'; 
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'teams', component: TeamsComponent },
  { path: 'projects/:teamId', component: ProjectsComponent },
  { path: 'tasks/:projectId', component: TasksComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];