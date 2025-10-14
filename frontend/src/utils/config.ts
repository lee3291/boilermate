// Add this declaration at the top to inform TypeScript about the shape of process.env
// This resolves the "Cannot find name 'process'" error for frontend projects.
declare const process: {
  env: {
    AWS_S3_BUCKET_BASE_URL: string;
  };
};

const config = {
  s3BaseUrl: process.env.AWS_S3_BUCKET_BASE_URL,
};

// --- Validation ---
if (!config.s3BaseUrl) {
  throw new Error('FATAL ERROR: AWS_S3_BUCKET_BASE_URL is not defined in the .env file.');
}

export default config;
