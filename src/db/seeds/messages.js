import { redis } from '../connection.js';
const messages = [
    "Hey there, I just wanted to say that I've always been in love with you",
    "Hi, I really needed to get this off my chest. I'm a furry. I hope you'll accept and love me for who I am",
    'Hey, I clogged up my toilet again. Is it okay if I come and use yours?',
    "I'm sorry to say but I'm done with you",
    'I really need to borrow some money from you. I can pay you back in a few months',
    'The police are after me. If they ask you anything just say I moved to Thailand',
    "I didn't want to say anything when I last saw you but your armpits really smell bad",
];
await redis.sadd('messages', messages);
process.exit(0);
