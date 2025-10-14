public class Program
{
    static void Main(string[] args)
    {
        User newUser = UserStore.TraceUser("Benji", "Ewald");
        Console.WriteLine("Hallo " + newUser.FirstName + " " + newUser.LastName + " " + newUser.Email);
    }
}