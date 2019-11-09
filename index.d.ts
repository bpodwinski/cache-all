import { RedisClient } from 'redis';

// export const redis: CacheAll.Cacher;
// export const file: CacheAll.Cacher;
// export const memory: CacheAll.Cacher;

// declare module 'cache-all' {
//   interface Cacher {
//     init(config?: Config): Promise<void>;

//     set(key: string, value: any, time?: number): Promise<Status>;

//     get(key: string): Promise<any>;

//     getAll(): Promise<any>;

//     has(key: string): Promise<boolean>;

//     remove(key: string): Promise<Status>;

//     removeByPattern(pattern: string): Promise<Status>;

//     clear(): Promise<Status>;

//     middleware(time: number, prefix: string): Function;
//   }

//   type Status = { status: 0 | 1 }

//   interface Config {
//     isEnable?: boolean;
//     ttl?: number;
//     file?: {
//       path?: string;
//     };
//     redis?: {
//       port?: number;
//       host?: string;
//       client?: RedisClient;
//       setex?: Function;
//       password?: string;
//       database?: string;
//       prefix?: string;
//     }
//   }
// }
declare module 'cache-all' {
  function init(config?: Config): Promise<void>;
}

declare module 'cache-all/file' {
  function init(config?: Config): Promise<void>;
}

declare module 'cache-all/memory' {
  function init(config?: Config): Promise<void>;
}

declare module 'cache-all/redis' {
  function init(config?: Config): Promise<void>;
}