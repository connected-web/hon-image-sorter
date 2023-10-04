import axios, { AxiosInstance, AxiosResponse } from 'axios'

interface ServerStatusResponse {
  // Define the structure of the response data
  // Modify the types based on the actual response structure
  // Example: { status: string }
  // Replace `any` with the appropriate type
  // Add more properties as needed
  // Example: status: string;
  [key: string]: any
}

type FileList = string[]

export default class HonClient {
  private readonly serverUrl: string
  private readonly client: AxiosInstance

  constructor (serverUrl?: string) {
    const location = window.location
    const defaultServerPort = 8901
    serverUrl = serverUrl ?? `${location.protocol}//${location.hostname}:${defaultServerPort}`

    this.serverUrl = serverUrl
    this.client = axios.create({
      baseURL: serverUrl
    })
  }

  async serverStatus (): Promise<ServerStatusResponse> {
    const response: AxiosResponse<ServerStatusResponse> = await this.client.get('/')
    return response.data
  }

  async listAllFiles (): Promise<FileList> {
    const response: AxiosResponse<FileList> = await this.client.get('/server/list')
    return response.data
  }

  async listFiles (folderPath: string): Promise<FileList> {
    const response: AxiosResponse<FileList> = await this.client.get('/server/folder/list', { params: { folderPath } })
    return response.data
  }

  async listFilesInFolder (folderPath: string): Promise<FileList> {
    const response: AxiosResponse<FileList> = await this.client.get('/server/folder/contents', { params: { folderPath } })
    return response.data
  }

  async moveFiles (filelist: FileList, destination: string): Promise<any> {
    const response: AxiosResponse<any> = await this.client.post('/server/move', { filelist, destination })
    return response.data
  }

  async removeFiles (filelist: FileList = []): Promise<any> {
    const { serverUrl } = this
    const normalized = filelist.map(file => file.replace(serverUrl, ''))
    const response: AxiosResponse<any> = await this.client.post('/server/remove', { filelist: normalized })
    return response.data
  }
}
