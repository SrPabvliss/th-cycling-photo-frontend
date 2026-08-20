export function triggerDownload(url: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  document.body.appendChild(iframe)
  setTimeout(() => document.body.removeChild(iframe), 10_000)
}
