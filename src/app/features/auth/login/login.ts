import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  
  @ViewChild('googleButton') googleButton!: ElementRef;

  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Add scroll animation class
    setTimeout(() => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('visible');
      });
    }, 100);
  }

  ngAfterViewInit(): void {
    // Initialize Google Sign-In button
    if (this.googleButton) {
      this.googleAuthService.initializeGoogleSignIn(
        this.googleButton.nativeElement,
        (credential) => this.googleAuthService.handleGoogleLogin(credential)
      );
    }
  }

  onSubmit() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Login failed. Please check your credentials.';
        console.error('Login error:', err);
      }
    });
  }
}