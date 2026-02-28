/// <summary>
/// AKS
/// 2.28.2026
/// Defines the ITicketAccessor interface for accessing ticket sales from a SQLite db.
/// </summary>
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RaikesHacks_Project_S26.Model;


namespace RaikesHacks_Project_S26.Accessors
{
    public interface ITicketAccessor
    {
        Task<TicketSale> GetTicketByIdAsync(int id);
        Task<IEnumerable<TicketSale>> GetAllTicketsAsync();
        Task<IEnumerable<TicketSale>> GetTicketsByStudentEmailAsync(string studentEmail);
        Task<IEnumerable<TicketSale>> GetTicketsByEventNameAsync(string eventName);
        Task<int> CreateTicketAsync(TicketSale ticket);
        Task UpdateTicketAsync(TicketSale ticket);
        Task DeleteTicketAsync(int id);
    }
}