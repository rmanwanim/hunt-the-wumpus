# Hunt the Wumpus

SPA en Angular 22. Busca el oro, evita los pozos y al Wumpus y vuelve a la salida.
Para ganar, pulsa **Salir** con el oro desde la casilla inicial.
**Nueva partida** vuelve a la configuración después de ganar o perder.

## Requisitos

Node.js 22.22.3+ (rama 22), 24.15.0+ (rama 24) o 26+, npm y Google Chrome para los tests.

## Ejecutar

1. Instala las dependencias con `npm ci`.
2. Inicia el servidor con `npm start`.
3. Abre http://localhost:4200/.

## Compilar y comprobar

- `npm run build`: genera la aplicación en `dist/hunt-the-wumpus/`.
- `npm run test:ci`: ejecuta una vez los tests con Karma, Jasmine y ChromeHeadless.
- `npm test -- --watch --browsers=Chrome`: ejecuta los tests en modo interactivo.

Si Chrome está en una ubicación personalizada, define `CHROME_BIN` con la ruta a su ejecutable.
