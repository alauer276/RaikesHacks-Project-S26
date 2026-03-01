namespace RaikesHacks_Project_S26.Model
{
    public class Offer
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string BuyerName { get; set; } = string.Empty;
        public string BuyerPhone { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
    }
}