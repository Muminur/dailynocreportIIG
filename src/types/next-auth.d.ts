import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      microsoftId: string;
    };
    accessToken: string;
    refreshToken: string;
    error?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    microsoftId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    microsoftId: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
    error?: string;
  }
}

