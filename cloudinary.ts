// utils/cloudinary.ts

/**
 * دالة لرفع الصور لـ Cloudinary
 * تأخذ الملف (File) أو نص (Base64) وتعيد رابط الصورة (URL)
 */
export const uploadToCloudinary = async (file: File | string): Promise<string | null> => {
  // إذا كان المدخل رابطاً جاهزاً بالفعل، نعيده كما هو
  if (typeof file === 'string' && file.startsWith('http')) {
    return file;
  }

  const cloudName = "dirhye0lh";
  const uploadPreset = "inventory_preset";

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary Error:", errorData);
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Critical Cloudinary Error:", error);
    return null;
  }
};