internal class LogingManager
{
    public static bool Login(string email, string pwHash)
    {
        User queriedUser = UserStore.TraceUser(email);

        if (queriedUser != null)
        {
            Console.WriteLine("Nutzer erfolgreich angemeldet!");
            return queriedUser.PwHash == pwHash;
        }
        
        Console.WriteLine("Nutzer konnte nicht gefunden werden!");
        return false;
    }
}