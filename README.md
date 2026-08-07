# Governance Hub

> Plataforma SaaS centralizada para el gobierno, auditoría y control de integraciones creadas mediante herramientas Low-Code/No-Code (Shadow IT).

Governance Hub proporciona un API Gateway centralizado para registrar, auditar y gobernar flujos automatizados, garantizando la trazabilidad, previniendo la fuga de datos y aplicando políticas corporativas estrictas mediante un motor de reglas asíncrono.

## Arquitectura y Stack Tecnológico

El proyecto está diseñado bajo una arquitectura de **Modular Monolith** orientada a eventos, separando estrictamente el dominio de la infraestructura mediante **Clean Architecture**.

*   **Backend:** Node.js, NestJS, TypeScript
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS v4
*   **Base de Datos:** PostgreSQL
*   **Mensajería (Async Processing):** RabbitMQ
*   **Real-time:** Socket.IO

## Estructura del Proyecto

El repositorio utiliza un enfoque de monorepo lógico:

\`\`\`text
governance-hub/
├── backend/    # API, Application Services, Domain & Infrastructure (NestJS)
└── frontend/   # SPA Administrativa (React + Vite)
\`\`\`

## Environment Variables (Configuración y Entorno)

La configuración sensible y específica del entorno se gestiona estrictamente mediante variables de entorno. **Bajo ninguna circunstancia se deben commitear secretos al repositorio.**

### Cómo configurar tu entorno local
1. Copia el archivo de ejemplo en la raíz del proyecto:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
2. Edita el archivo `.env` recién creado con tus valores locales. El archivo `.env` está ignorado en Git.

### Tipos de Variables
*   **Obligatorias:** Variables como `DATABASE_URL`, `JWT_SECRET`, y `HMAC_SECRET` son requeridas. El backend aplicará un *Fail Fast* y no iniciará si faltan o son inválidas.
*   **Públicas (Frontend):** Las variables del frontend (prefijo `VITE_`) son inyectadas en el bundle y **son públicas**. Nunca coloques secretos, contraseñas o claves de API privadas en las variables del frontend.

## Desarrollo Local

### Prerrequisitos
*   Node.js (v20+)
*   Docker y Docker Compose 

### Instalación y Ejecución

1. **Backend:**
   \`\`\`bash
   cd backend
   npm install
   npm run start:dev
   \`\`\`

2. **Frontend:**
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

## Git y Convenciones de Commits

Este proyecto utiliza ramas efímeras (`feature/*`, `fix/*`, `chore/*`) y se integra a la rama principal mediante Pull Requests. Los commits siguen la convención de **Conventional Commits**.