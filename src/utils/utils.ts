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

export function formatTime(
  targetTime: string | Date,
  language: "zh" | "en" = "zh"
): string {
  const now = new Date(); // 当前时间
  const target = new Date(targetTime); // 目标时间

  if (language === "zh") {
    if (isSameDay(now, target)) {
      return formatHoursMinutes(target);
    }
    if (isYesterday(now, target)) {
      return `昨天 ${formatHoursMinutes(target)}`;
    }
    if (isDayBeforeYesterday(now, target)) {
      return `前天 ${formatHoursMinutes(target)}`;
    }
    if (isSameMonth(now, target)) {
      return `${formatMonthDay(target)} ${formatHoursMinutes(target)}`;
    }
    if (isSameYear(now, target)) {
      return formatMonthDay(target);
    }
    return formatFullDate(target);
  } else if (language === "en") {
    if (isSameDay(now, target)) {
      return formatHoursMinutes(target, true);
    }
    if (isYesterday(now, target)) {
      return `Yesterday ${formatHoursMinutes(target, true)}`;
    }
    if (isDayBeforeYesterday(now, target)) {
      return `Day before yesterday ${formatHoursMinutes(target, true)}`;
    }
    if (isSameMonth(now, target)) {
      return `${formatMonthDay(target, true)} ${formatHoursMinutes(
        target,
        true
      )}`;
    }
    if (isSameYear(now, target)) {
      return formatMonthDay(target, true);
    }
    return formatFullDate(target, true);
  }
  return "";
}

// 辅助函数：判断是否是同一天
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// 辅助函数：判断是否是昨天
function isYesterday(now: Date, target: Date): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(yesterday, target);
}

// 辅助函数：判断是否是前天
function isDayBeforeYesterday(now: Date, target: Date): boolean {
  const dayBeforeYesterday = new Date(now);
  dayBeforeYesterday.setDate(now.getDate() - 2);
  return isSameDay(dayBeforeYesterday, target);
}

// 辅助函数：判断是否是同一月
function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

// 辅助函数：判断是否是同一年
function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

// 辅助函数：格式化时间为 时:分
function formatHoursMinutes(date: Date, is12Hour: boolean = false): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  if (is12Hour) {
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// 辅助函数：格式化时间为 月 日
function formatMonthDay(date: Date, isEnglish: boolean = false): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (isEnglish) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[month - 1]} ${day}`;
  }
  return `${month}月${day}日`;
}

// 辅助函数：格式化时间为 年 月 日
function formatFullDate(date: Date, isEnglish: boolean = false): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (isEnglish) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }
  return `${year}年${month}月${day}日`;
}
