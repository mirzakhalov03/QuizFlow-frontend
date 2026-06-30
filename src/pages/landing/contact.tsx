import { useForm } from 'react-hook-form'
import { Mail, MessageCircle, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePost } from '@/hooks/usePost'
import { toast } from '@/lib/toast'
import { CONTACT } from '@/constants/api-endpoints'
import SectionHeader from '../../components/landing/SectionHeader'

const channels = [
  {
    icon: Mail,
    title: 'Email us',
    value: 'javohirmirzakhalov@gmail.com',
    href: 'mailto:javohirmirzakhalov@gmail.com',
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
    value: '+998 94 158 31 58',
    href: 'tel:+998941583158',
    caption: 'For urgent onboarding requests.',
  },
]

type ContactForm = {
  name: string
  email: string
  message: string
}

const fieldClass = 'border-border bg-background rounded-md border px-3'

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>()

  const { mutate, isPending } = usePost<ContactForm>({
    onError: () => toast.error('Could not send your message. Please try again.'),
  })

  const onSubmit = (data: ContactForm) => {
    mutate(CONTACT, data, {
      onSuccess: () => {
        toast.success('Message sent — we will get back to you shortly.')
        reset()
      },
    })
  }

  return (
    <>
      <SectionHeader
        badge="Contact"
        title="Need help choosing the right quiz workflow?"
        description="Reach out and our team will help you set up a personalized learning experience."
      />

      <section className="container mx-auto grid gap-6 px-4 pb-14 sm:pb-16 md:grid-cols-[1fr_1.1fr] lg:pb-20">
        <div className="space-y-4">
          {channels.map(({ icon: Icon, title, value, href, caption }) => (
            <article key={title} className="border-border bg-card rounded-xl border p-5 shadow-sm">
              <Icon className="text-primary" size={20} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              {href ? (
                <a
                  href={href}
                  className="text-primary mt-1 block text-sm font-medium break-all hover:underline"
                >
                  {value}
                </a>
              ) : (
                <p className="mt-1 text-sm font-medium">{value}</p>
              )}
              <p className="text-muted-foreground mt-1 text-sm">{caption}</p>
            </article>
          ))}
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="border-border bg-card rounded-xl border p-5 shadow-sm sm:p-6"
        >
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
                className={`${fieldClass} h-10`}
                {...register('name', {
                  required: 'Name is required',
                  maxLength: { value: 100, message: 'Name is too long' },
                })}
              />
              {errors.name && (
                <span className="text-destructive text-xs">{errors.name.message}</span>
              )}
            </label>

            <label className="grid gap-1.5 text-sm">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                className={`${fieldClass} h-10`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && (
                <span className="text-destructive text-xs">{errors.email.message}</span>
              )}
            </label>

            <label className="grid gap-1.5 text-sm">
              Message
              <textarea
                rows={5}
                placeholder="How can QuizFlow help your learning goals?"
                className={`${fieldClass} py-2`}
                {...register('message', {
                  required: 'Message is required',
                  maxLength: { value: 2000, message: 'Message is too long' },
                })}
              />
              {errors.message && (
                <span className="text-destructive text-xs">{errors.message.message}</span>
              )}
            </label>

            <Button type="submit" loading={isPending} className="w-full sm:w-fit">
              Send message
            </Button>
          </div>
        </form>
      </section>
    </>
  )
}
