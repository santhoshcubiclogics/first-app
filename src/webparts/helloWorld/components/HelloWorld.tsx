import * as React from 'react';
import { IHelloWorldProps } from './IHelloWorldProps';
import { sp } from "@pnp/sp/presets/all";
import '@pnp/sp/lists';
import '@pnp/sp/items';
import UserRegistration from './userRegistration/UserRegistration';
import { Provider } from 'react-redux';
import { store } from '../../../tookit/store';


export default class HelloWorld extends React.Component<IHelloWorldProps, {}> {

  componentDidMount(): void {
    sp.setup({
      sp: {
        baseUrl: 'https://cubicdirect.sharepoint.com/sites/SanthoshDev' // Replace with your SharePoint site URL
      }
    });
  }


  public render(): React.ReactElement<IHelloWorldProps> {
    return (
      <div>
        <Provider store={store}>
          <UserRegistration contextProps={this.props.contextData} />
        </Provider>
      </div>
    );
  }
}

