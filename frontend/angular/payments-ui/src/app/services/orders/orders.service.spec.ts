// src/app/services/orders/orders.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://127.0.0.1:8000/api/orders';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrdersService,
        provideHttpClient(), // ✅ cliente real
        provideHttpClientTesting(), // ✅ backend de prueba
      ],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe hacer GET correcto en getOrders()', () => {
    const mockResponse = {
      success: true,
      message: 'OK',
      data: {
        results: [
          {
            id: '1',
            description: 'Orden 1',
            amount: '100',
            status: 'PENDING',
            created_at: '2025-10-01',
          },
        ],
        page: 1,
        page_size: 5,
        total_pages: 1,
        total_items: 1,
      },
    };

    service.getOrders(1, 5).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.data.results.length).toBe(1);
      expect(res.data.results[0].description).toBe('Orden 1');
    });

    const req = httpMock.expectOne(`${baseUrl}?page=1&page_size=5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debe hacer GET correcto en getOrderById()', () => {
    const id = '123';
    const mockResponse = {
      success: true,
      message: 'OK',
      data: {
        id,
        description: 'Orden única',
        amount: '200',
        status: 'PAID',
        created_at: '2025-10-02',
      },
    };

    service.getOrderById(id).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.data.id).toBe(id);
      expect(res.data.status).toBe('PAID');
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
