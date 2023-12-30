import * as React from "react";
import { TextField, DatePicker, PrimaryButton, Spinner, SpinnerSize, MessageBar, MessageBarButton, MessageBarType } from '@fluentui/react';
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../../tookit/store";
import { updateFormSubmitStatus } from "../../../../../../tookit/slicers/usrRgSlicer";
import { findUserByEmailId, findUserSpecificData, insertDataTolist, updateItemFromList } from "../../../../../../server/utils";
import * as moment from "moment";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import Swal from "sweetalert2";
import { IDatePickerProps} from "@fluentui/react";

export interface IHeaderForm {
    closeForm?: any;
}

const HeaderForm: React.FC<IHeaderForm> = (props: IHeaderForm) => {

    const store_data = useSelector((state: RootState) => state.usrReg);
    const dispatch = useDispatch();

    // states for message box
    const [showMessage, setShowMessage] = useState<boolean>(false);

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [dateOfBirth, setDateOfBirth] = useState<any>(null);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    console.log("dateOfBirth",dateOfBirth)

    React.useEffect(() => {
        if (store_data.checked_grid_items.length == 1) {
            let { Firstname, Lastname, DateofBirth, Email, Password } = store_data.checked_grid_items[0]
            setFirstName(Firstname)
            setLastName(Lastname)
            setDateOfBirth(moment(DateofBirth).toDate())
            setEmail(Email)
            setPassword(Password)
        } else {
            clearForm();
        }
    }, [])


    const clearForm = () => {
        setFirstName('');
        setLastName('');
        setDateOfBirth(null);
        setEmail('');
        setPassword('');
        setShowMessage(false);
    }

    const handleFormSubmit = (event: any) => {
        event.preventDefault();
        dispatch(updateFormSubmitStatus(true))
        if (store_data.checked_grid_items.length === 0) {
            findUserByEmailId(store_data.list_name, email).then((res: any) => {
                if (res?.data?.length == 0) {
                    let insertItem = {
                        "Firstname": firstName,
                        "Lastname": lastName,
                        "DateofBirth": dateOfBirth,
                        "Email": email,
                        "Password": password
                    }
                    insertDataTolist(store_data.list_name, insertItem).then((res) => {
                        dispatch(updateFormSubmitStatus(false));
                        if (res.code == 200) {
                            Swal.fire({
                                title: 'Success',
                                text: 'User inserted successfully',
                                icon: 'success',
                                confirmButtonText: 'Done'
                            })
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: 'Unable to insert user',
                                icon: 'error',
                                confirmButtonText: 'Close'
                            })
                        }
                        props.closeForm();
                    }).then(() => {
                        dispatch({
                            type: "GET_USERS_FROM_LIST",
                            payload: {
                                listName: store_data.list_name
                            }
                        })
                    })
                } else {
                    setShowMessage(true)
                    dispatch(updateFormSubmitStatus(false));
                }
            })
        } else {
            let updateItem = {
                "Firstname": firstName,
                "Lastname": lastName,
                "DateofBirth": dateOfBirth
            }
            updateItemFromList(store_data.list_name, store_data.checked_grid_items[0]["ID"], updateItem).then((res: any) => {
                dispatch(updateFormSubmitStatus(false))
                if (res.code == 200) {
                    Swal.fire({
                        title: 'Success',
                        text: 'User updated successfully',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    })
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Unable to insert user',
                        icon: 'error',
                        confirmButtonText: 'Close'
                    })
                }
                props.closeForm();
            }).then(() => {
                dispatch({
                    type: "GET_USERS_FROM_LIST",
                    payload: {
                        listName: store_data.list_name
                    }
                })
            })
        }
    };

    const _getPeoplePickerItems = (items: any[]) => {
        if (items.length == 0) {
            clearForm();
        }
        _getUserSpecificData(items[0]["loginName"])
    }

    const findUserDetailsFromProperty = (data: Array<any>, key: string) => {
        let ret = data.filter((item: any) => item.Key == key)[0]["Value"]
        return ret ? ret : ""
    }

    const _getUserSpecificData = (accountName: string) => {
        findUserSpecificData(accountName).then((res) => {
            if (res?.data?.UserProfileProperties) {
                console.log("UserProperties", res?.data.UserProfileProperties)
                setFirstName(findUserDetailsFromProperty(res?.data.UserProfileProperties, "FirstName"))
                setLastName(findUserDetailsFromProperty(res?.data.UserProfileProperties, "LastName"))
                setEmail(findUserDetailsFromProperty(res?.data.UserProfileProperties, "AccountName").split("|")[2])
                setDateOfBirth(moment(findUserDetailsFromProperty(res?.data.UserProfileProperties, "SPS-Birthday")).isValid() ? moment(findUserDetailsFromProperty(res?.data.UserProfileProperties, "SPS-Birthday")).toDate() : null)
            }
        })
    }
    return (
        <div>
            {
                Object.keys(store_data.current_context).length != 0 && store_data.checked_grid_items.length == 0 &&
                <PeoplePicker
                    context={store_data.current_context}
                    titleText="People Picker"
                    personSelectionLimit={1}
                    groupName={""} // Leave this blank in case you want to filter from all users
                    showtooltip={false}
                    required={false}
                    disabled={false}
                    onChange={_getPeoplePickerItems}
                    showHiddenInUI={false}
                    principalTypes={[PrincipalType.User]}
                    resolveDelay={1000} />
            }
            <hr/>
            <form onSubmit={handleFormSubmit}>
                <TextField
                    label="First Name"
                    value={firstName}
                    onChange={(event, newValue: string) => setFirstName(newValue)}
                    required
                />
                <TextField
                    label="Last Name"
                    value={lastName}
                    onChange={(event, newValue: string) => setLastName(newValue)}
                    required
                />
                <DatePicker
                    label="Date of Birth"
                    value={dateOfBirth}
                    formatDate={(date) => moment(date).format("MM/DD/YYYY")}
                    onSelectDate={(date: any) => setDateOfBirth(date)}
                    isRequired={true}
                />
                <TextField
                    label="Email"
                    value={email}
                    onChange={(event, newValue: string) => setEmail(newValue)}
                    type="email"
                    required
                    disabled={store_data.checked_grid_items.length === 0 ? false : true}
                />
                <TextField
                    label="Password"
                    value={password}
                    onChange={(event, newValue: string) => setPassword(newValue)}
                    type="password"
                    required
                    disabled={store_data.checked_grid_items.length === 0 ? false : true}
                />
                {
                    showMessage &&
                    <div className="message-bar">
                        <MessageBar

                            actions={
                                <div>
                                    <MessageBarButton onClick={() => setShowMessage(!showMessage)}>Ok</MessageBarButton>
                                </div>
                            }
                            messageBarType={MessageBarType.warning}
                            isMultiline={false}
                        >
                            Email already exists.
                        </MessageBar>
                    </div>
                }
                <PrimaryButton style={{ margin: "20px 0px 0px 0px" }} type="submit">
                    {store_data.submit_button_loading ? <Spinner size={SpinnerSize.small} /> : "Submit"}
                </PrimaryButton>
            </form>
        </div>
    )
}
export default HeaderForm;