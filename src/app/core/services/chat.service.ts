import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatSession, ChatMessage } from '../models/chat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  private apiUrl = 'http://localhost:8000/api/chat';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.apiUrl}/sessions`, {
      headers: this.getAuthHeaders()
    });
  }

  getSession(sessionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sessions/${sessionId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createNewSession(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/sessions`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }


sendMessage(sessionId: string, question: string): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrl}/message`,  // ← must be this, NOT /sessions/${sessionId}/messages
    { 
      session_id: sessionId, 
      question: question 
    },
    { headers: this.getAuthHeaders() }
  );
}


  deleteSession(sessionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/sessions/${sessionId}`, {
      headers: this.getAuthHeaders()
    });
  }
}