import React, { useEffect, useState } from 'react';

const IPFSContent = ({ hash }: { hash: string }) => {
  const [content, setContent] = useState<string>('Loading...');
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

  useEffect(() => {
    const fetchIPFS = async () => {
      try {
        const res = await fetch(`${gateway}${hash}`);
        const text = await res.text();

        // Try parsing as JSON
        const data = JSON.parse(text);
        if (data && data.content) {
          setContent(data.content);
        } else {
          setContent("⚠️ No content field found");
        }
      } catch (err) {
        console.error("Failed to fetch or parse IPFS content:", err);
        setContent("⚠️ Failed to load content");
      }
    };

    fetchIPFS();
  }, [hash, gateway]);

  return (
    <p className="text-gray-800 whitespace-pre-wrap font-medium mb-2">
      {content}
    </p>
  );
};

export default IPFSContent;
