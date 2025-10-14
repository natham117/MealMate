using System;
using System.Data;
using Oracle.ManagedDataAccess.Client;

class DbConnectionHelper
{
    private static readonly string connectionString = "User Id=fs231_aretzer;Password=adrian;Data Source=db-server.s-atiw.de:1521/atiwora;";

    public static OracleConnection Connect()
    {
        try
        {
            var conn = new Oracle.ManagedDataAccess.Client.OracleConnection(connectionString);
            conn.Open();
            Console.WriteLine("Verbindung erfolgreich hergestellt!");
            return conn;
        }
        catch (Exception ex)
        {
            Console.WriteLine("Fehler bei der DB-Verbindung: " + ex.Message);
            throw;
        }
    }
}