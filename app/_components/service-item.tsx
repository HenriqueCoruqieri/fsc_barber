"use client"

import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useState } from "react"
import { addDays, format, set } from "date-fns"
import { Barbershop, Booking, User } from "@prisma/client"
import { createBooking } from "../_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"

export type ServiceItemService = {
  id: string
  name: string
  description: string
  imageUrl: string
  barbershopId: string
  price: number
}

interface ServiceItemProps {
  service: ServiceItemService
  barbershop: Pick<Barbershop, "name">
}

const TIME_LIST = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
]

const getTimeList = (bookings: Booking[]) => {
  return TIME_LIST.filter((time) => {
    const hour = Number(time.split(":")[0])
    const minutes = Number(time.split(":")[1])

    const hasBookingOnCurrentTime = bookings.some(
      (booking) =>
        booking.date.getHours() == hour && booking.date.getMinutes() == minutes,
    )

    if (hasBookingOnCurrentTime) {
      return false
    }
    return true
  })
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { data } = useSession()
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )

  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState()

  useEffect(() => {
    const fetch = async () => {
      if (!selectedDay) return
      const bookings = await getBookings({
        date: selectedDay,
        serviceId: service.id,
      })
      setDayBookings(bookings)
    }
    fetch()
  }, [selectedDay, service.id])

  const handleBookingSheetOpenChange = () => {
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
  }

  const handleTimeSelect = (time: string | undefined) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDay || !selectedTime) return
      const hour = Number(selectedTime?.split(":")[0])
      const minute = Number(selectedTime?.split(":")[1])
      const newDate = set(selectedDay, {
        minutes: minute,
        hours: hour,
      })
      await createBooking({
        serviceId: service.id,
        userId: (data?.user as User).id,
        date: newDate,
      })
      handleBookingSheetOpenChange()
      toast.success("Reserva concluída!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar reserva")
    }
  }

  return (
    <Card>
      <CardContent className="flex items-stretch gap-3">
        <div className="relative max-h-[110px] min-h-[110px] max-w-[110px] min-w-[110px] shrink-0">
          {/* IMAGEM DO SERVIÇO */}
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="rounded-lg object-cover"
          />
        </div>

        {/* INFORMAÇÕES DO SERVIÇO */}
        <div className="flex min-h-[110px] min-w-0 flex-1 flex-col gap-2">
          <h3 className="text-sm font-semibold">{service.name}</h3>
          <p className="text-sm text-gray-400">{service.description}</p>

          {/* PREÇO E BOTÃO */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-violet-500">
              {Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(service.price)}
            </p>

            <Sheet
              open={bookingSheetIsOpen}
              onOpenChange={handleBookingSheetOpenChange}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBookingSheetIsOpen(true)}
              >
                Reservar
              </Button>

              <SheetContent>
                <SheetHeader className="text-center text-2xl font-semibold">
                  Fazer Reserva
                </SheetHeader>

                <div className="border-b border-solid">
                  <Calendar
                    variant="booking"
                    mode="single"
                    locale={ptBR}
                    selected={selectedDay}
                    onSelect={handleDateSelect}
                    fromDate={addDays(new Date(), 1)}
                  />
                </div>

                {selectedDay && (
                  <div className="flex gap-3 overflow-x-auto border-b border-solid p-4 [&::-webkit-scrollbar]:hidden">
                    {getTimeList(dayBookings).map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime == time ? "default" : "outline"}
                        className="rounded-full bg-violet-500 text-white"
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}

                {selectedTime && selectedDay && (
                  <div className="p-5">
                    <Card>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h2 className="font-bold">{service.name}</h2>
                          <p className="text-sm font-bold">
                            {Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(service.price))}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <h2 className="text-sm text-gray-400">Data</h2>
                          <p className="text-sm">
                            {format(selectedDay, "d 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <h2 className="text-sm text-gray-400">Horário</h2>
                          <p className="text-sm">{selectedTime}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <h2 className="text-sm text-gray-400">Barbearia</h2>
                          <p className="text-sm">{barbershop.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <SheetFooter className="px-5">
                  <SheetClose asChild>
                    <Button
                      className="bg-violet-500 text-white"
                      onClick={handleCreateBooking}
                      disabled={!selectedDay || !selectedTime}
                    >
                      Confirmar
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
