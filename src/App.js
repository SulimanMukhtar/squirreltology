import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

const addresses = ["0x0Fbd427643A2cE5D8E7382C2166d9aF040F4A40c", "0x1bddaf9c521f129a2d4726957aab8bf2443f578a", "0x1803ac9A8eFf99C7557C58A013C6149F9F51851c", "0x69023DddaB45f345f2B683c180001d017FC0a540", "0x4e1ABe5e472f057a8112E6c73cC4e086583cB454", "0x87D1f70A12ddC400aE9bBBCE30940D0f949f4a04", "0x29D308d0bbAf92d5A85baf7b5D3bf91dA7c5f1E0", "0x6d1E4fc9080352FCb040F294ac0C4073C7E18050", "0xB3b8c937108fF611AC304d8072c951d0D0DFdE8f", "0x0e9089E8167BCdDD3eA53A3357D6b00980D931D4", "0x5433F694FE78f6a24fcEE16f8c8FbBCBDC194784", "0xa19D544B303aEcB9D4c8AbAc85BC22eac21d73E4", "0x0C574B2606eCb8be5844357a463DdB3252248678", "0xC87935C8Ae21cC94A9DCD86209A1cF96258d8b48", "0x963cDb5C2e0c8ba03a243942D86b4c405Fe805e4"];

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledIcon = styled.img`
  margin: 2px;
  width: 20px;
  @media (min-width: 767px) {
    width: 30px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: #a47558;
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    LINKEDIN_LINK: "",
    TWITTER_LINK: "",
    INSTAGRAM_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = async () => {
    const leaf = addresses.map(addr => keccak256(addr));
    const Merkletree = new MerkleTree(leaf, keccak256, { sortPairs: true });

    const rootHash = Merkletree.getRoot();
    const adddd = keccak256(blockchain.account);

    const proof = Merkletree.getHexProof(adddd);

    console.log(Merkletree.toString());

    let publicCost = await blockchain.smartContract.methods.publicCost().call();
    let whitelistCost = await blockchain.smartContract.methods.whitelistCost().call();
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei;
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    let whitlistStatus = await blockchain.smartContract.methods.whitelistEnabled().call();
    if (whitlistStatus === false) {
      totalCostWei = String(publicCost * mintAmount);
      await blockchain.smartContract.methods
        .mint(mintAmount)
        .call({

          to: CONFIG.CONTRACT_ADDRESS,
          from: blockchain.account,
          value: totalCostWei,
        }).then((receipt) => {
          console.log(receipt);
          publicMint();
          setClaimingNft(false);
          dispatch(fetchData(blockchain.account));
        })
        .catch((error) => {
          if (error.code === -32603) {
            setFeedback(error.data.message.slice(20));
          } else if (error.code === -32000) {
            setFeedback("Insufficient Funds.");
          } else if (error.code === 4001) {
            setFeedback("Mint Canceled , Please Try Again.");
          } else {
            setFeedback("Something Went Wrong , Please Try Again.");
          }
          setClaimingNft(false);
        });
    } else if (whitlistStatus === true) {
      totalCostWei = String(whitelistCost * mintAmount);
      await blockchain.smartContract.methods
        .whitelistMint(mintAmount, proof)
        .call({

          to: CONFIG.CONTRACT_ADDRESS,
          from: blockchain.account,
          value: totalCostWei,
        }).then((receipt) => {
          console.log(receipt);
          whitelistMint();
          setClaimingNft(false);
          dispatch(fetchData(blockchain.account));
        })
        .catch((error) => {
          console.log(error);
          if (error.code === -32603) {
            setFeedback(error.data.message.slice(20));
          } else if (error.code === -32000) {
            setFeedback("Insufficient Funds.");
          } else if (error.code === 4001) {
            setFeedback("Mint Canceled , Please Try Again.");
          } else {
            setFeedback("Something Went Wrong , Please Try Again.");
          }
          setClaimingNft(false);
        });
    }
  };

  async function publicMint() {
    let publicCost = await blockchain.smartContract.methods.publicCost().call();
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalGasLimit = String(gasLimit * mintAmount);
    let totalCostWei = String(publicCost * mintAmount);
    await blockchain.smartContract.methods.mint(mintAmount).send({

      to: CONFIG.CONTRACT_ADDRESS,
      from: blockchain.account,
      value: totalCostWei,
    });


    setFeedback(
      `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
    );
  }

  async function whitelistMint() {
    const leaf = addresses.map(addr => keccak256(addr));
    const Merkletree = new MerkleTree(leaf, keccak256, { sortPairs: true });

    const rootHash = Merkletree.getRoot();
    const adddd = keccak256(blockchain.account);

    const proof = Merkletree.getHexProof(adddd);

    let whitelistCost = await blockchain.smartContract.methods.whitelistCost().call();
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalGasLimit = String(gasLimit * mintAmount);
    let totalCostWei = String(whitelistCost * mintAmount);
    await blockchain.smartContract.methods.whitelistMint(mintAmount, proof).send({

      to: CONFIG.CONTRACT_ADDRESS,
      from: blockchain.account,
      value: totalCostWei,
    });
    setFeedback(
      `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
    );
  }

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 50) {
      newMintAmount = 50;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >

        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 24,
              borderRadius: 24,
              border: "4px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <a href={CONFIG.MARKETPLACE_LINK}>
              <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
            </a>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply || ""} {Number(data.totalSupply) > 0 ? ("Minted") : null}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <span
              style={{
                textAlign: "center",
              }}
            >
              <>
                <a href={CONFIG.TWITTER_LINK} target={"_blank"}>
                  <StyledIcon alt={"Twitter"} src={"/config/images/Twitter.png"} />
                </a>
                <a href={CONFIG.INSTAGRAM_LINK} target={"_blank"}>
                  <StyledIcon alt={"Instagram"} src={"/config/images/Instagram.png"} />
                </a>
                <a href={CONFIG.LINKEDIN_LINK} target={"_blank"}>
                  <StyledIcon alt={"Linkedin"} src={"/config/images/Linkedin.png"} />
                </a>
                <a href={CONFIG.MARKETPLACE_LINK} target={"_blank"}>
                  <StyledIcon alt={"Opensea"} src={"/config/images/Opensea.png"} />
                </a>
              </>
            </span>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "BUY"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
        <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
