# Next.js + Supabase Auth

Aplicación **Next.js 16** (App Router, React 19, Tailwind CSS 4) con autenticación propia sobre **Supabase Auth** usando la API REST (sin `@supabase/supabase-js`).

Incluye:

- Registro e inicio de sesión con email y contraseña.
- Login con **Google** y **GitHub** mediante OAuth 2.0 con PKCE.
- Recuperación y cambio de contraseña.
- Sesión guardada en cookies `httpOnly` y refresco automático del token.
- Internacionalización (español / inglés) por ruta: `/es`, `/en`.
- Docker y Makefile para desarrollo y producción.

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Crear el proyecto en Supabase](#2-crear-el-proyecto-en-supabase)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Configurar las URLs de autenticación en Supabase](#4-configurar-las-urls-de-autenticación-en-supabase)
5. [Poner en marcha el proyecto](#5-poner-en-marcha-el-proyecto)
6. [Configurar OAuth con Google](#6-configurar-oauth-con-google)
7. [Configurar OAuth con GitHub](#7-configurar-oauth-con-github)
8. [Cómo funciona el flujo OAuth en este proyecto](#8-cómo-funciona-el-flujo-oauth-en-este-proyecto)
9. [Rutas de la aplicación y de la API](#9-rutas-de-la-aplicación-y-de-la-api)
10. [Despliegue en producción](#10-despliegue-en-producción)
11. [Solución de problemas](#11-solución-de-problemas)
12. [Comandos útiles](#12-comandos-útiles)

---

## 1. Requisitos previos

- **Node.js 20 o superior** (el Dockerfile usa Node 24).
- **npm** (hay `package-lock.json`, así que usa `npm ci` / `npm install`).
- Una cuenta en [Supabase](https://supabase.com) (el plan gratuito es suficiente).
- Opcional: **Docker** + **Docker Compose** y `make` si prefieres levantar el proyecto con contenedores.
- Opcional: cuenta de **Google Cloud** y cuenta de **GitHub** para habilitar los proveedores OAuth.

---

## 2. Crear el proyecto en Supabase

1. Entra en [https://supabase.com/dashboard](https://supabase.com/dashboard) e inicia sesión.
2. Pulsa **New project**.
3. Rellena:
   - **Organization**: la tuya.
   - **Project name**: por ejemplo `mi-app`.
   - **Database password**: guárdala (no la usa esta app, pero la necesitarás para la base de datos).
   - **Region**: la más cercana a tus usuarios.
4. Espera a que termine el aprovisionamiento (1–2 minutos).
5. Anota el **Project Ref** y la **Project URL**, que aparecen en:

   **Project Settings → Data API** (o **Project Settings → API**)

   ```
   https://<project-ref>.supabase.co
   ```

### 2.1 Ajustes recomendados para desarrollo

Ve a **Authentication → Sign In / Providers → Email**:

- **Enable Email provider**: activado.
- **Confirm email**: desactívalo mientras desarrollas si quieres que el registro inicie sesión directamente. Si lo dejas activo, el registro devolverá `needsEmailConfirmation: true` y el usuario tendrá que confirmar el correo antes de entrar.

Ve a **Authentication → Settings** y revisa:

- **Site URL**: la URL base de tu app (`http://localhost:3000` en local).
- **Redirect URLs**: las URLs permitidas de vuelta (ver sección 4).

> No necesitas crear tablas ni ejecutar SQL. Esta app usa Supabase únicamente como proveedor de autenticación.

---

## 3. Variables de entorno

### 3.1 Dónde encontrarlas en Supabase

En el dashboard de tu proyecto:

**Project Settings → API Keys** (en proyectos nuevos) o **Project Settings → API** (en proyectos clásicos).

| Variable | Dónde se obtiene | Ejemplo |
| --- | --- | --- |
| `SUPABASE_URL` | **Project URL** en *Project Settings → Data API* | `https://abcdefghijklmno.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | **Publishable key** en *Project Settings → API Keys* | `sb_publishable_xxxxxxxxxxxxxxxx` |

> En proyectos anteriores la clave se llamaba **anon key** (`eyJhbGciOi...`). Sirve igual: lo importante es que sea la clave **pública**, nunca la `service_role` ni la `secret key`.

### 3.2 Crear el archivo `.env.local`

Copia el ejemplo y rellena los valores:

```bash
cp .env.example .env.local
```

```dotenv
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_tu_clave_publica
```

Notas importantes:

- El archivo debe llamarse **`.env.local`** y estar en la raíz del proyecto.
- `.env.local` está en `.gitignore`: **no se sube al repositorio**. No lo commitees.
- **No** uses la `service_role` / secret key: estas variables se leen en el servidor (route handlers), pero no debe haber claves con privilegios de administrador en la app.
- Si cambias las variables, **reinicia el servidor de desarrollo**.
- `docker-compose.yml` (producción) monta `.env.local` con `env_file`, así que el mismo archivo sirve para Docker.

---

## 4. Configurar las URLs de autenticación en Supabase

Ve a **Authentication → URL Configuration** en el dashboard de Supabase.

### Site URL

```
http://localhost:3000
```

En producción será tu dominio, por ejemplo `https://mi-app.com`.

### Redirect URLs (lista de permitidas)

Añade cada una de estas (una por línea), sustituyendo el dominio en producción:

```
http://localhost:3000/api/auth/callback
http://localhost:3000/api/auth/callback?next=/reset-password
https://mi-app.com/api/auth/callback
https://mi-app.com/api/auth/callback?next=/reset-password
```

Supabase compara con comodines, así que también puedes usar:

```
http://localhost:3000/**
https://mi-app.com/**
```

Estas URLs son necesarias para:

- El retorno del **login OAuth** (`/api/auth/callback`).
- El enlace del **email de recuperación de contraseña**, que vuelve a `/api/auth/callback?next=/reset-password`.

Si falta la URL, verás errores del tipo `redirect_uri mismatch` o el login OAuth terminará en una página de error de Supabase.

---

## 5. Poner en marcha el proyecto

### Opción A: local con npm

```bash
npm install
cp .env.example .env.local   # si aún no lo has creado
# edita .env.local con tus valores
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El middleware de idioma te redirigirá a `/es` o `/en`.

Prueba el registro en:

```
http://localhost:3000/es/register
```

### Opción B: Docker en desarrollo (hot reload)

```bash
make dev
```

o directamente:

```bash
docker compose -f docker-compose.dev.yml up --build
```

El contenedor monta el código en `/app`, así que Next.js lee `.env.local` del proyecto automáticamente.

### Opción C: Docker en producción

```bash
make prod
```

o:

```bash
docker compose up --build -d
```

Disponible en [http://localhost:3000](http://localhost:3000). El `docker-compose.yml` carga `.env.local` mediante `env_file`.

### Verificar que todo funciona

1. Regístrate con email y contraseña en `/es/register`.
2. Cierra sesión y vuelve a entrar en `/es/login`.
3. Prueba “He olvidado mi contraseña” en `/es/forgot-password`.
4. Prueba los botones de **Google** y **GitHub** (tras configurarlos en las secciones 6 y 7).

---

## 6. Configurar OAuth con Google

El flujo tiene **dos saltos**: Google → Supabase → tu app. Por eso la URL de callback que se registra en Google **no es la de tu app**, sino la de Supabase.

```
Navegador → Google → https://<project-ref>.supabase.co/auth/v1/callback → http://localhost:3000/api/auth/callback
```

### 6.1 Crear las credenciales en Google Cloud

1. Entra en [https://console.cloud.google.com/](https://console.cloud.google.com/).
2. Arriba, **selecciona o crea un proyecto** (por ejemplo `mi-app`).
3. Ve a **APIs & Services → OAuth consent screen** (o **Google Auth Platform** en la consola nueva):
   - Elige **External** (o **Internal** si usas Google Workspace).
   - Rellena **App name**, **User support email** y **Developer contact email**.
   - En **Scopes**, con los scopes básicos (`email`, `profile`, `openid`) es suficiente.
   - En **Test users**, añade tu propio correo mientras la app esté en modo *Testing*.
   - Guarda.
4. Ve a **APIs & Services → Credentials → Create credentials → OAuth client ID**.
5. **Application type**: `Web application`.
6. **Name**: por ejemplo `Supabase Auth`.
7. En **Authorized JavaScript origins** añade:

   ```
   http://localhost:3000
   https://<project-ref>.supabase.co
   ```

8. En **Authorized redirect URIs** añade **exactamente**:

   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

   En producción añade también la del proyecto de producción si usas otro Supabase.

9. Pulsa **Create** y copia el **Client ID** y el **Client secret**.

### 6.2 Pegar las credenciales en Supabase

1. En Supabase: **Authentication → Sign In / Providers → Google**.
2. Activa **Enable Sign in with Google**.
3. Pega el **Client ID** y el **Client Secret**.
4. Guarda (**Save**).

### 6.3 Comprobar

Entra en `/es/login` y pulsa **Continuar con Google**. Deberías volver autenticado a la home (`/es`).

---

## 7. Configurar OAuth con GitHub

Igual que con Google, el callback registrado en GitHub es el de **Supabase**.

```
Navegador → GitHub → https://<project-ref>.supabase.co/auth/v1/callback → http://localhost:3000/api/auth/callback
```

### 7.1 Crear la OAuth App en GitHub

1. Entra en GitHub → **Settings** (de tu usuario) → **Developer settings** → **OAuth Apps** → **New OAuth App**.
   - Para una organización: **Organization Settings → Developer settings → OAuth Apps**.
2. Rellena:
   - **Application name**: por ejemplo `mi-app`.
   - **Homepage URL**: `http://localhost:3000` (en producción, `https://mi-app.com`).
   - **Authorization callback URL**:
     ```
     https://<project-ref>.supabase.co/auth/v1/callback
     ```
3. Pulsa **Register application**.
4. Copia el **Client ID**.
5. Pulsa **Generate a new client secret** y copia el **Client Secret** (solo se muestra una vez).

### 7.2 Pegar las credenciales en Supabase

1. En Supabase: **Authentication → Sign In / Providers → GitHub**.
2. Activa **Enable Sign in with GitHub**.
3. Pega el **Client ID** y el **Client Secret**.
4. Guarda (**Save**).

### 7.3 Comprobar

Entra en `/es/login` y pulsa **Continuar con GitHub**.

### Nota sobre emails de GitHub

GitHub puede no devolver un email si el usuario lo tiene privado. Supabase lo gestiona, pero si necesitas exigir email verificado revisa la opción correspondiente del proveedor en Supabase.

---

## 8. Cómo funciona el flujo OAuth en este proyecto

La app implementa el flujo **PKCE** a mano, sin SDK:

1. El usuario pulsa el botón (`src/components/auth/oauth-buttons.tsx`) y llama a `signInWithOAuth("google" | "github")`.
2. El navegador va a `GET /api/auth/oauth?provider=google`.
3. Ese route handler (`src/app/api/auth/oauth/route.ts`):
   - Genera un `code_verifier` y su `code_challenge` (SHA-256, S256).
   - Guarda el `code_verifier` en la cookie `httpOnly` `sb-pkce-verifier` (10 minutos).
   - Redirige a `https://<project-ref>.supabase.co/auth/v1/authorize?provider=...&redirect_to=...&code_challenge=...`.
4. Supabase habla con Google/GitHub y vuelve a tu app en `GET /api/auth/callback?code=...`.
5. El callback (`src/app/api/auth/callback/route.ts`):
   - Recupera el `code_verifier` de la cookie.
   - Lo canjea con Supabase (`grant_type=pkce`) en `https://<project-ref>.supabase.co/auth/v1/token`.
   - Guarda `access_token`, `refresh_token` y `expires_at` en cookies `httpOnly` (`sb-access-token`, `sb-refresh-token`, `sb-expires-at`).
   - Borra la cookie del `code_verifier` y redirige a `/` (o al parámetro `next`).

Por eso el **callback que registras en Google/GitHub es el de Supabase**, y el que registras en Supabase es el de tu app: cada salto tiene su propia URL de retorno.

Las cookies usan `secure` automáticamente cuando la petición llega por HTTPS (incluye `x-forwarded-proto`), así que funcionan también detrás de un proxy o balanceador.

---

## 9. Rutas de la aplicación y de la API

Páginas (con locale `es` / `en`):

| Ruta | Descripción |
| --- | --- |
| `/es` | Home |
| `/es/login` | Inicio de sesión + OAuth |
| `/es/register` | Registro |
| `/es/forgot-password` | Solicitar recuperación de contraseña |
| `/es/reset-password` | Establecer nueva contraseña |

API interna (`src/app/api/auth`):

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/auth/oauth?provider=` | Inicia el flujo OAuth |
| `GET` | `/api/auth/callback` | Retorno de OAuth y de recuperación |
| `POST` | `/api/auth/signup` | Registro |
| `POST` | `/api/auth/login` | Login con contraseña |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/session` | Sesión actual |
| `GET` | `/api/auth/user` | Usuario actual |
| `POST` | `/api/auth/refresh` | Refrescar tokens |
| `POST` | `/api/auth/recover` | Enviar email de recuperación |
| `POST` | `/api/auth/update-password` | Cambiar contraseña |

---

## 10. Despliegue en producción

1. Despliega la app (Vercel, un servidor con Docker, etc.).
2. Define `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en el entorno del hosting.
3. En Supabase, actualiza **Authentication → URL Configuration**:
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: añade `https://tu-dominio.com/api/auth/callback` y la variante `?next=/reset-password`.
4. En Google Cloud y GitHub, si usas un **proyecto Supabase distinto** en producción, repite el registro de credenciales con el nuevo `project-ref`. Si reutilizas el mismo proyecto Supabase, no cambian.
5. Si vas con Docker, `docker compose up --build -d` (o `make prod`). La imagen se construye en modo `standalone` y la sirve `node server.js`.

> Importante: si la app va detrás de HTTPS, asegúrate de que el proxy envía `X-Forwarded-Proto: https` para que las cookies se marquen como `secure`.

---

## 11. Solución de problemas

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY...` | No existe `.env.local` o falta alguna variable | Créalo en la raíz y reinicia el servidor |
| `redirect_uri mismatch` / error de Supabase al volver | La URL de callback no está en *Redirect URLs* | Añádela en **Authentication → URL Configuration** |
| Google: `Error 400: redirect_uri_mismatch` | La URI autorizada en Google no coincide | Debe ser `https://<project-ref>.supabase.co/auth/v1/callback` |
| GitHub: `The redirect_uri MUST match...` | Callback de la OAuth App incorrecto | Corrige la **Authorization callback URL** en GitHub |
| `Provider is not enabled` | Proveedor desactivado en Supabase | Actívalo en **Authentication → Sign In / Providers** |
| El registro no inicia sesión | **Confirm email** activo | Desactívalo en desarrollo o confirma el correo |
| `missing_code_verifier` en el callback | La cookie PKCE caducó (10 min) o el navegador la bloqueó | Repite el login; evita bloqueadores que rompan cookies |
| Cambios en `.env.local` sin efecto | Variables cargadas al arrancar | Reinicia `npm run dev` (o el contenedor) |
| El enlace del email de recuperación falla | Falta la redirect URL con `next=/reset-password` | Añádela en Supabase |

---

## 12. Comandos útiles

```bash
npm run dev      # desarrollo con hot reload
npm run build    # build de producción
npm run start    # servir el build
npm run lint     # ESLint

make help        # lista los objetivos disponibles
make dev         # Docker desarrollo (foreground)
make dev-down    # parar desarrollo
make dev-logs    # logs de desarrollo
make prod        # Docker producción (detached)
make prod-down   # parar producción
make prod-logs   # logs de producción
make build       # construir la imagen de producción
make clean       # limpiar contenedores, volúmenes e imágenes
```

---

## Estructura del proyecto

```
src/
├─ app/
│  ├─ [lang]/                 # Rutas localizadas (es / en)
│  │  ├─ (auth)/              # login, register, forgot/reset password
│  │  └─ (main)/              # home
│  └─ api/auth/               # Route handlers de autenticación
├─ components/
│  ├─ auth/                   # Formularios y botones OAuth
│  ├─ i18n/                   # Provider y selector de idioma
│  └─ ui/                     # Button, Form...
├─ lib/
│  ├─ auth/                   # Cliente de auth para el navegador
│  ├─ i18n/                   # Configuración y diccionarios
│  └─ supabase/               # Cliente REST de Supabase, cookies y sesión
└─ proxy.ts                   # Middleware de idioma
```

---

## Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Login con Google en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Login con GitHub en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-github)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [GitHub OAuth Apps](https://github.com/settings/developers)
