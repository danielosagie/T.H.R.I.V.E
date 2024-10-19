import React, { useState } from 'react';
//import axios from 'axios'; & useEffect

interface StreamingComponentProps {
  inputText: string;
  selectedDocuments: string[]; // Assuming selectedDocuments is an array of strings, adjust if needed
}

const StreamingComponent: React.FC<StreamingComponentProps> = ({ inputText, selectedDocuments }) => {
  const [streamedContent, setStreamedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const startStreaming = async () => {
    setIsStreaming(true);
    setStreamedContent('');

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText, selectedDocuments }),
      });

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamedContent((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div>
      <button onClick={startStreaming} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Start Streaming'}
      </button>
      <div>
        {streamedContent}
      </div>
    </div>
  );
};

export default StreamingComponent;
