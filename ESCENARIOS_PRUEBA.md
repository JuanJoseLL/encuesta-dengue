# Escenarios de Prueba - Encuesta de Ponderación de Indicadores para Estrategias de Mitigación del Dengue

## Información del Proyecto

**Aplicación:** Sistema de encuesta web para ponderación de indicadores epidemiológicos
**Contexto de uso:** Aplicación de uso único para 15-20 expertos
**Duración estimada:** Sesión única de 25-35 minutos por participante
**Criticidad:** ALTA - No se permiten fallos durante la ejecución
**Stack tecnológico:** Next.js 15, PostgreSQL, Prisma ORM
**Componentes principales:**
- 19 estrategias de mitigación
- 69 indicadores epidemiológicos y entomológicos
- Sistema de ponderación con pesos que suman 100%
- Guardado automático cada 1.5 segundos
- Panel administrativo con exportación CSV/Excel

---

## 1. Autenticación y Acceso

### 1.1 Acceso exitoso con token válido

**Precondiciones:**
- Usuario posee un número de cédula registrado en el sistema
- Base de datos contiene tokens válidos

**Pasos:**
1. Acceder a la URL `/survey`
2. Ingresar número de cédula válido en el campo de texto
3. Hacer clic en "Acceder a la encuesta"

**Resultado esperado:**
- El sistema valida el token
- Se crea o recupera una sesión asociada al token
- El usuario es redirigido a `/survey/{token}/strategies`
- Se muestra la lista de 19 estrategias disponibles

**Prioridad:** Alta

---

### 1.2 Acceso con token inválido

**Precondiciones:**
- Usuario ingresa un número de cédula no registrado en el sistema

**Pasos:**
1. Acceder a la URL `/survey`
2. Ingresar número de cédula no registrado
3. Hacer clic en "Acceder a la encuesta"

**Resultado esperado:**
- El sistema rechaza el acceso
- Se muestra mensaje de error: "No se pudo acceder con esta cédula. Por favor verifica que sea correcta o contacta al administrador"
- El usuario permanece en la página de login
- No se crea ninguna sesión

**Prioridad:** Alta

---

### 1.3 Validación de campo vacío

**Pasos:**
1. Acceder a la URL `/survey`
2. Dejar el campo de cédula vacío
3. Intentar hacer clic en "Acceder a la encuesta"

**Resultado esperado:**
- El botón debe estar deshabilitado cuando el campo está vacío
- Si se intenta enviar, se muestra mensaje: "Por favor ingresa tu cédula"
- No se realiza petición al servidor

**Prioridad:** Media

---

### 1.4 Continuidad de sesión (re-acceso)

**Precondiciones:**
- Usuario ha iniciado sesión previamente
- Usuario ha completado al menos 5 estrategias
- Usuario ha cerrado el navegador o salido de la aplicación

**Pasos:**
1. Acceder nuevamente a `/survey`
2. Ingresar la misma cédula utilizada anteriormente
3. Hacer clic en "Acceder a la encuesta"

**Resultado esperado:**
- El sistema recupera la sesión existente
- Se muestra el progreso guardado (5/19 estrategias completadas)
- Los pesos y selecciones de indicadores se mantienen intactos
- El usuario puede continuar desde donde quedó

**Prioridad:** Crítica

---

### 1.5 Acceso después de envío final

**Precondiciones:**
- Usuario ha completado y enviado la encuesta final
- Estado de sesión: "submitted"

**Pasos:**
1. Acceder a `/survey`
2. Ingresar cédula con encuesta ya enviada
3. Intentar acceder

**Resultado esperado:**
- El sistema detecta que la encuesta ya fue enviada
- Usuario es redirigido a página de confirmación de envío
- Se muestra mensaje: "Encuesta ya enviada"
- No se permite edición de ninguna estrategia

**Prioridad:** Crítica

---

## 2. Navegación entre Estrategias

### 2.1 Navegación secuencial hacia adelante

**Precondiciones:**
- Usuario ha iniciado sesión correctamente
- Usuario se encuentra en estrategia N con pesos válidos (suma 100%)

**Pasos:**
1. Completar estrategia actual con pesos que sumen 100%
2. Hacer clic en botón "Siguiente"
3. Repetir para estrategias 1 a 19

**Resultado esperado:**
- Se guarda automáticamente la estrategia actual
- El usuario avanza a la estrategia N+1
- Se cargan los datos guardados de la estrategia siguiente (si existen)
- La barra de progreso se actualiza correctamente
- El contador muestra "Estrategia X de 19"

**Prioridad:** Alta

---

### 2.2 Navegación hacia atrás

**Precondiciones:**
- Usuario se encuentra en estrategia 6 o superior

**Pasos:**
1. Hacer clic en botón "Anterior"
2. Verificar que se carga la estrategia previa
3. Realizar cambios en los pesos
4. Hacer clic en "Siguiente" para volver a la estrategia original

**Resultado esperado:**
- La navegación hacia atrás funciona correctamente
- Los datos previamente guardados se cargan sin pérdida
- Los cambios realizados se guardan automáticamente
- No hay pérdida de información en ninguna dirección

**Prioridad:** Alta

---

### 2.3 Navegación directa desde lista de estrategias

**Pasos:**
1. Desde la página de lista de estrategias `/survey/{token}/strategies`
2. Hacer clic en estrategia específica (ej: estrategia 10)
3. Verificar carga correcta

**Resultado esperado:**
- El sistema carga directamente la estrategia seleccionada
- Se muestran los datos guardados previamente (si existen)
- El indicador de progreso refleja la estrategia actual
- Los botones "Anterior" y "Siguiente" funcionan correctamente

**Prioridad:** Media

---

### 2.4 Bloqueo de navegación con pesos inválidos

**Precondiciones:**
- Usuario se encuentra en una estrategia
- Los pesos seleccionados NO suman 100% (ej: suman 85%)

**Pasos:**
1. Seleccionar indicadores con pesos que sumen menos de 100%
2. Intentar hacer clic en "Siguiente"

**Resultado esperado:**
- El botón "Siguiente" está deshabilitado visualmente
- Se muestra mensaje de error: "Los pesos deben sumar exactamente 100% antes de continuar"
- El usuario no puede avanzar hasta completar correctamente la suma
- El indicador visual muestra "Faltan X%" en color rojo o ámbar

**Prioridad:** Crítica

---

### 2.5 Transición a resumen desde última estrategia

**Precondiciones:**
- Usuario se encuentra en estrategia 19
- Estrategia 19 tiene pesos válidos (suma 100%)

**Pasos:**
1. Completar estrategia 19
2. Hacer clic en "Ir al resumen"

