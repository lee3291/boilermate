import React, { useState, useEffect } from 'react';
import {
  getVerificationStatus,
  getUploadUrl,
  uploadIdImage,
  createVerificationRequest,
  type VerificationStatus,
} from '../../services/verification.service';

const VerificationPage: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const statusData = await getVerificationStatus();
        setStatus(statusData);
      } catch (err) {
        setError('Failed to fetch verification status.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Get pre-signed URL from our backend
      const { preSignedUrl, key } = await getUploadUrl(selectedFile.type);

      // 2. Upload file directly to S3
      await uploadIdImage(preSignedUrl, selectedFile);

      // 3. Notify our backend that the upload is complete
      await createVerificationRequest(key);

      // 4. Refresh status to show 'PENDING'
      const statusData = await getVerificationStatus();
      setStatus(statusData);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const renderStatusContent = () => {
    if (loading) {
      return <p className='text-maingray'>Loading status...</p>;
    }
    if (error) {
      return <p className='text-red-500'>{error}</p>;
    }
    if (!status) {
      return (
        <p className='text-maingray'>Could not load verification status.</p>
      );
    }

    switch (status.status) {
      case 'NOT_SUBMITTED':
        return (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <h3 className='text-maingray text-lg font-medium'>
                Upload your ID
              </h3>
              <p className='text-maingray/80 mt-2 text-sm'>
                Please upload a clear picture of your Purdue University ID card
                to get a verified badge on your profile.
              </p>
            </div>
            <div>
              <label
                htmlFor='id-upload'
                className='text-maingray block text-sm font-medium'
              >
                ID Card Image
              </label>
              <div className='mt-1'>
                <input
                  id='id-upload'
                  name='id-upload'
                  type='file'
                  accept='image/*'
                  onChange={handleFileChange}
                  className='text-maingray file:border-grayline file:bg-maingray-dark hover:file:underline block w-full text-sm file:mr-4 file:rounded-lg file:border-1 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black'
                  disabled={uploading}
                />
              </div>
              {selectedFile && (
                <p className='text-maingray/70 mt-2 text-sm'>
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <div>
              <button
                type='submit'
                disabled={uploading || !selectedFile}
                className='font-sourceserif4-18pt-regular border-grayline bg-mainbrown text-maingray mt-4 w-full rounded-lg border py-2 text-lg transition-colors hover:underline disabled:opacity-70'
              >
                {uploading ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        );
      case 'PENDING':
        return (
          <div className='text-center'>
            <h3 className='text-maingray text-lg font-medium'>
              Verification Pending
            </h3>
            <p className='text-maingray/80 mt-2 text-sm'>
              Your ID has been submitted and is under review. This usually takes
              1-2 business days.
            </p>
          </div>
        );
      case 'APPROVED':
        return (
          <div className='text-center text-green-400'>
            <h3 className='text-lg font-medium'>You are Verified!</h3>
            <p className='mt-2 text-sm'>
              A verified badge will now be displayed on your profile.
            </p>
          </div>
        );
      case 'DECLINED':
        return (
          <div className='text-center text-red-400'>
            <h3 className='text-lg font-medium'>Verification Declined</h3>
            <p className='mt-2 text-sm'>
              {status.reason ||
                'Your submission was declined. Please try again.'}
            </p>
            {/* We can add a button here to allow re-submission */}
          </div>
        );
      default:
        return <p>Unknown status.</p>;
    }
  };

  return (
    <div className='bg-mainbrown flex min-h-screen flex-col justify-center p-4'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='font-sourceserif4-18pt-regular text-maingray mt-6 text-center text-3xl'>
          Account Verification
        </h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='border-grayline bg-sharkgray-light rounded-lg border px-4 py-8 sm:px-10'>
          {renderStatusContent()}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
