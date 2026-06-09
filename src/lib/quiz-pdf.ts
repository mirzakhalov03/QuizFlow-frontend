import { api } from '@/api/axios-instance'
import { QUIZ_PDF } from '@/constants/api-endpoints'
import { toast } from '@/lib/toast'

/**
 * Fetches the server-rendered (Puppeteer) PDF for a quiz and opens it in a new
 * tab, where the browser's PDF viewer shows it and offers a download. The tab
 * is opened synchronously on the click so it isn't caught by popup blockers,
 * then pointed at the blob once the request resolves.
 */
export async function openQuizPdf(quizId: string) {
  const tab = window.open('', '_blank', 'noopener,noreferrer')

  try {
    const res = await api.get(QUIZ_PDF(quizId), { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))

    if (tab) {
      tab.location.href = url
    } else {
      // Popup was blocked — fall back to navigating the current tab.
      window.location.href = url
    }

    // Give the viewer time to load before releasing the object URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    tab?.close()
    toast.error('Could not generate the PDF. Please try again.')
  }
}
