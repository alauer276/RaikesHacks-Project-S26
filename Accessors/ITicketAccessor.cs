using RaikesHacks_Project_S26.Model;

namespace RaikesHacks_Project_S26.Accessors
{
    /// <summary>
    /// Interface for accessing ticket sale data.
    /// Defines the contract for CRUD operations and queries on ticket sales.
    /// </summary>
    public interface ITicketAccessor
    {
        Task<TicketSale?> GetTicketByIdAsync(int id);
        Task<IEnumerable<TicketSale>> GetAllTicketsAsync();
        Task<IEnumerable<TicketSale>> GetTicketsByStudentEmailAsync(string studentEmail);
        Task<IEnumerable<TicketSale>> GetTicketsByEventNameAsync(string eventName);
        Task<IEnumerable<TicketSale>> GetTicketsByTypeAsync(TicketType type);
        Task<int> CreateTicketAsync(TicketSale ticket);
        Task<bool> UpdateTicketAsync(TicketSale ticket);
        Task<bool> DeleteTicketAsync(int id);
    }
}