import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { CalendarIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import { Avatar, AvatarImage } from "./ui/avatar"
import Link from "next/link"

const Header = () => {
  return (
    <Card>
      <CardContent className="flex flex-row items-center justify-between p-5">
        <Image alt="FSC Barber" src="/logo.png" height={18} width={120} />

        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <MenuIcon />
            </Button>
          </SheetTrigger>
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
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
