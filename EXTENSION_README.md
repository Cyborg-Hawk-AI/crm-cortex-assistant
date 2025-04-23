
# Actionit Chrome Extension

This README explains how to build and deploy the Actionit Chrome Extension.

## Building the Extension

1. Build the project for production:
   ```
   npm run build
   ```

2. The extension files will be in the `dist` directory.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable "Developer mode" at the top right.
3. Click "Load unpacked" and select the `dist` directory.
4. The extension should now appear in your extensions list.

## Using the Extension

1. Click the Actionit icon in your Chrome toolbar.
2. The side panel will open with the Actionit app.

## Deploying to AWS EKS

For AWS EKS deployment, follow these steps:

1. Build a Docker container with the web app:
   ```
   docker build -t actionit-app .
   ```

2. Push the container to your container registry (ECR).

3. Apply the Kubernetes manifests to deploy to your EKS cluster.

See the main documentation for detailed AWS EKS deployment instructions.
