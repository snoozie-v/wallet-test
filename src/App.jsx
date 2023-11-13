import { useState } from 'react'
import Connex from '@vechain/connex'
import { TokenURIAbi, balanceOf, tokenOfOwnerByIndex } from './components/ABI'
import './App.css'
import Header from './components/Header'


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

  const limit = 12;

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
      try {
        let requests = [];
  
        for (let i = offset; i < Math.min(offset + limit, balanceValue); i++) {
          const nftIDOutput = await nftID.call(userWallet, i);
          console.log(nftIDOutput)
          const URIOutput = await nftURI.call(nftIDOutput.decoded[0]);
          console.log(URIOutput)
          requests.push({ nftIDOutput, URIOutput });
        }
  
        const results = await Promise.all(requests);
  
        let images = [];
  
        for (let i = 0; i < results.length; i++) {
          const tokenId = results[i].nftIDOutput.decoded[0];
          const URIOutput = results[i].URIOutput.decoded[0];
  
          const metadataResponse = await fetch(`https://arweave.net/${URIOutput.substr(5)}`);
          const metadata = await metadataResponse.json();
  
          const imageUrl = metadata.image;
          const presentImage = await fetch(`https://arweave.net/${imageUrl.substr(5)}`);
          const presentImageURL = presentImage.url;
  
          images.push({ imageUrl: presentImageURL, tokenId });
        }
  
        console.log(images);
        setNftImages(images);
        return images;
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        return [];
      }
    }
    return [];
  }


return (
  <div>
     <Header handleSigning={handleSigning} />
    <div className="image-wrapper">
      
      

      {nftImages && nftImages.length > 0 ? (
        nftImages.map((image, index) => (
          <div className='images' key={index}>
            <img
              className='image'
              key={index}
              src={image.imageUrl}
              alt={`NFT ${index}`}
            />
            <p>Id: {image.tokenId}</p>
          </div>
        ))
      ) : null}

      {isLoading ? (
        <p>Loading...</p>
      ) : null}
    </div>
    <button onClick={handleLoadMore}>Load More</button>
    <button onClick={sortNFTsByTokenID}>Sort by Token ID</button> 
  </div>
);
        }