**Resultado esperado:**
- El usuario es redirigido a `/survey/{token}/summary`
- Se muestra el resumen completo de las 19 estrategias
- Se visualiza el estado de cada estrategia (completo/incompleto)
- Se muestra contador de estrategias completadas

**Prioridad:** Alta

---

## 3. Selección y Ponderación de Indicadores

### 3.1 Selección básica de indicadores

**Pasos:**
1. Acceder a una estrategia
2. Marcar checkbox de 3 indicadores diferentes
3. Verificar que aparecen en panel de pesos
4. Desmarcar 1 indicador

**Resultado esperado:**
- Los 3 indicadores seleccionados aparecen en el panel derecho de pesos
- Cada indicador inicia con peso de 0%
- Al desmarcar, el indicador desaparece del panel de pesos
- El peso asignado se elimina del cálculo total
- Los cambios se guardan automáticamente

**Prioridad:** Alta

---

### 3.2 Asignación manual de pesos con slider

**Pasos:**
1. Seleccionar 3 indicadores
2. Usar slider para asignar peso a primer indicador (mover a 35%)
3. Usar slider para segundo indicador (mover a 40%)
4. Usar slider para tercer indicador (mover a 25%)

**Resultado esperado:**
- Los valores se redondean automáticamente a múltiplos de 5 (35%, 40%, 25%)
- El total muestra 100% en color verde
- El indicador de progreso muestra "Suma correcta ✓"
- Los sliders no permiten exceder el límite disponible
- El campo numérico se sincroniza con el slider

**Prioridad:** Alta

---

### 3.3 Asignación manual con campo numérico

**Pasos:**
1. Seleccionar 2 indicadores
2. En campo numérico del primer indicador, ingresar valor "67"
3. En campo numérico del segundo indicador, ingresar valor "33"

**Resultado esperado:**
- El sistema redondea 67 al múltiplo de 5 más cercano (65 o 70 según lógica)
- El slider se actualiza al mismo valor del campo numérico
- El total se calcula correctamente
- Si el total excede 100%, se aplica la validación correspondiente

**Prioridad:** Media

---

### 3.4 Límite máximo de peso por indicador

**Precondiciones:**
- Indicador A: 40%
- Indicador B: 35%
- Indicador C: 0%

**Pasos:**
1. Intentar subir peso de indicador C a 50% usando slider
2. Intentar ingresar manualmente 50 en el campo numérico

**Resultado esperado:**
- El slider se detiene en 25% (máximo permitido: 100% - 75% = 25%)
- Si se ingresa 50 manualmente, el sistema lo ajusta a 25%
- Se mantiene la restricción de suma máxima de 100%
- No se permite exceder el límite bajo ninguna circunstancia

**Prioridad:** Alta

---

### 3.5 Funcionalidad de auto-distribución equitativa

**Escenario A - División exacta:**

**Pasos:**
1. Seleccionar 4 indicadores
2. Hacer clic en botón "Autorrepartir equitativamente"

**Resultado esperado:**
- Cada indicador recibe 25% (100 ÷ 4 = 25)
- Total suma exactamente 100%
- Indicador visual muestra verde

**Escenario B - División con residuo:**

**Pasos:**
1. Seleccionar 3 indicadores
2. Hacer clic en "Autorrepartir equitativamente"

**Resultado esperado:**
- Distribución: 35%, 35%, 30% o similar que sume 100%
- El residuo se distribuye en múltiplos de 5
- Total suma exactamente 100%

**Prioridad:** Alta

---

### 3.6 Búsqueda de indicadores

**Pasos:**
1. Acceder a una estrategia
2. En campo de búsqueda, escribir "Breteau"
3. Verificar resultados filtrados
4. Borrar texto de búsqueda

**Resultado esperado:**
- Se filtran solo indicadores que contengan "Breteau" en el nombre
- Los indicadores no coincidentes se ocultan temporalmente
- Al borrar la búsqueda, se muestran todos los 69 indicadores nuevamente
- Los indicadores previamente seleccionados mantienen su estado

**Prioridad:** Media

---

### 3.7 Estrategia sin indicadores seleccionados

**Pasos:**
1. Acceder a estrategia sin seleccionar ningún indicador
2. Intentar hacer clic en "Siguiente"

**Resultado esperado:**
- El botón "Siguiente" está deshabilitado
- Se muestra mensaje: "Selecciona al menos un indicador para asignar pesos"
- No se permite avanzar
- El panel de pesos muestra mensaje informativo

**Prioridad:** Alta

---

### 3.8 Pesos que no suman 100%

**Pasos:**
1. Seleccionar 3 indicadores
2. Asignar pesos: 30%, 40%, 20% (total: 90%)
3. Intentar avanzar

**Resultado esperado:**
- Botón "Siguiente" deshabilitado
- Mensaje de error: "Los pesos deben sumar exactamente 100% antes de continuar"
- Indicador visual muestra "Faltan 10%" en color ámbar
- Barra de progreso muestra 90% en color ámbar

**Prioridad:** Crítica

---

### 3.9 Validación de pesos que suman exactamente 100%

**Pasos:**
1. Seleccionar indicadores y ajustar pesos hasta sumar 100%
2. Verificar indicadores visuales
3. Verificar habilitación del botón "Siguiente"

**Resultado esperado:**
- Indicador total muestra "100.0%" en color verde
- Mensaje de confirmación: "✓ Estrategia completa"
- Botón "Siguiente" está habilitado y resaltado
- Barra de progreso al 100% en verde

**Prioridad:** Alta

---

## 4. Guardado Automático

### 4.1 Guardado automático básico

**Pasos:**
1. Acceder a una estrategia
2. Seleccionar indicadores y asignar pesos
3. Esperar 2 segundos sin realizar cambios
4. Observar indicador de guardado

**Resultado esperado:**
- Después de 1.5 segundos de inactividad, se muestra "Guardando..."
- Al completar la petición, se muestra "Guardado HH:MM:SS"
- El timestamp es preciso
- Al refrescar la página, los cambios persisten

**Prioridad:** Crítica

---

### 4.2 Debounce de guardado múltiple

**Pasos:**
1. Cambiar peso de indicador A a 20%
2. Inmediatamente (< 1 segundo) cambiar peso de indicador B a 30%
3. Inmediatamente cambiar peso de indicador C a 50%
4. Esperar 2 segundos

**Resultado esperado:**
- Solo se realiza UNA petición de guardado al servidor
- La petición se envía 1.5 segundos después del último cambio
- Se guardan los 3 cambios en una sola operación
- El estado final persiste correctamente

**Prioridad:** Alta

---

### 4.3 Persistencia después de refrescar página

**Pasos:**
1. Realizar cambios en estrategia (selección y pesos)
2. Esperar confirmación "Guardado HH:MM:SS"
3. Refrescar página (F5)

