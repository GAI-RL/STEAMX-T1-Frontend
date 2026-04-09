import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamxHomeComponent } from './steamx-home';

describe('SteamxHome', () => {
  let component: SteamxHomeComponent;
  let fixture: ComponentFixture<SteamxHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteamxHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SteamxHomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
