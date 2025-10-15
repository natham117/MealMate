using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

internal class ItemStore
{
    public static Item GetItemById(int itemId)
    {
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM items WHERE item_id = :itemId";
        cmd.Parameters.Add(":itemId", OracleDbType.Int32).Value = itemId;

        var reader = cmd.ExecuteReader();

        if (reader.Read())
        {
            return new Item
            {
                ItemId = reader.GetInt32(reader.GetOrdinal("item_id")),
                ItemName = reader.GetString(reader.GetOrdinal("item_name")),
                Category = !reader.IsDBNull(reader.GetOrdinal("category")) 
                    ? reader.GetString(reader.GetOrdinal("category")) : ""
            };
        }

        return null;
    }

    public static Item GetOrCreateItem(string itemName)
    {
        // Zuerst versuchen zu finden
        using var conn = DbConnectionHelper.Connect();
        using var cmd = conn.CreateCommand();

        cmd.BindByName = true;
        cmd.CommandText = "SELECT * FROM items WHERE LOWER(item_name) = LOWER(:itemName)";
        cmd.Parameters.Add(":itemName", OracleDbType.Varchar2).Value = itemName;

        var reader = cmd.ExecuteReader();

        if (reader.Read())
        {
            return new Item
            {
                ItemId = reader.GetInt32(reader.GetOrdinal("item_id")),
                ItemName = reader.GetString(reader.GetOrdinal("item_name")),
                Category = !reader.IsDBNull(reader.GetOrdinal("category")) 
                    ? reader.GetString(reader.GetOrdinal("category")) : ""
            };
        }

        reader.Close();

        // Wenn nicht gefunden, erstellen
        cmd.CommandText = @"
            INSERT INTO items (item_name, category)
            VALUES (:itemName, 'Sonstiges')
            RETURNING item_id INTO :itemId";

        cmd.Parameters.Clear();
        cmd.Parameters.Add(":itemName", OracleDbType.Varchar2).Value = itemName;

        var itemIdParam = new OracleParameter(":itemId", OracleDbType.Int32);
        itemIdParam.Direction = System.Data.ParameterDirection.Output;
        cmd.Parameters.Add(itemIdParam);

        cmd.ExecuteNonQuery();

        return new Item
        {
            ItemId = ((OracleDecimal)itemIdParam.Value).ToInt32(),
            ItemName = itemName,
            Category = "Sonstiges"
        };
    }
}