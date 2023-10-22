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
  const [userWallet, setUserWallet] = useState(null);
  const [nftImages, setNftImages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const limit = 4;

  const handleSigning = async () => {
    setIsLoading(true)
    try {
      const signedMessage = await connex.vendor
        .sign("cert", certificate)
        .request();

      const userWallet = signedMessage.annex.signer;
      console.log(userWallet);
      setUserWallet(userWallet)
      const newImages = await fetchNFTs(userWallet, offset, limit);
      setNftImages(newImages)
    } catch (err) {
      console.log("there was an error")
    } finally {
      setIsLoading(false)
    }
  };

  const handleLoadMore = async () => {
    setIsLoading(true)
    const newOffset = offset + limit;
    const newLimit = limit;
    const newImages = await fetchNFTs(userWallet, newOffset, newLimit);
    setNftImages([...nftImages, ...newImages]);
    setIsLoading(false);
    setOffset(newOffset)
  };

  const sortNFTsByTokenID = () => {
    const sortedNftImages = [...nftImages].sort((a, b) => a.tokenId - b.tokenId);
    setNftImages(sortedNftImages);
  };

async function fetchNFTs(userWallet, offset, limit) {
  const MINOS = connex.thor.account("0xf4d82631be350c37d92ee816c2bd4d5adf9e6493");

  const balance = MINOS.method(balanceOf);
  const nftID = MINOS.method(tokenOfOwnerByIndex);
  const nftURI = MINOS.method(TokenURIAbi);

  const output = await balance.call(userWallet);
  const balanceValue = output.decoded[0];

  if (balanceValue > 0) {
    let images = [];

    // Implement pagination (adjust offset and limit as needed)
    for (let i = offset; i < Math.min(offset + limit, balanceValue); i++) {
      const nftIDOutput = await nftID.call(userWallet, i);
      const tokenId = nftIDOutput.decoded[0];

      const URIOutput = await nftURI.call(tokenId);

      const metadataResponse = await fetch(`https://arweave.net/${URIOutput.decoded[0].substr(5)}`);

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
    <div className='header'>
      <div className='socials'>
        <div className='social discord'>D</div>
        <div className='social discord'>I</div>
        <div className='social x'>X</div>
      </div>
      <img className='logo' src={mino}></img>
      <button className='wallet button' onClick={handleSigning}>
        view Minos by signing
      </button>
      <div className='navMenu'>Nav</div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      <h1 style={{ width: '100%', margin: '0', padding: '25px' }}>View OG Minos</h1>
      {isLoading && nftImages.length === 0 ? (
        <p>Loading...</p>
      ) : null}

      {nftImages && nftImages.length > 0 ? (
        nftImages.map((image, index) => (
          <div key={index} style={{ flex: '1', maxWidth: 'calc(25% - 10px)' }}>
            <img
              key={index}
              src={image.imageUrl}
              alt={`NFT ${index}`}
              style={{ width: '100%', height: 'auto', paddingTop: '50px', minWidth: '250px' }}
            />
            <p style={{ textAlign: 'center' }}>Id: {image.tokenId}</p>
          </div>
        ))
      ) : null}
    </div>
    <button onClick={handleLoadMore}>Load More</button>
    <button onClick={sortNFTsByTokenID}>Sort by Token ID</button> {/* Add a button to trigger sorting */}
  </div>
);
        }