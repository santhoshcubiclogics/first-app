import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import  userRegistrationSlicer  from "./slicers/usrRgSlicer";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./saga/rootSaga";

const sagaMiddleware = createSagaMiddleware()
const middleware = [...getDefaultMiddleware({thunk:false,serializableCheck: false}), sagaMiddleware]

export const store = configureStore({
    reducer:{
        usrReg:userRegistrationSlicer
    },
    middleware
})

sagaMiddleware.run(rootSaga)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch