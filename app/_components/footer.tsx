import { Card, CardContent } from "./ui/card"

const Footer = () => {
  return (
    <footer>
      <Card>
        <CardContent className="px-5 py-2">
          <p className="text-sm text-gray-400">
            © 2026 Copyright <span className="font-bold">FSC Barber</span>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
