import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface CommentItem {
  id?: string;
  taskId: string;
  userId?: string;
  userName?: string;
  body: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api/comments';

  getComments(taskId: string) {
    return this.http.get<CommentItem[]>(`${this.api}?taskId=${taskId}`);
  }

createComment(comment: { taskId: string; body: string }) { 
  return this.http.post<CommentItem>(this.api, comment).pipe(
    timeout(8000),
    catchError(err => throwError(() => err))
  );
}
}
