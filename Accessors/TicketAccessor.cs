using Microsoft.Data.Sqlite;
using RaikesHacks_Project_S26.Model;
using System.Data;

namespace RaikesHacks_Project_S26.Accessors
{
    /// <summary>
    /// Ticket accessor class implementing ITicketAccessor interface for accessing ticket sales from a SQLite db. Provides methods for CRUD operations and simple queries.
    /// </summary>
    /// <remarks>
    /// AKS
    /// 2.28.2026
    /// </remarks>
    public class TicketAccessor : ITicketAccessor
    {
        private readonly string _connectionString;

        /// <summary>
        /// Constructor for TicketAccessor. If the DB file doesn't exist, it creates it and the necessary table.
        /// </summary>
        public TicketAccessor(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("TicketDb")!; //appsettings.json
        }

        /// <summary>
        /// Maps a data reader to a ticket sale object.
        /// </summary>
        /// <param name="reader"></param>
        /// <returns>
        /// The mapped ticket sale object.
        /// </returns>
        private static TicketSale MapReaderToTicket(SqliteDataReader reader)
        {
            return new TicketSale
            {
                Id = reader.GetInt32(0),
                StudentEmail = reader.GetString(1),
                EventName = reader.GetString(2),
                Price = (decimal)reader.GetDouble(3),
                Type = (TicketType)reader.GetInt32(4),
                IsPaid = reader.GetInt32(5) == 1,
                PurchaseDate = DateTime.Parse(reader.GetString(6))
            };
        }
        
