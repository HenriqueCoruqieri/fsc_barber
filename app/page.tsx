import { SearchIcon } from "lucide-react"
import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import { Input } from "./_components/ui/input"
import Image from "next/image"

const Home = () => {
  return (
    <div>
      <Header />

      <div className="p-5">
        <h2 className="text-xl font-bold">Olá, Henrique!</h2>
        <p>Segunda-Feira - 05/03</p>

        <div className="mt-6 flex items-center gap-2">
          <Input placeholder="Faça sua busca" />
          <Button size="icon">
            <SearchIcon />
          </Button>
        </div>
      </div>

      <div className="relative mt-6 h-[150px] w-full">
        <Image
          alt="Agende nos melhores com FSC Barber"
          src="/banner-01.png"
          fill
          className="rounded-xl object-cover p-2"
        />
      </div>
    </div>
  )
}

export default Home
