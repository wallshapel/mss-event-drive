// src/app/services/notifications/notifications.service.spec.ts
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock de localStorage
    localStorageMock = {};
    spyOn(window.localStorage, 'getItem').and.callFake((key: string) => localStorageMock[key] ?? null);
    spyOn(window.localStorage, 'setItem').and.callFake((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    // Mock de EventSource (no queremos abrir conexión real)
    (window as any).EventSource = class {
      addEventListener() {}
      close() {}
    };

    service = new NotificationsService();
  });

  it('debe parsear correctamente un mensaje de orden válido', () => {
    const message = `Nueva orden disponible...
ID: 123-abc
Descripción: Compra de teclado
Monto: $150.50
Estado: PENDING`;

    const result = (service as any).parseOrderFromMessage(message);

    expect(result).toEqual({
      id: '123-abc',
      description: 'Compra de teclado',
      amount: 150.5,
      status: 'PENDING',
    });
  });

  it('debe retornar null si el mensaje no contiene un ID', () => {
    const message = `Descripción: Sin ID\nMonto: $50\nEstado: PENDING`;
    const result = (service as any).parseOrderFromMessage(message);
    expect(result).toBeNull();
  });

  it('debe marcar una orden como leída y actualizar contadores', () => {
    const id = 'order-1';
    service.highlighted.set(new Set([id]));
    service.read.set(new Set());
    service.unreadCount.set(1);

    service.markAsRead(id);

    expect(service.highlighted().has(id)).toBeFalse();
    expect(service.read().has(id)).toBeTrue();
    expect(service.unreadCount()).toBe(0);
  });

  it('debe marcar todas como leídas', () => {
    service.highlighted.set(new Set(['1', '2']));
    service.read.set(new Set(['3']));
    service.unreadCount.set(2);

    service.markAllAsRead();

    expect(service.highlighted().size).toBe(0);
    expect(service.read().size).toBe(3); // 1,2,3
    expect(service.unreadCount()).toBe(0);
  });

  it('debe persistir y cargar correctamente el estado desde localStorage', () => {
    // Guardar estado simulado
    service.highlighted.set(new Set(['x']));
    service.read.set(new Set(['y']));
    (service as any).persistState();

    const stored = JSON.parse(localStorageMock['orderStatesAngular']);
    expect(stored.highlighted).toContain('x');
    expect(stored.read).toContain('y');

    // Ahora simular carga
    (window.localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(stored));
    const loaded = (service as any).loadOrderStates();

    expect(loaded.highlighted.has('x')).toBeTrue();
    expect(loaded.read.has('y')).toBeTrue();
  });
});
