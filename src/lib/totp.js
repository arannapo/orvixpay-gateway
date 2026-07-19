import crypto from 'crypto';

// Base32 decode function compliant with RFC 4648
function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const cleaned = base32.replace(/=+$/, '').toUpperCase();
  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned.charAt(i));
    if (val === -1) throw new Error('Invalid Base32 character');
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

// RFC 6238 TOTP verification function
export function verifyTOTP(secret, code, window = 1) {
  try {
    if (!secret || !code) return false;
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const currentStep = Math.floor(epoch / timeStep);
    
    // Check current step and surrounding window steps for clock drift
    for (let i = -window; i <= window; i++) {
      const step = currentStep + i;
      const buf = Buffer.alloc(8);
      buf.writeUInt32BE(0, 0);
      buf.writeUInt32BE(step, 4);
      
      const hmac = crypto.createHmac('sha1', key);
      hmac.update(buf);
      const hmacResult = hmac.digest();
      
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const binCode = ((hmacResult[offset] & 0x7f) << 24) |
                      ((hmacResult[offset + 1] & 0xff) << 16) |
                      ((hmacResult[offset + 2] & 0xff) << 8) |
                      (hmacResult[offset + 3] & 0xff);
                      
      const generatedCode = (binCode % 1000000).toString().padStart(6, '0');
      if (generatedCode === code) {
        return true;
      }
    }
  } catch (err) {
    console.error('Error verifying TOTP:', err);
  }
  return false;
}
