import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import FeaturesSection from '@/components/landing/FeaturesSection'
import SectionHeader from '@/components/landing/SectionHeader'

export default function FeaturesPage() {
  return (
    <>
      <SectionHeader
        badge="Product features"
        title="Everything you need to turn learning into active recall"
        description="From Notion sync to adaptive feedback, QuizFlow gives you a complete quiz workflow that feels fast, smart, and classroom-ready."
        actions={
          <>
            <Link to={PATHS.auth.register}>
              <Button size="lg">Start for free</Button>
            </Link>
            <Link to={PATHS.pricing}>
              <Button size="lg" variant="outline">
                View pricing
              </Button>
            </Link>
          </>
        }
      />

      <FeaturesSection
        title="Core capabilities"
        subtitle="Built to support modern learning workflows"
        showCta={false}
      />
    </>
  )
}
