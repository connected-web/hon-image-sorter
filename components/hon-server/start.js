import express from 'express'
import cors from 'cors'

import { find, position } from 'promise-path'

const app = express()
app.use(cors())

const sourcePath = process.env.HON_IMAGE_PATH ?? process.cwd()
const serverPort = 8901

const sourcePos = position(sourcePath)
const basePath = sourcePos('./')

app.get('/', (req, res) => {
  console.log('GET /')
  res.json({
    message: 'Hello',
    sourcePath
  })
})
app.get('/server/list', async (req, res) => {
  console.log('GET /server/list')
  const folderSearch = sourcePos('**/')
  const imageSearch = sourcePos('**/*.png')
  console.log('List files on server', { imageSearch })
  const files = await find(imageSearch)
  const folders = await find(folderSearch)
  const images = files.map(filepath => filepath.replace(basePath, '/images/'))
  res.json({
    sourcePath,
    folders: folders.map(folderpath => folderpath.replace(basePath, '/images/')),
    images
  })
})
console.log('Source path for /images:', { sourcePath })
app.use('/images', express.static(sourcePath))

const uiServer = 'http://localhost:5173'
console.log(`UI Server running on ${uiServer}`)

app.listen(serverPort, () => {
  console.log(`HON Server running on http://localhost:${serverPort}`)
})
