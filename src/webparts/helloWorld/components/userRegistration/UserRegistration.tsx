import * as React from 'react'
import HeaderComponent from './header/HeaderComponent';
import DetailsLists from './detailList/DetailsList';
import { useDispatch, useSelector } from 'react-redux';
import { updateCurrentContext } from '../../../../tookit/slicers/usrRgSlicer';
import { IStyleSet, Stack } from 'office-ui-fabric-react';
import { IField, IFieldAddResult, FieldTypes, IFieldInfo } from "@pnp/sp/fields/types";
import { sp } from "@pnp/sp/presets/all";
import { RootState } from '../../../../tookit/store';


const bucket_name = "TEST_DEMO_11"


function UserRegistration(props: any) {

  const dispatch = useDispatch();
  const store_data = useSelector((state: RootState) => state.usrReg)

  React.useEffect(() => {
    dispatch(updateCurrentContext(props.contextProps))
  }, [])

  const addNewList = async () => {
    await sp.web.lists.add(store_data.list_name).then((res) => {
      return res
    }).then(() => {
      configureColumns()
    })
  }



  const configureColumns = async () => {
    const columns: any = [
      {
        title: `<Field Type="Text" DisplayName="Firstname" Name="Firstname" />`,
      },
      {
        title: `<Field Type="Text" DisplayName="Lastname" Name="Lastname" />`,
      },
      {
        title: `<Field Type="Text" DisplayName="DateofBirth" Name="DateofBirth" />`,
      },
      {
        title: `<Field Type="Text" DisplayName="Email" Name="Email" />`,
      },
      {
        title: `<Field Type="Text" DisplayName="Password" Name="Password" />`,
      },
    ];
    (async () => {
      try {
        for (const column of columns as any) {
          const result = await sp.web.lists.getByTitle(store_data.list_name).fields.createFieldAsXml(column.title)
          console.log(`Column "${column.title}" added successfully:`, result.data);
        }
      } catch (error) {
        console.log("Error adding columns:", error);
      }
    })().then((res: any) => {
      dispatch({
        type: "GET_USERS_FROM_LIST",
        payload: {
          listName: store_data.list_name
        }
      })
    });
  }

  React.useEffect(() => {
    sp.web.lists.get().then((lists) => {
      let filteredItems = lists.filter((item: any) => item["Title"] == store_data.list_name)
      if (filteredItems.length == 0) {
        addNewList()
      }
    }).catch((error) => {
      console.log("Error fetching the lists:", error);
    });
  }, [])

  React.useEffect(() => {
    configureColumns()
  }, [])

  return (
    <div>
      <HeaderComponent />
      <DetailsLists />
    </div>
  )
}

export default UserRegistration