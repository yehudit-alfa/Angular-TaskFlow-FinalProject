import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CommentsService, CommentItem } from '../../services/comments';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class CommentsComponent implements OnInit {
  private commentsService = inject(CommentsService);
  private cdr = inject(ChangeDetectorRef); // חובה לרענון מיידי

  @Input() taskId!: string;
  comments: CommentItem[] = [];
  newText = '';
  loading = false;
  posting = false;
  errorMessage: string | null = null;

  ngOnInit() {
    this.load();
  }

  load() {
    if (!this.taskId) return;
    this.loading = true;
    this.commentsService.getComments(this.taskId).subscribe({
      next: c => { 
        this.comments = c; 
        this.loading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err) => { this.loading = false; this.handleError(err); }
    });
  }

// ב-comments.component.ts
post() {
  const textToSend = this.newText.trim();
  if (!textToSend || !this.taskId) return;

  const commentPayload = {
    taskId: this.taskId,
    body: textToSend,
    userName: "השם שלך" 
  };

  this.commentsService.createComment(commentPayload).subscribe({
    next: (newComment) => {
      this.comments = [...this.comments, newComment];
      this.newText = '';
      this.cdr.detectChanges();
    }
  });
}

  handleError(err: unknown) {
    const status = err instanceof HttpErrorResponse ? err.status : undefined;
    this.errorMessage = status === 403 ? 'אין הרשאה' : 'שגיאה בשליחה';
  }
}