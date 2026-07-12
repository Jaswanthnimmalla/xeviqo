// src/lib/cloudinary.ts

// Your Cloudinary credentials
const CLOUDINARY_CLOUD_NAME = "daavatdft"; // From your URL/Cloud name
const CLOUDINARY_UPLOAD_PRESET = "qrCodes"; // Your QR code preset

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // "qrCodes"
  formData.append("folder", "qrcodes"); // Asset folder from your preset

  try {
    console.log("📤 Uploading to Cloudinary...");
    console.log("Cloud Name:", CLOUDINARY_CLOUD_NAME);
    console.log("Upload Preset:", CLOUDINARY_UPLOAD_PRESET);
    console.log("File:", file.name, file.size, "bytes");
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary error:", errorData);
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    console.log("✅ Cloudinary upload complete!");
    console.log("✅ Image URL:", data.secure_url);
    console.log("✅ Public ID:", data.public_id);
    
    return data.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    throw error;
  }
};

// For multiple file uploads
export const uploadMultipleToCloudinary = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

// Get Cloudinary image URL with transformations (optional)

export const getCloudinaryUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: string;
  format?: string;
}): string => {
  let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
  
  if (options) {
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (transformations.length) {
      url += transformations.join(',') + '/';
    }
  }
  
  url += publicId;
  return url;
};