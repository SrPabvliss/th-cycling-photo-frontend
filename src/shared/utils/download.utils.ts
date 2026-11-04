export function triggerDownload(url: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)
  setTimeout(() => document.body.removeChild(iframe), 10_000)
}

export function openSignedUrl(url: string): void {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
