// src/test.ts
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

// 🔹 Inicializa el entorno de pruebas para Angular standalone apps (Angular 20)
getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
