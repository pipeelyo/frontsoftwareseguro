# Catálogo de Datos y Cumplimiento

Este documento define el catálogo de datos, las políticas de retención y la matriz de control de acceso para el sistema.

## 1. Catálogo de Datos y Clasificación

A continuación se detallan los modelos de datos, sus campos y su clasificación.

-   **PII**: Información de Identificación Personal (Personally Identifiable Information).
-   **Confidencial**: Datos internos sensibles de la operación.
-   **General**: Datos no sensibles.

### Modelo: `User`

| Campo                 | Tipo     | Clasificación | Descripción                                      |
| --------------------- | -------- | ------------- | ------------------------------------------------ |
| `_id`                 | ObjectId | General       | Identificador único del usuario.                 |
| `name`                | String   | PII           | Nombre completo del usuario.                     |
| `email`               | String   | PII           | Correo electrónico (usado para login).           |
| `password`            | String   | Confidencial  | Hash de la contraseña (nunca se almacena en texto plano). |
| `emailVerified`       | Date     | General       | Fecha de verificación del correo.                |
| `failedLoginAttempts` | Integer  | Confidencial  | Contador de intentos de login fallidos.          |
| `lockoutUntil`        | Date     | Confidencial  | Fecha de bloqueo de la cuenta.                   |
| `tokenVersion`        | Integer  | Confidencial  | Versión del token para invalidar sesiones.       |
| `role`                | String   | General       | Rol del usuario en el sistema.                   |

### Modelo: `Shift` (Turno)

| Campo           | Tipo     | Clasificación | Descripción                                      |
| --------------- | -------- | ------------- | ------------------------------------------------ |
| `_id`           | ObjectId | General       | Identificador único del turno.                   |
| `userId`        | ObjectId | General       | ID del vigilante que realiza el turno.           |
| `startTime`     | Date     | General       | Fecha y hora de inicio del turno.                |
| `endTime`       | Date     | General       | Fecha y hora de fin del turno.                   |
| `startLocation` | Object   | Confidencial  | Coordenadas de inicio del turno.                 |
| `endLocation`   | Object   | Confidencial  | Coordenadas de fin del turno.                    |
| `status`        | String   | General       | Estado del turno (`ACTIVE` o `COMPLETED`).       |

### Modelo: `Incident` (Novedad)

| Campo         | Tipo     | Clasificación | Descripción                                      |
| ------------- | -------- | ------------- | ------------------------------------------------ |
| `_id`         | ObjectId | General       | Identificador único de la novedad.               |
| `shiftId`     | ObjectId | General       | ID del turno al que pertenece la novedad.        |
| `userId`      | ObjectId | General       | ID del vigilante que reporta.                    |
| `description` | String   | Confidencial  | Descripción detallada de la novedad.             |
| `timestamp`   | Date     | General       | Fecha y hora del reporte.                        |
| `location`    | Object   | Confidencial  | Coordenadas donde se reportó la novedad.         |

### Modelo: `Document`

| Campo                | Tipo     | Clasificación | Descripción                                      |
| -------------------- | -------- | ------------- | ------------------------------------------------ |
| `_id`                | ObjectId | General       | Identificador único del documento.               |
| `filename`           | String   | Confidencial  | Nombre del archivo.                              |
| `contentType`        | String   | General       | Tipo MIME del archivo.                           |
| `data`               | Buffer   | Confidencial  | Contenido binario del archivo.                   |
| `hash`               | String   | Confidencial  | Hash SHA-256 del contenido.                      |
| `version`            | Integer  | General       | Número de versión del documento.                 |
| `uploadedBy`         | ObjectId | General       | ID del usuario que subió el documento.           |
| `originalDocumentId` | ObjectId | General       | ID del documento original para agrupar versiones.|

### Modelo: `AuditLog`

| Campo       | Tipo     | Clasificación | Descripción                                      |
| ----------- | -------- | ------------- | ------------------------------------------------ |
| `_id`       | ObjectId | General       | Identificador único del registro.                |
| `userId`    | ObjectId | General       | ID del usuario que realizó la acción.            |
| `action`    | String   | General       | Acción realizada (ej: `LOGIN_SUCCESS`).          |
| `timestamp` | Date     | General       | Fecha y hora de la acción.                       |
| `details`   | Object   | Confidencial  | Detalles adicionales en formato JSON.            |
| `ipAddress` | String   | PII           | Dirección IP del solicitante.                    |

---

## 2. Matriz de Control de Acceso por Roles (CRUD)

| Entidad / Rol      | VIGILANTE          | SUPERVISOR         | CLIENTE            | ADMINISTRATIVO     | ADMIN              |
| ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| **Turnos (Shifts)**| C (propio), R (propio) | R (todos)          | No Acceso          | No Acceso          | C, R, U, D (todos) |
| **Novedades (Incidents)**| C (propio)         | R (todos)          | No Acceso          | No Acceso          | C, R, U, D (todos) |
| **Documentos**   | No Acceso          | No Acceso          | No Acceso          | C, R (todos)       | C, R, U, D (todos) |
| **Reportes (Proxy)**| No Acceso          | No Acceso          | R (todos)          | No Acceso          | R (todos)          |
| **Auditoría (Logs)**| No Acceso          | No Acceso          | No Acceso          | No Acceso          | R, Export (todos)  |
| **Usuarios (Users)**| R/U (propio)       | No Acceso          | No Acceso          | No Acceso          | C, R, U, D (todos) |

---

## 3. Políticas de Retención de Datos

Las siguientes políticas se aplican automáticamente a través de un cron job diario:

-   **Tokens de Verificación (`VerificationToken`):** Se eliminan 24 horas después de su fecha de expiración.
-   **Logs de Auditoría (`AuditLog`):** Se eliminan después de 365 días.
-   **Turnos (`Shift`):** Los datos de turnos completados se conservan indefinidamente para fines históricos, pero se pueden anonimizar o archivar en el futuro.
