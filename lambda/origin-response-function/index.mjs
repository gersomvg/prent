import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import Sharp from 'sharp';

const s3Client = new S3Client({ region: 'eu-central-1' });
const bucket = 'prent-eu-central-1';

export const handler = (event, context, callback) => {
  let response = event.Records[0].cf.response;

  if (response.status == '404') {
    let request = event.Records[0].cf.request;
    const params = new URLSearchParams(request.querystring);
    const width = Number(params.get('w'));
    const match = request.uri.match(/(.*)\/(\d+)w\/([^/]+)\.([^.]+)$/);

    if (!Number.isFinite(width) || width < 1 || match == null) {
      callback(null, request);
      return;
    }

    const [, prefix, roundedWidth, name, extension] = match;

    const originalExtension = params.get('originalExtension') || extension;
    const originalKey = `${prefix}/${name}.${originalExtension}`.substring(1);
    const resizedKey = request.uri.substring(1);
    const requiredFormat = match[4] == 'jpg' ? 'jpeg' : match[4];

    s3Client
      .send(new GetObjectCommand({ Bucket: bucket, Key: originalKey }))
      .then(async (data) => {
        return Sharp(Buffer.concat(await data.Body.toArray()))
          .resize({ width: Number(roundedWidth), withoutEnlargement: true })
          .toFormat(requiredFormat)
          .toBuffer();
      })
      .then((buffer) => {
        s3Client
          .send(
            new PutObjectCommand({
              Body: buffer,
              Bucket: bucket,
              ContentType: 'image/' + requiredFormat,
              Key: resizedKey,
            })
          )
          .catch(() => {
            console.log('Exception while writing resized image to bucket');
          });
        response.status = '200';
        response.statusDescription = 'OK';
        response.body = buffer.toString('base64');
        response.bodyEncoding = 'base64';
        if (!response.headers) response.headers = {};
        response.headers['content-type'] = [
          { key: 'Content-Type', value: 'image/' + requiredFormat },
        ];
        callback(null, response);
      })
      .catch((err) => {
        console.log('Exception while reading source image');
        console.error(err);
      });
  } else {
    callback(null, response);
  }
};
