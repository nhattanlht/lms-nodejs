import { createTransport } from "nodemailer";

const sendMail = async (email, subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - E-Learning Website</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">

    <!-- Email Wrapper -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
        <tr>
            <td align="center">

                <!-- Container -->
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px; text-align: center;">

                            <!-- Title -->
                            <h1 style="color: #333; margin-bottom: 10px; font-size: 24px; font-weight: bold;">OTP Verification</h1>
                            <h2 style="color: #8a4baf; margin-top: 0; font-size: 18px; font-weight: normal;">E-Learning Website</h2>

                            <!-- Greeting -->
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Hello <strong>${data.name}</strong>,
                            </p>
                            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                Your One-Time Password (OTP) for account verification is:
                            </p>

                            <!-- OTP Code -->
                            <p style="font-size: 36px; color: #8a4baf; font-weight: bold; margin: 30px 0;">
                                ${data.otp}
                            </p>

                            <!-- Button -->
                            <a href="#" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #8a4baf; border-radius: 5px; text-decoration: none;">
                                Verify Now
                            </a>

                            <!-- Footer -->
                            <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 40px;">
                                If you did not request this OTP, please ignore this email.
                            </p>
                            <p style="color: #999; font-size: 12px; line-height: 1.6; margin-top: 5px;">
                                Thank you,<br>
                                LMS - Group 03 - Intro2SE CSC13002 CQ2022/1
                            </p>

                        </td>
                    </tr>
                </table>
                <!-- End Container -->

            </td>
        </tr>
    </table>
    <!-- End Wrapper -->

</body>
</html>
`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: email,
    subject,
    html,
  });
};

export default sendMail;

export const sendForgotMail = async (subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f3f3; font-family: Arial, sans-serif;">
  <!-- Email Wrapper -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f3f3; padding: 20px 0;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 30px; text-align: center;">

              <!-- Title -->
              <h1 style="color: #8a4baf; margin-bottom: 20px; font-size: 24px;">Reset Your Password</h1>

              <!-- Greeting -->
              <p style="color: #666666; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">Hello <strong>${data.name}</strong>,</p>

              <!-- Message -->
              <p style="color: #666666; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
                You have requested to reset your password. Please click the button below to proceed with resetting your password.
              </p>

              <!-- Button -->
              <a href="${process.env.frontendurl}/reset-password/${data.token}" 
                style="display: inline-block; padding: 15px 30px; background-color: #8a4baf; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                Reset Password
              </a>

              <!-- Additional Info -->
              <p style="color: #666666; margin-top: 30px; font-size: 14px; line-height: 1.6;">
                If you did not request this, please ignore this email.
              </p>

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="margin-top: 20px;">
          <tr>
            <td align="center" style="color: #999999; font-size: 14px; text-align: center; padding: 10px;">
              <p style="margin: 0;">Thank you,<br>LMS - Group 03 - Intro2SE CSC13002 CQ2022/1</p>
              <p style="margin: 0;">
                <a href="https://yourwebsite.com" style="color: #8a4baf; text-decoration: none;">yourwebsite.com</a>
              </p>
            </td>
          </tr>
        </table>
        <!-- End Footer -->

      </td>
    </tr>
  </table>
  <!-- End Wrapper -->
</body>
</html>
`;

  await transport.sendMail({
    from: process.env.Gmail,
    to: data.email,
    subject,
    html,
  });
};

export const sendNotificationMail = async (subject, data) => {
  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.course ? `${data.course} -`: ""}${subject}</title>
  <style>
    /* General resets */
    body {
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      font-family: Arial, sans-serif;
    }

    table {
      border-spacing: 0;
      width: 100%;
    }

    td {
      padding: 0;
    }

    /* Email container */
    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Header */
    .email-header {
      background-color: #8a4baf;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }

    /* Body */
    .email-body {
      padding: 20px;
      color: #333333;
    }

    .email-body p {
      margin: 0 0 20px;
      line-height: 1.6;
      color: #666666;
    }

    .email-body a.button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #8a4baf;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      margin-top: 20px;
    }

    .email-body a.button:hover {
      background-color: #5f357e;
    }

    /* Footer */
    .email-footer {
      text-align: center;
      padding: 20px;
      background-color: #f1f1f1;
      font-size: 14px;
      color: #999999;
    }

    .email-footer a {
      color: #8a4baf;
      text-decoration: none;
    }

    .email-footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <table class="email-container">
    <!-- Header -->
    <tr>
      <td class="email-header">
        ${data.course ? `<div>${data.course}</div>` : ""}
        ${subject}
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td class="email-body">
        <p>Dear ${data.recipientName || 'User'},</p>
        <p>${data.message}</p>
        ${data.actionUrl 
          ? `<a href="${data.actionUrl}" class="button">Take Action</a>` 
          : ''}
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td class="email-footer">
        <p>If you have any questions, please contact us at <a href="mailto:support@example.com">support@example.com</a>.</p>
        <p>Thank you,<br>The LMS Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  
    await transport.sendMail({
      from: process.env.Gmail,
      to: data.recipientEmails,
      subject,
      html,
      ...(data.file && {
        attachments: [
          {
            filename: data.file.filename,
            path: data.file.path,
          },
        ],
      }),
    });
  };