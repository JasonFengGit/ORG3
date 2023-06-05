import '../styles/globals.css'
import './index.css';
import '@rainbow-me/rainbowkit/styles.css'
import 'react-toastify/dist/ReactToastify.css';

import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from "react";
import { Navbar, Button, Link, Text, Card, Popover, Dropdown } from "@nextui-org/react";
import { Analytics } from '@vercel/analytics/react';
import { } from 'wagmi';
import { mainnet, optimism, goerli } from 'wagmi/chains'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ToastContainer, toast } from 'react-toastify';
import { ThemeProvider } from 'styled-components'
import { Heading, ThorinGlobalStyles, lightTheme, darkTheme } from "@ensdomains/thorin";
import { useState } from 'react';
import EditConfirmation from '../components/communitySpace/EditConfirmation';

import { Layout } from "../components/Layout";
import { Logo } from "../components/Logo";
import ConnectButtonWrapper from "../components/connect-button";
import Preloader from '../components/preloader';
import Header from '../components/header';

export const getChain = () => {
  if (process.env.NETWORK === "mainnet") {
    return mainnet;
  } else if (process.env.NETWORK === "goerli") {
    return goerli;
  } else {
    return goerli; // Default
  }
}

const { chains, provider } = configureChains(
  [goerli],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})
import 'react-toastify/dist/ReactToastify.css';
import { ConfigProvider } from 'antd';
import { globalTheme } from '../styles/globalTheme';
import Footer from '../components/footer';


function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState(lightTheme);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editProfileLink, setEditProfileLink] = useState("");
  const router = useRouter();

  return (
    <>
      <ConfigProvider theme={globalTheme}>
        <ThemeProvider theme={theme}>
          <ThorinGlobalStyles />
          <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>

              <Head>
                <title>ORG3</title>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                {/* <link rel="stylesheet" href="assets/css/fontAwesome5Pro.css" /> */}
                <link rel="stylesheet" href="assets/css/flaticon.css" />
                <link rel="stylesheet" href="assets/css/default.css" />
                {/* Global Site Tag (gtag.js) - Google Analytics */}
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=G-EJLRWV977S`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-EJLRWV977S', {
                    page_path: window.location.pathname,
                  });
                `,
                  }}
                />
              </Head>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh'
              }}>
                <div style={{ flex: '1' }}>
                  <Header position='absolute' setEditProfileLink={setEditProfileLink} setProfileEditOpen={setProfileEditOpen} />
                  <EditConfirmation open={profileEditOpen} setEditOpen={setProfileEditOpen} link={editProfileLink} />
                  <Component {...pageProps} />
                </div>
                {router.pathname !== '/' && <Footer />}
              </div>


              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </RainbowKitProvider>
          </WagmiConfig>
        </ThemeProvider>
      </ConfigProvider>
      <Analytics />
    </>
  );
}

export default MyApp
