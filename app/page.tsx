import { SearchIcon } from "lucide-react"
import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import { Input } from "./_components/ui/input"
import Image from "next/image"
import { Card, CardContent } from "./_components/ui/card"
import { Badge } from "./_components/ui/badge"
import { Avatar, AvatarImage } from "./_components/ui/avatar"

const Home = () => {
  return (
    <div>
      {/* HEADER */}
      <Header />
      <div className="p-4">
        <h2 className="text-xl font-bold">Olá, Henrique!</h2>
        <p>Segunda-Feira - 05/03</p>

        {/* BUSCA */}
        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Faça sua busca" />
          <Button size="icon">
            <SearchIcon />
          </Button>
        </div>

        {/* BANNER */}
        <div className="relative mt-6 h-[150px] w-full">
          <Image
            alt="Agende nos melhores com FSC Barber"
            src="/banner-01.png"
            fill
            className="rounded-xl object-cover p-2"
          />
        </div>

        {/* AGENDAMENTO */}
        <Card className="mt-6">
          <CardContent className="p- flex justify-between p-0">
            {/* ESQUERDA */}
            <div className="flex flex-col gap-2 py-4 pl-5">
              <Badge className="w-fit">Confirmado</Badge>
              <h3 className="font-semibold">Cortes de Cabelo</h3>

              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png" />
                </Avatar>
                <p className="text-sm">Barbearia FSC</p>
              </div>
            </div>

            {/* DIREITA */}
            <div className="item-center flex flex-col justify-center border-l-3 border-solid px-7">
              <p className="text-sm">Agosto</p>
              <p className="text-2xl">05</p>
              <p className="text-sm">20:00</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home
