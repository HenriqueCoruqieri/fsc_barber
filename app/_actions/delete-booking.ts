"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"

const bookingIdSchema = z.uuid("Reserva inválida")

export const deleteBooking = async (bookingId: string) => {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    throw new Error("Usuário não autenticado")
  }

  const parsed = bookingIdSchema.safeParse(bookingId)
  if (!parsed.success) {
    throw new Error("Reserva inválida")
  }

  const { count } = await db.booking.deleteMany({
    where: {
      id: parsed.data,
      userId,
    },
  })
  if (count === 0) {
    throw new Error("Reserva não encontrada")
  }

  revalidatePath("/bookings")
}
