export const emailTemplate = (projectName: string, colabLink: string, senderName: string) => {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join i18nForge Translation Collaboration</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4a86e8;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .header h1 {
            color: white;
            margin: 10px 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 30px;
        }
        .repo-info {
            background-color: #f2f7ff;
            border-left: 4px solid #4a86e8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
        .steps {
            background-color: #f9f9f9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .steps ol {
            margin-left: 20px;
            padding-left: 0;
        }
        .steps li {
            margin-bottom: 10px;
        }
        .button {
            display: inline-block;
            background-color: #4a86e8;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background-color: #3a76d8;
        }
        .footer {
            background-color: #f2f2f2;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            text-decoration: none;
        }
        .highlight {
            font-weight: bold;
            color: #4a86e8;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 300'><path d='M66.6585 1.83056C138.579 35.1733 478.299 46.7049 7.0978 295.937C485.26 133.941 371.903 -5.57091 66.6585 1.83056Z' fill='%23D3D3D3'/></svg>" alt="i18nForge Logo">
            <h1>Translate with i18nForge</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            
            <p>You've been invited to collaborate on language translations for <span class="highlight">${projectName}</span>! Your language expertise would be a valuable addition to our global community.</p>
            
            <div class="repo-info">
                <p><strong>Repository:</strong> ${projectName}</p>
            </div>
            
            <p>i18nForge makes translating software projects simple. You'll be able to contribute directly to the language files in our GitHub repository, helping to make ${projectName} accessible to users worldwide.</p>
            
            <div class="steps">
                <h3>How to Get Started:</h3>
                <ol>
                    <li>Click the "Join Translation Team" button below to access the repository</li>
                    <li>Edit the translation files for your preferred language</li>
                    <li>Submit a pull request with your changes</li>
                </ol>
            </div>
            
            <p>Our i18nForge platform will automatically validate your translations, ensuring formatting and special characters are preserved correctly.</p>
            
            <p style="text-align: center;">
                <a href="${colabLink}" class="button">Join Translation Team</a>
            </p>
            
            <p>No previous translation experience is necessary! Our documentation provides all the guidance you need to make effective contributions.</p>
            
            <p>Thank you for helping to make technology more accessible across language barriers!</p>
            
            <p>Best regards,<br>
            ${senderName}<br>
            i18nForge Team</p>
        </div>
        
        <div class="footer">
            <p>© ${year === 2025 ? '2025' : `2025-${year}`} i18nForge. All rights reserved.</p>
            <div class="social-links">
                <a href="https://github.com/i18nForge">GitHub</a> | 
                <a href="https://twitter.com/i18nForge">Twitter</a> | 
                <a href="https://i18nforge.com/docs">Documentation</a>
            </div>
            <p>You're receiving this email because you were invited to collaborate on translations for ${projectName}.<br>
            If you believe this was sent in error, please disregard this email.</p>
        </div>
    </div>
</body>
</html>
    `;
};

export const emailWelcomeTemplate = (name: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome to i18nforge</title>
</head>
<body style="margin:0; padding:0; background-color:#f9f9f9; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9f9f9">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin: 40px auto; border-radius:8px; overflow: hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a73e8; padding: 40px 30px; color:#ffffff; text-align:center;">
              <h1 style="margin:0; font-size:28px;">Welcome to <span style="color: #fff;">i18nforge</span></h1>
              <p style="margin:10px 0 0; font-size:16px;">You're all set to manage your i18n files smarter.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; color: #333;">
              <p style="font-size:16px; margin-top:0;">Hi ${name} 👋,</p>

              <p style="font-size:16px; line-height:1.6;">
                Thanks for logging in! You now have access to powerful tools to streamline your i18n workflow.
                With <strong>i18nforge</strong>, managing translations is no longer a pain:
              </p>

              <ul style="font-size:15px; line-height:1.6; padding-left:20px;">
                <li>Automatic syncing with your GitHub repos</li>
                <li>Real-time collaboration with your team</li>
                <li>Consistency across all language files</li>
                <li>Smart detection of missing or outdated keys</li>
              </ul>

              <p style="font-size:16px; line-height:1.6;">
                Explore your dashboard and take full control of your project's internationalization.
              </p>

              <div style="text-align:center; margin: 30px 0;">
                <a href="https://beta.i18nforge.com/home" target="_blank" style="background-color:#1a73e8; color:#fff; padding:14px 26px; border-radius:6px; text-decoration:none; font-weight:bold;">
                  Go to Dashboard
                </a>
              </div>

              <p style="font-size:14px; color:#999; text-align:center;">
                Need assistance? We're just a message away: <a href="mailto:info@i18nforge.com" style="color:#1a73e8; text-decoration:none;">support@i18nforge.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f1f1; text-align:center; padding:20px; font-size:12px; color:#777;">
              © 2025 i18nforge All rights reserved.<br/>
              <a href="https://beta.i18nforge.com" style="color:#1a73e8; text-decoration:none;">Visit our website</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
};
