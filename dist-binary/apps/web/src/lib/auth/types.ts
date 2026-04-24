import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    permissions: string[];
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      username: string;
      permissions: string[];
    };
  }
}
