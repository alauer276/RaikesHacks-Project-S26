using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;
using MailKit.Net.Smtp;
using MimeKit;

namespace RaikesHacks_Project_S26.Controllers
{
    /// <summary>
    /// Service for sending emails related to ticket transactions, such as notifying sellers of buyer interest.
    /// </summary>
    public interface IEmailService
    {
        public Task SendInterestEmailAsync(string sellerEmail, string eventName, TicketInterestRequest request);
    }
}