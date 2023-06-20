import HonClient from '../clients/HonClient.js'
import { ActionType } from './ImageTags'

export default class ActionProcessor {
  private client: HonClient  

  constructor(serverUrl: string | undefined) {
    this.client = new HonClient(serverUrl)  
  }

  async processFiles(files: string[], action: ActionType): Promise<any> {
    if (action.type === 'move') {
      return this.moveFiles(files, action.to)  
    } else if (action.type === 'delete') {
      return this.removeFiles(files)  
    } else {
      return Promise.reject('Invalid action type')  
    }
  }

  private async moveFiles(files: string[], destination: string): Promise<any> {
    try {
      const response = await this.client.moveFiles(files)  
      // Process the response or perform additional actions if needed
      return response  
    } catch (error) {
      // Handle the error appropriately
      throw error  
    }
  }

  private async removeFiles(files: string[]): Promise<any> {
    try {
      const response = await this.client.removeFiles(files)  
      // Process the response or perform additional actions if needed
      return response  
    } catch (error) {
      // Handle the error appropriately
      throw error  
    }
  }
}