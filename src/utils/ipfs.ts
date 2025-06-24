// You'll need to get a free API key from https://web3.storage/
const WEB3_STORAGE_TOKEN = 'YOUR_WEB3_STORAGE_API_KEY';

interface IPFSResult {
  cid: string;
  url: string;
}

export const storeJSON = async (data: any): Promise<IPFSResult> => {
  try {
    // In a production app, you should move this to an API route to keep your token secure
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to store data on IPFS');
    }

    const { cid } = await response.json();
    return {
      cid,
      url: `https://${cid}.ipfs.w3s.link`
    };
  } catch (error) {
    console.error('IPFS Storage Error:', error);
    throw error;
  }
};

export const retrieveJSON = async (cid: string): Promise<any> => {
  try {
    const response = await fetch(`https://${cid}.ipfs.w3s.link`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from IPFS');
    }
    return await response.json();
  } catch (error) {
    console.error('IPFS Retrieval Error:', error);
    throw error;
  }
};
