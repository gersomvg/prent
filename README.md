# Prent

Service that I use for resizing images on the fly, used by Gersom.nl.

Taken from (and modified): https://aws.amazon.com/blogs/networking-and-content-delivery/resizing-images-with-amazon-cloudfront-lambdaedge-aws-cdn-blog/

## Commands

- Build viewer request function

  ```
  cd lambda/viewer-request-function

  npm install --only=prod"

  mkdir -p ../../dist && zip -FS -q -r ../../dist/viewer-request-function.zip *
  ```

- Build origin response function

  ```
  cd lambda/origin-response-function

  npm install --only=prod --platform=linux --arch=x64"

  mkdir -p ../../dist && zip -FS -q -r ../../dist/origin-response-function.zip *
  ```

- Test

  ```
  bun test
  ```
