import { toPng } from 'html-to-image'

/**
 * Snapshots a DOM node to a PNG and shares it: Web Share API with the image file
 * where supported (mobile), otherwise triggers a download. Returns false if the
 * snapshot itself failed.
 */
export async function shareResultImage(node: HTMLElement, fileName: string): Promise<boolean> {
  let dataUrl: string
  try {
    dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
  } catch {
    return false
  }

  const blob = await (await fetch(dataUrl)).blob()
  const file = new File([blob], fileName, { type: 'image/png' })

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'My quiz result' })
      return true
    } catch {
      // user cancelled or share failed — fall through to download
    }
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
  return true
}
