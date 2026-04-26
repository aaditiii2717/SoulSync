import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mood-tracker')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mood-tracker"!</div>
}
