Perfecto — te dejo **dos entregables complementarios**:
1️⃣ **PRD (Product Requirements Document)** — visión, propósito, actores, casos de uso, criterios de aceptación, UX y flujos.
2️⃣ **Documento de Especificaciones Funcionales y Técnicas** — estructurado y **agnóstico de tecnología** (no dependiente de Next.js ni versiones), útil para planificar arquitectura o pasar a otro framework si fuera necesario.

---

## 🧩 1️⃣ Product Requirements Document (PRD)

### **Título del proyecto**

Encuesta interactiva para validación de indicadores epidemiológicos de dengue.

### **Propósito**

Recolectar de manera eficiente y amigable las ponderaciones que diferentes grupos de expertos (epidemiólogos, entomólogos, biólogos, autoridades sanitarias, etc.) asignan a un conjunto de indicadores para distintos escenarios epidemiológicos.
El objetivo es maximizar la completitud y minimizar el abandono, asegurando una experiencia de usuario fluida y comprensible.

### **Objetivos**

* Permitir a los expertos evaluar hasta **19 escenarios epidemiológicos**.
* En cada escenario, seleccionar y ponderar indicadores relevantes (hasta **69** posibles).
* Garantizar que la suma de pesos asignados a indicadores en cada escenario sea **100% exacta**.
* Permitir pausar y retomar la encuesta sin pérdida de progreso.
* Facilitar exportación y análisis de resultados en formato tabular.

### **Actores**

| Actor                      | Descripción                        | Permisos principales                                                                                  |
| -------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Participante (experto)** | Usuario invitado vía enlace único. | Completar encuesta, guardar progreso, reanudar, enviar respuestas.                                    |
| **Administrador**          | Equipo de investigación.           | Crear encuestas, gestionar escenarios/indicadores, enviar invitaciones, ver resultados, exportar CSV. |

### **Casos de uso**

1. El experto accede mediante un **link único**.
2. Selecciona su rol (epidemiólogo, entomólogo, etc.).
3. Visualiza el primer escenario.
4. Selecciona los indicadores relevantes.
5. Asigna pesos (suma = 100%).
6. Guarda automáticamente al avanzar o salir.
7. Puede regresar o continuar más tarde.
8. Revisa un resumen final antes de enviar.
9. El administrador exporta datos consolidados.

### **Principales flujos**

#### Flujo del participante

1. **Pantalla de bienvenida:** explicación, tiempo estimado, botón “Comenzar”.
2. **Selección de rol** (inicial, persistente).
3. **Wizard de escenarios (1–19):**

   * Descripción breve.
   * Buscador + selección múltiple de indicadores.
   * Panel lateral con indicadores seleccionados y sliders de peso (0–100).
   * Barra de progreso de suma (% actual).
   * Botón “Autorrepartir” pesos restantes.
   * “Copiar pesos del escenario anterior”.
   * Validación inmediata si ≠100%.
4. **Resumen global:** tabla con todos los escenarios, indicadores y pesos.
5. **Envío final:** bloqueo del token, mensaje de confirmación.

#### Flujo del administrador

1. Carga lista de escenarios e indicadores.
2. Genera encuestas (versión + fecha).
3. Envía enlaces únicos a los participantes.
4. Supervisa sesiones activas/completadas.
5. Exporta CSV de resultados.

### **Requisitos funcionales (clave)**

* [F01] Cada escenario requiere que los pesos sumen 100%.
* [F02] Guardado automático y manual (“Guardar y salir”).
* [F03] Reanudación mediante token o autenticación.
* [F04] Validación de completitud antes de envío.
* [F05] Posibilidad de marcar “No aplica” en escenarios.
* [F06] Panel de progreso (x/19 escenarios).
* [F07] Exportación a CSV/JSON.
* [F08] Control de estado: draft / submitted.
* [F09] Sistema de logs para medir avance y tiempos.

### **Requisitos no funcionales**

