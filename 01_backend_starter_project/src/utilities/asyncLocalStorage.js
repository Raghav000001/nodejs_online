import {AsyncLocalStorage} from "async_hooks"

export const asyncLocalStore = new AsyncLocalStorage()


export function getCoRelationID () {
      const asyncStore = asyncLocalStore.getStore()
      return asyncStore?.coRelationID || "error in getting coRelationID"
}



