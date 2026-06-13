import { detectImageMimeType } from "@/lib/storage/validation";
import type { ImageMetadata } from "@/types/media";

function readUint32BigEndian(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] * 256 ** 3 +
    bytes[offset + 1] * 256 ** 2 +
    bytes[offset + 2] * 256 +
    bytes[offset + 3]
  );
}

function readUint24LittleEndian(bytes: Uint8Array, offset: number) {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16);
}

function getPngDimensions(bytes: Uint8Array) {
  if (bytes.length < 24) {
    return { width: null, height: null };
  }

  return {
    width: readUint32BigEndian(bytes, 16),
    height: readUint32BigEndian(bytes, 20),
  };
}

function isJpegStartOfFrame(marker: number) {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function getJpegDimensions(bytes: Uint8Array) {
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    const blockLength = (bytes[offset + 2] << 8) + bytes[offset + 3];

    if (isJpegStartOfFrame(marker) && offset + 8 < bytes.length) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8],
      };
    }

    if (!blockLength || blockLength < 2) {
      break;
    }

    offset += 2 + blockLength;
  }

  return { width: null, height: null };
}

function getWebpDimensions(bytes: Uint8Array) {
  const chunkType = String.fromCharCode(...bytes.slice(12, 16));

  if (chunkType === "VP8X" && bytes.length >= 30) {
    return {
      width: readUint24LittleEndian(bytes, 24) + 1,
      height: readUint24LittleEndian(bytes, 27) + 1,
    };
  }

  if (chunkType === "VP8 " && bytes.length >= 30) {
    return {
      width: ((bytes[27] & 0x3f) << 8) | bytes[26],
      height: ((bytes[29] & 0x3f) << 8) | bytes[28],
    };
  }

  if (chunkType === "VP8L" && bytes.length >= 25) {
    const bits =
      bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);

    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return { width: null, height: null };
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectImageMimeType(bytes);

  if (mimeType === "image/png") {
    return { ...getPngDimensions(bytes), mimeType };
  }

  if (mimeType === "image/jpeg") {
    return { ...getJpegDimensions(bytes), mimeType };
  }

  if (mimeType === "image/webp") {
    return { ...getWebpDimensions(bytes), mimeType };
  }

  return {
    width: null,
    height: null,
    mimeType: null,
  };
}
