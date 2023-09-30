import { useState } from 'react'
import Connex from '@vechain/connex'
// import { Certificate, secp256k1, blake2b256 } from 'thor-devkit'
import { TokenURIAbi, balanceOf, tokenOfOwnerByIndex } from './components/ABI'
import './App.css'

const connex = new Connex({
  node: "https://mainnet.veblocks.net",
  network: "main"
});

export default function App() {
  const [certificate] = useState({
    purpose: "identification",
    payload: {
      type: "text",
      content: "content to sign"
    }
  });
  
  const [nftImages, setNftImages] = useState([]);

  const handleSigning = async () => {
    try {
      const signedMessage = await connex.vendor
        .sign("cert", certificate)
        .request();

      const userWallet = signedMessage.annex.signer;
      console.log(userWallet);



      await fetchNFTs(userWallet);
    } catch (err) {}
  };



  async function fetchNFTs(userWallet) {
    const VNONS = connex.thor.account(
      "0xf4d82631be350c37d92ee816c2bd4d5adf9e6493"
    );

    const balance = VNONS.method(balanceOf);
    const nftID = VNONS.method(tokenOfOwnerByIndex);
    const nftURI = VNONS.method(TokenURIAbi);

    const output = await balance.call(userWallet);
    const balanceValue = output.decoded[0];

    if (balanceValue > 0) {
      let images = [];
      for (let i = 0; i < balanceValue; i++) {
        const nftIDOutput = await nftID.call(userWallet, i);
        const tokenId = nftIDOutput.decoded[0];

        const URIOutput = await nftURI.call(tokenId);

        const metadataResponse = await fetch(
          `https://arweave.net/${URIOutput.decoded[0].substr(5)}`
        );
  
        const metadata = await metadataResponse.json();
  
        const imageUrl = metadata.image;
        const presentImage = await fetch(`https://arweave.net/${imageUrl.substr(5)}`);
        const presentImageURL = presentImage.url;

        images.push(presentImageURL);
      }
      console.log(images);
      setNftImages(images);
      return images;
    }
    return [];
  }

  return (
    <div>

      <button onClick={handleSigning}>view Minos by signing</button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <h1>View your Mino Mob NFT Collection</h1>
        {nftImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`NFT ${index}`}
            style={{ flex: '1', maxWidth: 'calc(25% - 10px)', height: 'auto', paddingTop: '50px' }}
          />
        ))}
      </div>
    </div>
  );
}