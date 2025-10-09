# Plan de Accion — Encuesta unica de indicadores de dengue

## Objetivos del proyecto
- Recopilar ponderaciones de expertos para los 19 escenarios definidos, garantizando que cada escenario tenga pesos que sumen 100%.
- Entregar una experiencia clara y guiada que minimice el abandono y permita retomar la encuesta desde donde se dejo.
- Producir un unico set de resultados exportables en formato tabular para analisis posterior.

## Alcance y supuestos
- Un solo levantamiento de respuestas; no se requiere gestionar multiples encuestas en paralelo.
- Participantes acceden mediante enlaces unicos provistos manualmente.
- Administracion y despliegue realizados por el mismo equipo tecnico; no se preve soporte continuo.
- Se prioriza una implementacion web responsiva (desktop y tablet) sin necesidad de aplicaciones moviles nativas.

## Entregables clave
- Encuesta web funcional con 19 escenarios, selector de indicadores y control de pesos.
- Mecanismo de guardado automatico y reanudacion via token o enlace unico.
- Resumen final previo al envio y exportacion manual de resultados en CSV/JSON.
- Documentacion corta de uso para el equipo de investigacion (flujo de participante y pasos para exportar).

## Plan de implementacion
1. **Kickoff y acuerdos (0.25 dia)**  
   - Reunir equipo para alinear alcance, responsables y ventana de recoleccion.  
   - Confirmar canales de comunicacion, formato de reporte y criterios de exito.  
   - Congelar lista preliminar de escenarios, indicadores y roles para modelado.
2. **Inventario de contenido (0.25 dia)**  
   - Validar textos definitivos: nombre de encuesta, instrucciones, mensajes de error.  
   - Recopilar descripciones de escenarios e indicadores (longitud <= 200 caracteres).  
   - Definir etiquetas de dominio por indicador para filtros rapidos.
3. **Configuracion tecnica base (0.5 dia)**  
   - Inicializar repositorio y entorno (framework, lint, formateo, CI opcional).  
   - Crear estructura de carpetas para front, backend ligero y scripts.  
   - Configurar variables de entorno (DB_URL, TOKEN_SECRET, STORAGE_BUCKET si aplica).
4. **Modelado de datos y migraciones (0.5 dia)**  
   - Escribir esquemas para `survey`, `scenario`, `indicator`, `respondent`, `session`, `response`.  
   - Generar migraciones y sembrar datos iniciales (19 escenarios, 69 indicadores).  
   - Preparar script de importacion CSV por si se requieren ajustes de contenido.
5. **Autenticacion por token y sesiones (0.5 dia)**  
   - Implementar endpoint que valida token unico y crea sesion en estado `draft`.  
   - Definir expiracion configurable y manejo de reintentos fallidos.  
   - Registrar en log cada acceso (timestamp, ip, user agent) para auditoria basica.
6. **Flujo del participante - UI inicial (0.75 dia)**  
   - Construir pantalla de bienvenida con resumen y boton iniciar.  
   - Implementar selector de rol con persistencia en sesion.  
   - Montar wizard de escenarios con navegacion anterior/siguiente y barra de progreso.  
   - Cargar escenarios e indicadores desde API y cachear en memoria/localStorage.
7. **Interaccion de indicadores y pesos (0.75 dia)**  
   - Implementar buscador de indicadores con filtros por rol/tag.  
   - Permitir agregar/quitar indicadores al listado seleccionado.  
   - Configurar sliders o inputs numericos con precision entera y validacion inmediata.  
   - Crear botones auxiliares: copiar pesos del escenario previo, autorrepartir saldo, limpiar.  
   - Bloquear avance si suma != 100 o no hay indicadores seleccionados (salvo "No aplica").
8. **Autosave y reanudacion (0.5 dia)**  
   - Guardar cada cambio (indicadores, pesos, flags) via `PATCH /sessions/:id/draft` con debounce.  
   - Implementar guardado manual "Guardar y salir" que confirma persistencia.  
   - Restaurar estado completo al volver con el mismo token (UI + validaciones).  
   - Manejar conflicto si sesion ya estaba `submitted` mostrando mensaje de cierre.
