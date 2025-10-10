# Encuesta de Ponderación de Indicadores para Estrategias de Mitigación del Dengue

Plataforma web para que expertos puedan ponderar 69 indicadores epidemiológicos y entomológicos a través de 19 estrategias de mitigación del dengue.

## 📊 Características

- ✅ **19 estrategias de mitigación** con ponderación individual
- ✅ **69 indicadores** epidemiológicos, entomológicos, sociales y operacionales
- ✅ **Guardado automático** cada 1.5 segundos
- ✅ **Validación en tiempo real** (pesos deben sumar 100%)
- ✅ **Panel administrativo** con exportación CSV/Excel
- ✅ **Sistema de tokens** basado en cédulas
- ✅ **Sesiones persistentes** con capacidad de reanudar

## 🚀 Tecnologías

- **Framework**: Next.js 15.5.4 (App Router)
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Estilos**: Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Despliegue**: Vercel
- **Exportación**: ExcelJS para reportes

## 📁 Estructura del Proyecto

```
encuesta/
├── prisma/
│   ├── schema.prisma       # Modelo de base de datos
│   └── seed.ts            # Datos iniciales (indicadores + estrategias)
├── src/
│   ├── app/
│   │   ├── (admin)/       # Rutas protegidas de administración
│   │   │   └── admin/     # Dashboard, exportaciones, sesiones
│   │   ├── (participant)/ # Rutas públicas de participantes
│   │   │   └── survey/    # Login, estrategias, resumen
│   │   └── api/           # API routes
│   │       ├── sessions/  # Gestión de sesiones
│   │       ├── indicators/# Obtener indicadores
│   │       └── admin/     # Endpoints admin
│   ├── components/        # Componentes React reutilizables
│   ├── domain/           # Modelos, constantes, tipos
│   ├── hooks/            # React hooks personalizados
│   ├── lib/              # Utilidades y configuración
│   └── services/         # Lógica de negocio
├── .env                  # Variables de entorno (local)
├── .env.example          # Template de variables
├── DEPLOYMENT.md         # Guía de despliegue en Vercel
└── docker-compose.yml    # PostgreSQL para desarrollo local
```

## 🛠️ Instalación Local

### Pre-requisitos

- Node.js 20+
- Docker (para PostgreSQL)
- npm o pnpm

### Pasos

1. **Clonar repositorio**

```bash
git clone [url-repo]
cd encuesta
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Iniciar PostgreSQL con Docker**

```bash
docker-compose up -d
```

4. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env si es necesario (por defecto usa Docker Compose)
```

5. **Inicializar base de datos**

```bash
# Generar cliente Prisma
npm run db:generate

# Sincronizar esquema
npm run db:push

# Poblar datos iniciales (69 indicadores, 19 estrategias, 6 tokens de prueba)
npm run db:seed
```

6. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🧪 Tokens de Prueba

Durante el desarrollo, puedes usar estos tokens de prueba:

- `123456789` - Epidemiólogo/a
- `987654321` - Entomólogo/a
- `111111111` - Biólogo/a
- `1077841023` - Salud pública
- `123123123` - Gestor/a sanitario
- `321321321` - Otro

**IMPORTANTE**: Elimina estos tokens antes de producción.

## 📝 Flujo de Uso

### Para Participantes

1. Accede a `/survey`
2. Ingresa tu número de cédula (token)
3. El sistema crea o carga tu sesión
4. Completa las 19 estrategias:
   - Selecciona indicadores relevantes
   - Asigna pesos (deben sumar 100%)
   - Usa "Autorrepartir" para distribución equitativa
5. Revisa el resumen
6. Selecciona tu rol profesional
7. Envía la encuesta

### Para Administradores

1. Accede a `/admin/dashboard`
2. Visualiza estadísticas globales
3. Monitorea sesiones activas
4. Exporta resultados en CSV o Excel

## 🗄️ Modelo de Datos

### Entidades Principales

- **Survey**: Encuesta (1 activa)
- **Strategy**: Estrategia de mitigación (19 total)
- **Indicator**: Indicador epidemiológico (69 total)
- **ResponseSession**: Sesión de usuario
- **Response**: Respuesta individual (estrategia + indicador + peso)
- **RespondentInvite**: Token de acceso
- **Respondent**: Participante
- **SessionLog**: Auditoría de eventos

## 📊 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor dev con Turbopack
npm run build            # Build de producción
npm run start            # Inicia servidor producción

# Base de Datos
npm run db:generate      # Genera cliente Prisma
npm run db:push          # Sincroniza esquema (sin migraciones)
npm run db:seed          # Pobla datos iniciales
npm run db:studio        # Abre Prisma Studio (GUI)
npm run db:reset         # Reset completo de BD
npm run db:deploy        # Push + seed (útil para producción)
```

## 🚢 Despliegue en Vercel

Ver **[DEPLOYMENT.md](./DEPLOYMENT.md)** para instrucciones detalladas.

### Resumen Rápido

1. Crea base de datos PostgreSQL (Vercel Postgres, Neon, o Supabase)
2. Configura `DATABASE_URL` en Vercel Environment Variables
3. Deploy desde Git o CLI
4. Ejecuta seed en producción:
   ```bash
   DATABASE_URL='tu-url' npm run db:deploy
   ```

## 🔐 Seguridad

- Los tokens se exponen en URLs (considera tokens aleatorios para mayor seguridad)
- El panel admin NO tiene autenticación por defecto
- Recomendación: Agrega middleware de autenticación antes de producción

## 📈 Exportación de Datos

El panel admin permite exportar:
- **CSV**: Para análisis en Excel/R/Python
- **Excel**: Con formato y múltiples hojas

Incluye:
- Respuestas por sesión
- Pesos por estrategia
- Metadatos del respondent

## 🐛 Troubleshooting

### Error: "Failed to connect to database"
- Verifica que PostgreSQL esté corriendo: `docker ps`
- Revisa DATABASE_URL en .env

### Error: "Prisma Client not found"
- Ejecuta: `npm run db:generate`

### Error: "No strategies found"
- Ejecuta: `npm run db:seed`

### Build falla en Vercel
- Asegúrate de tener `postinstall: "prisma generate"` en package.json (✅ ya está)
- Verifica que DATABASE_URL esté configurado en Vercel

## 📞 Soporte

Para problemas o preguntas sobre la encuesta, contacta al equipo de investigación.

## 📄 Licencia

Uso exclusivo para investigación académica sobre dengue.

---

**Desarrollado para**: Investigación de estrategias de mitigación del dengue
**Stack**: Next.js + PostgreSQL + Prisma + Tailwind CSS
**Despliegue**: Vercel
