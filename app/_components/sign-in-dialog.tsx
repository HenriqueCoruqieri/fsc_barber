"use client"

import { useState } from "react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import SignInForm from "./sign-in-form"
import SignUpForm from "./sign-up-form"

type AuthTab = "sign-in" | "sign-up"

interface SignInDialogProps {
  onSuccess?: () => void
}

const TAB_TEXTS: Record<AuthTab, { title: string; description: string }> = {
  "sign-in": {
    title: "Faça seu login na plataforma",
    description: "Entre com seu e-mail e senha ou use sua conta Google",
  },
  "sign-up": {
    title: "Crie sua conta",
    description: "Cadastre-se com e-mail e senha ou use sua conta Google",
  },
}

const SignInDialog = ({ onSuccess }: SignInDialogProps) => {
  const [tab, setTab] = useState<AuthTab>("sign-in")

  const handleLoginWithGoogleClick = () => signIn("google")

  return (
    <>
      <DialogHeader>
        <DialogTitle>{TAB_TEXTS[tab].title}</DialogTitle>
        <DialogDescription>{TAB_TEXTS[tab].description}</DialogDescription>
      </DialogHeader>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as AuthTab)}
        className="w-full gap-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in" className="h-9">
            Entrar
          </TabsTrigger>
          <TabsTrigger value="sign-up" className="h-9">
            Cadastrar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sign-in">
          <SignInForm onSuccess={onSuccess} />
        </TabsContent>
        <TabsContent value="sign-up">
          <SignUpForm
            onSuccess={onSuccess}
            onGoToSignIn={() => setTab("sign-in")}
          />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Separator decorative className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase">ou</span>
        <Separator decorative className="flex-1" />
      </div>

      <Button
        onClick={handleLoginWithGoogleClick}
        variant="secondary"
        className="h-10 w-full bg-violet-500 font-bold text-white"
      >
        <Image alt="" src="/google.svg" width={18} height={18} />
        Continuar com Google
      </Button>
    </>
  )
}

export default SignInDialog
