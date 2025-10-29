// src/app/app.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { NotificationsService } from './services/notifications/notifications.service';

// Mock simple del servicio
class MockNotificationsService {
  unreadCount = jasmine.createSpy().and.returnValue(3);
  markAllAsRead = jasmine.createSpy('markAllAsRead');
}

describe('App Component', () => {
  let fixture: ComponentFixture<App>;
  let component: App;
  let notifService: MockNotificationsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App], // componente standalone
      providers: [{ provide: NotificationsService, useClass: MockNotificationsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    notifService = TestBed.inject(NotificationsService) as unknown as MockNotificationsService;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar el título en la toolbar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pagos - Órdenes');
  });

  it('debe mostrar el badge con el número de notificaciones', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('button[mat-icon-button] span.mat-badge-content');
    expect(badge?.textContent?.trim()).toBe('3');
  });

  it('debe llamar a markAllAsRead() al hacer clic en la campanita', () => {
    const button = fixture.nativeElement.querySelector('button[mat-icon-button]');
    button.click();
    expect(notifService.markAllAsRead).toHaveBeenCalled();
  });
});
