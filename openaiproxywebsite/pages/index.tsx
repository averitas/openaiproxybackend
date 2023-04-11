import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import Link from 'next/link';
import App from './_app';


const MyApp = () => {
  useEffect(() => {
    ReactDOM.render(
      <>
        <Head>
          <title>My Openai proxy App</title>
          <meta name="description" content="My openai proxy App" />
        </Head>
        <nav>
          <ul>
            <li>
              <Link href="/">
                <a>Home</a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a>About</a>
              </Link>
            </li>
          </ul>
        </nav>
        <App />
      </>,
      document.getElementById('root')
    );
  }, []);

  return <div id="root" />;
};

export default MyApp;