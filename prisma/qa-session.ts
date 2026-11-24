import { PrismaClient, type User } from "@prisma/client";
import { randomUUID } from "node:crypto";

try {
  process.loadEnvFile();
} catch {
  // .env ausente: usa as variáveis do ambiente
}

const QA_USERS = [
  { email: "qa1@fsc-barber.test", name: "QA Tester 1" },
  { email: "qa2@fsc-barber.test", name: "QA Tester 2" },
];

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "Recusado: qa:session não pode rodar com NODE_ENV=production.",
    );
    process.exit(1);
  }

  const reset = process.argv.includes("--reset");
  const prisma = new PrismaClient();

  try {
    const users: User[] = [];
    for (const qa of QA_USERS) {
      const user = await prisma.user.upsert({
        where: { email: qa.email },
        update: { name: qa.name },
        create: { email: qa.email, name: qa.name },
      });
      users.push(user);
    }
    const userIds = users.map((user) => user.id);

    if (reset) {
      const { count } = await prisma.booking.deleteMany({
        where: { userId: { in: userIds } },
      });
      console.error(`Reservas dos usuários QA removidas: ${count}`);
    }

    const sessions = await prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId: { in: userIds } } });
      return Promise.all(
        users.map((user) =>
          tx.session.create({
            data: {
              userId: user.id,
              sessionToken: randomUUID(),
              expires: new Date(Date.now() + SESSION_TTL_MS),
            },
          }),
        ),
      );
    });

    const output = users.map((user, index) => ({
      email: user.email,
      name: user.name,
      userId: user.id,
      sessionToken: sessions[index].sessionToken,
      expires: sessions[index].expires.toISOString(),
    }));

    console.error("Sessões de teste criadas.");
    console.log(
      JSON.stringify(
        {
          baseUrl: "http://localhost:3000",
          cookieName: "next-auth.session-token",
          users: output,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Erro ao criar sessões de teste:", error);
  process.exit(1);
});