* [N01] UX altamente responsiva (móvil + escritorio).
* [N02] Tiempo máximo de carga < 2 s por escenario.
* [N03] Recuperación segura de sesiones (sin pérdida).
* [N04] Validación local antes de cada envío parcial.
* [N05] Cumplimiento con buenas prácticas de accesibilidad (WCAG 2.1 AA).
* [N06] Seguridad: HTTPS obligatorio, tokens no predecibles, expirables.
* [N07] Escalabilidad: permitir 100+ usuarios concurrentes sin pérdida de rendimiento.
* [N08] Internacionalización futura (es/en).

### **KPIs de éxito**

* ≥ 85% encuestas completadas.
* < 5% abandono después del escenario 5.
* Tiempo promedio < 30 min.
* 0 errores de validación post-envío.

---

## ⚙️ 2️⃣ Documento de Especificaciones (agnóstico de tecnología)

### **Arquitectura lógica**

```

┌──────────────┴────────────┐
│       Base de datos        │
│  - Surveys / Scenarios     │
│  - Indicators              │
│  - Respondents / Sessions  │
│  - Responses (pesos)       │
│  - Logs / Notes            │
└─────────────────────────────┘
```

### **Modelos de datos**

| Entidad             | Campos esenciales                                 | Descripción                   |
| ------------------- | ------------------------------------------------- | ----------------------------- |
| **Survey**          | id, title, version, active                        | Encuesta base.                |
| **Scenario**        | id, survey_id, title, description, order          | 1 por escenario.              |
| **Indicator**       | id, name, domain_tags[], active                   | 69 indicadores globales.      |
| **Respondent**      | id, name, role, org                               | Participante.                 |
| **ResponseSession** | id, respondent_id, survey_id, progress, status    | Avance y estado.              |
| **Response**        | id, session_id, scenario_id, indicator_id, weight | Peso por indicador/escenario. |

### **Endpoints API esperados**

| Método  | Ruta                        | Función                                           |
| ------- | --------------------------- | ------------------------------------------------- |
| `GET`   | `/surveys/:id/definition`   | Carga escenarios + indicadores filtrados por rol. |
| `POST`  | `/sessions?token=...`       | Crea o recupera sesión.                           |
| `PATCH` | `/sessions/:id/draft`       | Guarda avance parcial.                            |
| `POST`  | `/sessions/:id/submit`      | Valida y marca como completada.                   |
| `GET`   | `/sessions/:id/summary`     | Devuelve resumen.                                 |
| `GET`   | `/exports/csv?surveyId=...` | Exportación admin.                                |

### **Flujos UX detallados**

#### Flujo 1: Inicio de sesión

* Token válido → carga datos previos.
* Si ya está completado → vista de “ya enviado”.

#### Flujo 2: Escenario

* Mostrar descripción + tags de dominio.
* Selector buscable de indicadores.
* Panel lateral con sliders.
* Validación instantánea (suma total mostrada).
* Navegación entre escenarios: “Anterior / Siguiente”.
* Autosave cada 1s (con debounce).
* Indicador de avance global (ej. 8/19).

#### Flujo 3: Revisión

* Tabla consolidada.
* Marcar escenarios incompletos.
* Confirmar envío.
* Bloquear edición al enviar.

#### Flujo 4: Reanudación

* Token → recupera `progress` y datos.
* Si offline → leer localStorage, sincronizar al reconectar.

---

### **Validaciones funcionales**

* En cada escenario:

  * ≥1 indicador seleccionado.
  * Suma de pesos = 100 (± tolerancia 0).
* En envío final:

  * Todos los escenarios con datos válidos o marcados “No aplica”.
  * Token no usado previamente.

### **Mensajería UX**

* Microinteracciones tipo:

  * “Faltan 12% por asignar 🧮”.
  * “Guardado automáticamente ✓”.
  * “Copiaste pesos del escenario anterior 💡”.

### **Seguridad**

* Tokens de acceso firmados y expiran (configurable).
* Encriptación en tránsito (HTTPS).
* Prevención de doble envío.
* Protección CSRF y rate-limiting en autosave.

### **Exportación de resultados**

Formato CSV:

```
respondent_id,role,scenario_id,indicator_id,weight,timestamp
```

O JSON estructurado.