9. **Resumen y envio final (0.5 dia)**  
   - Construir vista resumen con tabla por escenario, resaltando pendientes o "No aplica".  
   - Implementar checklist de validacion antes de habilitar boton "Enviar respuestas".  
   - Endpoint `POST /sessions/:id/submit` que recalcula sumas, bloquea token y marca timestamp.  
   - Mostrar pantalla de agradecimiento y confirmacion descargable (PDF/HTML simple opcional).
10. **Exportacion y panel minimo (0.5 dia)**  
    - Crear vista/endpoint protegido para administradores con lista de sesiones y estado.  
    - Implementar descarga CSV y JSON siguiendo esquema acordado.  
    - Agregar filtro rapido por rol o fecha de envio y contador de completados vs pendientes.
11. **Pruebas funcionales dirigidas (0.5 dia)**  
    - Pruebas con datos reales en navegadores principales (Chrome/Edge + movil).  
    - Validar escenario feliz, escenario con "No aplica", sumas incorrectas y reanudacion.  
    - Revisar exportaciones generadas y consistencia con base de datos.  
    - Registrar hallazgos y corregir defectos criticos antes de despliegue.
12. **Despliegue y soporte de ejecucion (0.25 dia)**  
    - Preparar entorno de produccion (variables, base limpia, dominios, certificado).  
    - Verificar build y migraciones en produccion, generar tokens de acceso y distribuir.  
    - Activar monitoreo ligero (logs, alertas email) durante ventana de recoleccion.  
    - Plan de contingencia: rollback sencillo o modo lectura si surge incidencia critica.

## Especificaciones funcionales prioritarias
- Suma de pesos por escenario exactamente 100; bloquear navegacion y mostrar mensaje contextual si no se cumple.
- Indicador "No aplica" libera la restriccion de pesos y omite el escenario en exportaciones.
- Autosave cada cambio con confirmacion visual; reintentos en caso de error de red (3 intentos antes de mostrar alerta).
- Reanudacion por token debe restaurar escenario activo, indicadores seleccionados y pesos sin inconsistencias.
- Resumen final con badges de estado (`Completo`, `Incompleto`, `No aplica`) y preventiva de envio si hay errores.
- Validaciones duplicadas en backend para prevenir manipulacion via consola.

## Especificaciones tecnicas y operativas
- Persistencia: tabla de sesiones (estado draft/submitted) y tabla de respuestas con pesos por indicador/escenario.
- Seguridad basica: tokens unicos firmados, expiracion configurada, uso obligatorio de HTTPS en despliegue.
- Validaciones del lado del servidor para sumar pesos y evitar doble envio.
- Registro de eventos clave (inicio de sesion, autosave, envio) para auditoria ligera.
- Exportacion unificada `respondent_id, role, scenario_id, indicator_id, weight, timestamp`.

## Checklist por etapa
- Kickoff: acta de alcance firmada, textos aprobados.
- Configuracion: repositorio listo, entorno reproducible, migraciones aplicadas.
- Desarrollo UI: navegacion completa sin datos; carga dummy funcional.
- Validaciones: pruebas manuales registradas, errores resueltos.
- Exportacion: archivos validados por analista, respaldados en almacenamiento seguro.
- Despliegue: URL final comunicada, tokens enviados, monitoreo activo.

## Pruebas y criterios de aceptacion
- Completar encuesta con indicadores distintos en 3 escenarios y confirmar suma 100 en cada uno.
- Escenario marcado "No aplica" no debe bloquear el envio ni aparecer en la exportacion con pesos.
- Simular interrupcion (cerrar navegador) y retomar con mismo token conservando todo el progreso.
- Verificar que la exportacion entregue un archivo CSV y JSON legible sin campos extra.

## Despliegue y cierre
- Realizar despliegue unico (ej. hosting estatico + backend serverless sencillo) al ambiente acordado.
- Compartir enlaces unicos a los participantes y monitorear finalizacion mediante panel simple de sesiones.
- Tras recibir todas las respuestas, generar exportacion, resguardar archivo y cerrar acceso retirando los enlaces.
