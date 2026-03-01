using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;
using MailKit.Net.Smtp;
using MimeKit;

namespace RaikesHacks_Project_S26.Controllers {
    /// <summary>
    /// Service for sending emails related to ticket transactions, such as notifying sellers of buyer interest.
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config) => _config = config;

        public async Task SendInterestEmailAsync(string sellerEmail, string eventName, TicketInterestRequest request)
        {
            var message = new MimeMessage();
            var fromAddress = _config["Smtp:FromAddress"] ?? "noreply@raikeshacks.com";
            message.From.Add(new MailboxAddress("Raikes Hacks Ticket System", fromAddress));
            message.To.Add(new MailboxAddress("", sellerEmail));
            message.Subject = $"Interest in your ticket: {eventName}";

            message.Body = new TextPart("plain")
            {
                Text = $@"Hello,

You have a potential buyer for your {eventName} ticket!

Buyer Contact:
Name: {request.BuyerName}
Phone: {request.BuyerPhone}

Contact the buyer for more information to finalize the sale.

Best,
RaikesHacks '26 Team"
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(_config["Smtp:Host"], int.Parse(_config["Smtp:Port"] ?? "587"), MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_config["Smtp:Username"], _config["Smtp:Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}