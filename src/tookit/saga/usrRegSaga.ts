import { getDataFromList, searchItemFromList } from "../../server/utils";
import { IGetUsersFromList, IGetUsersFromSearch } from "../actions/usrRegActions";
import {call,put} from "redux-saga/effects"
import { getUsers } from "../slicers/usrRgSlicer";

export function* getUsersFromList(params:IGetUsersFromList){
    try {
        let {data} = yield call(getDataFromList as any,params)
        yield put(getUsers(data))
    } catch (error) {
        console.error(error)
    }
}

export function* getUsersFromListBySearch(params:IGetUsersFromSearch){
    try {
        let {data} = yield call(searchItemFromList as any, params)
        yield put(getUsers(data))
    } catch (error) {
        console.error(error);
    }
}