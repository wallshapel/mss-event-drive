// src/app/pages/order-detail/order-detail.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { OrderDetailComponent } from './order-detail.component';
import { OrdersService } from '../../services/orders/orders.service';
import { PaymentsService } from '../../services/payments/payments.service';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockOrder = {
  id: '1',
  description: 'Orden de prueba',
  amount: '150',
  status: 'PENDING',
  created_at: '2025-10-01',
};

class MockOrdersService {
  getOrderById = jasmine
    .createSpy()
    .and.returnValue(of({ success: true, message: 'OK', data: mockOrder }));
}

class MockPaymentsService {
  createPayment = jasmine
    .createSpy()
    .and.returnValue(of({ data: { id: 'p1', status: 'APPROVED' } }));
}

class MockNotificationsService {
  markAsRead = jasmine.createSpy('markAsRead');
}

class MockSnackBar {
  open = jasmine.createSpy('open');
}

describe('OrderDetailComponent', () => {
  let fixture: ComponentFixture<OrderDetailComponent>;
  let component: OrderDetailComponent;
  let paymentsService: MockPaymentsService;
  let notifService: MockNotificationsService;
  let snackBar: MockSnackBar;

  beforeEach(async () => {
    spyOn(console, 'error');

    const mockPayments = new MockPaymentsService();
    const mockOrders = new MockOrdersService();
    const mockNotif = new MockNotificationsService();
    const mockSnack = new MockSnackBar();

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '1' : null) } },
          },
        },
      ],
    })
      // 🚀 Sobrescribimos los providers del componente standalone
      .overrideComponent(OrderDetailComponent, {
        set: {
          providers: [
            { provide: OrdersService, useValue: mockOrders },
            { provide: PaymentsService, useValue: mockPayments },
            { provide: NotificationsService, useValue: mockNotif },
            { provide: MatSnackBar, useValue: mockSnack },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    paymentsService = mockPayments;
    notifService = mockNotif;
    snackBar = mockSnack;

    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar la orden y marcarla como leída', () => {
    expect(notifService.markAsRead).toHaveBeenCalledWith('1');
    expect(component.order()?.description).toBe('Orden de prueba');
  });

  it('debe ejecutar el pago correctamente', fakeAsync(() => {
    component.payOrder();
    tick();
    expect(paymentsService.createPayment).toHaveBeenCalledWith({ orderId: '1', amount: 150 });
    expect(snackBar.open).toHaveBeenCalledWith('Pago realizado exitosamente ✅', 'Cerrar', {
      duration: 3000,
    });
    expect(component.order()?.status).toBe('PAID');
  }));

  it('debe mostrar error si el pago falla', fakeAsync(() => {
    paymentsService.createPayment = jasmine
      .createSpy()
      .and.returnValue(throwError(() => new Error('Network error')));

    component.payOrder();
    tick();

    expect(snackBar.open).toHaveBeenCalledWith('Error al procesar el pago ❌', 'Cerrar', {
      duration: 3000,
    });
  }));
});
