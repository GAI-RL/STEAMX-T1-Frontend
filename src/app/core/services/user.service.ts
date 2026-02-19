import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get user profile
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`);
  }

  // Update user profile
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile`, data);
  }

  // Get usage statistics
  getUsageStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/usage`);
  }

  // ← NEW: Delete Account
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/account`);
  }
}