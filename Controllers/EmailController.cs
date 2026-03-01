using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;
using MailKit.Net.Smtp;
using MimeKit;

namespace RaikesHacks_Project_S26.Controllers 
{
    /// <summary>
    /// Controller for handling email related API endpoints.
    /// </summary>
    [ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
        private readonly ITicketAccessor _ticketAccessor;
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Initializes a new instance of the EmailController class.
        /// </summary>
        public EmailController(ITicketAccessor ticketAccessor, IConfiguration configuration)
        {
            _ticketAccessor = ticketAccessor;
            _configuration = configuration;
        }
        
        /// <summary>
        /// Sends an email to ticket owner when a buyer submits interest form with contact info.
        /// </summary>
        /// <param name="request"></param>
        /// <returns>
        /// Returns an Ok result if email is sent successfully, or a NotFound result if ticket is not found.
        /// </returns>
        [HttpPost("send-interest")]
        public async Task<IActionResult> SendInterestEmail([FromBody] TicketInterestRequest request)
        {
            var ticket = await _ticketAccessor.GetTicketByIdAsync(request.TicketId);
            if (ticket == null)
            {
                return NotFound("Ticket not found.");
            }

            try
            {
                var message = new MimeMessage();
                var fromAddress = _configuration["Smtp:FromAddress"] ?? "noreply@raikeshacks.com";
                message.From.Add(new MailboxAddress("Raikes Hacks Ticket System", fromAddress));
                message.To.Add(new MailboxAddress("", ticket.StudentEmail));
                message.Subject = $"Interest in your ticket: {ticket.EventName}";

                message.Body = new TextPart("plain")
                {
                    Text = $@"Hello,

You have a potential buyer for your {ticket.EventName} ticket!

Buyer Contact:
Email: {request.BuyerEmail}
Phone: {request.BuyerPhone}

Contact the buyer for more information to finalize the sale.

Best,
RaikesHacks '26 Team"
                };

                using var client = new SmtpClient();
                await client.ConnectAsync(_configuration["Smtp:Host"], int.Parse(_configuration["Smtp:Port"] ?? "587"), MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_configuration["Smtp:Username"], _configuration["Smtp:Password"]);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                return Ok("Email sent successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error sending email: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Request model for submitting interest in a ticket, containing the ticket ID and buyer's contact information.
    /// </summary>
    public class TicketInterestRequest
    {
        public int TicketId { get; set; }
        public string BuyerEmail { get; set; } = string.Empty;
        public string BuyerPhone { get; set; } = string.Empty;
    }
}