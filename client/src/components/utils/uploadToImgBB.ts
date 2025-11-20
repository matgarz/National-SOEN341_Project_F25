export async function uploadToImgBB(fileOrBase64: File | string) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) throw new Error("Missing VITE_IMGBB_API_KEY");

  const formData = new FormData();
  formData.append("key", apiKey);

  let base64: string;

  if (fileOrBase64 instanceof File) {
    base64 = await fileToBase64(fileOrBase64);
  } else {
    base64 = fileOrBase64;
  }

  // UNIVERSAL prefix stripper
  base64 = base64.replace(/^data:.*;base64,/, "");

  formData.append("image", base64);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("ImgBB response:", data); // <-- debugging

  if (!data.success) {
    throw new Error(data?.error?.message || "Failed to upload image");
  }

  return data.data.url;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
