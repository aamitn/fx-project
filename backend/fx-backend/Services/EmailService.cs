using fx_backend.utils;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using System;
using System.Threading.Tasks;

public class EmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var fromEmail = _config["EmailSettings:FromEmail"];
        var smtpHost = _config["EmailSettings:SmtpServer"];
        var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
        var username = _config["EmailSettings:Username"];
        var password = _config["EmailSettings:Password"];
        var enableSsl = bool.Parse(_config["EmailSettings:EnableSsl"] ?? "true");

        try
        {
            // ✅ Use the refactored method to get the complete HTML body
            string finalBody = EmailTemplate.GetHtml(body);

            // 1. Create a MimeMessage
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("FurnXpert", fromEmail));
            message.To.Add(new MailboxAddress("Customer", toEmail));
            message.Subject = subject;

            message.Body = new TextPart("html") { Text = finalBody };

            // 2. Determine the correct secure socket option
            var secureSocketOption = SecureSocketOptions.None;
            if (enableSsl)
            {
                if (smtpPort == 465)
                {
                    secureSocketOption = SecureSocketOptions.SslOnConnect;
                }
                else
                {
                    secureSocketOption = SecureSocketOptions.StartTls;
                }
            }

            // 3. Use MailKit's SmtpClient
            using (var smtpClient = new SmtpClient())
            {
                await smtpClient.ConnectAsync(smtpHost, smtpPort, secureSocketOption);
                await smtpClient.AuthenticateAsync(username, password);
                await smtpClient.SendAsync(message);
                await smtpClient.DisconnectAsync(true);
            }

            _logger.LogInformation($"Email sent to {toEmail}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP send failed");
            throw;
        }
    }
}