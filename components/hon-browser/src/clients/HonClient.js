import axios from 'axios'

export default class HonClient {
  constructor (serverUrl) {
    const location = window.location
    const defualtServerPort = 8901
    serverUrl = serverUrl ?? location.protocol + '//' + location.hostname + ':' + defualtServerPort

    this.serverUrl = serverUrl
    this.client = axios.create({
      baseURL: serverUrl
    })
  }

  async serverStatus () {
    const response = await this.client.get('/')
    return response.data
  }

  async listFiles () {
    const response = await this.client.get('/server/list')
    return response.data
  }

  async moveFiles (filelist) {
    const response = await this.client.post('/server/move', { filelist })
    return response.data
  }

  async removeFiles (filelist) {
    const response = await this.client.post('/server/remove', { filelist })
    return response.data
  }
}
