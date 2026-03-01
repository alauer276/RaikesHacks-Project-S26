using Microsoft.Data.Sqlite;
using RaikesHacks_Project_S26.Model;

namespace RaikesHacks_Project_S26.Accessors
{
    public class OfferAccessor : IOfferAccessor
    {
        private readonly string _connectionString;

        public OfferAccessor(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("TicketDb")!;
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();
            var command = connection.CreateCommand();
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS Offers (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    TicketId INTEGER NOT NULL,
                    BuyerName TEXT NOT NULL,
                    BuyerPhone TEXT NOT NULL,
                    SubmittedAt TEXT NOT NULL
                );
            ";
            command.ExecuteNonQuery();
        }

        public async Task<int> CreateOfferAsync(Offer offer)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = @"
                INSERT INTO Offers (TicketId, BuyerName, BuyerPhone, SubmittedAt)
                VALUES (@TicketId, @BuyerName, @BuyerPhone, @SubmittedAt);
                SELECT last_insert_rowid();
            ";
            command.Parameters.AddWithValue("@TicketId", offer.TicketId);
            command.Parameters.AddWithValue("@BuyerName", offer.BuyerName);
            command.Parameters.AddWithValue("@BuyerPhone", offer.BuyerPhone);
            command.Parameters.AddWithValue("@SubmittedAt", offer.SubmittedAt.ToString("o"));
            return Convert.ToInt32(await command.ExecuteScalarAsync());
        }

        public async Task<IEnumerable<Offer>> GetOffersByTicketIdAsync(int ticketId)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "SELECT Id, TicketId, BuyerName, BuyerPhone, SubmittedAt FROM Offers WHERE TicketId = @TicketId";
            command.Parameters.AddWithValue("@TicketId", ticketId);
            using var reader = await command.ExecuteReaderAsync();
            var offers = new List<Offer>();
            while (await reader.ReadAsync())
            {
                offers.Add(new Offer
                {
                    Id = reader.GetInt32(0),
                    TicketId = reader.GetInt32(1),
                    BuyerName = reader.GetString(2),
                    BuyerPhone = reader.GetString(3),
                    SubmittedAt = DateTime.Parse(reader.GetString(4))
                });
            }
            return offers;
        }

        public async Task<bool> DeleteOfferAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM Offers WHERE Id = @Id";
            command.Parameters.AddWithValue("@Id", id);
            int affectedRows = await command.ExecuteNonQueryAsync();
            return affectedRows > 0;
        }
    }
}