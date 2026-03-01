using RaikesHacks_Project_S26.Model;

namespace RaikesHacks_Project_S26.Accessors
{
    public interface IOfferAccessor
    {
        Task<int> CreateOfferAsync(Offer offer);
        Task<IEnumerable<Offer>> GetOffersByTicketIdAsync(int ticketId);
        Task<bool> DeleteOfferAsync(int id);
    }
}