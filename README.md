# Frontend Uber Clone

Frontend en React + TypeScript para consumir el backend Spring Boot del laboratorio `Uber Clone Backend`.

## Requisitos

- Backend Spring Boot corriendo en `http://localhost:8080`
- Node.js y pnpm


## Estructura

- `src/` contiene la aplicacion React

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


## URLs utiles

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8080](http://localhost:8080)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)