export const getBase64ImageFile = (base64Data: string) => {
  // Check for data:image/ prefix
  if (!base64Data.startsWith("data:image/")) {
    throw new Error("Invalid base64 data format. Needs data:image/ prefix.");
  }

  // Extract MIME type and data part
  const mimeType = base64Data.split(";base64,")[0].split(":")[1];
  const data = atob(base64Data.split(";base64,")[1]);

  // Create array buffer to hold binary data
  const arrayBuffer = new ArrayBuffer(data.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert base64 string to binary data
  for (let i = 0; i < data.length; i++) {
    uint8Array[i] = data.charCodeAt(i);
  }

  // Create Blob object to represent image file
  const blob = new Blob([arrayBuffer], { type: mimeType });

  // Create unique filename using current timestamp
  const filename = `image-${Date.now()}.${mimeType.split("/")[1]}`;

  // Create Image File object
  const imageFile = new File([blob], filename, { type: mimeType });

  return imageFile;
};
export const getBlobFromBase64 = (base64Data: string) => {
  // Check for data:image/ prefix
  if (!base64Data.startsWith("data:image/")) {
    throw new Error("Invalid base64 data format. Needs data:image/ prefix.");
  }

  // Extract MIME type and data part
  const mimeType = base64Data.split(";base64,")[0].split(":")[1];
  const data = atob(base64Data.split(";base64,")[1]);

  // Create array buffer to hold binary data
  const arrayBuffer = new ArrayBuffer(data.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert base64 string to binary data
  for (let i = 0; i < data.length; i++) {
    uint8Array[i] = data.charCodeAt(i);
  }

  // Create Blob object to represent image file
  const blob = new Blob([arrayBuffer], { type: mimeType });

  return blob;
};
