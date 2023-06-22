import HonClient from '../clients/HonClient'
import { ActionType } from './ImageTags'

export default class ActionProcessor {
  private readonly client: HonClient

  constructor (serverUrl: string | undefined) {
    this.client = new HonClient(serverUrl)
  }

  async processFiles (files: string[], action: ActionType): Promise<any> {
    if (action.type === 'move') {
      return await this.moveFiles(files, action.to)
    } else if (action.type === 'delete') {
      return await this.removeFiles(files)
    } else {
      return await Promise.reject(new Error('Invalid action type'))
    }
  }

  private async moveFiles (files: string[], destination: string): Promise<any> {
    try {
      const response = await this.client.moveFiles(files)
      console.log('Moved files:', { response })
      return response
    } catch (error) {
      console.error('Unable to move files:', { files, error })
    }
  }

  private async removeFiles (files: string[]): Promise<any> {
    try {
      const response = await this.client.removeFiles(files)
      console.log('Removed files:', { response })
      return response
    } catch (error) {
      console.error('Unable to remove files:', { files, error })
    }
  }
}
