using Oracle.ManagedDataAccess.Client;
using System.Data;

public static class UserRepository
{
    private const string InsertSql = @"
        INSERT INTO users (user_id, first_name, last_name, email, pw_hash)
        VALUES (FS231_ARETZER.ISEQ$$_373194.NEXTVAL, :firstName, :lastName, :email, :pwHash)
        RETURNING user_id INTO :newId";

    public static int Create(string firstName, string lastName, string email, string pwHash)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();
        cmd.BindByName = true;
        cmd.CommandText = InsertSql;

        cmd.Parameters.Add(":firstName", OracleDbType.Varchar2, 50).Value = firstName;
        cmd.Parameters.Add(":lastName", OracleDbType.Varchar2, 50).Value = lastName;
        cmd.Parameters.Add(":email", OracleDbType.Varchar2, 255).Value = email;
        cmd.Parameters.Add(":pwHash", OracleDbType.Varchar2, 255).Value = pwHash;

        var outParam = new OracleParameter(":newId", OracleDbType.Int32)
        {
            Direction = System.Data.ParameterDirection.ReturnValue
        };
        cmd.Parameters.Add(outParam);

        cmd.ExecuteNonQuery();
        return Convert.ToInt32(outParam.Value);
    }
}