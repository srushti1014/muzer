import { WebSocketServer, WebSocket } from 'ws'
import { Stream } from '../generated/prisma'

const wss = new WebSocketServer({ port: 3001 })
const clients = new Set<WebSocket>()

wss.on('connection', (socket: WebSocket) => {
  clients.add(socket)

  socket.on('close', () => {
    clients.delete(socket)
  })
})

export interface BroadcastMessage {
  type: string
  data: Stream
}

// Broadcast message to all connected clients
export function broadcast(message: BroadcastMessage): void {
  const payload = JSON.stringify(message)
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  }
}
