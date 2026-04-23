import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PricingCardProps = {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  ctaLabel: string
  ctaTo: string
  highlighted?: boolean
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  ctaLabel,
  ctaTo,
  highlighted = false,
}: PricingCardProps) {
  return (
    <article
      className={[
        'rounded-2xl border p-6 shadow-sm transition-transform sm:p-7',
        highlighted
          ? 'border-primary bg-primary/5 shadow-[0_16px_45px_-30px_rgba(88,80,236,0.9)]'
          : 'border-border bg-card',
      ].join(' ')}
    >
      {highlighted && (
        <p className="bg-primary text-primary-foreground inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
          Most popular
        </p>
      )}

      <h3 className="mt-3 text-xl font-semibold">{name}</h3>
      <p className="mt-3 flex items-end gap-1">
        <span className="text-4xl leading-none font-bold">{price}</span>
        <span className="text-muted-foreground text-sm">{period}</span>
      </p>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{description}</p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="text-primary mt-0.5" size={16} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link to={ctaTo} className="mt-7 inline-flex w-full">
        <Button size="lg" variant={highlighted ? 'primary' : 'outline'} className="w-full">
          {ctaLabel}
        </Button>
      </Link>
    </article>
  )
}
