/**
 * Pasted text is delivered to the backend as a plain-text file, not a new API
 * shape: `text/plain` is already an accepted upload MIME type and the Lambda's
 * extractor falls through to UTF-8 for anything that isn't PDF/DOCX/PPTX. So a
 * paste rides the exact same presign → S3 → generate path a real upload does.
 */

/** Shorter than this and the model has nothing to build a quiz from. */
export const PASTED_TEXT_MIN = 200

/** Roughly 12k tokens — comfortably inside every supported model's context. */
export const PASTED_TEXT_MAX = 50_000

export const PASTED_TEXT_FILENAME = 'pasted-text.txt'

/** Human-readable source name, used for the pending-job card title. */
export const PASTED_TEXT_LABEL = 'pasted text'

export const pastedTextToFile = (text: string): File =>
  new File([text.trim()], PASTED_TEXT_FILENAME, { type: 'text/plain' })

/**
 * Validates pasted content for the create-quiz form. Returns an error message,
 * or `true` when valid — the shape react-hook-form's `validate` rule expects.
 */
export const validatePastedText = (text: string | undefined): string | true => {
  const length = text?.trim().length ?? 0
  if (length === 0) return 'Paste some content to generate a quiz from'
  if (length < PASTED_TEXT_MIN) return `Add a bit more — at least ${PASTED_TEXT_MIN} characters`
  if (length > PASTED_TEXT_MAX)
    return `That's too long — keep it under ${PASTED_TEXT_MAX.toLocaleString()} characters`
  return true
}
