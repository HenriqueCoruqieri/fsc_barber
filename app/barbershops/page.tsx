import BarbershopItem from "../_components/barbershop-item"
import Header from "../_components/header"
import Search from "../_components/search"
import { db } from "../_lib/prisma"

interface BarbershopPageProps {
  searchParams: Promise<{
    title?: string
    service?: string
  }>
}

const BarbershopPage = async ({ searchParams }: BarbershopPageProps) => {
  const { title = "", service = "" } = await searchParams
  const queryLabel = title || service
  const filters = [
    ...(title
      ? [
          {
            name: {
              contains: title,
              mode: "insensitive" as const,
            },
          },
        ]
      : []),
    ...(service
      ? [
          {
            services: {
              some: {
                name: {
                  contains: service,
                  mode: "insensitive" as const,
                },
              },
            },
          },
        ]
      : []),
  ]

  const barbershops = await db.barbershop.findMany({
    where: filters.length ? { OR: filters } : undefined,
  })
  return (
    <div className="mb-4">
      <Header />
      <div className="my-6 px-5">
        <Search />
      </div>

      <div className="px-5">
        <h2 className="mt-6 mb-3 text-xs font-bold text-gray-400 uppercase">
          resultados para &quot;{queryLabel}&quot;
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BarbershopPage
