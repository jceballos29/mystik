import * as React from "react"
import { cn } from "@/lib/utils"

type TypographyProps = React.HTMLAttributes<HTMLElement>

const H1 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        "scroll-m-20 text-center font-title text-5xl font-bold tracking-wider text-balance text-primary sm:text-6xl lg:text-7xl",
        className
      )}
      {...props}
    />
  )
)
H1.displayName = "H1"

const H2 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "scroll-m-20 font-title text-5xl font-semibold tracking-wider text-balance text-primary first:mt-0",
        className
      )}
      {...props}
    />
  )
)
H2.displayName = "H2"

const H3 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "scroll-m-20 font-title text-2xl font-semibold tracking-tight text-primary",
        className
      )}
      {...props}
    />
  )
)
H3.displayName = "H3"

const H4 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  )
)
H4.displayName = "H4"

const P = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("leading-7", className)} {...props} />
  )
)
P.displayName = "P"

const Blockquote = React.forwardRef<HTMLQuoteElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}
    />
  )
)
Blockquote.displayName = "Blockquote"

const List = React.forwardRef<HTMLUListElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  )
)
List.displayName = "List"

const InlineCode = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <code
      ref={ref}
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    />
  )
)
InlineCode.displayName = "InlineCode"

const Lead = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    />
  )
)
Lead.displayName = "Lead"

const Large = React.forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
)
Large.displayName = "Large"

const Small = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <small
      ref={ref}
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  )
)
Small.displayName = "Small"

const Muted = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
Muted.displayName = "Muted"

const TableWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-6 w-full overflow-y-auto", className)}
    {...props}
  >
    <table className="w-full">{children}</table>
  </div>
))
TableWrapper.displayName = "TableWrapper"

export const Typography = {
  H1,
  H2,
  H3,
  H4,
  P,
  Blockquote,
  List,
  InlineCode,
  Lead,
  Large,
  Small,
  Muted,
  Table: TableWrapper,
}

export {
  H1 as TypographyH1,
  H2 as TypographyH2,
  H3 as TypographyH3,
  H4 as TypographyH4,
  P as TypographyP,
  Blockquote as TypographyBlockquote,
  List as TypographyList,
  InlineCode as TypographyInlineCode,
  Lead as TypographyLead,
  Large as TypographyLarge,
  Small as TypographySmall,
  Muted as TypographyMuted,
  TableWrapper as TypographyTable,
}
