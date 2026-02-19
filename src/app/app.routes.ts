import { Routes } from '@angular/router';
import { SteamxHomeComponent } from './features/landing/steamx-home/steamx-home';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { ChatInterfaceComponent } from './features/chat/chat-interface/chat-interface';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Public routes
  { path: '', component: SteamxHomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'chat', 
    component: ChatInterfaceComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'chat/:id', 
    component: ChatInterfaceComponent,
    canActivate: [authGuard]
  },
  
  // Fallback
  { path: '**', redirectTo: '' }
];