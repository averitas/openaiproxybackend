import React from 'react'
import Heads from '@/components/Heads'
import ChatApp from '../components/chat/chat_app'
import AppContainer from '@/components/app_container';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

const MyApp = () => {
  return (
    <>
    <Provider store={store}>

      <AppContainer />

    </Provider>
    </>
  );
};

export default MyApp;