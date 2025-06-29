import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

export const uploadImage = async (image: File): Promise<string> => {
  // Saglabāt attēlu public/slider mapē
  const imagePath = path.join(process.cwd(), 'public', 'slider', image.name)

  const buffer = await image.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)
  await promisify(fs.writeFile)(imagePath, uint8Array)

  // Atgriežam attēla URL ar pareizu ceļu
  return `/slider/${image.name}`
}
