import { PrismaClient } from "@prisma/client"

const createPrismaClient = () =>
  new PrismaClient({ omit: { user: { password: true } } })

declare global {
  var cachedPrisma: ReturnType<typeof createPrismaClient>
}

let prisma: ReturnType<typeof createPrismaClient>
if (process.env.NODE_ENV == "production") {
  prisma = createPrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient()
  }

  prisma = global.cachedPrisma
}

export const db = prisma