**Resultado esperado:**
- Todos los indicadores seleccionados se mantienen
- Todos los pesos se mantienen con valores exactos
- El estado de la estrategia (completo/incompleto) es correcto
- No hay pérdida de información

**Prioridad:** Crítica

---

### 4.4 Guardado con conexión lenta

**Precondiciones:**
- Simular conexión lenta (Network throttling: Slow 3G)

**Pasos:**
1. Realizar cambios en pesos
2. Observar comportamiento del indicador de guardado

**Resultado esperado:**
- El indicador "Guardando..." permanece visible durante toda la petición
- No se permite realizar nuevos cambios hasta completar guardado (opcional)
- Al completar, muestra "Guardado HH:MM:SS"
- Los datos se guardan correctamente sin pérdida

**Prioridad:** Alta

---

### 4.5 Pérdida de conexión durante guardado

**Precondiciones:**
- Configurar para desconectar red durante guardado

**Pasos:**
1. Realizar cambios en estrategia
2. Desconectar red ANTES de que complete el guardado automático
3. Esperar timeout
4. Reconectar red
5. Refrescar página

**Resultado esperado:**
- El sistema detecta error de red
- Se muestra mensaje de error de conexión
- Al reconectar y refrescar, se verifica si los cambios se perdieron
- Idealmente, existe mecanismo de reintento o notificación al usuario

**Prioridad:** Alta

---

### 4.6 Guardado al navegar entre estrategias

**Pasos:**
1. Realizar cambios en estrategia 5
2. Inmediatamente hacer clic en "Siguiente" (antes de 1.5 segundos)

**Resultado esperado:**
- Los cambios se guardan ANTES de navegar
- El usuario avanza a estrategia 6
- Al volver a estrategia 5, los cambios persisten
- No hay pérdida de información

**Prioridad:** Crítica

---

### 4.7 Detección de sesión ya enviada durante guardado

**Precondiciones:**
- Usuario tiene sesión en estado "draft"
- Administrador cambia manualmente el estado a "submitted"

**Pasos:**
1. Usuario realiza cambios en estrategia
2. Sistema intenta guardar automáticamente
3. Servidor responde con error 403 (sesión ya enviada)

**Resultado esperado:**
- El sistema detecta que la sesión fue enviada
- Se muestra mensaje: "Esta encuesta ya fue enviada y no se puede editar"
- Usuario es redirigido a página de resumen o confirmación
- No se permite más edición

**Prioridad:** Media

---

## 5. Progreso y Completitud

### 5.1 Cálculo correcto de progreso

**Precondiciones:**
- Usuario ha completado exactamente 10 de 19 estrategias

**Pasos:**
1. Acceder a lista de estrategias o cualquier estrategia
2. Observar barra de progreso

**Resultado esperado:**
- Barra de progreso muestra "10/19"
- Porcentaje visual: 52.6% (10/19 ≈ 0.526)
- Solo las estrategias con pesos que sumen 100% cuentan como completas
- El indicador es consistente en todas las páginas

**Prioridad:** Alta

---

### 5.2 Estrategia incompleta no cuenta en progreso

**Precondiciones:**
- Usuario ha completado 5 estrategias (100% cada una)
- Usuario accede a estrategia 6 y asigna pesos que suman 75%

**Pasos:**
1. Verificar progreso actual
2. Navegar a otra estrategia
3. Verificar nuevamente el progreso

**Resultado esperado:**
- El progreso sigue mostrando "5/19 completadas"
- La estrategia 6 NO se cuenta como completa
- El porcentaje es 26.3% (5/19)
- Al completar estrategia 6 al 100%, el progreso cambia a "6/19"

**Prioridad:** Alta

---

### 5.3 Actualización dinámica de progreso

**Pasos:**
1. Estar en estrategia 8 con pesos que suman 95%
2. Ajustar pesos hasta llegar a 100%
3. Observar cambio en tiempo real

**Resultado esperado:**
- Cuando suma llega a 100%, el contador de progreso incrementa inmediatamente
- No es necesario navegar para ver el cambio
- El indicador visual cambia de ámbar/rojo a verde
- El mensaje cambia a "✓ Estrategia completa"

**Prioridad:** Media

---

### 5.4 Estado de estrategia en lista

**Pasos:**
1. Acceder a `/survey/{token}/strategies` (lista de estrategias)
2. Verificar indicadores visuales de cada estrategia

**Resultado esperado:**
- Estrategias completas muestran check verde o indicador similar
- Estrategias incompletas muestran indicador ámbar o vacío
- Estrategias no iniciadas se distinguen claramente
- El orden es del 1 al 19

**Prioridad:** Media

---

## 6. Resumen y Envío Final

### 6.1 Acceso a resumen con estrategias incompletas

**Precondiciones:**
- Usuario tiene 15 estrategias completas y 4 incompletas

**Pasos:**
1. Acceder a `/survey/{token}/summary`
2. Observar estado del botón de envío

**Resultado esperado:**
- Se muestra resumen de las 19 estrategias
- Indicador muestra: "15 completos, 4 incompletos"
- Botón "Enviar encuesta final" está DESHABILITADO
- Mensaje de advertencia: "Debes completar todas las estrategias (pesos sumando 100%) antes de enviar la encuesta"

**Prioridad:** Alta

---

### 6.2 Visualización detallada en resumen

**Precondiciones:**
- Usuario tiene al menos 5 estrategias completas

**Pasos:**
1. Acceder a página de resumen
2. Verificar información mostrada para cada estrategia

**Resultado esperado:**
Cada estrategia muestra:
- Título y descripción
- Estado visual (completo/incompleto)
- Tabla con indicadores seleccionados y sus pesos
- Total de pesos (debe ser 100% para completas)
- Botón "Editar" funcional

**Prioridad:** Media

---

### 6.3 Edición desde página de resumen

**Pasos:**
1. En página de resumen, hacer clic en "Editar" de estrategia 7
2. Modificar pesos de indicadores
3. Hacer clic en "Siguiente" o navegar de vuelta al resumen

**Resultado esperado:**
- Usuario es redirigido a `/survey/{token}/strategies/7`
- Se cargan los datos actuales de la estrategia
- Usuario puede modificar libremente
- Al volver al resumen, los cambios se reflejan inmediatamente
- El estado (completo/incompleto) se actualiza correctamente

**Prioridad:** Alta

---

### 6.4 Habilitación de envío con todas estrategias completas

**Precondiciones:**
- Usuario completa la última estrategia faltante (19/19)

**Pasos:**
1. Acceder a resumen después de completar todas las estrategias
2. Observar cambios en la interfaz

