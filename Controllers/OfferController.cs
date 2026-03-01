using Microsoft.AspNetCore.Mvc;
using RaikesHacks_Project_S26.Accessors;
using RaikesHacks_Project_S26.Model;

namespace RaikesHacks_Project_S26.Controllers
{
    [ApiController]
    [Route("api/offers")]
    public class OfferController : ControllerBase
    {
        private readonly IOfferAccessor _offerAccessor;
        private readonly ITicketAccessor _ticketAccessor;

        public OfferController(IOfferAccessor offerAccessor, ITicketAccessor ticketAccessor)
        {
            _offerAccessor = offerAccessor;
            _ticketAccessor = ticketAccessor;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOffer([FromBody] Offer offer)
        {
            var ticket = await _ticketAccessor.GetTicketByIdAsync(offer.TicketId);
            if (ticket == null) return NotFound("Ticket not found.");
            offer.SubmittedAt = DateTime.UtcNow;
            var id = await _offerAccessor.CreateOfferAsync(offer);
            return Ok(new { id });
        }

        [HttpGet("my-offers")]
        public async Task<IActionResult> GetMyOffers([FromQuery] string email)
        {
            var tickets = await _ticketAccessor.GetTicketsByStudentEmailAsync(email);
            var allOffers = new List<object>();
            foreach (var ticket in tickets)
            {
                var offers = await _offerAccessor.GetOffersByTicketIdAsync(ticket.Id);
                foreach (var offer in offers)
                {
                    allOffers.Add(new {
                        offer.Id,
                        offer.BuyerName,
                        offer.BuyerPhone,
                        offer.SubmittedAt,
                        ticketName = ticket.EventName,
                        ticketId = ticket.Id
                    });
                }
            }
            return Ok(allOffers);
        }
    }
}