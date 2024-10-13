class UserManager {

// Todo: implement redis for user management
    private static users: Map<string, string> = new Map<string, string>();

  public static addUser(userId: string, socketId: string): void {
    this.users.set(userId, socketId);
  }

  public static deleteUser(userId: string): void {
    this.users.delete(userId);
  }

  public static getSocket(userId: string): string | undefined {
    return this.users.get(userId);
  }

  public static getAllUsers(): [string, string][] {
    return Array.from(this.users.entries());
  }
}

export default UserManager;
