import type { Collection } from 'mongodb'

import { AuthenticationCreds, AuthenticationState, BufferJSON, initAuthCreds, proto, SignalDataSet, SignalDataTypeMap } from 'baileys'

async function useMongoAuthState(
  collection: Collection<{ id: string } & any>
): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void>, removeCreds: () => Promise<void> }> {
  const writeData = async (id: string, data: any) => {
    await collection.replaceOne(
      { id },
      { id, ...JSON.parse(JSON.stringify(data, BufferJSON.replacer)) },
      { upsert: true }
    )
  }

  const readData = async (id: string): Promise<any | null> => {
    const data = await collection.findOne(
      { id },
      { projection: { _id: 0, id: 0 } }
    )

    return data ? JSON.parse(JSON.stringify(data), BufferJSON.reviver) : null
  }

  const removeData = async (id: string) => {
    await collection.deleteOne({ id })
  }

  const creds: AuthenticationCreds =
    (await readData('creds')) || initAuthCreds()
  return {
    state: {
      creds,
      keys: {
        get: async (type, ids: string[]) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {}
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`)
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value)
              }
              data[id] = value
            })
          )
          return data
        },
        set: async (data: SignalDataSet): Promise<void> => {
          const tasks: Promise<void>[] = []
          for (const category in data) {
            for (const id in data[category as keyof SignalDataTypeMap]) {
              const value = data[category as keyof SignalDataTypeMap]?.[id]
              const key = `${category}-${id}`
              tasks.push(value ? writeData(key, value) : removeData(key))
            }
          }

          await Promise.all(tasks)
        }
      },
    },
    saveCreds: async () => {
      await writeData('creds', creds)
    },

    removeCreds: async () => {
      await removeData('creds')
    }
  }
}

export default useMongoAuthState