**Resultado esperado:**
- Mensaje de éxito: "Listo para enviar: Todas las estrategias están completas"
- Botón "Enviar encuesta final" está HABILITADO
- Indicadores muestran "19 completos, 0 incompletos"
- Barra de progreso al 100%

**Prioridad:** Crítica

---

### 6.5 Selección de rol profesional

**Precondiciones:**
- Todas las estrategias están completas

**Pasos:**
1. Hacer clic en "Enviar encuesta final"
2. Observar modal de selección de rol

**Resultado esperado:**
- Aparece modal con título "Selecciona tu rol profesional"
- Se muestran 6 opciones de roles:
  - Epidemiólogo/a
  - Entomólogo/a
  - Biólogo/a
  - Salud pública
  - Gestor/a sanitario
  - Otro
- Botón "Continuar" está DESHABILITADO hasta seleccionar un rol
- Se puede cancelar y volver

**Prioridad:** Alta

---

### 6.6 Confirmación de envío final

**Precondiciones:**
- Usuario seleccionó rol profesional

**Pasos:**
1. Seleccionar rol (ej: "Epidemiólogo/a")
2. Hacer clic en "Continuar"
3. Observar modal de confirmación

**Resultado esperado:**
- Aparece segundo modal de confirmación
- Mensaje claro: "¿Estás seguro/a de enviar tu encuesta? Una vez enviada no podrás modificarla"
- Muestra rol seleccionado: "Rol seleccionado: Epidemiólogo/a"
- Opciones: "Volver" y "Sí, enviar"
- Botón "Volver" regresa al modal de selección de rol

**Prioridad:** Alta

---

### 6.7 Envío exitoso de encuesta

**Pasos:**
1. En modal de confirmación, hacer clic en "Sí, enviar"
2. Esperar procesamiento

**Resultado esperado:**
- Se muestra indicador de carga: "Enviando..."
- Se realiza petición POST a `/api/sessions/{id}/submit`
- El estado de sesión cambia a "submitted"
- El rol se guarda en el registro de Respondent
- Usuario es redirigido a `/survey/{token}/success`
- Se muestra página de confirmación con mensaje de agradecimiento

**Prioridad:** Crítica

---

### 6.8 Prevención de doble envío

**Pasos:**
1. En modal de confirmación, hacer clic rápidamente 2 veces en "Sí, enviar"

**Resultado esperado:**
- Se procesa solo UNA petición de envío
- El botón se deshabilita inmediatamente después del primer clic
- Se muestra "Enviando..." durante el proceso
- No se crean registros duplicados
- El segundo clic no tiene efecto

**Prioridad:** Alta

---

### 6.9 Manejo de error en envío con estrategias incompletas

**Precondiciones:**
- Usuario intenta enviar pero el servidor detecta estrategias incompletas

**Pasos:**
1. Intentar envío final
2. Servidor responde con error indicando estrategias incompletas

**Resultado esperado:**
- Se muestra alerta con mensaje específico: "Hay X estrategia(s) incompleta(s). Por favor completa todas las estrategias con pesos que sumen 100%"
- El modal se cierra
- El usuario permanece en la página de resumen
- Se puede identificar cuáles estrategias están incompletas
- No se cambia el estado de la sesión

**Prioridad:** Alta

---

### 6.10 Intento de edición después de envío

**Precondiciones:**
- Encuesta ya fue enviada (estado: "submitted")

**Pasos:**
1. Intentar acceder directamente a una estrategia mediante URL: `/survey/{token}/strategies/5`

**Resultado esperado:**
- El sistema detecta que la sesión está en estado "submitted"
- Usuario es redirigido a página de confirmación de envío
- Se muestra mensaje: "Encuesta ya enviada"
- No se permite acceso a estrategias
- No se permite modificación de datos

**Prioridad:** Alta

---

## 7. Concurrencia y Múltiples Usuarios

### 7.1 Usuarios simultáneos con tokens diferentes

**Precondiciones:**
- 5 usuarios con tokens distintos acceden simultáneamente

**Pasos:**
1. Usuario A accede con token "123456789"
2. Usuario B accede con token "987654321"
3. Usuario C accede con token "111111111"
4. Usuario D accede con token "1077841023"
5. Usuario E accede con token "123123123"
6. Cada usuario trabaja en estrategias diferentes

**Resultado esperado:**
- Cada usuario ve solo sus propios datos
- No hay interferencia entre sesiones
- Los cambios de un usuario no afectan a otros
- El rendimiento se mantiene estable
- No hay errores de concurrencia en base de datos

**Prioridad:** Crítica

---

### 7.2 Carga masiva simultánea (15-20 usuarios)

**Precondiciones:**
- 20 usuarios acceden al sistema al mismo tiempo

**Pasos:**
1. Simular 20 sesiones simultáneas iniciando en el mismo segundo
2. Cada usuario navega por estrategias y guarda cambios
3. Monitorear tiempos de respuesta y errores

**Resultado esperado:**
- El servidor maneja la carga sin errores
- Tiempo de respuesta de API: < 3 segundos
- No hay timeouts
- No hay bloqueos en base de datos
- Todas las sesiones funcionan correctamente

**Prioridad:** Crítica

---

### 7.3 Guardado automático simultáneo

**Precondiciones:**
- 10 usuarios realizando cambios simultáneos

**Pasos:**
1. 10 usuarios modifican pesos en sus respectivas estrategias
2. El guardado automático se dispara al mismo tiempo (mismo segundo)
3. Verificar integridad de datos

**Resultado esperado:**
- Todas las peticiones se procesan correctamente
- No hay race conditions en la base de datos
- Cada registro se guarda con los datos correctos
- No hay sobrescritura accidental entre sesiones
- Timestamps de "updatedAt" son precisos

**Prioridad:** Alta

---

### 7.4 Envío simultáneo de encuestas

**Precondiciones:**
- 3 usuarios completan su última estrategia al mismo tiempo

**Pasos:**
1. Usuario A, B y C hacen clic en "Enviar encuesta final" en el mismo segundo
2. Los 3 completan el flujo de selección de rol y confirmación
3. Verificar procesamiento en base de datos

**Resultado esperado:**
- Las 3 encuestas se procesan correctamente
- Cada sesión cambia a estado "submitted"
- No hay errores de bloqueo
- Los roles se guardan correctamente para cada usuario
- Timestamps de "completedAt" son precisos

**Prioridad:** Alta

---

### 7.5 Sesiones del mismo usuario en navegadores diferentes

**Pasos:**
1. Abrir Chrome e iniciar sesión con token "123456789"
2. Abrir Firefox e iniciar sesión con el mismo token "123456789"
3. Realizar cambios en Chrome
4. Refrescar en Firefox

