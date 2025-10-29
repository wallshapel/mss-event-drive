// src/exceptions/app-error.ts
export class AppError extends Error {
  public readonly status: number;
  public readonly data: any;

  constructor(message: string, status = 400, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
