/**
 * Microsoft Graph Client
 * Simple wrapper for Graph API calls
 */

import { Client } from '@microsoft/microsoft-graph-client';

export function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

export interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  body: {
    contentType: string;
    content: string;
  };
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  sentDateTime: string;
  hasAttachments: boolean;
}

export interface GraphEmailsResponse {
  value: GraphEmail[];
  '@odata.nextLink'?: string;
}

