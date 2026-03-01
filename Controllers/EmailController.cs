using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;

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
        private readonly IEmailService _emailService;

        /// <summary>
        /// Initializes a new instance of the EmailController class.
        /// </summary>
        public EmailController(ITicketAccessor ticketAccessor, IEmailService emailService)
        {
            _ticketAccessor = ticketAccessor;
            _emailService = emailService;
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
                await _emailService.SendInterestEmailAsync(ticket.StudentEmail, ticket.EventName, request);
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