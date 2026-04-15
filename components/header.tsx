import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

export function Header({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn("absolute inset-x-0 top-0 z-50", className)}
      {...props}
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </nav>
    </header>
  )
}
