import * as React from "react";
import "./HeaderComponent.scss";
import { ISearchBoxStyles, IStackTokens, Label, SearchBox, Stack, DefaultButton, Panel, Modal, mergeStyleSets } from "office-ui-fabric-react";
import { IContextualMenuProps } from "@fluentui/react"
import HeaderForm from "./headerForm/HeaderForm";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../tookit/store";
import { useDispatch } from "react-redux";
import { IGetUsersFromSearch } from "../../../../../tookit/actions/usrRegActions";
import { deleteItemFromList, deleteMultipleItemsFromList, findUserSpecificData } from "../../../../../server/utils";
import { updateCheckedItems } from "../../../../../tookit/slicers/usrRgSlicer";
import Swal from 'sweetalert2';
import ModalForm from "./modalForm/ModalForm";
import { debounce } from "@microsoft/sp-lodash-subset";
import * as XLSX from "xlsx";


declare global {
    interface Navigator {
        msSaveBlob?: (blob: any, defaultName?: string) => boolean
    }
}


const stackTokens: IStackTokens = { childrenGap: 5 };
const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch'
    },
})
const searchStyle: Partial<ISearchBoxStyles> = { root: { width: 200 } };

const HeaderComponent: React.FunctionComponent<any> = () => {
    const [isPanelOpen, setIsPanelOpen] = React.useState<boolean>(false);
    const store_data = useSelector((state: RootState) => state.usrReg);
    const dispatch = useDispatch();
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const [showAddListModal,setShowAddListModal] = React.useState<boolean>(false);

    const onClosePanelForm = () => {
        setIsPanelOpen(false)
        dispatch(updateCheckedItems([]))
        setSearchValue("")
    }

    function downloadExcel(data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        if (navigator.msSaveBlob) {
            // For IE browser
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                // For modern browsers
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            }
        }
    }

    function onDownloadExcelClick() {
        const data = store_data.grid_data
        const filename = 'output.xlsx';
        downloadExcel(data, filename);
    }



    const onPanelOpen = () => {
        setIsPanelOpen(true);
    }

    const onBulkUpload = () => {
        setIsModalOpen(true);
    }

    const onDeleteClick = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm'
        }).then((result) => {
            if (result.isConfirmed) {
                if (store_data.checked_grid_items.length > 1) {
                    let ids: Array<number> = []
                    store_data.checked_grid_items.map((item: any) => {
                        ids.push(item["ID"])
                    })
                    deleteMultipleItemsFromList(store_data.list_name, ids).then((res) => {
                        if (res.code == 200) {
                            Swal.fire({
                                title: 'Success',
                                text: 'User deleted success',
                                icon: 'success',
                                confirmButtonText: 'Ok'
                            })
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: 'Unable to delete users',
                                icon: 'error',
                                confirmButtonText: 'Close'
                            })
                        }
                    }).then(() => {
                        dispatch({
                            type: "GET_USERS_FROM_LIST",
                            payload: {
                                listName: store_data.list_name
                            }
                        })
                        dispatch(updateCheckedItems([]))
                    })
                } else {
                    deleteItemFromList(store_data.list_name, store_data.checked_grid_items[0]["ID"]).then((res) => {
                        if (res.code == 200) {
                            Swal.fire({
                                title: 'Success',
                                text: 'User deleted success',
                                icon: 'success',
                                confirmButtonText: 'Cool'
                            })
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: 'Unable to delete users',
                                icon: 'error',
                                confirmButtonText: 'Close'
                            })
                        }
                    }).then(() => {
                        dispatch({
                            type: "GET_USERS_FROM_LIST",
                            payload: {
                                listName: store_data.list_name
                            }
                        })
                        dispatch(updateCheckedItems([]))
                    })
                }
            }
        })
    }

    const handleFileUploadFinish = () => {
        setIsModalOpen(false);
        dispatch({
            type: "GET_USERS_FROM_LIST",
            payload: {
                listName: store_data.list_name
            }
        })
    }

    const onDownloadClick = (type: string) => {
        if (type == "csv") {
            downloadCSV(store_data.grid_data, "output.csv")
        }
        if (type == "excel") {
            onDownloadExcelClick()
        }
    }

    function downloadCSV(data, filename) {
        const csv = convertArrayToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        if (navigator?.msSaveBlob) {
            // For IE browser
            navigator?.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                // For modern browsers
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
            }
        }
    }

    function convertArrayToCSV(data) {
        const separator = ',';
        const keys = Object.keys(data[0]);
        const header = keys.join(separator);
        const rows = data.map((item) => keys.map((key) => item[key]).join(separator));
        return `${header}\n${rows.join('\n')}`;
    }


    const onAddNewList = () => {
        setShowAddListModal(true);
    }

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: 'addnew',
                text: 'Add New',
                iconProps: { iconName: 'Add' },
                disabled: store_data.checked_grid_items.length === 0 ? false : true,
                subMenuProps: {
                    items: [
                        {
                            key: 'addnewuser',
                            text: 'Add New User',
                            iconProps: { iconName: 'AddFriend' },
                            disabled: store_data.grid_data.length === 0 ? true : false,
                            onClick: () => onPanelOpen(),
                        },
                        {
                            key: 'addnewlist',
                            text: 'Add New List',
                            iconProps: { iconName: 'AddToShoppingList' },
                            disabled: store_data.grid_data.length === 0 ? true : false,
                            onClick: () => onAddNewList(),
                        },
                    ]
                }
            },
            {
                key: 'edituser',
                text: 'Edit User',
                iconProps: { iconName: 'Edit' },
                disabled: store_data.checked_grid_items.length === 1 ? false : true,
                onClick: () => onPanelOpen()
            },
            {
                key: 'deleteuser',
                text: 'Delete User',
                iconProps: { iconName: 'Delete' },
                disabled: store_data.checked_grid_items.length >= 1 ? false : true,
                onClick: () => onDeleteClick()
            },
            {
                key: 'bulkupload',
                text: 'Bulk Upload',
                iconProps: { iconName: 'Folder' },
                disabled: store_data.checked_grid_items.length === 0 ? false : true,
                onClick: () => onBulkUpload()
            },
            {
                key: 'download',
                text: 'Download',
                iconProps: { iconName: 'Download' },
                disabled: store_data.grid_data.length === 0 ? true : false,
                subMenuProps: {
                    items: [
                        {
                            key: 'downloadcsv',
                            text: 'Download as CSV',
                            iconProps: { iconName: 'AnalyticsView' },
                            disabled: store_data.grid_data.length === 0 ? true : false,
                            onClick: () => onDownloadClick("csv"),
                        },
                        {
                            key: 'downloadexcel',
                            text: 'Download as Excel',
                            iconProps: { iconName: 'ExcelDocument' },
                            disabled: store_data.grid_data.length === 0 ? true : false,
                            onClick: () => onDownloadClick("excel"),
                        },
                    ]
                }
            }
        ],
    };


    const handleDebounceFunction = React.useCallback(
        debounce((value: string) => {
            if (value.length == 0) {
                dispatch({
                    type: "GET_USERS_FROM_LIST",
                    payload: {
                        listName: store_data.list_name
                    }
                })
            } else {
                dispatch({
                    type: "UPDATE_SEARCH_KEYWORD",
                    payload: {
                        listName: store_data.list_name,
                        finderKey: "Email",
                        keyword: value
                    }
                } as IGetUsersFromSearch)
            }
        }, 200)
        , [])

    const handleSearch = (value: string) => {
        setSearchValue(value)
        handleDebounceFunction(value)
    }

    return (
        <div>
            <div className="header-panel">
                <div>
                    <Label className='header-title'>User Registration with SharePoint</Label>
                </div>
                <div className="header-panel-right">
                    <Stack horizontal tokens={stackTokens}>
                        <SearchBox
                            styles={searchStyle}
                            value={searchValue}
                            placeholder="Search by email"
                            onEscape={ev => {
                                console.log('Custom onEscape Called');
                            }}
                            onClear={ev => {
                                console.log('Custom onClear Called');
                            }}
                            onChange={(_, newValue: string) => handleSearch(newValue)}
                            onSearch={newValue => console.log('SearchBox onSearch fired: ' + newValue)}
                        />
                        <DefaultButton
                            primary
                            split
                            text="Actions"
                            splitButtonAriaLabel="See 2 options"
                            aria-roledescription="split button"
                            menuProps={menuProps}
                        />
                    </Stack>
                </div>
            </div>
            <div>
                <Panel

                    headerText={store_data.checked_grid_items.length == 0 ? "Add User" : "Edit User"}
                    isOpen={isPanelOpen}
                    onDismiss={() => setIsPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                >
                    <HeaderForm closeForm={onClosePanelForm} />
                </Panel>
            </div>

            <div className="bulkUploadModal">
                <Modal
                    titleAriaId={"ID1"}
                    isOpen={isModalOpen}
                    onDismiss={() => setIsModalOpen(false)}
                    isBlocking={false}
                    containerClassName={contentStyles.container}
                >
                    <ModalForm onFinish={handleFileUploadFinish} />
                </Modal>
            </div>

            <div className="addListModal">
                <Modal
                    titleAriaId={"ID2"}
                    isOpen={showAddListModal}
                    onDismiss={() => setShowAddListModal(false)}
                    isBlocking={false}
                    containerClassName={contentStyles.container}
                >
                   <h1>Hello World</h1>
                </Modal>
            </div>

        </div>
    )
}

export default HeaderComponent;