
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aura API',
      version: '1.0.0',
      description: `API documentation for the Aura application. This application also uses WebSockets for real-time communication. Connect to the server with a valid JWT in the auth object.\n\n### WebSocket Events\n\n**Client to Server Events:**\n\n*   **\`join\`**: Joins a user to a room.\n    *   **Payload**: \`{ userId: number }\`\n*   **\`requestChat\`**: Sends a chat request to a psychic.\n    *   **Payload**: \`{ psychicId: number }\`\n*   **\`acceptChat\`**: Accepts a chat request.\n    *   **Payload**: \`{ clientId: number }\`\n*   **\`rejectChat\`**: Rejects a chat request.\n    *   **Payload**: \`{ clientId: number }\`\n*   **\`sendMessage\`**: Sends a message.\n    *   **Payload**: \`{ senderId: number, receiverId: number, content: string }\`\n\n**Server to Client Events:**\n\n*   **\`chatRequest\`**: Notifies a psychic of a new chat request.\n    *   **Payload**: \`{ from: number }\`\n*   **\`chatAccepted\`**: Notifies both users that the chat has been accepted.\n    *   **Payload**: \`{ with: number }\`\n*   **\`chatRejected\`**: Notifies a client that their chat request has been rejected.\n    *   **Payload**: \`{ with: number }\`\n*   **\`receiveMessage\`**: Sends a message to a user.\n    *   **Payload**: \`Message object\`\n*   **\`timeLeft\`**: Sends the remaining time to the user.\n    *   **Payload**: \`number\`\n*   **\`chatEnded\`**: Notifies a user that the chat has ended.`,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            sender: {
              $ref: '#/components/schemas/User'
            },
            receiver: {
              $ref: '#/components/schemas/User'
            },
            content: {
              type: 'string'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            email: {
              type: 'string'
            }
          }
        },
        Package: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            name: {
              type: 'string'
            },
            duration: {
              type: 'integer'
            },
            price: {
              type: 'number'
            },
            color: {
              type: 'string'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            package: {
              $ref: '#/components/schemas/Package'
            },
            amount: {
              type: 'number'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed']
            },
            stripeSessionId: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PsychicSetting: {
          type: 'object',
          properties: {
            id: {
              type: 'integer'
            },
            bio: {
              type: 'string'
            },
            image: {
              type: 'string'
            },
            minuteRate: {
              type: 'number'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts'], // files containing annotations as above
};

export const swaggerSpec = swaggerJsdoc(options);
