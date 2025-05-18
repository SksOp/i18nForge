export const emailTemplate = (projectName: string, colabLink: string, senderName: string) => {
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
            <img src="/api/placeholder/150/60" alt="i18nForge Logo">
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
                    <li>Fork the repository to your GitHub account</li>
                    <li>Navigate to the <code>/locales/</code> directory where you'll find language files</li>
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
            <p>© 2025 i18nForge. All rights reserved.</p>
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
}