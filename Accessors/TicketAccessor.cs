/// <summary>
/// AKS
/// 2.28.2026
/// Accesses ticket sales from a SQLite db.
/// </summary>
public class TicketAccessor : ITicketAccessor
{
    /// <summary>
    /// Path to DB file, in the same directory as exe.
    /// </summary>
    public static string DbPath => Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tickets.db");

    /// <summary>
    /// Constructor for TicketAccessor. If the DB file doesn't exist, it creates it and the necessary table.
    /// </summary>
    public TicketAccessor()
    {
        if (!File.Exists(DbPath))
        {
            using (var connection = new SqliteConnection($"Data Source={DbPath}"))
            {
                connection.Open();
                var command = connection.CreateCommand();
                command.CommandText =
                @"
                    CREATE TABLE TicketSales (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        StudentEmail TEXT NOT NULL,
                        EventName TEXT NOT NULL,
                        Price REAL NOT NULL,
                        IsPaid INTEGER NOT NULL,
                        PurchaseDate TEXT NOT NULL
                    );
                ";
                command.ExecuteNonQuery();
            }
        }
    }

    /// <summary>
    /// Fetches ticket sale by ID from DB. Returns null if not found.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task<TicketSale> GetTicketByIdAsync(int id)
    {
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "SELECT * FROM TicketSales WHERE Id = @Id";
            command.Parameters.AddWithValue("@Id", id);
            using (var reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    return new TicketSale
                    {
                        Id = reader.GetInt32("Id"),
                        StudentEmail = reader.GetString("StudentEmail"),
                        EventName = reader.GetString("EventName"),
                        Price = reader.GetDouble("Price"),
                        IsPaid = reader.GetInt32("IsPaid") == 1,
                        PurchaseDate = reader.GetString("PurchaseDate")
                    };
                }
                return null;
            }
        }
    }

    /// <summary>
    /// Fetches all ticket sales from DB. Note async.
    /// </summary>
    /// <returns></returns>
    public async Task<IEnumerable<TicketSale>> GetAllTicketsAsync()
    {
        var tickets = new List<TicketSale>();
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "SELECT * FROM TicketSales";
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    tickets.Add(new TicketSale
                    {
                        Id = reader.GetInt32("Id"),
                        StudentEmail = reader.GetString("StudentEmail"),
                        EventName = reader.GetString("EventName"),
                        Price = reader.GetDouble("Price"),
                        IsPaid = reader.GetInt32("IsPaid") == 1,
                        PurchaseDate = reader.GetString("PurchaseDate")
                    });
                }
            }
        }
        return tickets;
    }

    /// <summary>
    /// Fetches ticket sales by student email from DB. Note async.
    /// </summary>
    /// <param name="studentEmail"></param>
    /// <returns></returns>
    public async Task<IEnumerable<TicketSale>> GetTicketsByStudentEmailAsync(string studentEmail)
    {
        var tickets = new List<TicketSale>();
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "SELECT * FROM TicketSales WHERE StudentEmail = @StudentEmail";
            command.Parameters.AddWithValue("@StudentEmail", studentEmail);
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    tickets.Add(new TicketSale
                    {
                        Id = reader.GetInt32("Id"),
                        StudentEmail = reader.GetString("StudentEmail"),
                        EventName = reader.GetString("EventName"),
                        Price = reader.GetDouble("Price"),
                        IsPaid = reader.GetInt32("IsPaid") == 1,
                        PurchaseDate = reader.GetString("PurchaseDate")
                    });
                }
            }
        }
        return tickets;
    }

    /// <summary>
    /// Fetches ticket sales by event name from DB.    
    /// </summary>
    /// <param name="eventName"></param>
    /// <returns></returns>
    public async Task<IEnumerable<TicketSale>> GetTicketsByEventNameAsync(string eventName)
    {
        var tickets = new List<TicketSale>();
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "SELECT * FROM TicketSales WHERE EventName = @EventName";
            command.Parameters.AddWithValue("@EventName", eventName);
            using (var reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    tickets.Add(new TicketSale
                    {
                        Id = reader.GetInt32("Id"),
                        StudentEmail = reader.GetString("StudentEmail"),
                        EventName = reader.GetString("EventName"),
                        Price = reader.GetDouble("Price"),
                        IsPaid = reader.GetInt32("IsPaid") == 1,
                        PurchaseDate = reader.GetString("PurchaseDate")
                    });
                }
            }
        }
        return tickets;
    }

    /// <summary>
    /// Creates a new ticket sale in the DB. Returns the ID of the newly created ticket.
    /// </summary>
    /// <param name="ticket"></param>
    /// <returns></returns>
    public async Task<int> CreateTicketAsync(TicketSale ticket)
    {
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText =
            @"
                INSERT INTO TicketSales (StudentEmail, EventName, Price, IsPaid, PurchaseDate)
                VALUES (@StudentEmail, @EventName, @Price, @IsPaid, @PurchaseDate);
                SELECT last_insert_rowid();
            ";
            command.Parameters.AddWithValue("@StudentEmail", ticket.StudentEmail);
            command.Parameters.AddWithValue("@EventName", ticket.EventName);
            command.Parameters.AddWithValue("@Price", ticket.Price);
            command.Parameters.AddWithValue("@IsPaid", ticket.IsPaid ? 1 : 0);
            command.Parameters.AddWithValue("@PurchaseDate", ticket.PurchaseDate.ToString("o"));
            return Convert.ToInt32(await command.ExecuteScalarAsync());
        }
    }

    /// <summary>
    /// Updates an existing ticket sale in the DB. The ticket must have a valid ID.
    /// </summary>
    /// <param name="ticket"></param>
    /// <returns></returns>
    public async Task UpdateTicketAsync(TicketSale ticket)
    {
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText =
            @"
                UPDATE TicketSales
                SET StudentEmail = @StudentEmail,
                    EventName = @EventName,
                    Price = @Price,
                    IsPaid = @IsPaid,
                    PurchaseDate = @PurchaseDate
                WHERE Id = @Id;
            ";
            command.Parameters.AddWithValue("@Id", ticket.Id);
            command.Parameters.AddWithValue("@StudentEmail", ticket.StudentEmail);
            command.Parameters.AddWithValue("@EventName", ticket.EventName);
            command.Parameters.AddWithValue("@Price", ticket.Price);
            command.Parameters.AddWithValue("@IsPaid", ticket.IsPaid ? 1 : 0);
            command.Parameters.AddWithValue("@PurchaseDate", ticket.PurchaseDate.ToString("o"));
            await command.ExecuteNonQueryAsync();
        }
    }

    /// <summary>
    /// Deleltes a ticket sale entry from DB by ID.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task DeleteTicketAsync(int id)
    {
        using (var connection = new SqliteConnection($"Data Source={DbPath}"))
        {
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = "DELETE FROM TicketSales WHERE Id = @Id";
            command.Parameters.AddWithValue("@Id", id);
            await command.ExecuteNonQueryAsync();
        }
    }    
}    