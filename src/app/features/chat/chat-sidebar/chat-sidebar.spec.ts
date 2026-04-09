import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSidebarComponent } from './chat-sidebar';

describe('ChatSidebar', () => {
  let component: ChatSidebarComponent;
  let fixture: ComponentFixture<ChatSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
