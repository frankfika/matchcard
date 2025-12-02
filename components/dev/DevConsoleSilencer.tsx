'use client'

import { useEffect } from 'react'

export default function DevConsoleSilencer() {
  useEffect(() => {
    const origError = console.error
    const origWarn = console.warn
    const origLog = console.log
    const origDebug = console.debug
    const patterns = [
      /net::ERR_ABORTED/i,
      /errors\.authjs\.dev#autherror/i,
      /\/_rsc=/i,
      /webpack\.hot-update/i,
      /ide_webview_request_time=/i,
      /\/dashboard\?_rsc=/i,
      /fetch-server-response\.js/i,
    ]

    const shouldSilence = (args: unknown[]) => {
      try {
        const str = args && args.length ? String(args[0]) : ''
        return patterns.some((p) => p.test(str))
      } catch {
        return false
      }
    }

    console.error = (...args: unknown[]) => {
      if (shouldSilence(args)) return
      origError(...args)
    }
    console.warn = (...args: unknown[]) => {
      if (shouldSilence(args)) return
      origWarn(...args)
    }
    console.log = (...args: unknown[]) => {
      if (shouldSilence(args)) return
      origLog(...args)
    }
    console.debug = (...args: unknown[]) => {
      if (shouldSilence(args)) return
      origDebug(...args)
    }

    const errorHandler = (e: ErrorEvent) => {
      const msg = String(e.message ?? (e.error as unknown) ?? '')
      if (patterns.some((p) => p.test(msg))) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      const msg = String((e.reason as unknown) ?? '')
      if (patterns.some((p) => p.test(msg))) {
        e.preventDefault()
        e.stopImmediatePropagation()
      }
    }
    window.addEventListener('error', errorHandler, true)
    window.addEventListener('unhandledrejection', rejectionHandler, true)

    return () => {
      console.error = origError
      console.warn = origWarn
      console.log = origLog
      console.debug = origDebug
      window.removeEventListener('error', errorHandler, true)
      window.removeEventListener('unhandledrejection', rejectionHandler, true)
    }
  }, [])

  return null
}
