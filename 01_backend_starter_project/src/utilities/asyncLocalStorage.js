import {AsyncLocalStorage} from "async_hooks"

export const asyncLocalStore = new AsyncLocalStorage()


export function getCoRelationID () {
      const asyncStore = asyncLocalStore.getStore()
       console.log("async store :",asyncStore)
       return asyncStore?.coRelationID || "error in getting coRelationID"
}



