using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

internal class UserStore
{
    public static User TraceUser(string firstName, string lastName)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM users WHERE first_name = :firstName AND last_name = :lastName";
        
        cmd.Parameters.Add(":firstName", OracleDbType.Varchar2, 50).Value = firstName;
        cmd.Parameters.Add(":lastName", OracleDbType.Varchar2, 50).Value = lastName;

        var reader = cmd.ExecuteReader();

        if (reader.Read())
        {
            return new User
            {
                UserId = reader.GetInt32(reader.GetOrdinal("user_id")),
                FirstName = reader.GetString(reader.GetOrdinal("first_name")),
                LastName = reader.GetString(reader.GetOrdinal("last_name")),
                Email = reader.GetString(reader.GetOrdinal("email")),
                PwHash = reader.GetString(reader.GetOrdinal("pw_hash"))
            };
        }
        else
        {
            Console.WriteLine("Es konnte kein Nutzer gefunden werden.");
        }

        return null;
    }
}