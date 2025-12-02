import NextLink, { type LinkProps } from 'next/link'
import type { ReactNode } from 'react'

type Props = LinkProps & { children: ReactNode; className?: string }

export default function LinkNoPrefetch(props: Props) {
  return <NextLink {...{ ...props, prefetch: false }} />
}
