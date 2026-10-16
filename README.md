# Sistema CAL · Cliente

Aplicación web del Sistema CAL, el software de generación automática de horarios con inteligencia artificial y evaluación docente para Cambridge Academy of Languages. Es parte del proyecto de grado del programa de Ingeniería de Software de la Universidad Cooperativa de Colombia, sede San Juan de Pasto.

La API vive en el repositorio [`proyectoGrado-server`](https://github.com/cambridge-cal/proyectoGrado-server).

## Tecnologías

- Node.js 24 LTS
- React 19 con TypeScript y Vite
- React Router 7 para las rutas protegidas por rol
- Zustand para la sesión y TanStack Query para las peticiones al servidor
- Axios con renovación automática del Access Token
- Tailwind CSS 4 con los tokens del prototipo en Figma, tipografía Inter e íconos Lucide
- Vitest y Testing Library para las pruebas

## Requisitos

- Node.js 24 o superior (`node -v`)
- El servidor corriendo en `http://localhost:3000` (ver su README)

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

En Windows (PowerShell) usa `Copy-Item .env.example .env` en lugar de `cp`.

La aplicación queda disponible en `http://localhost:5173`. Para entrar, el servidor debe estar corriendo con los usuarios de prueba creados (`npm run semilla` en `proyectoGrado-server`): admin@cambridge.edu.co, docente@cambridge.edu.co o estudiante@cambridge.edu.co, con la contraseña que definiste en `SEMILLA_CONTRASENA`.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Verifica tipos y compila a `dist/` |
| `npm run preview` | Sirve la compilación de producción |
| `npm run test` | Pruebas |
| `npm run lint` | Análisis estático |

## Estructura

La organización sigue el diagrama de componentes del frontend (Figura 6.13 de la tesis):

```
src/
├── App.tsx                 TanStack Query y React Router
├── rutas.tsx               Mapa de rutas por rol
├── index.css               Tokens del sistema de diseño (Tailwind @theme)
├── compartido/
│   ├── api.ts              Cliente Axios con interceptores de token
│   ├── navegacion.ts       Menú de cada rol
│   ├── layouts/            Estructura de Administrador, Docente/Estudiante y login
│   ├── paginas/            Sin permiso, no encontrada y vista en construcción
│   └── ui/                 Botón, insignia, tarjeta, campo, avatar, barra de progreso…
├── seguridad/              Sesión (Zustand), ProtectedRoute y pantallas de acceso
└── modulos/
    ├── admin/              Dashboard, Horarios, Evaluación, Usuarios, Configuración, Auditoría
    ├── docente/            Mi horario, Mis resultados (DashboardDocente), Mi disponibilidad
    └── estudiante/         Evaluaciones pendientes, formulario, horario y grupos
```

Cada vista muestra por ahora el ticket que la implementa y la pantalla de Figma que le sirve de referencia. El ticket correspondiente reemplaza la vista base por la real.

## Sistema de diseño

Los colores, la tipografía y los radios están en `src/index.css` y se usan como clases de Tailwind (`bg-primario`, `text-texto-suave`, `rounded-tarjeta`…). Usa siempre estos tokens y los componentes de `src/compartido/ui` para mantener la consistencia visual (RNF-16). Para textos de estado usa las variantes `*-texto` (por ejemplo `text-exito-texto`), que cumplen el contraste mínimo de accesibilidad.

## Documentación

- Guía de diseño (Figma, rutas y tickets): [`docs/diseno.md`](docs/diseno.md)
- Diagramas del sistema: [`docs/diagramas` del servidor](https://github.com/cambridge-cal/proyectoGrado-server/tree/main/docs/diagramas)
- Forma de trabajo, ramas y commits: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Autores

- Danilo Andrés Montezuma Ibarra
- Juan José Burbano Bolaños
