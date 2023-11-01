import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

import { find, position, clean } from 'promise-path'

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

app.get('/server/folder/contents', async (req, res) => {
  console.log('GET /server/folder/contents')
  const folderPath = (req.query.folderPath ?? '').replace('images/', '')
  const folderSearch = sourcePos(`${folderPath}/**/`)
  const imageSearch = sourcePos(`${folderPath}/**/*.png`)
  console.log('List files in folder', { imageSearch })

  const files = await find(imageSearch)
  const folders = await find(folderSearch)
  const images = files.map(filepath => filepath.replace(basePath, '/images/'))

  res.json({
    sourcePath,
    folderPath,
    folders: folders.map(folderpath => folderpath.replace(basePath, '/images/')),
    images
  })
})

const fileCountCache = {}
app.get('/server/folder/list', async (req, res) => {
  console.log('GET /server/folder/list')
  const rootFolder = (req.query.folderPath ?? '').replace('images/', '')
  const folderSearch = sourcePos(`${rootFolder}/**/`)

  const folders = await find(folderSearch)

  res.json({
    sourcePath,
    folderPath: rootFolder,
    folders: await Promise.all(folders.map(async (folderpath) => {
      const updatedPath = folderpath.replace(basePath, '/images/')
      const imageSearch = `${folderpath}**/*.png`
      if (fileCountCache[updatedPath] === undefined) {
        const files = await find(imageSearch)
        console.log('List folders on server', { imageSearch, count: files.length })
        fileCountCache[updatedPath] = files.filter(imagepath => imagepath.includes(folderpath) && !imagepath.replace(folderpath, '').includes('/')).length
      }

      return {
        path: updatedPath,
        fileCount: fileCountCache[updatedPath] ?? 0
      }
    }))
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

  let error
  try {
    const cleanUpWork = filesToDelete.map(file => {
      const targetFile = sourcePos(file).replace('/images/', '/')
      console.log('Removing:', { targetFile })
      return clean(targetFile)
    })
    await Promise.all(cleanUpWork)
  } catch (ex) {
    error = `Unable to delete files: ${ex.message}`
    return res.json({ error, filesToDelete, filesNotFound, folders })
  }

  res.json({
    sourcePath,
    folders: folders.map(folderpath => folderpath.replace(basePath, '/images/')),
    filesToDelete: filelist,
    deletedFiles: filesToDelete,
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
