import { Mail, MessageCircle, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SectionHeader from '../../components/landing/SectionHeader'

const channels = [
  {
    icon: Mail,
    title: 'Email us',
    value: 'support@quizflow.ai',
    caption: 'Best for account and billing questions.',
  },
  {
    icon: MessageCircle,
    title: 'Live chat',
    value: 'Available 09:00-18:00',
    caption: 'Fastest way to get product guidance.',
  },
  {
    icon: PhoneCall,
    title: 'Call support',
    value: '+1 (800) 123-7788',
    caption: 'For urgent onboarding requests.',
  },
]

export default function ContactPage() {
  return (
    <>
      <SectionHeader
        badge="Contact"
        title="Need help choosing the right quiz workflow?"
        description="Reach out and our team will help you set up a personalized learning experience."
      />

      <section className="container mx-auto grid gap-6 px-4 pb-14 sm:pb-16 md:grid-cols-[1fr_1.1fr] lg:pb-20">
        <div className="space-y-4">
          {channels.map(({ icon: Icon, title, value, caption }) => (
            <article key={title} className="border-border bg-card rounded-xl border p-5 shadow-sm">
              <Icon className="text-primary" size={20} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm font-medium">{value}</p>
              <p className="text-muted-foreground mt-1 text-sm">{caption}</p>
            </article>
          ))}
        </div>

        <form className="border-border bg-card rounded-xl border p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold">Send us a message</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tell us what you are building and we will get back shortly.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm">
              Full name
              <input
                type="text"
                placeholder="John Doe"
                className="border-border bg-background h-10 rounded-md border px-3"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                className="border-border bg-background h-10 rounded-md border px-3"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              Message
              <textarea
                rows={5}
                placeholder="How can QuizFlow help your learning goals?"
                className="border-border bg-background rounded-md border px-3 py-2"
              />
            </label>

            <Button type="button" className="w-full sm:w-fit">
              Send message
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}
