const Z85_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
const decodeMap = new Uint8Array(256);

for (let i = 0; i < Z85_ALPHABET.length; i++) {
  decodeMap[Z85_ALPHABET.charCodeAt(i)] = i;
}

/**
 * Encodes bytes as Z85, padding a final partial chunk automatically.
 *
 * @param {ArrayBuffer | ArrayBufferView} data
 * @returns {string}
 */
function Encode(data) {
  data = ArrayBuffer.isView(data)
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : new Uint8Array(data);
  const padding = (4 - (data.length % 4)) % 4;
  const result = new Array(Math.ceil(data.length / 4) * 5);

  for (let offset = 0; offset < data.length; offset += 4) {
    let value =
      data[offset] * 0x1000000 +
      (data[offset + 1] ?? 0) * 0x10000 +
      (data[offset + 2] ?? 0) * 0x100 +
      (data[offset + 3] ?? 0);

    const outputOffset = (offset / 4) * 5;
    for (let i = 4; i >= 0; i--) {
      result[outputOffset + i] = Z85_ALPHABET[value % 85];
      value = Math.floor(value / 85);
    }
  }

  result.length -= padding;
  return result.join("");
}

/**
 * Decodes Z85 into bytes, padding a final partial chunk automatically.
 * Unrecognized characters have value zero, matching the Go implementation.
 *
 * @param {string} data
 * @returns {Uint8Array}
 */
function Decode(data) {
  const padding = (5 - (data.length % 5)) % 5;
  const result = new Uint8Array(Math.ceil(data.length / 5) * 4 - padding);

  for (let offset = 0; offset < data.length; offset += 5) {
    let value = 0;

    for (let i = 0; i < 5; i++) {
      const index = offset + i;
      let digit = 84;
      if (index < data.length) {
        digit = decodeMap[data.charCodeAt(index)] ?? 0;
      }
      value = (value * 85 + digit) >>> 0;
    }

    const outputOffset = (offset / 5) * 4;
    for (let i = 0; i < 4 && outputOffset + i < result.length; i++) {
      result[outputOffset + i] = value >>> (24 - i * 8);
    }
  }

  return result;
}

export { Decode, Encode };
