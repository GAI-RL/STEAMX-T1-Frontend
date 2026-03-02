import { Routes } from '@angular/router';
import { SteamxHomeComponent } from './features/landing/steamx-home/steamx-home';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ChatInterfaceComponent } from './features/chat/chat-interface/chat-interface';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';


export const routes: Routes = [
  // ════════════════════════════════════════════════════════════
  // PUBLIC ROUTES (No authentication required)
  // ════════════════════════════════════════════════════════════
  { 
    path: '', 
    component: SteamxHomeComponent 
  },
  
  // ════════════════════════════════════════════════════════════
  // GUEST ROUTES (Only accessible when NOT logged in)
  // Logged-in users will be redirected to dashboard
  // ════════════════════════════════════════════════════════════
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [guestGuard]  // 🔒 Prevent logged-in users from accessing
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [guestGuard]  // 🔒 Prevent logged-in users from accessing
  },
  
  // ════════════════════════════════════════════════════════════
  // PROTECTED ROUTES (Require authentication)
  // Non-logged-in users will be redirected to login
  // ════════════════════════════════════════════════════════════
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]  // 🔒 Require login
  },
  { 
    path: 'chat', 
    component: ChatInterfaceComponent,
    canActivate: [authGuard]  // 🔒 Require login
  },
  { 
    path: 'chat/:id', 
    component: ChatInterfaceComponent,
    canActivate: [authGuard]  // 🔒 Require login
  },
  
  // ════════════════════════════════════════════════════════════
  // FALLBACK ROUTE
  // ════════════════════════════════════════════════════════════
  { 
    path: '**', 
    redirectTo: '' 
  }
];