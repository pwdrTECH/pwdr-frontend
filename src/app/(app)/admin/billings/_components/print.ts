// print.ts
export function handlePrint(target?: HTMLElement | null) {
  const node =
    target ??
    (document.querySelector("[data-print-root='true']") as HTMLElement | null)

  if (!node) return

  // Clone content
  const cloned = node.cloneNode(true) as HTMLElement

  // Remove non-printable elements
  cloned.querySelectorAll("[data-no-print='true']").forEach((el) => {
    el.remove()
  })

  // Create hidden iframe
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) return

  // Prepare document
  doc.open()
  doc.close()

  // Title
  const title = doc.createElement("title")
  title.textContent = document.title
  doc.head.appendChild(title)

  // Copy styles
  document.querySelectorAll("style, link[rel='stylesheet']").forEach((el) => {
    doc.head.appendChild(el.cloneNode(true))
  })

  // Inject printable content
  doc.body.appendChild(cloned)

  // Print
  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 500)
}
