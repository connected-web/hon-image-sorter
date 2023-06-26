const path = require('path')

export default function isPathBelowBase (basePath, relativePath) {
  const absoluteBasePath = path.resolve(basePath)
  const absoluteRelativePath = path.resolve(basePath, relativePath)

  // Check if the absoluteRelativePath starts with the absoluteBasePath
  return absoluteRelativePath.startsWith(absoluteBasePath)
}
