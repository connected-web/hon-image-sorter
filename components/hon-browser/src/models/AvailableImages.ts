
import { computed, ComputedRef } from 'vue'
import memoizee from 'memoizee'
import HonClient from '../clients/HonClient'

export default class AvailableImages {
  private readonly honClient: HonClient
  public readonly availableImages: ComputedRef<any>

  constructor () {
    this.honClient = new HonClient()
    this.availableImages = computed(async () => await this.getAvailableImages())
  }

  @memoizee()
  private async getAvailableImages (): Promise<any> {
    const files = await this.honClient.listFiles()
    return files
  }
}