**Resultado esperado:**
- Ambos navegadores acceden a la MISMA sesión
- Los cambios realizados en Chrome se reflejan en Firefox al refrescar
- No se crean sesiones duplicadas
- El estado es consistente entre navegadores
- El último cambio guardado prevalece

**Prioridad:** Media

---

## 8. Panel Administrativo

### 8.1 Acceso al dashboard administrativo

**Pasos:**
1. Acceder a `/admin/dashboard`
2. Verificar carga de estadísticas

**Resultado esperado:**
- Se muestra dashboard con métricas principales:
  - Total de sesiones
  - Sesiones completadas
  - Sesiones en progreso
  - Tasa de completitud (%)
  - Progreso promedio (estrategias)
- Las métricas se calculan en tiempo real
- Los datos son precisos

**Prioridad:** Media

---

### 8.2 Visualización de sesiones recientes

**Pasos:**
1. En dashboard, observar sección "Sesiones Recientes"

**Resultado esperado:**
- Se muestran las 5 sesiones más recientes
- Información por sesión:
  - Nombre del participante (token/cédula)
  - Rol profesional (si fue seleccionado)
  - Progreso visual y numérico (X/19)
  - Estado (En progreso / Completada)
  - Última actividad (timestamp)
- Enlace "Ver todas" redirige a `/admin/sessions`

**Prioridad:** Media

---

### 8.3 Lista completa de sesiones

**Pasos:**
1. Acceder a `/admin/sessions`
2. Verificar tabla completa de participantes

**Resultado esperado:**
- Se muestran TODAS las sesiones creadas
- Tabla con columnas: Participante, Rol, Progreso, Estado, Última actividad
- Ordenamiento por última actividad (más reciente primero)
- Progreso visual con barra de porcentaje
- Indicadores de estado con colores (verde = completada, ámbar = en progreso)

**Prioridad:** Media

---

### 8.4 Cálculo de estadísticas globales

**Precondiciones:**
- 20 usuarios en total
- 12 han completado (submitted)
- 8 están en progreso (draft)

**Pasos:**
1. Acceder a dashboard
2. Verificar métricas calculadas

**Resultado esperado:**
- Total Sesiones: 20
- Completadas: 12
- En Progreso: 8
- Tasa de Completitud: 60% (12/20)
- Progreso Promedio: calculado correctamente sobre las 8 en progreso

**Prioridad:** Media

---

### 8.5 Exportación CSV

**Pasos:**
1. Acceder a `/admin/exports`
2. Hacer clic en "Exportar CSV"
3. Descargar archivo
4. Abrir en Excel o editor de texto

**Resultado esperado:**
- Se descarga archivo con nombre: `encuesta-dengue-{fecha}.csv`
- Estructura de datos:
  - Una fila por cada respuesta (sesión + estrategia + indicador + peso)
  - Columnas: SessionID, RespondentID, Rol, StrategyID, StrategyTitle, IndicatorID, IndicatorName, Weight, Status, CompletedAt
- Codificación UTF-8 (caracteres especiales correctos)
- Datos completos y sin pérdida de información

**Prioridad:** Alta

---

### 8.6 Exportación Excel con formato

**Pasos:**
1. Acceder a `/admin/exports`
2. Hacer clic en "Exportar Excel"
3. Descargar archivo .xlsx
4. Abrir en Microsoft Excel o LibreOffice

**Resultado esperado:**
- Se descarga archivo: `encuesta-dengue-{fecha}.xlsx`
- Formato profesional:
  - Encabezados en negrita
  - Colores de fondo en encabezados
  - Filtros automáticos habilitados
  - Anchos de columna ajustados
- Posiblemente múltiples hojas:
  - Hoja 1: Respuestas detalladas
  - Hoja 2: Resumen por sesión
  - Hoja 3: Resumen por estrategia
- Datos completos y legibles

**Prioridad:** Alta

---

### 8.7 Exportación con datos parciales

**Precondiciones:**
- Solo 5 de 20 participantes han completado la encuesta
- Los otros 15 tienen progreso variable

**Pasos:**
1. Administrador exporta datos a CSV
2. Verificar contenido del archivo

**Resultado esperado:**
- El archivo incluye:
  - Datos completos de las 5 sesiones finalizadas
  - Datos parciales de las 15 sesiones en progreso
- Las sesiones incompletas se marcan claramente (Status: "draft")
- Solo se exportan estrategias con al menos 1 indicador seleccionado
- No se incluyen estrategias vacías

**Prioridad:** Media

---

### 8.8 Consistencia de exportación en tiempo real

**Escenario:**
- 2 usuarios están completando encuesta MIENTRAS el admin exporta

**Pasos:**
1. Usuario A y B están guardando cambios activamente
2. Admin hace clic en "Exportar Excel" en ese momento
3. Verificar datos exportados

**Resultado esperado:**
- La exportación captura el estado actual de la base de datos
- Los datos son consistentes (no hay corrupción)
- Si un guardado ocurre durante la exportación, puede o no incluirse (comportamiento definido)
- No hay errores de bloqueo o timeout

**Prioridad:** Media

---

## 9. Validaciones y Manejo de Errores

### 9.1 Error de conexión a base de datos

**Precondiciones:**
- Simular caída de base de datos (detener contenedor PostgreSQL)

**Pasos:**
1. Usuario intenta guardar cambios en estrategia
2. El guardado automático falla

**Resultado esperado:**
- Se muestra mensaje de error: "Error de conexión. Verifica tu conexión a internet"
- El usuario es notificado claramente
- Los cambios NO se marcan como "Guardado"
- Al restaurar la BD, el siguiente guardado debe funcionar
- Idealmente, existe mecanismo de reintento automático

**Prioridad:** Alta

---

### 9.2 Timeout de petición HTTP

**Precondiciones:**
- Simular latencia extrema (>30 segundos)

**Pasos:**
1. Usuario realiza acción que requiere petición al servidor
2. La petición excede el timeout

**Resultado esperado:**
- La aplicación no se congela indefinidamente
- Se muestra mensaje de error después del timeout
- El usuario puede reintentar la acción
- No se pierde el contexto de la sesión

**Prioridad:** Media

---

### 9.3 Token expirado (si aplica)

**Precondiciones:**
- Si el sistema implementa expiración de tokens

**Pasos:**
1. Acceder con un token que ha expirado según `expiresAt` en `RespondentInvite`

**Resultado esperado:**
- Se rechaza el acceso
- Mensaje: "El token ha expirado. Contacta al administrador"
- No se crea sesión
- El usuario es informado claramente

**Prioridad:** Baja (dependiendo de si se implementa expiración)

---

### 9.4 Acceso a estrategia inexistente

**Pasos:**
1. Manipular URL para acceder a: `/survey/{token}/strategies/999` (ID inválido)

