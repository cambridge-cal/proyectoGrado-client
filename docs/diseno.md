# Guía de diseño del cliente

Este documento une el prototipo de Figma con las rutas, los tickets y los requisitos de la tesis. Úsalo al empezar cualquier ticket de vistas.

## Archivos de Figma

| Archivo | Contenido |
|---|---|
| [Cambridge Academy · Sistema de Gestión Académica](https://www.figma.com/design/ER8A2Knc4PxX2BUuZcusGS) | Prototipo original: 10 pantallas (01 a 10). |
| [Sistema CAL · Propuesta alineada a la tesis](https://www.figma.com/design/mSWNpzvONFtgr82biOUmPj) | Tokens de color, barra lateral y barra superior como componentes, pantallas ajustadas (03b a 06b) y pantallas nuevas (13 a 19). |

Si una pantalla existe en los dos archivos, manda la versión de la propuesta.

## Pantallas, rutas y tickets

| Pantalla | Ruta | Ticket | Requisitos |
|---|---|---|---|
| 01 · Login | `/iniciar-sesion` | TKT-007 | RF-01, RNF-14, RNF-15 |
| 02 · Recuperar contraseña | `/recuperar-contrasena` | TKT-012 | RF-04 |
| Restablecer contraseña (por diseñar) | `/restablecer-contrasena?token=` | TKT-012 | RF-05 |
| 13 · Admin - Dashboard | `/admin` | TKT-041 | RF-39, RF-41, RF-44 |
| 03b · Horarios (ajustada) | `/admin/horarios` | TKT-024 y TKT-025 | RF-20, RF-21, RF-24, RF-25 |
| 04b · Generación con IA (ajustada) | `/admin/horarios/generar` | TKT-024 | RF-17, RF-18, RF-19, RNF-13 |
| 17 · Historial de horarios | `/admin/horarios/historial` | TKT-024 | RF-20, RF-22, RF-23, RF-24 |
| 05b · Evaluación (ajustada) | `/admin/evaluacion` | TKT-041 | RF-37, RF-39, RF-41 |
| 06b · Formularios (ajustada) | `/admin/evaluacion/formularios` | TKT-031 | RF-28 a RF-30 |
| 18 · Asignación de evaluaciones | `/admin/evaluacion/asignaciones` | TKT-031 | RF-31, RF-32, RF-37, RF-38 |
| 19 · Alertas | `/admin/evaluacion/alertas` | TKT-041 | RF-40, RF-44 |
| 14 y 14b · Usuarios | `/admin/usuarios` | TKT-012 | RF-06, RF-07, RNF-32 |
| Configuración académica (por diseñar) | `/admin/configuracion` | TKT-018 | RF-09 a RF-16 |
| Auditoría (por diseñar) | `/admin/auditoria` | TKT-012 | RF-08, RNF-11 |
| 07 · Docente - Mi horario | `/docente` | TKT-025 | RF-21, RF-25 |
| 08 · Docente - Mis resultados | `/docente/resultados` | TKT-040 | RF-42, RF-43 |
| Mi disponibilidad (por diseñar) | `/docente/disponibilidad` | TKT-018 | RF-16 |
| 09 · Estudiante - Evaluaciones pendientes | `/estudiante` | TKT-036 | RF-33 |
| 10 · Estudiante - Formulario en curso | `/estudiante/evaluaciones/:id` | TKT-036 | RF-34 a RF-36, RNF-10 |
| Mi horario del estudiante (por diseñar) | `/estudiante/horario` | TKT-026 | RF-25 |
| Mis grupos (por diseñar) | `/estudiante/grupos` | TKT-026 | RF-26, RF-27 |

## Ajustes al prototipo original para cumplir la tesis

1. **Escala de puntajes de 1 a 5.** El prototipo muestra puntajes sobre 100 (87.3, umbral < 70). La tesis usa promedios de 1 a 5, con alerta crítica por debajo de 3.0 y advertencia por debajo de 3.5 (RF-40 y RF-42). El círculo del dashboard docente muestra, por ejemplo, 4.27 / 5.
2. **Funciones fuera del alcance.** Se quitan Comparar, Editar horario, Publicar, Exportar PDF o Excel y "hasta 3 propuestas". Quedaron como trabajo futuro en las recomendaciones de la tesis. En su lugar, Horarios ofrece Historial, Archivar y Eliminar (RF-20 a RF-24).
3. **Tiempo de generación.** El texto pasa de "menos de 5 minutos" a "menos de 3 minutos" (RNF-02).
4. **Restricciones del motor.** Las duras son las cuatro de RF-18: sin cruces de docente, sin cruces de aula, disponibilidad del docente y capacidad del aula. La blanda es la carga máxima semanal del docente (función de aptitud de la sección 6.3.1). Se agrega la exclusión de tipos de aula SALON, LAB y VIRTUAL (RF-19).
5. **Pasos del progreso.** Validación de datos, Algoritmo Genético, Búsqueda Tabú, validación con Gemini y guardado. Si Gemini falla se informa que el horario quedó con `validadoGemini = false` (RNF-18).
6. **Comentario anónimo.** Es un único comentario al final del formulario, opcional y de mínimo 30 caracteres (RF-35). No tiene peso, así que las cuatro dimensiones suman 100 %: Metodología 30, Puntualidad 15, Dominio 30 y Comunicación 25.
7. **Filtro por período en Mis resultados** (RF-43), con un selector junto al título.
8. **Superposiciones del prototipo.** Las insignias "Configurando" y "Período cerrado" se montan sobre el título, el puntaje 85.4 queda fuera del círculo, la tarjeta del formulario en curso arranca en x = -15 y la pantalla de generación se sale de los 900 px de alto. En código todo va con flex o grid, nunca con posiciones absolutas.

## Pantallas pendientes de diseñar

Se crearon las rutas con la vista base. Al implementarlas, sigue el mismo sistema visual:

- **Restablecer contraseña:** mismo layout del login, dos campos (nueva contraseña y confirmación), reglas visibles y aviso de enlace vencido.
- **Aviso de privacidad (primer ingreso):** modal con el resumen del tratamiento de datos (Ley 1581 de 2012 y Decreto 1377 de 2013) y botón "Acepto". Ticket TKT-043.
- **Configuración académica:** pestañas Períodos, Niveles, Cursos, Grupos, Aulas, Franjas, Docentes y Disponibilidad. Cada pestaña es una tabla con botón "Nuevo" y panel lateral como en 14b.
- **Auditoría:** filtros por módulo, usuario y rango de fechas; tabla de solo lectura con fecha, usuario, módulo, acción y detalle; aviso de que el registro no se puede modificar (RNF-11).
- **Mi disponibilidad (docente):** grilla de días por franjas donde cada celda se marca disponible o no, y botón Guardar.
- **Mis grupos (estudiante):** tarjeta "Unirme a un grupo" con el código de acceso y lista de grupos activos con "Darme de baja". La baja pide escribir una confirmación (RF-27). Mensajes para código inválido, grupo sin cupo e idioma repetido.
- **Mi horario (estudiante):** lista cronológica por día, pensada primero para celular (RNF-12).

## Recomendaciones visuales

1. **Íconos en lugar de emojis.** Los emojis cambian según el sistema operativo y no se pueden colorear. El cliente usa Lucide, con el mismo trazo en todas las vistas.
2. **Contraste.** El verde #10b981 y el ámbar #f59e0b sobre blanco no llegan a 4.5:1. Para texto usa `text-exito-texto`, `text-advertencia-texto` y `text-peligro-texto`, y deja los colores claros para fondos, bordes y barras.
3. **Color por nivel en la grilla.** A1 y A2 en naranja, B1 y B2 en azul, C1 y C2 en morado, con una leyenda debajo.
4. **Estados vacíos, de carga y de error** en todas las tablas y tarjetas: el componente `EstadoVacio` y mensajes de `mensajeDeError`.
5. **Responsive.** En pantallas pequeñas la barra lateral se vuelve un menú desplegable y las pestañas del portal se desplazan horizontalmente. Las tablas anchas deben ir dentro de un contenedor con desplazamiento horizontal.
6. **Accesibilidad.** Foco visible, botones con `aria-label` cuando solo tienen ícono, botones de escala Likert con `role="radiogroup"` y enlace para saltar al contenido.
7. **Confirmaciones destructivas.** Eliminar historial, eliminar evaluación y darse de baja usan el botón rojo de borde y un diálogo de confirmación.
