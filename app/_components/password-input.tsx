"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { cn } from "../_lib/utils"

interface PasswordInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  "type"
> {
  className?: string
}

const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 h-full"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

export default PasswordInput
