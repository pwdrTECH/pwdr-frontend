type DownloadPdfOptions = {
  fileName?: string
  marginMm?: number
  scale?: number
}

async function loadLibs(): Promise<{
  html2canvas: (el: HTMLElement, opts?: any) => Promise<HTMLCanvasElement>
  jsPDF: typeof import("jspdf").jsPDF
}> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])
  return { html2canvas, jsPDF }
}

function hasUnsupportedColorFn(value: string) {
  const v = value.toLowerCase()
  return (
    v.includes("lab(") ||
    v.includes("oklab(") ||
    v.includes("lch(") ||
    v.includes("oklch(") ||
    v.includes("color-mix(")
  )
}

function kebabCase(prop: string) {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function safeSet(el: HTMLElement, prop: string, value: string) {
  el.style.setProperty(kebabCase(prop), value)
}

/**
 * Force html2canvas-safe inline styles.
 * We do NOT try to preserve exact colors when they use lab/oklch/color-mix.
 * We replace them with safe RGB / disable the effect (gradients/shadows/filters).
 */
function sanitizeElementStyles(el: HTMLElement) {
  const cs = getComputedStyle(el)

  // color-like props
  const colorProps = [
    "color",
    "backgroundColor",
    "borderTopColor",
    "borderRightColor",
    "borderBottomColor",
    "borderLeftColor",
    "outlineColor",
    "textDecorationColor",
    "caretColor",
    "fill",
    "stroke",
  ] as const

  colorProps.forEach((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (cs as any)[p] ?? cs.getPropertyValue(kebabCase(p))
    const value = typeof raw === "string" ? raw.trim() : ""

    if (value) {
      if (hasUnsupportedColorFn(value)) {
        // fallback safe color
        if (p === "backgroundColor") {
          safeSet(el, p, "rgb(255,255,255)")
        } else {
          safeSet(el, p, "rgb(0,0,0)")
        }
      } else {
        // inline computed (usually rgb/rgba) to bypass css vars
        safeSet(el, p, value)
      }
    }
  })

  // background / gradients
  const bgImage = cs.getPropertyValue("background-image")
  if (bgImage && hasUnsupportedColorFn(bgImage)) {
    safeSet(el, "backgroundImage", "none")
    safeSet(el, "backgroundColor", "rgb(255,255,255)")
  } else if (bgImage) {
    safeSet(el, "backgroundImage", bgImage)
  }

  const bg = cs.getPropertyValue("background")
  if (bg && hasUnsupportedColorFn(bg)) {
    safeSet(el, "background", "none")
    safeSet(el, "backgroundColor", "rgb(255,255,255)")
  }

  // shadows
  const boxShadow = cs.getPropertyValue("box-shadow")
  if (boxShadow && hasUnsupportedColorFn(boxShadow)) {
    safeSet(el, "boxShadow", "none")
  } else if (boxShadow) {
    safeSet(el, "boxShadow", boxShadow)
  }

  const textShadow = cs.getPropertyValue("text-shadow")
  if (textShadow && hasUnsupportedColorFn(textShadow)) {
    safeSet(el, "textShadow", "none")
  } else if (textShadow) {
    safeSet(el, "textShadow", textShadow)
  }

  // filters (drop-shadow can include oklch/lab)
  const filter = cs.getPropertyValue("filter")
  if (filter && hasUnsupportedColorFn(filter)) {
    safeSet(el, "filter", "none")
  } else if (filter) {
    safeSet(el, "filter", filter)
  }

  const backdrop = cs.getPropertyValue("backdrop-filter")
  if (backdrop && hasUnsupportedColorFn(backdrop)) {
    safeSet(el, "backdropFilter", "none")
  }

  // border image (rare, but can carry gradients)
  const borderImg = cs.getPropertyValue("border-image-source")
  if (borderImg && hasUnsupportedColorFn(borderImg)) {
    safeSet(el, "borderImageSource", "none")
  }
}

function sanitizeColorsForPdf(root: HTMLElement) {
  sanitizeElementStyles(root)

  const all = root.querySelectorAll<HTMLElement>("*")
  all.forEach((el) => {
    sanitizeElementStyles(el)
  })
}

function injectPdfSafeCss(wrapper: HTMLElement) {
  const style = document.createElement("style")
  style.setAttribute("data-pdf-safe", "true")

  // Important: disable pseudo elements & any “fancy” effects that may still reference lab/oklch
  style.textContent = `
    *::before, *::after {
      content: "" !important;
      background-image: none !important;
      filter: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    /* Gradients can carry lab/oklch; kill them */
    * {
      background-image: none !important;
    }
  `
  wrapper.appendChild(style)
}

/**
 * Downloads a DOM node as a multi-page A4 PDF.
 */
export async function downloadNodeAsPdf(
  node: HTMLElement,
  opts: DownloadPdfOptions = {}
): Promise<void> {
  const { html2canvas, jsPDF } = await loadLibs()

  const fileName = opts.fileName ?? "document.pdf"
  const marginMm = typeof opts.marginMm === "number" ? opts.marginMm : 10
  const scale = typeof opts.scale === "number" ? opts.scale : 2

  const cloned = node.cloneNode(true) as HTMLElement
  cloned.querySelectorAll("[data-no-print='true']").forEach((el) => {
    el.remove()
  })

  const wrapper = document.createElement("div")
  wrapper.style.position = "fixed"
  wrapper.style.left = "-99999px"
  wrapper.style.top = "0"
  wrapper.style.width = `${node.offsetWidth}px`
  wrapper.style.background = "white"
  wrapper.style.padding = "0"
  wrapper.style.margin = "0"
  wrapper.appendChild(cloned)

  document.body.appendChild(wrapper)

  try {
    // ✅ stop pseudo/gradients from reintroducing lab()
    injectPdfSafeCss(wrapper)

    // ✅ inline sanitize (works because clone is mounted)
    sanitizeColorsForPdf(cloned)

    const canvas = await html2canvas(cloned, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: cloned.scrollWidth,
      windowHeight: cloned.scrollHeight,
    })

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    })

    const pageWidthMm = pdf.internal.pageSize.getWidth()
    const pageHeightMm = pdf.internal.pageSize.getHeight()

    const usableWidthMm = pageWidthMm - marginMm * 2
    const usableHeightMm = pageHeightMm - marginMm * 2

    const imgData = canvas.toDataURL("image/png", 1.0)

    const canvasWidthPx = canvas.width
    const canvasHeightPx = canvas.height

    const imgWidthMm = usableWidthMm
    const imgHeightMm = (canvasHeightPx * imgWidthMm) / canvasWidthPx

    if (imgHeightMm <= usableHeightMm) {
      pdf.addImage(imgData, "PNG", marginMm, marginMm, imgWidthMm, imgHeightMm)
      pdf.save(fileName)
      return
    }

    let remainingHeightMm = imgHeightMm
    let pageIndex = 0

    while (remainingHeightMm > 0) {
      if (pageIndex > 0) pdf.addPage()

      const offsetMm = usableHeightMm * pageIndex

      pdf.addImage(
        imgData,
        "PNG",
        marginMm,
        marginMm - offsetMm,
        imgWidthMm,
        imgHeightMm
      )

      remainingHeightMm -= usableHeightMm
      pageIndex += 1
    }

    pdf.save(fileName)
  } finally {
    document.body.removeChild(wrapper)
  }
}
