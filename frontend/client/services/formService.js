import { getAuthToken } from "@/utils/auth";
import { safeError } from "@/utils/logger";

export async function submitNurseryForm(formData, file) {
  const authToken = getAuthToken();
  
  if (!authToken || authToken === "guest") {
    return { success: false, error: "UNAUTHORIZED" };
  }

  const formDataToSend = new FormData();
  
  if (file) {
    let fileToSend = file;
    if (!fileToSend.type || fileToSend.type !== "image/jpeg") {
      fileToSend = new File([fileToSend], fileToSend.name || "registration.jpeg", {
        type: "image/jpeg",
        lastModified: fileToSend.lastModified || Date.now(),
      });
    }
    formDataToSend.append("registrationFile", fileToSend, fileToSend.name || "registration.jpeg");
  }
  
  const nurseryFormDTO = {
    organizationName: formData.organizationName.trim(),
    fullName: formData.fullName.trim(),
    city: formData.city.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim(),
    fileName: file ? file.name : "",
  };
  
  const jsonBlob = new Blob([JSON.stringify(nurseryFormDTO)], { type: "application/json" });
  formDataToSend.append("nurseryFormDTO", jsonBlob);

  const response = await fetch("/api/forms/nurseryform", {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
    body: formDataToSend,
  });

  if (response.status === 401) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
      safeError("Error response:", errorText);
      const errorJson = JSON.parse(errorText);
      errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch (e) {
      errorText = errorText || `HTTP ${response.status}`;
    }
    return { success: false, error: errorText };
  }

  const data = await response.json();
  return { success: true, data };
}