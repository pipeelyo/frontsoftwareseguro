# Proyecto de Software Seguro - Portal de Gestión

Este proyecto es una aplicación web completa construida con Next.js que implementa un sistema de gestión de seguridad con múltiples roles, incluyendo registro de turnos para vigilantes, supervisión, un portal para clientes y gestión de documentos.

## Tecnologías Utilizadas

-   **Framework:** [Next.js](https://nextjs.org/) (con App Router)
-   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
-   **Base de Datos:** [MongoDB](https://www.mongodb.com/) (a través de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
-   **ODM:** [Mongoose](https://mongoosejs.com/) para la interacción con MongoDB.
-   **Autenticación:** Basada en [JWT](https://jwt.io/) (JSON Web Tokens) con cookies HttpOnly.
-   **Despliegue:** [Vercel](https://vercel.com/)
-   **Tareas Programadas (Cron Jobs):** Vercel Cron Jobs.

---

## Configuración del Entorno Local (Paso a Paso)

### 1. Requisitos Previos

-   **Node.js:** Se recomienda la versión 20.x. La forma más fácil de gestionarlo es usando `nvm`.
-   **`nvm` (Node Version Manager):** Si no lo tienes, instálalo con `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`.
-   **Cuenta de MongoDB Atlas:** Necesitarás una base de datos gratuita en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 2. Clonar y Configurar el Repositorio

```bash
# Clona el repositorio
git clone https://github.com/pipeelyo/frontsoftwareseguro.git

# Entra a la carpeta del proyecto
cd frontsoftwareseguro

# (Recomendado) Usa la versión de Node.js correcta
nvm use
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto. Este archivo **no** debe ser subido al repositorio de Git.

Añade las siguientes variables:

```
# URL de conexión a tu base de datos de MongoDB Atlas
MONGO_URI="mongodb+srv://<user>:<password>@<cluster-url>/?retryWrites=true&w=majority&appName=<appName>"

# Clave secreta para firmar los JWT (genera una tuya)
JWT_SECRET="tu_clave_secreta_larga_y_aleatoria"

# Clave secreta para proteger los cron jobs (solo para desarrollo local)
CRON_SECRET="tu_clave_secreta_para_el_cron"
```

> **Para generar claves secretas seguras**, puedes usar el siguiente comando en tu terminal:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### 6. (Alternativa) Iniciar con Docker Compose

Si tienes Docker instalado, puedes levantar el entorno de desarrollo de forma contenerizada. Esto asegura que todos los desarrolladores usen el mismo entorno.

```bash
docker-compose up --build
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000) y se recargará automáticamente si haces cambios en el código.

---

## Arquitectura y Despliegue en Vercel

La aplicación está diseñada para ser desplegada en **Vercel**, aprovechando su integración nativa con Next.js y GitHub.

-   **Base de Datos:** La aplicación se conecta a una base de datos remota en **MongoDB Atlas**. No utiliza una base de datos local en producción.
-   **Cron Jobs:** Se utiliza un **Vercel Cron Job** para ejecutar tareas de mantenimiento diarias (como la limpieza de datos antiguos). La configuración se encuentra en el archivo `vercel.json`.

### Pasos para el Despliegue

1.  Conecta tu repositorio de GitHub a Vercel.
2.  Vercel detectará automáticamente que es un proyecto Next.js.
3.  En la configuración del proyecto en Vercel, añade las siguientes **variables de entorno**:
    -   `MONGO_URI`: La URL de conexión a tu base de datos de producción.
    -   `JWT_SECRET`: Una clave secreta segura para JWT.
    -   `CRON_SECRET`: Una clave secreta segura para proteger el endpoint del cron job. Vercel la usará para autorizar las peticiones.
4.  Haz clic en **Deploy**. Vercel se encargará del resto.

---

## Gestión de Roles y Acceso

El sistema tiene un robusto control de acceso basado en roles (RBAC).

### Descripción de Roles

-   **`VIGILANTE`**: Rol por defecto. Puede gestionar sus propios turnos y registrar novedades.
-   **`SUPERVISOR`**: Puede ver los turnos y novedades de todos los vigilantes.
-   **`CLIENTE`**: Puede acceder a un portal exclusivo para ver reportes y descargar certificados.
-   **`ADMINISTRATIVO`**: Puede subir y gestionar documentos y contratos.
-   **`ADMIN`**: Superusuario. Tiene acceso a todas las funcionalidades, incluyendo la descarga de logs de auditoría.

### Cómo Asignar un Rol

Todos los usuarios se registran como `VIGILANTE` por defecto. Para cambiar el rol de un usuario, usa el siguiente script desde la terminal:

```bash
# Sintaxis
npm run assign-role -- <email-del-usuario> <ROL>

# Ejemplo para asignar el rol de ADMINISTRATIVO
npm run assign-role -- admin@empresa.com ADMINISTRATIVO
```

> **Importante:** Los `--` después de `assign-role` son necesarios.

### Usuarios de Prueba

Para facilitar las pruebas del sistema, se han creado los siguientes usuarios con sus respectivos roles:

| Email | Rol | Contraseña |
|-------|-----|------------|
| vigilante@segurcontrol.com | VIGILANTE | Password123! |
| supervisor@segurcontrol.com | SUPERVISOR | Password123! |
| admin@segurcontrol.com | ADMIN | Password123! |
| cliente@segurcontrol.com | CLIENTE | Password123! |
| administrativo@segurcontrol.com | ADMINISTRATIVO | Password123! |

### Acceso a Vistas por Rol

La visibilidad de las páginas se controla según el rol del usuario. A continuación se detalla el acceso para cada rol:

| Vista / Página                | VIGILANTE | SUPERVISOR | CLIENTE | ADMINISTRATIVO | ADMIN |
| ----------------------------- | :-------: | :--------: | :-----: | :------------: | :---: |
| **Página de Inicio (`/`)**    |     ✅    |     ✅     |    ✅   |       ✅       |   ✅  |
| **Dashboard (`/dashboard`)**    |     ✅    |     ✅     |    ❌   |       ❌       |   ✅  |
| **Gestionar Turnos (`/admin/shifts`)** |     ❌    |     ❌     |    ❌   |       ❌       |   ✅  |
| **Documentos (`/documents`)**     |     ❌    |     ❌     |    ❌   |       ✅       |   ✅  |
| **Portal Cliente (`/client-portal`)** |     ❌    |     ❌     |    ✅   |       ❌       |   ✅  |
| **Auditoría (`/audit`)**        |     ❌    |     ❌     |    ❌   |       ❌       |   ✅  |
| **Gobierno de Datos (`/datagovernance`)** |     ❌    |     ❌     |    ❌   |       ❌       |   ✅  |

