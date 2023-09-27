import { expect, it } from 'bun:test';
import { handler } from './index.mjs';

it('rounds width and serves webp', () => {
  const request = {
    querystring: 'w=250',
    uri: '/test/image.jpeg',
    headers: {
      accept: [{ key: 'Accept', value: 'text/html,image/webp,image/apng' }],
    },
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/test/300w/image.webp',
  });
});

it('rounds width and serves png', () => {
  const request = {
    querystring: 'w=640',
    uri: '/test/image.png',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/test/600w/image.png',
  });
});

it('rounds width and serves jpg', () => {
  const request = {
    querystring: 'w=890',
    uri: '/test/image.jpg',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/test/900w/image.jpg',
  });
});

it('respects min width', () => {
  const request = {
    querystring: 'w=50',
    uri: '/image.jpeg',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/100w/image.jpeg',
  });
});

it('respects max width', () => {
  const request = {
    querystring: 'w=3400',
    uri: '/image.jpeg',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/3000w/image.jpeg',
  });
});

it('ignores negative width', () => {
  const request = {
    querystring: 'w=-200',
    uri: '/image.jpeg',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/image.jpeg',
  });
});

it('ignores zero width', () => {
  const request = {
    querystring: 'w=0',
    uri: '/image.jpeg',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/image.jpeg',
  });
});

it('ignores malformed width', () => {
  const request = {
    querystring: 'w=abc',
    uri: '/image.jpeg',
  };
  expect(getCallbackValue(request)).toEqual({
    ...request,
    uri: '/image.jpeg',
  });
});

function event(request) {
  return {
    Records: [
      {
        cf: {
          request,
        },
      },
    ],
  };
}

function getCallbackValue(request) {
  let callbackValue;
  handler(event(request), null, (_, value) => (callbackValue = value));
  return callbackValue;
}
