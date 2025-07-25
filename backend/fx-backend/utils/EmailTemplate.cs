namespace fx_backend.utils
{
    public static class EmailTemplate
    {
        // Define your common HTML email template with a placeholder for the body
        private const string Template = @"
            <!DOCTYPE html>
            <html lang=""en"">
            <head>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <title>Notification</title>
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: #4CAF50; color: white; padding: 10px 0; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ padding: 20px; line-height: 1.6; color: #333; }}
                    .footer {{ text-align: center; font-size: 12px; color: #777; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class=""container"">
                    <div class=""header"">
                        <h2>FurnXpert Systems</h2>
                    </div>
                    <div class=""content"">
                        {0}
                    </div>
                    <div class=""footer"">
                        <p>&copy; 2025 Bitmutex technologies. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";

        /// <summary>
        /// Combines the email template with the provided body content.
        /// </summary>
        /// <param name="body">The custom HTML body content to insert into the template.</param>
        /// <returns>The complete HTML string for the email.</returns>
        public static string GetHtml(string body)
        {
            return string.Format(Template, body);
        }
    }
}