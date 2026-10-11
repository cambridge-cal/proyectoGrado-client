# Sistema CAL · Cliente

Aplicación web del Sistema CAL, el software de generación automática de horarios con inteligencia artificial y evaluación docente para Cambridge Academy of Languages. Es parte del proyecto de grado del programa de Ingeniería de Software de la Universidad Cooperativa de Colombia, sede San Juan de Pasto.

La API vive en el repositorio [`proyectoGrado-server`](https://github.com/cambridge-cal/proyectoGrado-server).

## Tecnologías

- Node.js 24 LTS
- React 19 con TypeScript y Vite

## Requisitos

- Node.js 24 o superior (`node -v`)

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Verifica tipos y compila a `dist/` |
| `npm run preview` | Sirve la compilación de producción |
| `npm run lint` | Análisis estático |

## Documentación

- Diagramas del sistema: [`docs/diagramas` del servidor](https://github.com/cambridge-cal/proyectoGrado-server/tree/main/docs/diagramas)
- Forma de trabajo, ramas y commits: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Autores

- Danilo Andrés Montezuma Ibarra
- Juan José Burbano Bolaños
