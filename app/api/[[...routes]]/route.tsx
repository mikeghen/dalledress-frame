/** @jsxImportSource frog/jsx */

import { allo } from "@/abis/Allo";
import { fetchGrant, fetchProject } from "@/hooks/useRegisteredEvent";
import { Button, Frog, TextInput, parseEther } from "frog";
import { createSystem } from 'frog/ui'
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import GithubLogo from "@/public/github-mark/github-mark.png";
import XLogo from "@/public/x-logo/logo-white.png";
import { ethers } from "ethers";
import dollor from "@/public/circle-dollar-sign.png";
import human from "@/public/person-standing.png";
import {
  availableChainId,
  extractRoundInfo,
  getChainId,
  truncateText,
} from "@/utils";

const { Image } = createSystem()

if (!process.env.IPFS_BASE_URL) {
  throw new Error("IPFS_BASE_URL is not defined");
}

const app = new Frog({
  title: "DalleDress",
  assetsPath: "/",
  basePath: "/api",
  browserLocation: "/",
  imageAspectRatio: '1:1',
  imageOptions: {
    fonts: [
      {
        name: "Open Sans",
        weight: 700,
        source: "google",
      },
      {
        name: "Madimi One",
        source: "google",
      },
    ],
  },
});

app.frame("/", async (c) => {
  return c.res({
    action: '/create',
    image: (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(to right, #36D1DC, #5B86E5)",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          fontFamily: "Open Sans",
          fontWeight: 500,
          padding: "20px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 100,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          Welcome to DalleDress
        </div>
      </div>
    ),
    intents: [
      // <Button.Link href="https://github.com/tnkshuuhei/gg-frame">
      //   Github 🔧
      // </Button.Link>,
      <Button.Transaction target="/send-ether">Create New for 0.0001 Ξ</Button.Transaction>,
      <Button action="/view">View Existing</Button>,
    ],
  });
});

app.frame("/create", async (c) => {
  const { frameData, buttonValue } = c
  let url = `http://192.34.63.136:8080/dalle/simple/${frameData?.address}?generate`

  // Use the DalleDress API to generate or get the generated image
  // for the wallet address that just paid.
  return await fetch(url)
    .then(
      (response) => {
        if (!response.ok) {
          return c.res({
            image: (
              <div
                style={{
                  alignItems: "center",
                  background: "linear-gradient(to right, #36D1DC, #5B86E5)",
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  height: "100%",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                  fontFamily: "Open Sans",
                  fontWeight: 500,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: 100,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Something went wrong
                </div>
              </div>
            ),
            intents: [
              // <TextInput placeholder="Paste your Project URL here!" />,
              <Button action="/">Next</Button>,
            ],
          });
        } else if (response.headers.get("content-type")?.includes("image/png")) {
          // If so, return the image
          return c.res({
            image: <Image src={url} height="100%" width="100%"/>,
            intents: [
              // <TextInput placeholder="Paste your Project URL here!" />,
              <Button action={url}>View</Button>,
              <Button.Transaction target={`/mint/${frameData?.address}`}>Mint</Button.Transaction>,
            ],
          });
        } else {
          return c.res({
            image: (
              <div
                style={{
                  alignItems: "center",
                  background: "linear-gradient(to right, #36D1DC, #5B86E5)",
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  height: "100%",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                  fontFamily: "Open Sans",
                  fontWeight: 500,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: 80,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Please wait while your DalleDress is being generated...
                </div>
                <div
                  style={{
                    color: "white",
                    fontSize: 50,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                    marginTop: 20,
                  }}
                >
                  This may take a few minutes...
                </div>
                {/* <div
                  style={{
                    color: "white",
                    fontSize: 40,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {`${frameData?.address}`}
                </div> */}
              </div>
            ),
        
            intents: [
              // <TextInput placeholder="Paste your Project URL here!" />,
              <Button action={`/check/${frameData?.address}`}>Refresh</Button>,
            ],
          });
      }
    }
  );
});

app.frame("/check/:wallet", async (c) => {
  const wallet = c.req.param('wallet')
  const url = `http://192.34.63.136:8080/dalle/simple/${wallet}`

  return await fetch(url)
    .then(
      (response) => {
        if (!response.ok) {
          return c.res({
            image: (
              <div
                style={{
                  alignItems: "center",
                  background: "linear-gradient(to right, #36D1DC, #5B86E5)",
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  height: "100%",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                  fontFamily: "Open Sans",
                  fontWeight: 500,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: 100,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Something went wrong
                </div>
              </div>
            ),
            intents: [
              // <TextInput placeholder="Paste your Project URL here!" />,
              <Button action="/">Next</Button>,
            ],
          });
        } else if (response.headers.get("content-type")?.includes("image/png")) {
          // If so, return the image
          return c.res({
            action: '/minted',
            image:  <Image src={url} height="100%" width="100%"/>,
            intents: [
              // <TextInput placeholder="Paste your Project URL here!" />,
              <Button action={url}>View</Button>,
              <Button.Transaction target={`/mint/${wallet}`}>Mint</Button.Transaction>,
            ],
          });
        } else {
          return c.res({
            image: (
              <div
                style={{
                  alignItems: "center",
                  background: "linear-gradient(to right, #36D1DC, #5B86E5)",
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  height: "100%",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "100%",
                  fontFamily: "Open Sans",
                  fontWeight: 500,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontSize: 80,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Please wait while your DalleDress is being generated...
                </div>
                <div
                  style={{
                    color: "white",
                    fontSize: 50,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                    marginTop: 20,
                  }}
                >
                  This may take a few minutes...
                </div>
                {/* <div
                  style={{
                    color: "white",
                    fontSize: 40,
                    fontStyle: "normal",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {`${frameData?.address}`}
                </div> */}
              </div>
            ),
            intents: [
              // <TextInput placeholder="Paste your Project URL here!" />,
              <Button.Transaction target={`/check/${wallet}`}>Refresh</Button.Transaction>,
            ],
          });
      }
    });
});

app.frame("/finish", (c) => {
  const { transactionId } = c;
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(to right, #36D1DC, #5B86E5)",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          fontFamily: "Open Sans",
          fontWeight: 500,
          padding: "20px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 100,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          Your donation is complete!
        </div>
        <div
          style={{
            color: "white",
            fontSize: 40,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {`Transaction ID: ${transactionId}`}
        </div>
      </div>
    ),
    intents: [<Button.Reset>Back</Button.Reset>],
  });
});

app.transaction('/send-ether', (c) => {
  return c.send({
    chainId: `eip155:84532`,
    to: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
    value: parseEther('0.0001'),
    // Mark these txns as from dalledress
    data: ethers.hexlify(ethers.toUtf8Bytes("dalledress")) as `0x{string}`
  })
})

app.transaction('/send-ether2', (c) => {
  return c.send({
    chainId: `eip155:84532`,
    to: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
    value: parseEther('0.005'),
    // Mark these txns as from dalledress
    data: ethers.hexlify(ethers.toUtf8Bytes("dalledress")) as `0x{string}`
  })
})

app.transaction('/mint/:wallet', (c) => {
  const wallet = c.req.param('wallet') as `0x${string}`;
  return c.contract({
    chainId: `eip155:84532`,
    abi: [						{
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "safeMint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }],
    to: '0xF915789E918Cf197A5C61065814EB9aAafC6d819',
    functionName: 'safeMint', 
    args: [wallet, `http://192.34.63.136:8080/dalle/simple/${wallet}`],
    value: parseEther('0.005')
  })
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
