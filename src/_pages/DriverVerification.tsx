import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Tesseract from 'tesseract.js';

const DriverVerificationPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
      setOcrResult('');
      setVerified(false);
    }
  };

  const handleVerify = () => {
    if (!file) return;
    setLoading(true);
    Tesseract.recognize(file, 'eng', { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        setOcrResult(text);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleMarkVerified = () => {
    setVerified(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto mt-8 bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Driver Verification
        </h2>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Driver ID Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-64 h-64 object-contain border rounded mt-4 mx-auto"
            />
          )}
          <button
            type="button"
            onClick={handleVerify}
            disabled={!file || loading}
            className={`w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Running OCR...' : 'Run OCR'}
          </button>
        </form>
        {ocrResult && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
            <h4 className="font-semibold mb-2 text-gray-700">OCR Result</h4>
            <pre className="whitespace-pre-wrap text-gray-800 text-sm">
              {ocrResult}
            </pre>
            {!verified && (
              <button
                type="button"
                onClick={handleMarkVerified}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Mark as Verified
              </button>
            )}
            {verified && (
              <div className="mt-4 flex items-center text-green-700 bg-green-50 border border-green-200 rounded p-3">
                <svg
                  className="w-6 h-6 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">
                  Driver verified successfully!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverVerificationPage;
