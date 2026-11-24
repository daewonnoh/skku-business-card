import QRCode from 'qrcode'

export async function generateQrDataUrl(
  text: string,
  darkColor = '#072A60',
  lightColor = '#FFFFFF'
): Promise<string> {
  if (!text.trim()) return ''
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 360,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
  } catch {
    return ''
  }
}
