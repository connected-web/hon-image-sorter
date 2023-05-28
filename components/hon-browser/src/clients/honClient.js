import axios from 'axios'

export default class HonClient {
  constructor (serverUrl) {
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
}
