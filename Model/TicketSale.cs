using System;

namespace RaikesHacks_Project_S26.Model
{
    public class TicketSale
    {
        public int Id { get; set; }
        public string StudentEmail { get; set; }
        public string EventName { get; set; }
        public decimal Price { get; set; }
        public bool IsPaid { get; set; }
        public DateTime PurchaseDate { get; set; }
    }

    
}