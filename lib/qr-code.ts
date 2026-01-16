import QRCode from 'qrcode';

/**
 * Generate QR code data URL for payment
 */
export async function generatePaymentQRCode(
  bankName: string,
  accountNumber: string,
  accountHolder: string,
  amount: number,
  reference: string
): Promise<string> {
  // Create payment string in a format that can be scanned
  // Format: Bank transfer details
  const paymentData = `Bank: ${bankName}\nAccount: ${accountNumber}\nHolder: ${accountHolder}\nAmount: ${amount.toFixed(2)}\nReference: ${reference}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(paymentData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}