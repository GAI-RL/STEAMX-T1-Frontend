import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css'
})
export class AccountSettingsComponent implements OnInit {
  
  currentUser: User | null = null;
  
  // Profile Edit
  profileData = {
    full_name: '',
    email: ''
  };
  editingProfile = false;
  savingProfile = false;
  profileError = '';
  profileSuccess = '';

  // Delete Account
  showDeleteConfirm = false;
  deleteConfirmEmail = '';
  deleting = false;
  deleteError = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.profileData = {
        full_name: this.currentUser.full_name,
        email: this.currentUser.email
      };
    }
  }

  enableProfileEdit(): void {
    this.editingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';
  }

  cancelProfileEdit(): void {
    this.editingProfile = false;
    if (this.currentUser) {
      this.profileData = {
        full_name: this.currentUser.full_name,
        email: this.currentUser.email
      };
    }
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';

    this.userService.updateProfile(this.profileData).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.savingProfile = false;
        this.editingProfile = false;
        this.profileSuccess = 'Profile updated successfully!';
        
        setTimeout(() => {
          this.profileSuccess = '';
        }, 3000);
      },
      error: (err) => {
        this.savingProfile = false;
        this.profileError = err.error?.detail || 'Failed to update profile';
      }
    });
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
    this.deleteConfirmEmail = '';
    this.deleteError = '';
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.deleteConfirmEmail = '';
    this.deleteError = '';
  }

  deleteAccount(): void {
    if (this.deleteConfirmEmail !== this.currentUser?.email) {
      this.deleteError = 'Email does not match';
      return;
    }

    this.deleting = true;
    this.deleteError = '';

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.deleting = false;
        alert('Your account has been deleted successfully.');
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = err.error?.detail || 'Failed to delete account';
      }
    });
  }
}