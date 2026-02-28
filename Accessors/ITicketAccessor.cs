/// <summary>
/// AKS
/// 2.28.2026
/// Defines the ITicketAccessor interface for accessing ticket sales from a SQLite db.
/// </summary>
/// <remarks>
/// AKS
/// 2.28.2026
/// </remarks>
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RaikesHacks_Project_S26.Model;

namespace RaikesHacks_Project_S26.Accessors
{
    public interface ITicketAccessor
    {
        /// <summary>
        /// Fetches ticket sale by ID from DB. Returns null if not found.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<TicketSale?> GetTicketByIdAsync(int id);

        /// <summary>
        /// Fetches all ticket sales from DB.
        /// </summary>
        /// <returns></returns>
        Task<IEnumerable<TicketSale>> GetAllTicketsAsync();

        /// <summary>
        /// Fetches ticket sales by student email from DB.
        /// </summary>
        /// <param name="studentEmail"></param>
        /// <returns></returns>
        Task<IEnumerable<TicketSale>> GetTicketsByStudentEmailAsync(string studentEmail);

        /// <summary>
        /// Fetches ticket sales by event name from DB.
        /// </summary>
        /// <param name="eventName"></param>
        /// <returns></returns>
        Task<IEnumerable<TicketSale>> GetTicketsByEventNameAsync(string eventName);

        /// <summary>
        /// Creates a new ticket sale in the DB. Returns the new ticket's ID.
        /// </summary>
        /// <param name="ticket"></param>
        /// <returns></returns>
        Task<int> CreateTicketAsync(TicketSale ticket);

        /// <summary>
        /// Updates an existing ticket sale in the DB. Returns true if update was successful, false if ticket not found.
        /// </summary>
        /// <param name="ticket"></param>
        /// <returns></returns>
        Task<bool> UpdateTicketAsync(TicketSale ticket);

        /// <summary>
        /// Deletes a ticket sale from the DB by ID. Returns true if delete was successful, false if ticket not found.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<bool> DeleteTicketAsync(int id);
    }
}