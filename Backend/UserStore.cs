using Oracle.ManagedDataAccess.Client;

internal class UserStore
{
    public static User TraceUser(string email)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM users WHERE email = :email";

        cmd.Parameters.Add(":email", OracleDbType.Varchar2, 50).Value = email;

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