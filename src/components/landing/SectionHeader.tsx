import type { ReactNode } from 'react'

type SectionHeaderProps = {
  badge: string
  title: string
  description: string
  actions?: ReactNode
}

export default function SectionHeader({ badge, title, description, actions }: SectionHeaderProps) {
  return (
    <section className="container mx-auto px-4 pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
          {badge}
        </p>
        <h1 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
          {description}
        </p>
        {actions && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{actions}</div>
        )}
      </div>
    </section>
  )
}
