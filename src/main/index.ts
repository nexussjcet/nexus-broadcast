import qrcode from 'qrcode-terminal'
import { Client } from 'whatsapp-web.js'

const client = new Client({
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
})

client.on('qr', (qr) => {
  console.log('QR Code received!')
  qrcode.generate(qr)
})

client.on('ready', () => {
  console.log('Client is ready!')
})

client.on('authenticated', () => {
  console.log('Client authenticated!')
})

client.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg)
})

client.initialize().catch((err) => {
  console.error('Failed to initialize client:', err)
})
