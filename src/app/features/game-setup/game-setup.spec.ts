import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameSetupComponent } from './game-setup';

describe('GameSetup', () => {
  let component: GameSetupComponent;
  let fixture: ComponentFixture<GameSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSetupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSetupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });
});
