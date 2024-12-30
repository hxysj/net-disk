// 计算文件大小
export const formatFileSize: (fileSizeInB: number) => string = (
  fileSizeInB
) => {
  const fileSizeInGB: number = eval(fileSizeInB + "/ (1024 * 1024 * 1024)");
  const fileSizeInMB = eval(fileSizeInB + "/ (1024 * 1024)");
  const fileSizeInKB = eval(fileSizeInB + "/ 1024");
  if (fileSizeInGB > 1) {
    return `${fileSizeInGB.toFixed(2)} GB`; // 保留两位小数
  } else if (fileSizeInMB > 1) {
    return `${fileSizeInMB.toFixed(2)} MB`; // 保留两位小数
  } else if (fileSizeInKB > 1) {
    return `${fileSizeInKB.toFixed(2)} KB`;
  } else {
    return `${fileSizeInB} B`;
  }
};

// 获取当前时间
export function getCurrentFormattedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 函数用于解析JWT
export function parseToken(token: string) {
  if (!token || token == "undefined") return null;
  // console.log(token)

  // 分割Token字符串，获取payload部分
  const base64Url = token.split(".")[1];
  // 对base64Url进行解码
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // 将base64字符串转换为字符串格式
  const payload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  // 将JSON字符串转换为对象
  const payloadObj = JSON.parse(payload);

  return payloadObj;
}

export async function fetchEncryptionKey() {
  try {
    // 使用 fetch 请求读取 .bin 文件
    const response = await fetch("/encryption_key.bin"); // 访问 public/assets 目录中的文件

    if (!response.ok) {
      throw new Error("Failed to fetch the encryption key file");
    }

    // 将文件内容转为 ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // 将 ArrayBuffer 转换为 Hex 字符串（假设用于加密密钥）
    const encryptionKey = bufferToHex(arrayBuffer);

    // 将读取的密钥保存到 encryption 变量
    let encryption = encryptionKey;

    console.log("Encryption Key:", encryption); // 打印输出密钥

    // 你可以在这里使用 `encryption` 变量进行后续的加密/解密操作

    return encryption;
  } catch (error) {
    console.error("Error fetching the encryption key:", error);
  }
}

// Helper function: 将 ArrayBuffer 转换为 Hex 字符串
function bufferToHex(buffer: any) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (byte) => {
      return byte.toString(16).padStart(2, "0");
    })
    .join("");
}
