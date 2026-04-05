import { BarbershopService } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

interface ServiceItemProps {
  service: BarbershopService
}

const ServiceItem = ({ service }: ServiceItemProps) => {
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
              }).format(service.price.toNumber())}
            </p>

            <Button variant="secondary" size="sm">
              Reservar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ServiceItem
