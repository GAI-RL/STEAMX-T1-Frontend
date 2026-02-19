import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInterfaceComponent } from './chat-interface';

describe('ChatInterface', () => {
  let component: ChatInterfaceComponent;
  let fixture: ComponentFixture<ChatInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatInterfaceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
