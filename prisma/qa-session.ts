import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { encode } from "next-auth/jwt";

try {
  process.loadEnvFile();
} catch {}

const QA_USERS = [
  { email: "qa1@fsc-barber.test", name: "QA Tester 1" },
  { email: "qa2@fsc-barber.test", name: "QA Tester 2" },
];

interface QaOutputUser {
  email: string;
  name: string;
  userId: string;
  sessionToken?: string;
  expires?: string;
  password?: string;
}

const QA_GOOGLE = {
  email: "qa-google@fsc-barber.test",
  name: "QA Google",
  providerAccountId: "qa-google-fixture",
};

const SIGNUP_EMAIL_PREFIX = "qa-signup-";
const EMAIL_DOMAIN = "@fsc-barber.test";
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;
const BCRYPT_COST = 10;

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "Recusado: qa:session não pode rodar com NODE_ENV=production.",
    );
    process.exit(1);
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("NEXTAUTH_SECRET ausente: defina a variável no .env.");
    process.exit(1);
  }

  const reset = process.argv.includes("--reset");
  const prisma = new PrismaClient();

  try {
    const users = [];
    for (const qa of QA_USERS) {
      const password = `${randomBytes(12).toString("base64url")}a1`;
      const passwordHash = await hash(password, BCRYPT_COST);
      const user = await prisma.user.upsert({
        where: { email: qa.email },
        update: { name: qa.name, password: passwordHash },
        create: { email: qa.email, name: qa.name, password: passwordHash },
      });
      users.push({ id: user.id, email: qa.email, name: qa.name, password });
    }

    const googleUser = await prisma.user.upsert({
      where: { email: QA_GOOGLE.email },
      update: { name: QA_GOOGLE.name, password: null },
      create: { email: QA_GOOGLE.email, name: QA_GOOGLE.name },
    });
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: QA_GOOGLE.providerAccountId,
        },
      },
      update: {},
      create: {
        userId: googleUser.id,
        type: "oauth",
        provider: "google",
        providerAccountId: QA_GOOGLE.providerAccountId,
      },
    });

    const qaUserIds = [...users.map((user) => user.id), googleUser.id];

    if (reset) {
      const signupUsers = await prisma.user.findMany({
        where: {
          email: { startsWith: SIGNUP_EMAIL_PREFIX, endsWith: EMAIL_DOMAIN },
        },
        select: { id: true },
      });
      const signupIds = signupUsers.map((user) => user.id);

      const { count } = await prisma.booking.deleteMany({
        where: { userId: { in: [...qaUserIds, ...signupIds] } },
      });
      console.error(`Reservas dos usuários QA removidas: ${count}`);

      const { count: removedUsers } = await prisma.user.deleteMany({
        where: { id: { in: signupIds } },
      });
      console.error(`Usuários qa-signup removidos: ${removedUsers}`);
    }

    await prisma.session.deleteMany({ where: { userId: { in: qaUserIds } } });

    const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const output: QaOutputUser[] = [];
    for (const user of users) {
      const sessionToken = await encode({
        token: {
          sub: user.id,
          name: user.name,
          email: user.email,
          picture: null,
        },
        secret,
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
      output.push({
        email: user.email,
        name: user.name,
        userId: user.id,
        sessionToken,
        expires: expires.toISOString(),
        password: user.password,
      });
    }
    output.push({
      email: QA_GOOGLE.email,
      name: QA_GOOGLE.name,
      userId: googleUser.id,
    });

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
