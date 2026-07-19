import { NextResponse } from 'next/server';
import crypto from 'crypto';

function getPublicIdFromUrl(url) {
  try {
    // Matches public ID after v\d+/ or upload/ and before the extension
    const regex = /\/v\d+\/([^\s]+)\.[a-z0-9]+$/i;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
    const regexNoVersion = /\/upload\/([^\s]+)\.[a-z0-9]+$/i;
    const matchNoVersion = url.match(regexNoVersion);
    if (matchNoVersion && matchNoVersion[1]) {
      return matchNoVersion[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function deleteFromCloudinary(url, cloudName, apiKey, apiSecret) {
  try {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const destroyData = new FormData();
    destroyData.append('public_id', publicId);
    destroyData.append('api_key', apiKey);
    destroyData.append('timestamp', timestamp.toString());
    destroyData.append('signature', signature);

    const destroyRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: destroyData,
    });
    const resJson = await destroyRes.json();
    return resJson.result === 'ok';
  } catch (error) {
    console.error('Cloudinary destroy error:', error);
    return false;
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const oldLogoUrl = formData.get('oldLogoUrl');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ success: false, error: 'Cloudinary credentials missing' }, { status: 500 });
    }

    // Delete the previous logo from Cloudinary if provided
    if (oldLogoUrl) {
      await deleteFromCloudinary(oldLogoUrl, cloudName, apiKey, apiSecret);
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'orvixpay/logo';

    // Generate SHA-1 signature for upload
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    // Create a new form data for Cloudinary
    const cloudinaryData = new FormData();
    cloudinaryData.append('file', file);
    cloudinaryData.append('api_key', apiKey);
    cloudinaryData.append('timestamp', timestamp.toString());
    cloudinaryData.append('folder', folder);
    cloudinaryData.append('signature', signature);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryData,
    });

    const result = await uploadRes.json();

    if (result.secure_url) {
      return NextResponse.json({ success: true, url: result.secure_url });
    } else {
      console.error('Cloudinary Error:', result);
      return NextResponse.json({ success: false, error: 'Failed to upload to Cloudinary' }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
