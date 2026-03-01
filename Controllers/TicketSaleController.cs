using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;

namespace RaikesHacks_Project_S26.Controllers
{
    /// <summary>
    /// Controller for handling ticket sales related API endpoints.
    /// </summary>
    [ApiController]
    [Route("api/tickets")]
    public class TicketSaleController : ControllerBase
    {
        private readonly ILogger<TicketSaleController> _logger;
        private readonly ITicketAccessor _ticketAccessor;

        public TicketSaleController(ILogger<TicketSaleController> logger, ITicketAccessor ticketAccessor)
        {
            _logger = logger;
            _ticketAccessor = ticketAccessor;
        }

        /// <summary>
        /// Gets all ticket sales.
        /// </summary>
        /// <returns>A list of all ticket sales.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketSale>>> GetAllTickets([FromQuery] string? sortBy)
        {
            _logger.LogInformation("Getting all tickets");
            var tickets = await _ticketAccessor.GetAllTicketsAsync();

            if (!string.IsNullOrEmpty(sortBy) && sortBy.Equals("price", StringComparison.OrdinalIgnoreCase))
            {
                tickets = tickets.OrderBy(t => t.Price);
            }

            return Ok(tickets);
        }

        /// <summary>
        /// Gets a specific ticket sale by its ID.
        /// </summary>
        /// <param name="id">The ID of the ticket sale.</param>
        /// <returns>The ticket sale object if found; otherwise, a 404 Not Found.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TicketSale>> GetTicketById(int id)
        {
            _logger.LogInformation("Getting ticket with ID: {Id}", id);
            var ticket = await _ticketAccessor.GetTicketByIdAsync(id);

            if (ticket == null)
            {
                _logger.LogWarning("Ticket with ID: {Id} not found", id);
                return NotFound();
            }

            return Ok(ticket);
        }

        /// <summary>
        /// Creates a new ticket sale.
        /// </summary>
        /// <param name="ticket">The ticket sale object to create.</param>
        /// <returns>The created ticket sale object with its new ID.</returns>
        [HttpPost]
        public async Task<ActionResult<TicketSale>> CreateTicket([FromBody] TicketSale ticket)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Creating a new ticket for event: {EventName}", ticket.EventName);
            var newTicketId = await _ticketAccessor.CreateTicketAsync(ticket);
            var newTicket = await _ticketAccessor.GetTicketByIdAsync(newTicketId);

            return CreatedAtAction(nameof(GetTicketById), new { id = newTicketId }, newTicket);
        }

        /// <summary>
        /// Updates an existing ticket sale.
        /// </summary>
        /// <param name="id">The ID of the ticket to update.</param>
        /// <param name="ticket">The updated ticket sale object.</param>
        /// <returns>A 204 No Content response if successful; otherwise, an error response.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(int id, [FromBody] TicketSale ticket)
        {
            if (id != ticket.Id)
            {
                return BadRequest("ID in URL must match ID in the request body.");
            }

            if (!ModelState.IsValid) // Validate the model state (email format, etc.)
            {
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Updating ticket with ID: {Id}", id);
            var success = await _ticketAccessor.UpdateTicketAsync(ticket);

            return success ? NoContent() : NotFound();
        }

        /// <summary>
        /// Deletes a ticket sale by its ID.
        /// </summary>
        /// <param name="id">The ID of the ticket to delete.</param>
        /// <returns>A 204 No Content response if successful; otherwise, a 404 Not Found.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            _logger.LogInformation("Deleting ticket with ID: {Id}", id);
            var success = await _ticketAccessor.DeleteTicketAsync(id);

            return success ? NoContent() : NotFound();
        }
    }
}