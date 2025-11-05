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
      return <p>Loading status...</p>;
    }
    if (error) {
      return <p className='text-red-500'>{error}</p>;
    }
    if (!status) {
      return <p>Could not load verification status.</p>;
    }

    switch (status.status) {
      case 'NOT_SUBMITTED':
        return (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium text-gray-900'>
                Upload your ID
              </h3>
              <p className='mt-2 text-sm text-gray-600'>
                Please upload a clear picture of your Purdue University ID card
                to get a verified badge on your profile.
              </p>
            </div>
            <div>
              <label
                htmlFor='id-upload'
                className='block text-sm font-medium text-gray-700'
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
                  className='block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100'
                  disabled={uploading}
                />
              </div>
              {selectedFile && (
                <p className='mt-2 text-sm text-gray-500'>
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <div>
              <button
                type='submit'
                disabled={uploading || !selectedFile}
                className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:bg-gray-400'
              >
                {uploading ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        );
      case 'PENDING':
        return (
          <div className='text-center'>
            <h3 className='text-lg font-medium text-gray-900'>
              Verification Pending
            </h3>
            <p className='mt-2 text-sm text-gray-600'>
              Your ID has been submitted and is under review. This usually takes
              1-2 business days.
            </p>
          </div>
        );
      case 'APPROVED':
        return (
          <div className='text-center text-green-600'>
            <h3 className='text-lg font-medium'>You are Verified!</h3>
            <p className='mt-2 text-sm'>
              A verified badge will now be displayed on your profile.
            </p>
          </div>
        );
      case 'DECLINED':
        return (
          <div className='text-center text-red-600'>
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
    <div className='flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Account Verification
        </h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          {renderStatusContent()}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
