const TELEGRAM_TOKEN = '8703072591:AAHIi980rtmtQxvcROtGxV4UqniJtIxkRXI';
const CHAT_ID = '-5077354515';
const APP_URL = 'https://satun-health-mou.vercel.app/';

export async function sendTelegramNotification(message: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

export function formatSubmissionMessage(indicatorName: string, area: string, timeframe: string, username: string) {
  return `<b>🔔 แจ้งเตือนการส่งข้อมูลใหม่</b>\n\n` +
    `📍 <b>หน่วยงาน:</b> ${area}\n` +
    `📊 <b>ตัวชี้วัด:</b> ${indicatorName}\n` +
    `📅 <b>รอบการประเมิน:</b> ${timeframe}\n` +
    `👤 <b>ผู้ส่ง:</b> ${username}\n\n` +
    `🔗 <a href="${APP_URL}">คลิกที่นี่เพื่อตรวจสอบข้อมูล</a>`;
}

export function formatVerificationMessage(indicatorName: string, area: string, timeframe: string, status: string, feedback?: string) {
  const statusEmoji = status === 'ผ่าน' ? '✅' : status === 'แก้ไข' ? '❌' : 'ℹ️';
  const statusText = status === 'ผ่าน' ? 'ผ่านการตรวจสอบ' : status === 'แก้ไข' ? 'ส่งกลับแก้ไข' : status;

  let message = `<b>${statusEmoji} แจ้งเตือนผลการตรวจสอบข้อมูล</b>\n\n` +
    `📍 <b>หน่วยงาน:</b> ${area}\n` +
    `📊 <b>ตัวชี้วัด:</b> ${indicatorName}\n` +
    `📅 <b>รอบการประเมิน:</b> ${timeframe}\n` +
    `📝 <b>สถานะ:</b> ${statusText}\n`;

  if (feedback) {
    message += `💬 <b>ข้อเสนอแนะ:</b> ${feedback}\n`;
  }

  message += `\n🔗 <a href="${APP_URL}">คลิกที่นี่เพื่อตรวจสอบข้อมูล</a>`;
  return message;
}

export function formatProgressSummary(totalIndicators: number, completedCount: number, pendingCount: number) {
  const percentage = totalIndicators > 0 ? Math.round((completedCount / totalIndicators) * 100) : 0;
  return `<b>📊 สรุปความก้าวหน้าภาพรวม</b>\n\n` +
    `✅ <b>ดำเนินการเสร็จสิ้น:</b> ${completedCount} / ${totalIndicators} (${percentage}%)\n` +
    `⏳ <b>รอการตรวจสอบ:</b> ${pendingCount} รายการ\n\n` +
    `🔗 <a href="${APP_URL}">คลิกที่นี่เพื่อดูรายละเอียด</a>`;
}
