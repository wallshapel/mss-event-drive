# Guía de instalación y ejecución del proyecto **mss-event-drive**

Este documento describe paso a paso cómo clonar, configurar y ejecutar el proyecto **mss-event-drive**, una arquitectura **event-driven** basada en Kafka que implementa una pasarela de pagos distribuida en microservicios.

---

## 📦 Estructura general del proyecto

El repositorio contiene dos grandes carpetas:

- **backend/** → Contiene los tres microservicios (Django, Express y Spring Boot) y el entorno Kafka.
- **frontend/** → Contiene las dos aplicaciones cliente (React y Angular).

Cada servicio es independiente y debe iniciarse en el orden adecuado para garantizar la comunicación por eventos.

---

## 🧩 Requisitos previos

Asegúrate de tener instalados:

- **Git** ≥ 2.40
- **Docker + Docker Compose** ≥ 20.10
- **Python** ≥ 3.10
- **Node.js** ≥ 20
- **npm** ≥ 10
- **Java** ≥ 17 (para el microservicio de notificaciones)
- **PostgreSQL** ≥ 14
- **MongoDB** ≥ 6
- **Kafka** (usado mediante Docker Compose)
- **Angular CLI** ≥ 17 (para el frontend Angular)

---

## 🚀 Clonación del repositorio

```bash
# Clonar el proyecto completo
git clone https://github.com/wallshapel/mss-event-drive.git
cd mss-event-drive
```

---

## 🧠 1. Iniciar el entorno de mensajería (Kafka)

Antes de ejecutar cualquier microservicio, se deben levantar los contenedores de **Kafka** y **Zookeeper**.

```bash
cd backend/kafka

# Levantar los contenedores de Kafka y Zookeeper
docker compose up -d

# Verificar que los contenedores estén corriendo
docker ps
```

Deberías ver **3 contenedores activos**: Zookeeper, Kafka y posiblemente un UI de administración (si fue configurada).

---

## 🐍 2. Microservicio de Órdenes (Django + PostgreSQL)

### Configuración de base de datos

Asegúrate de tener creada la base de datos **orders_db** en PostgreSQL:

```sql
CREATE DATABASE orders_db;
CREATE USER postgres WITH PASSWORD '456';
GRANT ALL PRIVILEGES ON DATABASE orders_db TO postgres;
```

### Instalación y ejecución

```bash
cd backend/django/orders

# Activar entorno virtual (si no existe, créalo primero)
python3 -m venv venv
source venv/bin/activate  # En Linux o macOS
# .\venv\Scripts\activate  # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# Correr tests (cobertura > 80%)
pytest --ds=orders_ms.settings -v

# Iniciar el servidor
python manage.py runserver --noreload
```

El microservicio se ejecuta en **http://localhost:8000**.

---

## 💳 3. Microservicio de Pagos (Express + TypeScript + MongoDB)

### Configuración de base de datos

La base de datos requerida es **payments_db**, accesible mediante:
```
mongodb://root:456@localhost:27017/payments_db?authSource=admin
```

### Instalación y ejecución

```bash
cd backend/express/payments-ms

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Iniciar el servicio
npm run start  # o node dist/main.js según la configuración
```

El microservicio se ejecuta en **http://localhost:3000**.

---

## 🔔 4. Microservicio de Notificaciones (Spring Boot / WebFlux)

Este servicio no utiliza base de datos.

### Instalación y ejecución

```bash
cd backend/webflux/notifications-ms
```

En **IntelliJ IDEA** o cualquier IDE con soporte Gradle:

1. Abre el proyecto como **proyecto Gradle**.
2. Espera a que se sincronicen las dependencias.
3. Ejecuta la clase principal (`NotificationsMsApplication.java` o similar) con clic derecho → *Run*.

El servicio se ejecuta en **http://localhost:8080**.

### Tests
Puedes ejecutar las pruebas desde el IDE (clic derecho sobre la clase de test → *Run Tests*).

---

## 🖥️ 5. Frontend de Órdenes (React + TypeScript)

Este frontend actúa como **panel administrativo**, permitiendo crear nuevas órdenes, listarlas y recibir notificaciones en tiempo real cuando son pagadas.

```bash
cd frontend/react/orders-admin-frontend

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación se ejecuta en **http://localhost:5173**.

---

## 💰 6. Frontend de Pagos (Angular + Angular Material)

Este frontend permite visualizar las órdenes creadas, procesar pagos y emitir notificaciones a los otros servicios.

```bash
cd frontend/angular/payments-ui

# Instalar dependencias
npm install

# Ejecutar tests
CHROME_BIN=/usr/bin/brave npm run test

# Iniciar el servidor de desarrollo
ng s -o
```

La aplicación se ejecuta en **http://localhost:4200**.

---

## 🔄 Flujo de comunicación entre servicios

```text
React (Admin) → [Kafka topic: order_created] → Django (Orders)
Django → [Kafka topic: payment_pending] → Angular (Payments)
Angular (Payments) → [Kafka topic: payment_completed] → React (Admin)
Spring Boot (Notifications) → [Emite notificaciones a ambos frontends]
```

Los frontends almacenan las notificaciones en **LocalStorage**, comparando las recibidas con las leídas para determinar el estado de lectura.

---

## 🧩 Principios y buenas prácticas aplicadas

- **Arquitectura Event-Driven** basada en Kafka.
- **Patrón Repositorio** y **DTOs** en todos los microservicios.
- **Principios SOLID**.
- **Testing unitario e integración** con alta cobertura.
- **Comunicación desacoplada** mediante topics Kafka.

---

## ✅ Resumen rápido de puertos

| Servicio                   | Puerto | Tecnología         |
|-----------------------------|--------|--------------------|
| Django (Órdenes)            | 8000   | Python / PostgreSQL|
| Express (Pagos)             | 3000   | Node.js / MongoDB  |
| Spring Boot (Notificaciones)| 8080   | Java / WebFlux     |
| React (Admin)               | 5173   | React + TypeScript |
| Angular (Pagos)             | 4200   | Angular Material   |
| Kafka                       | 9092   | Docker Compose     |

---

## 🧾 Notas finales

- Asegúrate de que **Kafka** esté en ejecución **antes** de levantar los microservicios.
- Cada servicio es independiente y puede probarse por separado.
- Los frontends usan **LocalStorage** para persistir las notificaciones.
- Puedes modificar las variables de entorno o conexiones según tu entorno local.

---

**Repositorio:** [github.com/wallshapel/mss-event-drive](https://github.com/wallshapel/mss-event-drive)