**Resultado esperado:**
- Se muestra mensaje de error: "Estrategia no encontrada"
- El usuario es redirigido a la lista de estrategias
- No hay errores de servidor (500)
- El manejo es gracioso

**Prioridad:** Baja

---

### 9.5 Datos corruptos en sesión

**Precondiciones:**
- Modificar manualmente datos en base de datos para crear inconsistencia

**Pasos:**
1. Corromper el campo `metadata` de una sesión (JSON inválido)
2. Usuario intenta acceder a esa sesión

**Resultado esperado:**
- El sistema detecta datos inválidos
- Se muestra mensaje de error genérico
- No se expone información técnica al usuario
- Logs del servidor registran el error para debugging
- Idealmente, se ofrece opción de "resetear" la sesión

**Prioridad:** Baja

---

### 9.6 Validación de formato de peso (entrada manual)

**Pasos:**
1. En campo numérico de peso, ingresar texto: "abc"
2. Ingresar número negativo: "-20"
3. Ingresar número muy grande: "999"

**Resultado esperado:**
- Texto no numérico: se ignora o se convierte a 0
- Número negativo: se convierte a 0
- Número > 100: se limita a 100
- Solo se aceptan múltiplos de 5
- El valor se sanitiza antes de guardar

**Prioridad:** Media

---

## 10. Compatibilidad de Navegadores

### 10.1 Google Chrome (última versión)

**Pasos:**
1. Ejecutar flujo completo en Chrome versión actual
2. Completar al menos 5 estrategias
3. Probar guardado automático, navegación y envío

**Resultado esperado:**
- Funcionamiento completo sin errores
- Sliders responden correctamente
- Guardado automático funciona
- Transiciones suaves
- No hay errores en consola

**Prioridad:** Crítica

---

### 10.2 Mozilla Firefox (última versión)

**Pasos:**
1. Ejecutar flujo completo en Firefox
2. Prestar especial atención a sliders y componentes de entrada

**Resultado esperado:**
- Compatibilidad completa
- Sliders de peso funcionan correctamente
- Estilos se renderizan correctamente
- Guardado automático funciona igual que en Chrome

**Prioridad:** Alta

---

### 10.3 Safari (última versión)

**Pasos:**
1. Ejecutar flujo en Safari (macOS o iOS)
2. Verificar guardado automático (Safari tiene restricciones de localStorage/cookies)

**Resultado esperado:**
- Funcionalidad completa
- Guardado automático funciona (no depende de localStorage)
- Los timers (setTimeout) funcionan correctamente
- Estilos CSS compatibles con WebKit

**Prioridad:** Alta

---

### 10.4 Microsoft Edge (última versión)

**Pasos:**
1. Ejecutar flujo completo en Edge
2. Verificar funcionalidad general

**Resultado esperado:**
- Compatibilidad completa (Edge usa Chromium)
- Sin errores específicos del navegador

**Prioridad:** Media

---

### 10.5 Responsive design en tablet

**Pasos:**
1. Acceder desde tablet (iPad o Android)
2. Completar al menos 2 estrategias

**Resultado esperado:**
- El layout se adapta correctamente
- Los sliders son usables con touch
- No hay elementos cortados o superpuestos
- La navegación es intuitiva

**Prioridad:** Baja (si se espera uso en tablets)

---

### 10.6 Navegador móvil (smartphone)

**Pasos:**
1. Acceder desde smartphone
2. Intentar seleccionar indicadores y ajustar pesos

**Resultado esperado:**
- Si el diseño NO es responsive móvil, debe ser usable con zoom
- Los elementos táctiles tienen tamaño adecuado (min 44px)
- Los sliders responden a touch gestures
- El teclado numérico aparece al editar campos de peso

**Prioridad:** Baja (según requisitos)

---

## 11. Integridad de Datos

### 11.1 Verificación de 69 indicadores

**Pasos:**
1. Acceder a cualquier estrategia
2. Contar indicadores disponibles en el selector
3. Verificar nombres y descripciones

**Resultado esperado:**
- Se muestran exactamente 69 indicadores
- Todos tienen nombre único
- Las descripciones son correctas y legibles
- No hay indicadores duplicados
- Todos están activos (active: true)

**Prioridad:** Alta

---

### 11.2 Verificación de 19 estrategias

**Pasos:**
1. Acceder a lista de estrategias
2. Contar total de estrategias
3. Verificar orden secuencial

**Resultado esperado:**
- Se muestran exactamente 19 estrategias
- El orden es del 1 al 19 (campo `order`)
- Todas tienen título y descripción
- Todas están activas (active: true)
- No hay estrategias duplicadas

**Prioridad:** Alta

---

### 11.3 Tokens de prueba funcionales

**Pasos:**
1. Probar acceso con cada token de prueba:
   - 123456789
   - 987654321
   - 111111111
   - 1077841023
   - 123123123
   - 321321321

**Resultado esperado:**
- Todos los tokens permiten acceso
- Cada token crea o recupera una sesión única
- Los tokens están registrados en tabla `RespondentInvite`
- Estado de tokens: "pending" o "accepted"

**Prioridad:** Alta

---

### 11.4 Suma exacta de pesos (sin errores de punto flotante)

**Precondiciones:**
- Usuario completa estrategia con 3 indicadores: 33.33%, 33.33%, 33.34%

**Pasos:**
1. Guardar estrategia
2. Verificar en base de datos los valores guardados
3. Exportar datos y verificar suma

**Resultado esperado:**
- La suma en base de datos es exactamente 100.0
- No hay errores de redondeo (99.99% o 100.01%)
- Los valores se almacenan como FLOAT con precisión adecuada
- Al exportar, la suma es 100% en todas las estrategias completas

**Prioridad:** Alta

---

### 11.5 Relaciones de integridad referencial

**Pasos:**
1. Verificar que cada `Response` tiene referencias válidas:
   - `sessionId` existe en `ResponseSession`
   - `strategyId` existe en `Strategy`
   - `indicatorId` existe en `Indicator`

**Resultado esperado:**
- No hay registros huérfanos
- Las relaciones de clave foránea se mantienen
- `onDelete: Cascade` funciona correctamente
- No hay errores de integridad en base de datos

**Prioridad:** Media

---

### 11.6 Unicidad de respuestas por estrategia

**Pasos:**
1. Usuario selecciona mismo indicador 2 veces en una estrategia
2. Intentar guardar

**Resultado esperado:**
- Solo se guarda UNA respuesta por combinación (sessionId, strategyId, indicatorId)
- La constraint `@@unique([sessionId, strategyId, indicatorId])` previene duplicados
- Si se intenta actualizar, se hace UPDATE en vez de INSERT

**Prioridad:** Media

---

## 12. Casos Extremos (Edge Cases)

