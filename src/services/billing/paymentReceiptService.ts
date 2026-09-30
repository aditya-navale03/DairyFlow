//code for payment pdf
import { NativeModules } from 'react-native';
const { DownloadModule } = NativeModules;

import { generatePDF } from 'react-native-html-to-pdf';

export const generatePaymentReceipt = async (
    customerName: string,
    customerMobile: String,
    billAmount: number,
    previousAdvanceUsed: number,
    paymentReceived: number,
    remainingAmount: number,
    advanceAmount: number,
    paidAmount: number,
) => {
    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const html = `
    <html>
      <body
        style="
          font-family: Arial;
          padding: 20px;
        "
      >

        <h2 style="text-align:center;">
          Milk Payment Receipt
        </h2>

        <hr />

        <p>
          <b>Customer:</b>
          ${customerName}
        </p>

        <p>
          <b>Date:</b>
          ${date}
        </p>

        <hr />

        <h3>Payment Details</h3>

        <table
          width="100%"
          cellpadding="8"
          cellspacing="0"
          border="1"
        >

          <tr>
            <td>Milk Bill</td>
            <td align="right">
              ₹${Number(billAmount || 0).toFixed(2)
        }
            </td>
          </tr>

          <tr>
            <td>Previous Advance Used</td>
            <td align="right">
              ₹${Number(previousAdvanceUsed || 0).toFixed(2)
        }
            </td>
          </tr>

          <tr>
            <td>Payment Received</td>
            <td align="right">
              ₹${Number(paymentReceived || 0).toFixed(2)
        }
            </td>
          </tr>

     <tr>
  <td><b>Total Paid</b></td>
  <td align="right">
  <b>₹${Number(paidAmount || 0).toFixed(2)}</b>
</td>
</tr>

          <tr>
            <td><b>Remaining</b></td>
            <td align="right">
              <b>₹${Number(remainingAmount || 0).toFixed(2)
        }</b>
            </td>
          </tr>

          <tr>
            <td>Advance</td>
            <td align="right">
              ₹${Number(advanceAmount || 0).toFixed(2)}
            </td>
          </tr>

        </table>

        <br />

        <h3 style="text-align:center;">
          Payment Received Successfully
        </h3>

      </body>
    </html>
  `;

    const file = await generatePDF({
        html,
        fileName: `PaymentReceipt_${customerName}`,
    });

    console.log(
        'PAYMENT RECEIPT PDF:',
        file.filePath,
    );
const downloadUri =
  await DownloadModule.saveToDownloads(
    file.filePath,
    `${customerName}_of_${date}.pdf`,
  );

console.log(
  'DOWNLOAD URI:',
  downloadUri,
);

const phone =
  customerMobile.replace(/\D/g, '');

const finalNumber =
  phone.startsWith('91')
    ? phone
    : `91${phone}`;

await DownloadModule.shareToWhatsApp(
  file.filePath,
  finalNumber,
);
    console.log(
        'PAYMENT RECEIPT SAVED TO DOWNLOADS',
    );

    return file.filePath;
};