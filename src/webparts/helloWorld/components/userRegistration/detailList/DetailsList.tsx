// import React, { useState, useEffect } from 'react';
import * as React from "react";
import { DetailsList, DetailsListLayoutMode, Selection, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { Icon } from "office-ui-fabric-react";
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyles } from '@fluentui/react/lib/Styling';
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../tookit/store";
import { updateCheckedItems } from "../../../../../tookit/slicers/usrRgSlicer";
import { IStackTokens, Label, Spinner, SpinnerSize, Stack } from "office-ui-fabric-react";
import moment from "moment";


const exampleChildClass = mergeStyles({
    display: 'block',
    marginBottom: '10px',
});

const stackClass = mergeStyles({
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    margin: "100px"
})

const iconClass = mergeStyles({
    fontSize: 20,
    textAlign: "center"
})

export interface IDetailsListBasicExampleItem {
    firstname: string;
    lastname: string;
    dateofbirth: string;
    email: string;
    password: string;
    id: number;
}

const stackToken: IStackTokens = { childrenGap: 10 }



const DetailsLists: React.FC = () => {
    const dispatch = useDispatch();
    const store_data = useSelector((state: RootState) => state.usrReg);
    const [items, setItems] = React.useState<IDetailsListBasicExampleItem[]>([]);
    const [selectionDetails, setSelectionDetails] = React.useState<string>('');

    const selection = React.useRef(new Selection({
        onSelectionChanged: () => setSelectionDetails(getSelectionDetails()),
    }));

    const allItems: IDetailsListBasicExampleItem[] = [];

    const columns: IColumn[] = [
        { key: 'column1', name: 'Id', fieldName: 'ID', minWidth: 100, maxWidth: 100, isResizable: true },
        { key: 'column2', name: 'Firstname', fieldName: 'Firstname', minWidth: 100, maxWidth: 100, isResizable: true },
        { key: 'column2', name: 'Lastname', fieldName: 'Lastname', minWidth: 100, maxWidth: 100, isResizable: true },
        { key: 'column2', name: 'Email', fieldName: 'Email', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Date of Birth', fieldName: 'DateOfBirth', minWidth: 100, maxWidth: 100, isResizable: true }
    ];

    React.useEffect(() => {
        setItems(allItems);
        setSelectionDetails(getSelectionDetails());
        dispatch({
            type: "GET_USERS_FROM_LIST",
            payload: {
                listName: store_data.list_name
            }
        })
    }, []);

    React.useEffect(() => {
        if (store_data.grid_data && store_data.grid_data.length != 0) {
            let a = store_data.grid_data && store_data?.grid_data.map((item: any) => {
                return {
                    ...item,
                    DateOfBirth: moment(item["DateofBirth"]).format("DD MMM YYYY")
                }
            })
            setItems(a)
        }else{
            setItems([])
        }
    }, [store_data.grid_data])


    React.useEffect(() => {
        if (store_data.checked_grid_items.length == 0) {
            selection.current.setAllSelected(false)
        }
    }, [store_data.checked_grid_items])


    const renderSelectionDetails = () => {
        return <div className={exampleChildClass}>{selectionDetails}</div>;
    };





    const getSelectionDetails = (): string => {
        const selectionCount = selection.current.getSelectedCount();
        dispatch(updateCheckedItems(selection.current.getSelection()))
        switch (selectionCount) {
            case 0:
                return 'No items are selected';
            case 1:
                return '1 item selected';
            default:
                return `${selectionCount} items selected`;
        }
    };

    if (store_data.grid_loading_status) {
        return (
            <div style={{ margin: "auto", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "100px" }}>
                <Stack horizontal tokens={stackToken}>
                    <Label>Loading</Label>
                    <Spinner size={SpinnerSize.small} />
                </Stack>
            </div>
        )
    } else {
        if (store_data.grid_data?.length == 0) {
            return (
                <div className={stackClass}>
                    <Stack tokens={{ childrenGap: 10 }}>
                        <Icon className={iconClass} iconName="DocumentSearch" />
                        <p>No data found</p>
                    </Stack>
                </div>
            )
        } else {
            return (
                <div>
                    {renderSelectionDetails()}
                    <MarqueeSelection selection={selection.current}>
                        <DetailsList
                            items={items}
                            columns={columns}
                            selectionMode={SelectionMode.multiple}
                            setKey="set"
                            layoutMode={DetailsListLayoutMode.justified}
                            selection={selection.current}
                            selectionPreservedOnEmptyClick={true}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="select row"
                        />
                    </MarqueeSelection>
                </div>
            );
        }
    }
};

export default DetailsLists;
