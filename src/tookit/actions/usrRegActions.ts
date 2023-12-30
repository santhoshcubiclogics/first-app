export const GET_USERS_FROM_LIST = "GET_USERS_FROM_LIST"
export const UPDATE_SEARCH_KEYWORD = "UPDATE_SEARCH_KEYWORD"

export interface IGetUsersFromList {
    type:"GET_USERS_FROM_LIST",
    payload:{
        listName:string
    }
}
export interface IGetUsersFromSearch{
    type:"UPDATE_SEARCH_KEYWORD",
    payload:{
        listName: string,
        keyword: string,
        finderKey:string
    }
}