"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"
import SidebarSheet from "./sidebar-sheet"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Sheet, SheetTrigger } from "./ui/sheet"

const Header = () => {
  const pathname = usePathname()

  return (
    <Card className="overflow-visible">
      <CardContent className="flex flex-row items-center justify-between gap-3 p-5">
        <Link href="/" className="min-w-0 shrink">
          <Image alt="FSC Barber" src="/logo.png" height={18} width={120} />
        </Link>

        <Sheet key={pathname}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="shrink-0">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </CardContent>
    </Card>
  )
}

export default Header
