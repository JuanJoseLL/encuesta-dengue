import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista de emails de usuarios de prueba
const TEST_USER_EMAILS = [
  'user2@email.com',
  'prueba@prueba.com',
  'user1@email.com',
  'usuario10@email.com',
  'dfosorio@icesi.edu.co',
  'juank123ganzalez@gmail.com'
];

async function main() {
  console.log('🔍 Buscando usuarios de prueba...\n');

  // Buscar los usuarios de prueba
  const testUsers = await prisma.respondent.findMany({
    where: {
      email: {
        in: TEST_USER_EMAILS
      }
    },
    include: {
      sessions: {
        include: {
          _count: {
            select: {
              responses: true,
              secondIterationResponses: true,
              logs: true
            }
          }
        }
      }
    }
  });

  if (testUsers.length === 0) {
    console.log('❌ No se encontraron usuarios de prueba con esos emails.');
    return;
  }

  console.log(`✅ Encontrados ${testUsers.length} usuarios de prueba:\n`);

  // Mostrar información de los usuarios y sus respuestas
  let totalSessions = 0;
  let totalResponses = 0;
  let totalSecondIterationResponses = 0;
  let totalLogs = 0;

  testUsers.forEach((user) => {
    const sessionsCount = user.sessions.length;
    const responsesCount = user.sessions.reduce(
      (sum, session) => sum + session._count.responses,
      0
    );
    const secondIterResponsesCount = user.sessions.reduce(
      (sum, session) => sum + session._count.secondIterationResponses,
      0
    );
    const logsCount = user.sessions.reduce(
      (sum, session) => sum + session._count.logs,
      0
    );

    totalSessions += sessionsCount;
    totalResponses += responsesCount;
    totalSecondIterationResponses += secondIterResponsesCount;
    totalLogs += logsCount;

    console.log(`📧 ${user.email}`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Nombre: ${user.name}`);
    console.log(`   - Sesiones: ${sessionsCount}`);
    console.log(`   - Respuestas (1ra iteración): ${responsesCount}`);
    console.log(`   - Respuestas (2da iteración): ${secondIterResponsesCount}`);
    console.log(`   - Logs: ${logsCount}\n`);
  });

  console.log('📊 TOTALES A ELIMINAR:');
  console.log(`   - ${totalSessions} sesiones`);
  console.log(`   - ${totalResponses} respuestas (1ra iteración)`);
  console.log(`   - ${totalSecondIterationResponses} respuestas (2da iteración)`);
  console.log(`   - ${totalLogs} logs\n`);

  console.log('⚠️  IMPORTANTE: Los usuarios NO serán eliminados, solo sus respuestas.\n');

  // Confirmar antes de eliminar
  console.log('🗑️  Eliminando las sesiones de respuesta (esto eliminará automáticamente todas las respuestas asociadas)...\n');

  // Eliminar las sesiones (esto eliminará en cascada Response, SecondIterationResponse y SessionLog)
  const deleteResult = await prisma.responseSession.deleteMany({
    where: {
      respondentId: {
        in: testUsers.map((u) => u.id)
      }
    }
  });

  console.log(`✅ Eliminadas ${deleteResult.count} sesiones de respuesta exitosamente.`);
  console.log('✅ Todas las respuestas asociadas fueron eliminadas automáticamente por cascada.');
  console.log('✅ Los usuarios siguen existiendo en el sistema.\n');

  // Verificar que los usuarios siguen existiendo
  const remainingUsers = await prisma.respondent.findMany({
    where: {
      email: {
        in: TEST_USER_EMAILS
      }
    },
    select: {
      email: true,
      name: true,
      _count: {
        select: {
          sessions: true
        }
      }
    }
  });

  console.log('📋 Verificación - Usuarios que siguen en el sistema:');
  remainingUsers.forEach((user) => {
    console.log(`   ✓ ${user.email} (${user.name}) - ${user._count.sessions} sesiones`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
