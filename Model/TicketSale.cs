using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace RaikesHacks_Project_S26.Model
{
    /// <summary>
    /// Ticket sale model class representing a ticket sale record in the database. Contains properties for ID,
    /// student email, event name, price, payment status, and purchase date.
    /// </summary>
    /// <remarks>
    /// AKS
    /// 2.28.2026
    /// </remarks>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TicketType
    {
        Football,
        Volleyball,
        Basketball,
        Music
    }

    public class TicketSale
    {
        public int Id { get; set; }
        [RegularExpression(@"^[^@\s]+@(nebraska\.edu|unl\.edu|huskers\.unl\.edu)$", ErrorMessage = "Email must be a valid nebraska.edu, unl.edu, or huskers.unl.edu address.")]
        public string StudentEmail { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public TicketType Type { get; set; }
        public bool IsPaid { get; set; }
        public DateTime PurchaseDate { get; set; }
    }
}