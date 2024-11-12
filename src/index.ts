// import express from 'express';
// import cors from 'cors';
// import { connectToMongoDB } from './config/config';
// import userRoutes from './routes/userRoutes';
// import vendorRoutes from './routes/vendorRoutes';
// import adminRoutes from './routes/adminRoutes';
// import chatRoutes from './routes/chatRoutes';
// import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';
// import morgan from 'morgan';
// import { createServer } from 'http';
// import { Server as serverSocket } from 'socket.io';
// import { socketHandler } from './utils/socket/chat';
// import { errorHandler } from './middleware/errorHandling';
// import logger from './utils/logger';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8080;
// const morganFormat = ":method :url :status :response-time ms";

// connectToMongoDB();

// const httpServer = createServer(app);

// // CORS configuration based on environment
// const allowedOrigins = process.env.NODE_ENV === 'production'
//   ? ['https://www.eventopia.shop', 'https://eventopia.shop']
//   : ['http://localhost:3000'];

// app.use(cors({
//   origin:  allowedOrigins, 
//   credentials: true,
// }));

// export const io = new serverSocket(httpServer, {
//   cors: {
//     origin:  '*',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// socketHandler(io);

// app.use(express.json());
// app.use(cookieParser());

// // Morgan logging configuration
// app.use(
//   morgan(morganFormat, {
//     stream: {
//       write: (message: string) => {
//         const logObject = {
//           method: message.split(" ")[0],
//           url: message.split(" ")[1],
//           status: message.split(" ")[2],
//           responseTime: message.split(" ")[3],
//         };
//         logger.info(JSON.stringify(logObject));
//       },
//     },
//   })
// );

// // app.use('/v1/api/users', userRoutes);
// // app.use('/v1/api/company', companyRoutes);
// // app.use('/v1/api/admin', adminRoutes);
// // app.use('/v1/api/chat', chatRoutes);
// // app.use('/v1/api/message', messageRoutes);

// // Route handlers
// app.use('/v1/api/users', userRoutes);
// app.use('/vendor', vendorRoutes);
// app.use('/admin', adminRoutes);
// app.use('/chat', chatRoutes);
// app.use(errorHandler);

// httpServer.listen(PORT, () => {
//   console.log(`Server started running on http://localhost:${PORT}/`);
// });


import express from 'express';
import cors from 'cors';
import { connectToMongoDB } from './config/config';
import userRoutes from './routes/userRoutes';
import vendorRoutes from './routes/vendorRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as serverSocket } from 'socket.io';
import { socketHandler } from './utils/socket/chat';
import { errorHandler } from './middleware/errorHandling';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const morganFormat = ":method :url :status :response-time ms";

connectToMongoDB();

const httpServer = createServer(app);



const allowedOrigins = [
  "https://e-vent-project-ii.vercel.app",
  "https://www.eventopia.shop",
  "https://eventopia.shop", 'http://localhost:3000', '*'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE','PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  })
);

export const io = new serverSocket(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHandler(io);

app.use(express.json());
app.use(cookieParser());

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);


app.use('/v1/api/user', userRoutes);
app.use('/v1/api/vendor', vendorRoutes);
app.use('/v1/api/admin', adminRoutes);
app.use('/v1/api/chat', chatRoutes);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`Server started running on http://localhost:${PORT}/`);
});

// index..ts