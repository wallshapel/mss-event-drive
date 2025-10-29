// src/app/services/payments/payments.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PaymentsService, PaymentRequest } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3000/api/payments';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PaymentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe realizar POST correcto al crear un pago', () => {
    const payload: PaymentRequest = { orderId: 'abc', amount: 150 };
    const mockResponse = {
      success: true,
      message: 'Pago procesado',
      data: { id: 'p1', orderId: 'abc', amount: 150, status: 'APPROVED' },
    };

    service.createPayment(payload).subscribe((data) => {
      expect(data).toEqual(mockResponse.data);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('debe devolver null si ocurre un error', () => {
    const payload: PaymentRequest = { orderId: 'err', amount: 99 };

    service.createPayment(payload).subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne(baseUrl);
    req.error(new ProgressEvent('NetworkError'));
  });

  it('debe mantener señal de loading en false por defecto', () => {
    expect(service.loading()).toBeFalse();
  });
});
