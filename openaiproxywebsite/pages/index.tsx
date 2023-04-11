import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import Link from 'next/link';
import ChatApp from './chat_app';


const MyApp = () => {
  return (
    <>
      <Head>
        <title>Azure Openai proxy App</title>
        <meta name="description" content="openai proxy App" />
        <meta name="email" content="lewis0204@outlook.com" />
      </Head>
      <ChatApp/>
    </>
  );
};

export default MyApp;