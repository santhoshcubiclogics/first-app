import { GET_USERS_FROM_LIST, UPDATE_SEARCH_KEYWORD } from "../actions/usrRegActions";
import {takeEvery} from "redux-saga/effects"
import { getUsersFromList, getUsersFromListBySearch } from "./usrRegSaga";

export function* rootSaga(){
    yield takeEvery(GET_USERS_FROM_LIST,getUsersFromList)
    yield takeEvery(UPDATE_SEARCH_KEYWORD,getUsersFromListBySearch)
}