### 12.1 Sesión de larga duración (2+ horas)

**Pasos:**
1. Iniciar sesión
2. Trabajar en 5 estrategias
3. Dejar el navegador idle por 2 horas (sin cerrar)
4. Volver y continuar trabajando

**Resultado esperado:**
- La sesión permanece activa
- No hay logout automático
- El siguiente guardado funciona correctamente
- Los datos previos están intactos

**Prioridad:** Media

---

### 12.2 Usuario con un solo indicador al 100%

**Pasos:**
1. Seleccionar SOLO 1 indicador
2. Asignarle 100% de peso
3. Intentar avanzar

**Resultado esperado:**
- El sistema acepta esta configuración como válida
- Botón "Siguiente" se habilita
- El indicador muestra verde (100%)
- Es una configuración legítima y debe permitirse

**Prioridad:** Media

---

### 12.3 Usuario con 20 indicadores al 5% cada uno

**Pasos:**
1. Seleccionar 20 indicadores
2. Usar "Autorrepartir" o asignar manualmente 5% a cada uno
3. Verificar que suma 100%

**Resultado esperado:**
- El sistema permite seleccionar hasta 20+ indicadores
- La distribución 5% × 20 = 100% es válida
- El guardado funciona correctamente
- No hay límite superior de indicadores por estrategia

**Prioridad:** Baja

---

### 12.4 Navegación caótica entre estrategias

**Pasos:**
1. Navegar: Estrategia 1 → 8 → 3 → 15 → 2 → 19 → 5
2. No completar ninguna, solo hacer cambios parciales
3. Verificar integridad de datos

**Resultado esperado:**
- Todos los cambios parciales se guardan correctamente
- No hay pérdida de información
- Cada estrategia mantiene su estado independiente
- No hay errores de navegación o carga

**Prioridad:** Media

---

### 12.5 Acceso directo mediante URL manipulada

**Pasos:**
1. Copiar URL de estrategia 10: `/survey/{token}/strategies/{strategyId}`
2. Modificar manualmente `strategyId` en la URL
3. Pegar en navegador y acceder

**Resultado esperado:**
- Si el ID es válido, se carga la estrategia correcta
- Si el ID es inválido, se muestra error y redirige
- No hay errores de servidor
- La sesión se mantiene estable

**Prioridad:** Baja

---

### 12.6 Mismo usuario en múltiples pestañas

**Pasos:**
1. Abrir pestaña 1: estrategia 5
2. Abrir pestaña 2: estrategia 10
3. Realizar cambios en pestaña 1
4. Realizar cambios en pestaña 2
5. Refrescar pestaña 1

**Resultado esperado:**
- Ambas pestañas comparten la misma sesión
- Los cambios de pestaña 2 se reflejan en pestaña 1 al refrescar
- No hay conflictos de concurrencia
- El último cambio guardado prevalece

**Prioridad:** Baja

---

### 12.7 Exportación durante envío activo

**Escenario:**
- Usuario 19 ha completado y enviado
- Usuario 20 está enviando justo ahora
- Admin inicia exportación en ese momento exacto

**Pasos:**
1. Admin hace clic en "Exportar Excel"
2. Verificar si datos del usuario 20 se incluyen

**Resultado esperado:**
- La exportación captura el estado del momento de la petición
- Si usuario 20 aún no ha completado el commit, no se incluye
- Si el commit ya ocurrió, se incluye
- No hay inconsistencias en los datos
- El comportamiento es predecible y documentado

**Prioridad:** Baja

---

### 12.8 Cambio rápido de rol antes de enviar

**Pasos:**
1. Completar todas las estrategias
2. Hacer clic en "Enviar encuesta final"
3. Seleccionar rol "Epidemiólogo/a"
4. Hacer clic en "Continuar"
5. En modal de confirmación, hacer clic en "Volver"
6. Cambiar rol a "Entomólogo/a"
7. Confirmar envío

**Resultado esperado:**
- El rol final guardado es "Entomólogo/a" (el último seleccionado)
- No se guarda el rol intermedio
- El flujo permite cambiar de rol antes de confirmar
- El envío se procesa con el rol correcto

**Prioridad:** Baja

---

## 13. Rendimiento

### 13.1 Tiempo de carga inicial de sesión

**Pasos:**
1. Medir tiempo desde que se ingresa token hasta ver lista de estrategias
2. Usar herramientas de desarrollo (Network tab)

**Resultado esperado:**
- Tiempo total: < 3 segundos
- Peticiones principales:
  - GET /api/sessions (< 1s)
  - GET /api/indicators (< 1s)
  - Renderizado UI (< 1s)
- Sin bloqueos perceptibles

**Prioridad:** Media

---

### 13.2 Tiempo de guardado automático

**Pasos:**
1. Realizar cambio en peso de indicador
2. Medir tiempo desde el cambio hasta ver "Guardado HH:MM"

**Resultado esperado:**
- Debounce delay: 1.5 segundos (configurado)
- Tiempo de petición: < 500ms
- Tiempo total: < 2 segundos desde último cambio
- El usuario recibe feedback claro

**Prioridad:** Media

---

### 13.3 Carga de página de resumen

**Precondiciones:**
- Usuario tiene 19 estrategias completas (máximo de datos)

**Pasos:**
1. Navegar a `/survey/{token}/summary`
2. Medir tiempo hasta que el resumen se renderiza completamente

**Resultado esperado:**
- Petición GET summary: < 2s
- Renderizado completo: < 4s total
- Todas las 19 estrategias se muestran
- No hay lag perceptible al scrollear

**Prioridad:** Media

---

### 13.4 Rendimiento de exportación con datos máximos

**Precondiciones:**
- 20 usuarios con 19 estrategias cada uno
- Cada estrategia con promedio de 10 indicadores
- Total: ~3800 registros de respuesta

**Pasos:**
1. Admin hace clic en "Exportar Excel"
2. Medir tiempo hasta descarga

**Resultado esperado:**
- Tiempo de generación: < 10 segundos
- Tamaño de archivo: < 5 MB
- La descarga inicia automáticamente
- No hay timeout del servidor

**Prioridad:** Media

---

### 13.5 Rendimiento de búsqueda de indicadores

**Pasos:**
1. En estrategia, escribir en campo de búsqueda: "índice"
2. Medir tiempo de filtrado

**Resultado esperado:**
- Filtrado instantáneo (< 100ms)
- No hay lag al escribir
- Los resultados se actualizan en tiempo real
- La búsqueda es case-insensitive

**Prioridad:** Baja

---

## 14. Accesibilidad y Experiencia de Usuario

### 14.1 Indicadores visuales claros de progreso

**Pasos:**
1. Completar 8 de 19 estrategias
2. Observar barra de progreso en diferentes páginas

