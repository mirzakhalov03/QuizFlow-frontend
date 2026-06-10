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
  // Opened synchronously on the click so it isn't caught by popup blockers.
  // No `noopener` — we need to keep the reference to point it at the blob later.
  const tab = window.open('', '_blank')
  if (tab) {
    tab.document.title = 'Generating PDF...'
    tab.document.body.innerHTML =
      '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;">Generating PDF, please wait...</div>'
  }

  try {
    // `responseType: 'blob'` already gives us a Blob, so no need to re-wrap it.
    const res = await api.get(QUIZ_PDF(quizId), { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)

    if (tab) {
      tab.location.href = url
    } else {
      // Popup was blocked — fall back to a direct download so the user keeps
      // their current app state instead of navigating the tab away.
      const link = document.createElement('a')
      link.href = url
      link.download = `quiz-${quizId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Give the viewer time to load before releasing the object URL.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    tab?.close()
    toast.error('Could not generate the PDF. Please try again.')
  }
}
