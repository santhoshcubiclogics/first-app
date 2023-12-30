import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'


export interface IUSerRegistration {
    grid_data: any,
    search_keyword: string,
    grid_loading_status:boolean,
    checked_grid_items:Array<any>,
    submit_button_loading:boolean,
    current_context:any,
    list_name:string
}

const userRegistrationState: IUSerRegistration = {
    grid_data: [],
    search_keyword: "",
    grid_loading_status: true,
    checked_grid_items:[],
    submit_button_loading:false,
    current_context:{},
    list_name:"CURD_DEMO_9"
}

export const userRegistrationSlicer = createSlice({
    name: "user_registration",
    initialState: userRegistrationState,
    reducers: {
        getUsers: (state: IUSerRegistration, action:PayloadAction<any>) => {
            state.grid_data = action.payload,
            state.grid_loading_status = false
        },
        updateSearchKeyword: (state:IUSerRegistration,action:PayloadAction<string>) => {
            state.search_keyword = action.payload
        },
        updateGridLoadingStatus: (state:IUSerRegistration,action:PayloadAction<boolean>) => {
            state.grid_loading_status = action.payload
        },
        updateCheckedItems:(state:IUSerRegistration,action:PayloadAction<any>) => {
            state.checked_grid_items = action.payload
        },
        updateFormSubmitStatus:(state:IUSerRegistration,action:PayloadAction<any>) => {
            state.submit_button_loading = action.payload
        },
        updateCurrentContext:(state:IUSerRegistration,action:PayloadAction<any>) => {
            state.current_context = action.payload
        }
    }
})

export const {updateCurrentContext,updateFormSubmitStatus,getUsers,updateSearchKeyword,updateGridLoadingStatus,updateCheckedItems} = userRegistrationSlicer.actions;
export default userRegistrationSlicer.reducer;