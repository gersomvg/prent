const widthGranularity = 100;
const minWidth = 100;
const maxWidth = 3000;

export const handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const params = new URLSearchParams(request.querystring);
  const width = Number(params.get('w'));
  const match = request.uri.match(/(.*)\/([^/]+)\.([^.]+)$/);

  if (!Number.isFinite(width) || width < 1 || match == null) {
    callback(null, request);
    return;
  }

  const [, prefix, name, extension] = match;

  let granularWidth = Math.round(width / widthGranularity) * widthGranularity;
  granularWidth = Math.max(minWidth, Math.min(maxWidth, granularWidth));

  const acceptsWebp = (request.headers?.['accept']?.[0].value || '').includes(
    'webp'
  );
  const newExtension = acceptsWebp ? 'webp' : extension;
  const newUri = `${prefix}/${granularWidth}w/${name}.${newExtension}`;
  request.uri = newUri;
  params.set('originalExtension', extension);
  request.querystring = params.toString();
  callback(null, request);
};
