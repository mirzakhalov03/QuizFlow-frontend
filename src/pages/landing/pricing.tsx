import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import PricingCard from '@/components/landing/PricingCard'
import SectionHeader from '@/components/landing/SectionHeader'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started with quiz creation and lightweight practice.',
    features: [
      'Limited quiz generations per month',
      'Standard AI model access',
      'Basic file upload limits',
      'Core question formats',
    ],
    ctaLabel: 'Get started free',
    ctaTo: PATHS.auth.register,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious learners and teams who need speed, quality, and scale.',
    features: [
      'Advanced AI models for quiz generation',
      'Unlimited file uploads',
      'Tailored quiz formats and difficulty levels',
      'Detailed feedback and performance insights',
    ],
    ctaLabel: 'Upgrade to pro',
    ctaTo: PATHS.auth.register,
    highlighted: true,
  },
]

export default function PricingPage() {
  return (
    <>
      <SectionHeader
        badge="Simple pricing"
        title="Choose a plan that matches your study pace"
        description="Start free, then upgrade when you need stronger AI models and unlimited content uploads."
      />

      <section className="container mx-auto px-4 pb-14 sm:pb-16 lg:pb-20">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <div className="border-border bg-muted/40 mx-auto mt-8 max-w-3xl rounded-xl border p-5 text-center sm:p-6">
          <h3 className="text-lg font-semibold">Need a custom plan for your institution?</h3>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            We also support team onboarding and volume discounts for schools and academies.
          </p>
          <Link to={PATHS.contact} className="mt-4 inline-flex">
            <Button variant="outline">Contact sales</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
