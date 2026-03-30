import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatSession, ChatMessage } from '../../../core/models/chat.model';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar';
import { ChatMessageComponent } from '../chat-message/chat-message';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ChatSidebarComponent, ChatMessageComponent],
  templateUrl: './chat-interface.html',
  styleUrl: './chat-interface.css'
})
export class ChatInterfaceComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  user: User | null = null;
  sessions: ChatSession[] = [];
  currentSession: ChatSession | null = null;
  currentSessionId: string | null = null;
  messages: ChatMessage[] = [];
  currentMessage = '';
  loading = false;
  loadingSessions = false;
  sidebarCollapsed = true; // Changed to true - sidebar closed by default
  inputFocused = false;
  inputMenuOpen = false;

  stats = { plan: 'FREE' };
  private shouldScroll = false;
  private isFirstMessage = false; // Track if this is the first message in a new session

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    if (this.user) {
      this.stats.plan = (this.user.subscription_tier || 'free').toUpperCase();
    }

    this.loadingSessions = true;
    this.chatService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.loadingSessions = false;

        // Check for initial route params after sessions are loaded
        const initialId = this.route.snapshot.params['id'];
        if (initialId && initialId !== this.currentSessionId) {
          this.loadSession(initialId);
        }
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        this.loadingSessions = false;
        // Check if it's an auth error
        if (err.status === 401 || err.status === 403) {
          this.handleAuthError();
        }
      }
    });

    // Listen to route changes without reloading component
    this.route.params.subscribe(params => {
      const sessionId = params['id'];
      // Only load if we have an ID, it's different from current, and we don't have an ongoing message send
      if (sessionId && sessionId !== this.currentSessionId && !this.isFirstMessage) {
        this.loadSession(sessionId);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  loadSession(sessionId: string): void {
    // If we're currently sending a first message, don't reload
    if (this.isFirstMessage && this.currentSessionId === sessionId) {
      return;
    }

    // Clear current state first for smooth transition
    this.currentSessionId = sessionId;

    // Don't show loading spinner if we already have messages (switching between chats)
    const hadMessages = this.messages.length > 0;
    if (!hadMessages) {
      this.loading = true;
    }

    this.chatService.getSession(sessionId).subscribe({
      next: (response) => {
        this.currentSession = response.session || response;

        this.messages = (response.messages || []).map((msg: any) => ({
          ...msg,
          figures: (msg.figures || []).map((fig: any) => ({
            ...fig,
            imageUrl: fig.image_base64 ? `data:image/png;base64,${fig.image_base64}` : ''
          }))
        }));

        console.log('LOADED SESSION RESPONSE:', response);
        console.log('LOADED SESSION MESSAGES:', this.messages);

        this.shouldScroll = true;
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Error loading session:', err);
        this.loading = false;
        this.cdr.detectChanges();
        // Check if it's an auth error
        if (err.status === 401 || err.status === 403) {
          this.handleAuthError();
        }
      }
    });
  }

  createNewSession(): void {
    this.currentSession = null;
    this.currentSessionId = null;
    this.messages = [];
    this.loading = false;
    this.isFirstMessage = false;
    // Don't navigate yet - wait for actual message to be sent
    this.cdr.detectChanges();
    setTimeout(() => { if (this.messageInput) this.messageInput.nativeElement.focus(); }, 100);
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.loading) return;
    const userMessage = this.currentMessage.trim();
    this.currentMessage = '';

    // Reset textarea height after sending
    if (this.messageInput) {
      this.messageInput.nativeElement.style.height = 'auto';
    }

    this.loading = true;

    if (!this.currentSessionId) {
      // This is a new session - mark as first message
      this.isFirstMessage = true;

      this.chatService.createNewSession().subscribe({
        next: (session) => {
          this.currentSessionId = session.id;
          this.currentSession = session;

          // DON'T navigate yet - wait until message is sent and received
          this.loadSessions(true);
          this.sendToSession(userMessage, session.id);
        },
        error: (err) => {
          console.error('Error creating session:', err);
          this.loading = false;
          this.isFirstMessage = false;
          // Check if it's an auth error
          if (err.status === 401 || err.status === 403) {
            this.handleAuthError();
          }
        }
      });
    } else {
      this.sendToSession(userMessage, this.currentSessionId);
    }
  }

  private sendToSession(question: string, sessionId: string): void {
    console.log('[sendToSession] Starting - Session:', sessionId, 'Question:', question);
    console.log('[sendToSession] Current messages count:', this.messages.length);

    // Immediately show user message in UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    this.messages.push(userMessage);
    console.log('[sendToSession] Added user message. New count:', this.messages.length);
    this.shouldScroll = true;
    this.cdr.detectChanges(); // Force immediate UI update

    this.chatService.sendMessage(sessionId, question).subscribe({
      next: (response) => {
        console.log('[sendToSession] FULL RESPONSE:', response);
        console.log('[sendToSession] RESPONSE FIGURES:', response.figures);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          session_id: sessionId,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          figures: (response.figures || []).map((fig: any) => ({
            ...fig,
            imageUrl: fig.image_base64
              ? `data:image/png;base64,${fig.image_base64}`
              : ''
          }))
        };

        console.log('[sendToSession] ASSISTANT MESSAGE:', assistantMessage);

        this.messages.push(assistantMessage);
        console.log('[sendToSession] Added assistant message. New count:', this.messages.length);
        this.shouldScroll = true;
        this.loading = false;

        // Now that we have the response, update URL if this was the first message
        if (this.isFirstMessage) {
          console.log('[sendToSession] First message - updating URL');
          this.isFirstMessage = false;
          // Update URL without reloading the page
          window.history.replaceState({}, '', `/chat/${sessionId}`);
        }

        this.cdr.detectChanges(); // Force immediate UI update

        // Silently refresh sidebar sessions to update title
        this.loadSessions(true);

        // Also update current session title locally for the header
        if (this.currentSession && this.currentSession.title === 'New Conversation') {
          this.currentSession = {
            ...this.currentSession,
            title: question.length > 50 ? question.substring(0, 50) + '...' : question
          };
        }
      },
      error: (err) => {
        console.error('[sendToSession] Error:', err);
        this.messages.pop(); // Remove the user message on error
        this.loading = false;
        this.isFirstMessage = false;
        this.cdr.detectChanges();
        // Check if it's an auth error
        if (err.status === 401 || err.status === 403) {
          this.handleAuthError();
        }
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.inputMenuOpen = false; }

  toggleInputMenu(): void { this.inputMenuOpen = !this.inputMenuOpen; }

  handleInputAction(action: string): void {
    this.inputMenuOpen = false;
    if (action === 'upload') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*,.pdf,.doc,.docx,.txt,.csv';
      input.click();
    }
  }

  loadSessions(silent = false): void {
    if (!silent) this.loadingSessions = true;
    this.chatService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        if (!silent) this.loadingSessions = false;
      },
      error: (err) => {
        console.error('Error loading sessions:', err);
        if (!silent) this.loadingSessions = false;
        // Check if it's an auth error
        if (err.status === 401 || err.status === 403) {
          this.handleAuthError();
        }
      }
    });
  }

  handleDeleteSession(sessionId: string): void {
    this.chatService.deleteSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        if (this.currentSessionId === sessionId) this.createNewSession();
      },
      error: (err) => {
        console.error('Error deleting session:', err);
        // Check if it's an auth error
        if (err.status === 401 || err.status === 403) {
          this.handleAuthError();
        }
      }
    });
  }

  clearCurrentChat(): void {
    if (!this.currentSessionId) { this.messages = []; return; }
    this.handleDeleteSession(this.currentSessionId);
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Auto-resize textarea as user types
  onTextareaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  usePrompt(prompt: string): void {
    this.currentMessage = prompt;
    // Focus on the textarea so user can review and press Enter to send
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
        // Auto-resize textarea to fit the prompt
        const textarea = this.messageInput.nativeElement;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
      }
    }, 0);
  }

  scrollToBottom(): void {
    try { this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight; } catch {}
  }

  // Get count of user messages only (professional standard)
  getUserMessageCount(): number {
    return this.messages.filter(m => m.role === 'user').length;
  }

  getUserFirstName(): string {
    if (!this.user?.full_name) return 'there';
    return this.user.full_name.split(' ')[0];
  }

  getUserInitial(): string {
    if (!this.user?.full_name) return 'U';
    return this.user.full_name.charAt(0).toUpperCase();
  }

  // Handle authentication errors
  private handleAuthError(): void {
    console.log('Authentication error detected - logging out');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}