# Cliente del Sistema CAL servido por Caddy (ver despliegue/ en proyectoGrado-server).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# La API vive en el mismo dominio bajo /api, así no hace falta CORS entre orígenes.
ARG VITE_API_URL=/api
ARG VITE_CORREO_DATOS=
ENV VITE_API_URL=$VITE_API_URL VITE_CORREO_DATOS=$VITE_CORREO_DATOS
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
