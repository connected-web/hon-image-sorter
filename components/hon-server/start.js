import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import { find, position } from 'promise-path'

const app = express()
app.use(cors())
app.use(bodyParser.json())

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

app.post('/server/remove', async (req, res) => {
  const payload = req.body
  const filelist = payload?.filelist ?? []

  console.log('POST /server/remove', { filelist })
  const folderSearch = sourcePos('**/')
  const imageSearch = sourcePos('**/*.png')

  const files = await find(imageSearch)
  const folders = await find(folderSearch)
  const images = files.map(filepath => filepath.replace(basePath, '/images/'))

  const filesToDelete = images.filter(file => filelist.includes(file))
  const filesToKeep = images.filter(file => !filelist.includes(file))
  const filesNotFound = filelist.filter(file => !images.includes(file))

  res.json({
    sourcePath,
    filelist,
    folders: folders.map(folderpath => folderpath.replace(basePath, '/images/')),
    filesToDelete,
    filesNotFound,
    images: filesToKeep
  })
})

console.log('Source path for /images:', { sourcePath })
app.use('/images', express.static(sourcePath))

const uiServer = 'http://localhost:5173'
console.log(`UI Server running on ${uiServer}`)

app.listen(serverPort, () => {
  console.log(`HON Server running on http://localhost:${serverPort}`)
})
