import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {
  
  @ViewChild('googleButton') googleButton!: ElementRef;

  formData = {
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  };

  loading = false;
  error = '';
  success = false;

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
    // Validation
    if (!this.formData.full_name || !this.formData.email || !this.formData.password || !this.formData.confirm_password) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.formData.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      return;
    }

    if (this.formData.password !== this.formData.confirm_password) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = '';

    const registerData = {
      full_name: this.formData.full_name,
      email: this.formData.email,
      password: this.formData.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }
}