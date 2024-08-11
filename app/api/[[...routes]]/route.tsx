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

const { Box, VStack, Heading, Text, Image } = createSystem();

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
      <Box
        grow
        alignVertical="center"
        alignHorizontal="center"
        padding="20"
        textAlign="center"
      >
        <Heading>
          Welcome to DalleDress
        </Heading>
      </Box>
    ),
    intents: [
      <Button.Transaction target="/send-ether">Create New for 0.0001 Ξ</Button.Transaction>,
      <Button action="/view">View Existing</Button>,
    ],
  });
});

app.frame("/create", async (c) => {
  const { frameData, buttonValue } = c;
  let url = `http://192.34.63.136:8080/dalle/simple/${frameData?.address}?generate`;

  return await fetch(url)
    .then((response) => {
      if (!response.ok) {
        return c.res({
          image: (
            <Box>
              <Heading>
                Something went wrong
              </Heading>
            </Box>
          ),
          intents: [
            <Button action="/">Next</Button>,
          ],
        });
      } else if (response.headers.get("content-type")?.includes("image/png")) {
        return c.res({
          image: <Image src={url} height="100%" width="100%" />,
          intents: [
            <Button action={url}>View</Button>,
            <Button.Transaction target={`/mint/${frameData?.address}`}>Mint</Button.Transaction>,
          ],
        });
      } else {
        return c.res({
          image: (
            <VStack
              grow
              alignHorizontal="center"
              padding="20"
              textAlign="center"
              gap="4"
            >
              <Heading>
                Please wait while your DalleDress is being generated...
              </Heading>
              <Text>
                This may take a few minutes...
              </Text>
            </VStack>
          ),
          intents: [
            <Button action={`/check/${frameData?.address}`}>Refresh</Button>,
          ],
        });
      }
    });
});

app.frame("/check/:wallet", async (c) => {
  const wallet = c.req.param('wallet');
  const url = `http://192.34.63.136:8080/dalle/simple/${wallet}`;

  return await fetch(url)
    .then((response) => {
      if (!response.ok) {
        return c.res({
          image: (
            <Box
              grow
              alignVertical="center"
              alignHorizontal="center"
              padding="20"
              textAlign="center"
            >
              <Heading>
                Something went wrong
              </Heading>
            </Box>
          ),
          intents: [
            <Button action="/">Next</Button>,
          ],
        });
      } else if (response.headers.get("content-type")?.includes("image/png")) {
        return c.res({
          action: '/',
          image: <Image src={url} height="100%" width="100%" />,
          intents: [
            <Button action={url}>View</Button>,
            <Button.Transaction target={`/mint/${wallet}`}>Mint</Button.Transaction>,
          ],
        });
      } else {
        return c.res({
          image: (
            <VStack
              grow
              alignHorizontal="center"
              padding="20"
              textAlign="center"
              gap="4"
            >
              <Heading>
                Please wait while your DalleDress is being generated...
              </Heading>
              <Text marginTop="20">
                This may take a few minutes...
              </Text>
            </VStack>
          ),
          intents: [
            <Button.Transaction target={`/check/${wallet}`}>Refresh</Button.Transaction>,
          ],
        });
      }
    });
});

app.transaction('/send-ether', (c) => {
  return c.send({
    chainId: `eip155:84532`,
    to: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
    value: parseEther('0.0001'),
    data: ethers.hexlify(ethers.toUtf8Bytes("dalledress")) as `0x{string}`,
  });
});

app.transaction('/send-ether2', (c) => {
  return c.send({
    chainId: `eip155:84532`,
    to: '0xf503017D7baF7FBC0fff7492b751025c6A78179b',
    value: parseEther('0.005'),
    data: ethers.hexlify(ethers.toUtf8Bytes("dalledress")) as `0x{string}`,
  });
});

app.transaction('/mint/:wallet', (c) => {
  const wallet = c.req.param('wallet') as `0x${string}`;
  return c.contract({
    chainId: `eip155:84532`,
    abi: [{
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
    value: parseEther('0.005'),
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