**Resultado esperado:**
- Barra de progreso visible en todas las páginas relevantes
- Colores intuitivos:
  - Verde: completo
  - Ámbar: incompleto
  - Rojo: error
- Texto acompañante claro: "8/19 completadas"

**Prioridad:** Media

---

### 14.2 Mensajes de error en español claro

**Pasos:**
1. Provocar diferentes errores:
   - Token inválido
   - Pesos que no suman 100%
   - Error de conexión
   - Estrategia no encontrada

**Resultado esperado:**
- Todos los mensajes están en español
- Lenguaje claro y comprensible para usuarios no técnicos
- No se exponen códigos de error técnicos
- Se sugiere acción correctiva cuando es posible

**Prioridad:** Alta

---

### 14.3 Confirmaciones para acciones irreversibles

**Pasos:**
1. Intentar enviar encuesta final

**Resultado esperado:**
- Doble confirmación:
  1. Selección de rol
  2. Confirmación explícita con advertencia
- Mensaje claro: "Una vez enviada no podrás modificarla"
- Opción de cancelar en cualquier momento antes de confirmar

**Prioridad:** Alta

---

### 14.4 Indicador de estado de guardado persistente

**Pasos:**
1. Realizar cambios en estrategia
2. Observar indicador de guardado en todo momento

**Resultado esperado:**
- Indicador visible: "Guardando..." durante guardado
- Indicador visible: "Guardado HH:MM:SS" después de completar
- Posición fija y visible (esquina superior derecha)
- El usuario siempre sabe el estado de sus cambios

**Prioridad:** Alta

---

### 14.5 Accesibilidad con teclado

**Pasos:**
1. Navegar usando solo el teclado (Tab, Enter, flechas)
2. Intentar completar una estrategia

**Resultado esperado:**
- Orden de tabulación lógico
- Elementos interactivos reciben foco visible
- Se puede marcar/desmarcar checkboxes con Enter/Space
- Los sliders responden a flechas del teclado
- Se puede navegar sin mouse

**Prioridad:** Baja (según requisitos de accesibilidad)

---

### 14.6 Contrast ratio adecuado

**Pasos:**
1. Verificar contraste de texto con herramientas (ej: WAVE)

**Resultado esperado:**
- Texto cumple con WCAG AA (ratio 4.5:1 para texto normal)
- Títulos y elementos importantes son claramente legibles
- Los estados (deshabilitado, hover, etc.) son distinguibles

**Prioridad:** Baja

---

## 15. Recuperación ante Fallos

### 15.1 Recuperación de sesión después de pérdida total

**Pasos:**
1. Usuario trabaja en 10 estrategias
2. Simular pérdida total de sesión (borrar cookies/storage)
3. Re-acceder con el mismo token

**Resultado esperado:**
- El usuario puede re-autenticarse con su cédula
- El sistema recupera TODA la sesión desde base de datos
- Los 10 estrategias completadas están intactas
- No hay pérdida de información

**Prioridad:** Crítica

---

### 15.2 Manejo de datos corruptos en una estrategia

**Precondiciones:**
- Simular corrupción de datos en estrategia 7

**Pasos:**
1. Usuario intenta acceder a estrategia 7
2. Sistema detecta datos inválidos

**Resultado esperado:**
- Se muestra mensaje de error
- El usuario puede:
  - Resetear solo esa estrategia (perder datos de esa estrategia)
  - Continuar con otras estrategias
- Las otras 18 estrategias NO se ven afectadas

**Prioridad:** Media

---

### 15.3 Backup y restauración de base de datos

**Pasos:**
1. Verificar existencia de backup automático de PostgreSQL
2. Simular pérdida de datos
3. Restaurar desde backup

**Resultado esperado:**
- Existe proceso de backup automático (diario/horario)
- El backup incluye todas las tablas relevantes
- La restauración funciona correctamente
- Se puede recuperar el estado completo del sistema

**Prioridad:** Alta (antes del evento real)

---

### 15.4 Reinicio de servidor durante guardado

**Pasos:**
1. Usuario realiza cambios
2. Justo cuando inicia el guardado automático, reiniciar servidor
3. Servidor vuelve a estar disponible
4. Usuario refrescar página

**Resultado esperado:**
- Si el commit a BD se completó: los datos están guardados
- Si el commit no se completó: los datos se perdieron pero el usuario es notificado
- No hay estado intermedio inconsistente
- El usuario puede reintentar

**Prioridad:** Media

---

### 15.5 Plan de contingencia para fallos el día del evento

**Documentación requerida:**
- Procedimiento para reiniciar servidor rápidamente
- Contacto de soporte técnico disponible
- Backup reciente disponible (< 1 hora antes del evento)
- Plan B: exportación manual de datos parciales si es necesario

**Prioridad:** Crítica

---

## Notas Finales para Ejecución de Pruebas

### Priorización de Escenarios

**Críticos (deben pasar obligatoriamente):**
- 1.4 - Continuidad de sesión
- 1.5 - Acceso después de envío
- 2.4 - Bloqueo con pesos inválidos
- 3.8 - Validación de suma 100%
- 4.1 - Guardado automático básico
- 4.3 - Persistencia después de refrescar
- 4.6 - Guardado al navegar
- 6.4 - Habilitación de envío
- 6.7 - Envío exitoso
- 7.1 - Usuarios simultáneos
- 7.2 - Carga masiva
- 10.1 - Chrome compatibilidad
- 15.1 - Recuperación de sesión

**Altos (muy importantes):**
- Todos los casos de sección 1, 2, 3, 4, 5, 6, 8
- Casos de validación críticos

**Medios (importantes pero no bloqueantes):**
- Casos de UX, rendimiento, exportaciones

**Bajos (nice to have):**
- Edge cases específicos, accesibilidad avanzada

### Recomendaciones

1. **Ejecutar pruebas en orden de prioridad**
2. **Documentar TODOS los fallos encontrados con**:
   - Pasos exactos para reproducir
   - Resultado esperado vs obtenido
   - Screenshots/videos cuando sea relevante
   - Prioridad del bug

3. **Realizar pruebas con datos reales similares**:
   - Usar los 6 tokens de prueba provistos
   - Crear escenarios realistas (expertos completando encuesta)

4. **Verificar compatibilidad en los 3 navegadores principales** (Chrome, Firefox, Safari)

5. **Hacer prueba de carga con 20 usuarios simultáneos** antes del evento real

6. **Tener plan de rollback** en caso de fallo crítico el día del evento

---

**Documento creado para:** Encuesta de Ponderación de Indicadores - Dengue 2025
**Total de escenarios identificados:** 100+
**Versión:** 1.0
**Fecha:** 2025
