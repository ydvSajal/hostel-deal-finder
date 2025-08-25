#!/bin/bash

# AWS Deployment Script for BU_Basket
# Make sure to set these environment variables:
# AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
# S3_BUCKET_NAME, CLOUDFRONT_DISTRIBUTION_ID

set -e

echo "🚀 Starting AWS deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Upload to S3
echo "☁️ Uploading to S3..."
aws s3 sync dist/ s3://${S3_BUCKET_NAME} --delete --exclude ".git/*" --exclude "node_modules/*"

# Set proper permissions for S3 objects
echo "🔒 Setting S3 permissions..."
aws s3api put-bucket-policy --bucket ${S3_BUCKET_NAME} --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'${S3_BUCKET_NAME}'/*"
    }
  ]
}'

# Configure S3 bucket for static website hosting
echo "🌐 Configuring S3 static website hosting..."
aws s3 website s3://${S3_BUCKET_NAME} --index-document index.html --error-document index.html

# Invalidate CloudFront cache
if [ ! -z "${CLOUDFRONT_DISTRIBUTION_ID}" ]; then
  echo "🔄 Invalidating CloudFront cache..."
  aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
  echo "✅ CloudFront cache invalidated"
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app is now live!"

if [ ! -z "${S3_BUCKET_NAME}" ]; then
  echo "📍 S3 URL: http://${S3_BUCKET_NAME}.s3-website-${AWS_REGION}.amazonaws.com"
fi