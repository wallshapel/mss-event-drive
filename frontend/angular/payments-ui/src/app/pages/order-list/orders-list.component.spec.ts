// src/app/pages/order-list/orders-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrdersListComponent } from './orders-list.component';
import { OrdersService } from '../../services/orders/orders.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { of } from 'rxjs';

// ─── Mocks ───────────────────────────────────────────────────────────────
const mockOrders = [
  { id: '1', description: 'Orden 1', amount: '100', status: 'PENDING', created_at: '2025-10-01' },
  { id: '2', description: 'Orden 2', amount: '200', status: 'PAID', created_at: '2025-10-02' },
];

class MockOrdersService {
  getOrders = jasmine.createSpy().and.returnValue(
    of({
      success: true,
      message: 'OK',
      data: {
        results: mockOrders,
        page: 1,
        page_size: 5,
        total_pages: 1,
        total_items: 2,
      },
    })
  );
}

class MockNotificationsService {
  highlighted = jasmine.createSpy().and.returnValue(new Set(['1']));
  markAllAsRead = jasmine.createSpy('markAllAsRead');
}

// ─── Suite ───────────────────────────────────────────────────────────────
describe('OrdersListComponent', () => {
  let fixture: ComponentFixture<OrdersListComponent>;
  let component: OrdersListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersListComponent], // componente standalone
      providers: [
        { provide: OrdersService, useClass: MockOrdersService },
        { provide: NotificationsService, useClass: MockNotificationsService },
        provideRouter([]), // ✅ mock de router para RouterLink y ActivatedRoute
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las órdenes al inicializar', () => {
    expect(component.orders().length).toBe(2);
  });

  it('debe renderizar los descriptores de órdenes en la tabla', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Orden 1');
    expect(compiled.textContent).toContain('Orden 2');
  });

  it('debe agregar una nueva orden cuando se emite el evento "order-created"', () => {
    const newOrder = {
      id: '3',
      description: 'Nueva orden 3',
      amount: 300,
      status: 'PENDING',
      created_at: '2025-10-03',
    };
    const event = new CustomEvent('order-created', { detail: newOrder });

    window.dispatchEvent(event);
    fixture.detectChanges();

    const orders = component.orders();
    expect(orders.some((o) => o.id === '3')).toBeTrue();
  });

  it('debe aplicar clase "highlighted" cuando una orden está resaltada', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const highlightedRow = compiled.querySelector('tr.highlighted');
    expect(highlightedRow).not.toBeNull();
  });
});
