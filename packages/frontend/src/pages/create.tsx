import React from "react";
import { ethers } from "ethers";
import {
  getEthersSigner,
  ChainIdType,
  getNetworkConfig,
  getContract,
} from "../modules/web3";

import "./create.css";

export const Create: React.FC = () => {
  const [
    waitingTransactionConfirmation,
    setWaitingTransactionConfirmation,
  ] = React.useState(false);

  const [slippage, setSlippage] = React.useState("");
  const [priceToMint, setPriceToMint] = React.useState("");
  const [priceToBurn, setPriceToBurn] = React.useState("");

  React.useEffect(() => {
    const chainId = "4";
    const network = getNetworkConfig(chainId);
    const contract = getContract(network.contractAddress, chainId);
    contract.totalSupply().then((supply: any) => {
      contract
        .getPriceToMint(supply)
        .then((price: any) => setPriceToMint(price.toString()));
      contract
        .getPriceToBurn(supply)
        .then((price: any) => setPriceToBurn(price.toString()));
    });
  }, []);

  const handleSlippage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlippage(event.target.value);
  };

  const openConfirm = () => {
    const dialog = document.getElementById("dialog-dark") as any;
    dialog.showModal();
  };
  const openAlert = () => {
    const dialog = document.getElementById("dialog-alert") as any;
    dialog.showModal();
  };

  const mintNft = async () => {
    setWaitingTransactionConfirmation(true);
    const signer = await getEthersSigner();
    const chainId = await signer.getChainId();
    if (chainId != 4) {
      openAlert();
      return;
    }
    console.log("test", priceToMint, slippage);

    const value = ethers.BigNumber.from(priceToMint)
      .mul(parseInt(slippage) + 1)
      .toString();
    console.log("test");
    const { contractAddress } = getNetworkConfig(
      chainId.toString() as ChainIdType
    );
    console.log(value);
    const contract = getContract(contractAddress).connect(signer);
    const { hash } = await contract.mint({ value });
    alert(`TxHash:${hash}`);
  };

  return (
    <div className="container">
      <div className="nes-container is-dark with-title is-centered">
        <p className="title">HashCreatures</p>
        <p>
          HashCreatures are generated by minting transaction hash. Svg and
          metadata is generated on chain. HashCreatures image will be
          deteriorated when transferred, and only 5 transfer is allowed. A
          bonding curve determins the mint price, and 90% of the mint price is
          stored in a reserve to refund burned HashCreatures.
        </p>
      </div>
      <div className="slippage">
        <h4>Slippage</h4>
        <div className="slippage_radio" onChange={handleSlippage}>
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="slippage"
              defaultChecked
              value="0"
            />
            <span>0</span>
          </label>
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="slippage"
              value="1"
            />
            <span>1</span>
          </label>
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="slippage"
              value="2"
            />
            <span>2</span>
          </label>
          <label>
            <input
              type="radio"
              className="nes-radio"
              name="slippage"
              value="3"
            />
            <span>3</span>
          </label>
        </div>
      </div>
      <div className="mint_button">
        <button
          type="button"
          className="nes-btn is-success mint_button"
          onClick={mintNft}
        >
          Mint for {priceToMint ? ethers.utils.formatEther(priceToMint) : "?"}{" "}
          ETH
        </button>
      </div>
      <div className="mint_button">
        <button
          type="button"
          className="nes-btn is-error mint_button"
          onClick={mintNft}
        >
          Burn for {priceToBurn ? ethers.utils.formatEther(priceToBurn) : "?"}{" "}
          ETH
        </button>
      </div>
      <section>
        <dialog className="nes-dialog is-dark" id="dialog-alert">
          <form method="dialog">
            <p className="title">Wrong Network Detected!</p>
            <p>Please connect rinkeby network</p>
            <menu className="dialog-menu">
              <button className="nes-btn is-primary">Confirm</button>
            </menu>
          </form>
        </dialog>
      </section>
      <section>
        <dialog className="nes-dialog is-dark" id="dialog-dark">
          <form method="dialog">
            <p className="title">Dark dialog</p>
            <p>Alert: this is a dialog.</p>
            <menu className="dialog-menu">
              <button className="nes-btn" onClick={() => console.log("cancel")}>
                Cancel
              </button>
              <button
                className="nes-btn is-primary"
                onClick={() => console.log("confirm")}
              >
                Confirm
              </button>
            </menu>
          </form>
        </dialog>
      </section>
    </div>
  );
};

export default Create;
