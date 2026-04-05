import Image from "next/image"
import { Button } from "./ui/button"
import { CalendarIcon, HomeIcon, LogOutIcon } from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import { Avatar, AvatarImage } from "./ui/avatar"
import Link from "next/link"

const SidebarSheet = () => {
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex items-center gap-3 border-b border-solid p-5">
        <Avatar size="lg">
          <AvatarImage />
        </Avatar>

        <div>
          <p className="font-bold">Henrique Oliveira</p>
          <p className="text-sm text-gray-400">heoliveirac@gmail.com</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-b border-solid p-4">
        <SheetClose asChild>
          <Button className="justify-start" variant="ghost" asChild>
            <Link href="/">
              <HomeIcon />
              Inicio
            </Link>
          </Button>
        </SheetClose>

        <Button className="justify-start" variant="ghost">
          <CalendarIcon />
          Agendamentos
        </Button>
      </div>

      <div className="flex flex-col gap-4 border-b border-solid p-4">
        {quickSearchOptions.map((option) => (
          <Button
            key={option.title}
            className="justify-start gap-2"
            variant="ghost"
          >
            <Image
              alt={option.title}
              src={option.imageUrl}
              height={18}
              width={18}
            />
            {option.title}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-4 border-b border-solid p-4">
        <Button variant="ghost" className="justify-start gap-2">
          <LogOutIcon />
          Sair
        </Button>
      </div>
    </SheetContent>
  )
}

export default SidebarSheet
