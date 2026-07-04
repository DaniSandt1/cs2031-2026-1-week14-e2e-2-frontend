# Frontend Uber Clone

Frontend en React + TypeScript para consumir el backend Spring Boot del laboratorio `Uber Clone Backend`.

## Requisitos

- Backend Spring Boot corriendo en `http://localhost:8080`
- Node.js y pnpm


## Estructura

- `src/` contiene la aplicacion React
- `.env.example` define la URL base del backend
- `package.json` contiene los scripts de desarrollo y build

## Configuracion

1. Entra a la carpeta del frontend:

```powershell
cd C:\Users\mmmmm\cs2031-2026-1-week14-e2e-2-frontend
```

2. Crea tu archivo `.env` a partir del ejemplo:

```powershell
Copy-Item .env.example .env
```

3. El valor por defecto ya apunta al backend local:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Comandos

Instalar dependencias:

```powershell
pnpm install
```

Levantar el frontend en desarrollo:

```powershell
pnpm dev
```

Generar build de produccion:

```powershell
pnpm build
```

Previsualizar el build:

```powershell
pnpm preview
```

## Inicio rapido

1. Levanta el backend Spring Boot en `http://localhost:8080`
2. Levanta este frontend con `pnpm dev`
3. Abre `http://localhost:5173`
4. Usa usuarios seed o registra uno nuevo

## Usuarios seed recomendados

- `ana@uber.com` / `pass123` para probar flujo `PASSENGER`
- `carlos@uber.com` / `pass123` para probar flujo `DRIVER`
- `lucia@uber.com` / `pass123` para probar conductor con viaje `IN_PROGRESS`

## Verificacion manual de la rubrica completa

La siguiente guia cubre los 20 puntos solicitados por el `README` del backend.

### 1. Login / Registro - 3 puntos

Endpoints requeridos:

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`

Verificacion:

1. Abre `http://localhost:5173/auth`
2. Inicia sesion con `ana@uber.com / pass123`
3. Confirma que ingresas automaticamente al dashboard de pasajero
4. Abre `Application > Local Storage` en el navegador y verifica que existe el token
5. Cierra sesion
6. Ve a la pestana `Registro`
7. Registra un usuario nuevo eligiendo `PASSENGER` o `DRIVER`
8. Confirma que ingresa automaticamente y redirige al dashboard correcto segun rol

Resultado esperado:

- El token se guarda localmente
- Cada sesion redirige segun el rol obtenido desde `GET /users/me`

### 2. Dashboard pasajero - 3 puntos

Endpoints requeridos:

- `GET /users/me`
- `GET /trips`

Verificacion:

1. Entra con `ana@uber.com`
2. Confirma que ves tu nombre en la vista
3. Confirma que aparece la lista de tus viajes
4. Verifica que cada viaje tiene badge de estado `PENDING`, `IN_PROGRESS` o `COMPLETED`

Resultado esperado:

- El dashboard muestra usuario y viajes reales del backend

### 3. Solicitar viaje - 2 puntos

Endpoints requeridos:

- `GET /drivers/available`
- `POST /trips`

Verificacion:

1. En el dashboard de pasajero revisa la lista de conductores disponibles
2. Completa origen y destino
3. Presiona `Confirmar solicitud`
4. Confirma que se crea el viaje y redirige al detalle

Resultado esperado:

- Antes de crear el viaje ves conductores disponibles
- El viaje nuevo queda creado y visible

### 4. Detalle de viaje pasajero - 4 puntos

Endpoints requeridos:

- `GET /trips/{id}`
- `POST /trips/{id}/rate`

Verificacion:

1. Desde el dashboard de pasajero entra al detalle de un viaje creado
2. Si el viaje esta `PENDING`, confirma que se muestra "Buscando conductor..."
3. Abre otra sesion con un conductor y acepta ese viaje
4. Regresa a la vista del pasajero y espera 3 a 5 segundos
5. Confirma que el detalle se actualiza solo y ahora muestra el conductor asignado
6. Completa el viaje desde la vista del conductor
7. Regresa al pasajero y espera el polling o recarga
8. Confirma que aparece el formulario de calificacion solo cuando el viaje esta `COMPLETED` y no fue calificado antes
9. Envia una calificacion y comentario opcional

Resultado esperado:

- El polling actualiza estado y conductor
- La calificacion solo aparece en el momento correcto
- Tras calificar, se muestra el resumen y desaparece el formulario

### 5. Dashboard conductor - 4 puntos

Endpoints requeridos:

- `GET /users/me`
- `GET /trips/pending`
- `GET /trips/my`
- `PATCH /trips/{id}/accept`

Verificacion:

1. Inicia sesion con `carlos@uber.com`
2. Confirma que ves tu rating actual
3. Confirma que ves la lista de viajes `PENDING`
4. Si tienes un viaje activo, debe aparecer resaltado arriba
5. Toma un viaje pendiente con `Aceptar`

Resultado esperado:

- El conductor ve su rating
- Puede aceptar viajes pendientes
- El viaje aceptado pasa a su flujo activo

### 6. Detalle de viaje conductor - 2 puntos

Endpoints requeridos:

- `GET /trips/{id}`
- `PATCH /trips/{id}/complete`

Verificacion:

1. Desde el dashboard conductor entra al detalle del viaje aceptado
2. Confirma que ves origen, destino y datos del pasajero
3. Si el viaje esta `IN_PROGRESS`, presiona `Completar viaje`
4. Confirma que la pantalla muestra el resumen final con estado `COMPLETED`

Resultado esperado:

- El conductor puede cerrar el viaje desde el detalle

### 7. Historial - 2 puntos

Endpoints requeridos:

- `GET /trips` para `PASSENGER`
- `GET /trips/my` para `DRIVER`

Verificacion:

1. Entra a `Historial` como pasajero
2. Prueba los filtros `ALL`, `PENDING`, `IN_PROGRESS` y `COMPLETED`
3. Confirma que cada resultado abre su detalle
4. Repite el mismo proceso como conductor

Resultado esperado:

- Ambos roles pueden filtrar su historial por estado


## URLs utiles

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8080](http://localhost:8080)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)