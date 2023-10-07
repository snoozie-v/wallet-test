import { useState } from 'react'
import Connex from '@vechain/connex'
import { TokenURIAbi, balanceOf, tokenOfOwnerByIndex } from './components/ABI'
import './App.css'
import mino from './assets/minomob.png'

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
    const MINOS = connex.thor.account(
      "0xf4d82631be350c37d92ee816c2bd4d5adf9e6493"
    );

    const balance = MINOS.method(balanceOf);
    const nftID = MINOS.method(tokenOfOwnerByIndex);
    const nftURI = MINOS.method(TokenURIAbi);

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

        images.push({ imageUrl: presentImageURL, tokenId: tokenId });
      }
      console.log(images);
      setNftImages(images);
      return images;
    }
    return [];
  }

  return (
<div>


<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
<button onClick={handleSigning}>view Minos by signing</button>
  <img src={mino}></img>
  <h1 style={{width: '100%', margin: '0', padding: '0'}}>View OG Minos</h1>
  
    {nftImages.map((image, index) => (
     <div key={index} style={{ flex: '1', maxWidth: 'calc(25% - 10px)' }}>
    <img
      key={index}
      src={image.imageUrl}
      alt={`NFT ${index}`}
      style={{ width: '100%', height: 'auto', paddingTop: '50px', minWidth: '250px' }}
    />
    <p style={{ textAlign: 'center' }}>Id: {image.tokenId}</p>
    </div>
  ))}
</div>
</div>
  );
}