        /// <summary>
        /// Fetches ticket sale by ID from DB. Returns null if not found.
        /// </summary>
        /// <param name="id"></param>
        /// <returns>
        /// The ticket sale if found, otherwise null.
        /// </returns>
        public async Task<TicketSale?> GetTicketByIdAsync(int id)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT Id, StudentEmail, EventName, Price, TicketType, IsPaid, PurchaseDate FROM TicketSales WHERE Id = @Id";
                command.Parameters.AddWithValue("@Id", id);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        return MapReaderToTicket(reader);
                    }
                    else
                    {
                        return null;
                    }
                }
            }
        }

        /// <summary>
        /// Fetches all ticket sales from DB. Note async.
        /// </summary>
        /// <returns>
        /// A list of all ticket sales.
        /// </returns>
        public async Task<IEnumerable<TicketSale>> GetAllTicketsAsync()
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT Id, StudentEmail, EventName, Price, TicketType, IsPaid, PurchaseDate FROM TicketSales";
                using (var reader = await command.ExecuteReaderAsync())
                {
                    var tickets = new List<TicketSale>();
                    while (await reader.ReadAsync())
                    {
                        tickets.Add(MapReaderToTicket(reader));
                    }
                    return tickets;
                }
            }
        }

        /// <summary>
        /// Fetches ticket sales by student email from DB. Note async.
        /// </summary>
        /// <param name="studentEmail"></param>
        /// <returns>
        /// A list of ticket sales for the given student email.
        /// </returns>
        public async Task<IEnumerable<TicketSale>> GetTicketsByStudentEmailAsync(string studentEmail)
        {
            var tickets = new List<TicketSale>();
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT Id, StudentEmail, EventName, Price, TicketType, IsPaid, PurchaseDate FROM TicketSales WHERE StudentEmail = @StudentEmail";
                command.Parameters.AddWithValue("@StudentEmail", studentEmail);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        tickets.Add(MapReaderToTicket(reader));
                    }
                }
            }
            return tickets;
        }

        /// <summary>
        /// Fetches ticket sales by event name from DBs.    
        /// </summary>
        /// <param name="eventName"></param>
        /// <returns>
        /// A list of ticket sales for the given event name.
        /// </returns>
        public async Task<IEnumerable<TicketSale>> GetTicketsByEventNameAsync(string eventName)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT Id, StudentEmail, EventName, Price, TicketType, IsPaid, PurchaseDate FROM TicketSales WHERE EventName = @EventName";
                command.Parameters.AddWithValue("@EventName", eventName);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    var tickets = new List<TicketSale>();
                    while (await reader.ReadAsync())
                    {
                        tickets.Add(MapReaderToTicket(reader));
                    }
                    return tickets;
                }
            }
        }

        /// <summary>
        /// Fetches ticket sales by ticket type from DB.
        /// </summary>
        /// <param name="type"></param>
        /// <returns>
        /// A list of ticket sales for the given ticket type.
        /// </returns>
        public async Task<IEnumerable<TicketSale>> GetTicketsByTypeAsync(TicketType type)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "SELECT Id, StudentEmail, EventName, Price, TicketType, IsPaid, PurchaseDate FROM TicketSales WHERE TicketType = @TicketType";
                command.Parameters.AddWithValue("@TicketType", (int)type);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    var tickets = new List<TicketSale>();
                    while (await reader.ReadAsync())
                    {
                        tickets.Add(MapReaderToTicket(reader));
                    }
                    return tickets;
                }
            }
        }

        /// <summary>
        /// Creates a new ticket sale in the DB.
        /// </summary>
        /// <param name="ticket"></param>
        /// <returns>
        /// The ID of the newly created ticket.
        /// </returns>
        public async Task<int> CreateTicketAsync(TicketSale ticket)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText =
                @"
                    INSERT INTO TicketSales (StudentEmail, EventName, Price, TicketType, IsPaid, PurchaseDate)
                    VALUES (@StudentEmail, @EventName, @Price, @TicketType, @IsPaid, @PurchaseDate);
                    SELECT last_insert_rowid();
                ";
                command.Parameters.AddWithValue("@StudentEmail", ticket.StudentEmail);
                command.Parameters.AddWithValue("@EventName", ticket.EventName);
                command.Parameters.AddWithValue("@Price", ticket.Price);
                command.Parameters.AddWithValue("@TicketType", (int)ticket.Type);
                command.Parameters.AddWithValue("@IsPaid", ticket.IsPaid ? 1 : 0);
                command.Parameters.AddWithValue("@PurchaseDate", ticket.PurchaseDate.ToString("o"));
                return Convert.ToInt32(await command.ExecuteScalarAsync());
            }
        }

        /// <summary>
        /// Updates an existing ticket sale in the DB. The ticket must have a valid ID.
        /// </summary>
        /// <param name="ticket"></param>
        /// <returns>
        /// True if the ticket was updated, false if the ID didn't exist.
        /// </returns>
        public async Task<bool> UpdateTicketAsync(TicketSale ticket)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = @"
                    UPDATE TicketSales 
                    SET StudentEmail = @StudentEmail, 
                        EventName = @EventName, 
                        Price = @Price, 
                        TicketType = @TicketType,
                        IsPaid = @IsPaid, 
                        PurchaseDate = @PurchaseDate 
                    WHERE Id = @Id";
                command.Parameters.AddWithValue("@Id", ticket.Id);
                command.Parameters.AddWithValue("@StudentEmail", ticket.StudentEmail);
                command.Parameters.AddWithValue("@EventName", ticket.EventName);
                command.Parameters.AddWithValue("@Price", ticket.Price);
                command.Parameters.AddWithValue("@TicketType", (int)ticket.Type);
                command.Parameters.AddWithValue("@IsPaid", ticket.IsPaid ? 1 : 0);
                command.Parameters.AddWithValue("@PurchaseDate", ticket.PurchaseDate.ToString("o"));

                int affectedRows = await command.ExecuteNonQueryAsync();

                return affectedRows > 0;
            }
        }

        /// <summary>
        /// Deletes a ticket sale entry from DB by ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns>
        /// True if the ticket was deleted, false if the ID didn't exist.
        /// </returns>
        public async Task<bool> DeleteTicketAsync(int id)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = connection.CreateCommand();
                command.CommandText = "DELETE FROM TicketSales WHERE Id = @Id";
                command.Parameters.AddWithValue("@Id", id);
                int affectedRows = await command.ExecuteNonQueryAsync();
                return affectedRows > 0;
            }
        }    
    }
}