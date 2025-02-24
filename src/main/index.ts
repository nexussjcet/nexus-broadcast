import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import qrcode from 'qrcode-terminal'
import { Client, MessageMedia } from 'whatsapp-web.js'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

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
  // Notify renderer process about successful authentication
  mainWindow?.webContents.send('whatsapp-authenticated')
})

client.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg)
  // Notify renderer process about authentication failure
  mainWindow?.webContents.send('whatsapp-auth-failure')
})

// Handle file upload requests from renderer
ipcMain.handle('send-file', async (_event, { name, type, data }) => {
  try {
    const media = new MessageMedia(type, Buffer.from(data).toString('base64'), name)
    await client.sendMessage('me', media)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error sending file:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

client.initialize().catch((err) => {
  console.error('Failed to initialize client:', err)
})
