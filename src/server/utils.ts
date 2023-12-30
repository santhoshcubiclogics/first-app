import { sp } from "@pnp/sp/presets/all";
import { IGetUsersFromList, IGetUsersFromSearch } from "../tookit/actions/usrRegActions";

export async function getDataFromList(params: IGetUsersFromList) {
    let res = await sp.web.lists.getByTitle(params.payload.listName).items.get().then((data: any) => {
        return successMessageWrapper(data)
    }).catch((error: any) => {
        return errorMessageWrapper(error);
    });
    return res;
}

export async function insertDataTolist(listname: string, itemData: any) {
    let res = await sp.web.lists.getByTitle(listname).items.add(itemData).then((result: any) => {
        return successMessageWrapper(result)
    }).catch((error) => {
        return errorMessageWrapper(error)
    });
    return res;
}

export async function insertMultipleDataTolist(listname:string, itemDataList:Array<any>){
    const list = sp.web.lists.getByTitle(listname);
    const itemPromises = [];
    for (let i = 1; i < itemDataList.length; i++) {
      const item = {};
      for (let j = 0; j < itemDataList[0].length; j++) {
        item[itemDataList[0][j]] = itemDataList[i][j];
      }
      itemPromises.push(list.items.add(item));
    }
    const results = await Promise.all(itemPromises).then((res:any) => {
        return successMessageWrapper(res)
    }).catch((error:any) => {   
        return errorMessageWrapper(error)
    })
    return results
}

export async function deleteItemFromList(listname: string, itemId: number) {
    let res = await sp.web.lists.getByTitle(listname).items.getById(itemId).delete().then((res: any) => {
        return successMessageWrapper(res)
    }).catch((error) => {
        return errorMessageWrapper(error)
    });
    return res;
}

export async function deleteMultipleItemsFromList(listname: string, itemIds: Array<number>) {
    const deletePromises = itemIds.map(itemId =>
        sp.web.lists.getByTitle(listname).items.getById(itemId).delete()
    );
    return Promise.all(deletePromises)
        .then((res: any) => {
            return successMessageWrapper(res)
        })
        .catch((error: any) => {
            return errorMessageWrapper(error)
        })
}

export async function updateItemFromList(listname: string, itemId: number, updatedData: any) {
    let res = await sp.web.lists.getByTitle(listname).items.getById(itemId).update(updatedData).then((res: any) => {
        return successMessageWrapper(res);
    }).catch((error) => {
        return errorMessageWrapper(error)
    });
    return res;
}

export async function searchItemFromList(params: IGetUsersFromSearch) {
    let res = await sp.web.lists.getByTitle(params.payload.listName).items
        .filter(`substringof('${params.payload.keyword}', ${params.payload.finderKey})`)
        .get()
        .then((data) => {
            return successMessageWrapper(data)
        })
        .catch((error) => {
            return errorMessageWrapper(error)
        });
    return res
}

export async function findUserByEmailId(listname: string, email: string) {
    let res = await sp.web.lists.getByTitle(listname).items
        .filter(`Email eq '${email}'`)
        .get()
        .then((data) => {
            return successMessageWrapper(data);
        })
        .catch((error) => {
            return errorMessageWrapper(error);
        });
    return res;
}

export async function findUserSpecificData(accountName:string){
    let res = await sp.profiles.getPropertiesFor(accountName).then((res) => {
        return successMessageWrapper(res)
    })
    return res    
}



export function errorMessageWrapper(result: any) {
    return {
        code: 400,
        data: result
    }
}

export function successMessageWrapper(message: any) {
    return {
        code: 200,
        data: message
    }
}