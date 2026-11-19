export const runtime = 'nodejs'

export function GET() {
  return Response.json({
    status: 'ok',
    service: 'gcit-project-examples',
    timestamp: new Date().toISOString(),
  })
}
