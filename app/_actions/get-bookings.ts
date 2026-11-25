"use server"

import { endOfDay, startOfDay } from "date-fns"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"

const getBookingsSchema = z.object({
  serviceId: z.uuid("Serviço inválido"),
  date: z.date("Data inválida"),
})

interface GetBookingsProps {
  serviceId: string
  date: Date
}

export const getBookings = async (input: GetBookingsProps) => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return []
  }

  const parsed = getBookingsSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error("Dados inválidos")
  }
  const { date, serviceId } = parsed.data

  return db.booking.findMany({
    where: {
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
      serviceId,
    },
    select: { date: true },
  })
}
