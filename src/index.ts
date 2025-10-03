import { Hono } from "hono";
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Enable CORS globally
app.use('*', cors({
  origin: '*',                 // allow all origins (or specify your frontend URL)
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get("/message", (c) => {
  return c.text("Hello Hono!");
});

app.get("/v1/products", (c) => {
  return c.json({
    products: [
      // ==== WIGS ====
      {
        id: 1,
        name: "Гламурна класика",
        category: 1, // WIGS
        type: 1, // NATURAL
        length: 3, // LONG
        description: "Натуральна довга перука з глибоким об’ємом, підходить для урочистих подій.",
        variants: [
          { id: "1-1", color: 1, price: 4500, old_price:6000, availability: true, images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg", '1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          { id: "1-2", color: 2, price: 4600, old_price:6000, availability: true, images: ['1.webp', 'd94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          { id: "1-3", color: 3, price: 4700, old_price:6000, availability: false, images: ['2.webp', 'd94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg', '1.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          { id: "1-3", color: 3, price: 4700, old_price:6000, availability: false, images: ['3.webp', 'd94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg', '1.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          { id: "1-3", color: 3, price: 4700, old_price:6000, availability: false, images: ['4.webp', 'd94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg', '1.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          { id: "1-3", color: 3, price: 4700, old_price:6000, availability: false, images: ['5.webp', 'd94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg', '1.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          { id: "1-3", color: 3, price: 4700, old_price:6000, availability: false, images: ['6.webp', 'd94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg', '1.webp', '3.webp', '4.webp', '5.webp', '6.webp'] },
          
        ]
      },
      {
        id: 2,
        name: "Мальвіна",
        category: 1,
        type: 2, // SYNTHETIC
        length: 2, // MEDIUM
        description: "Синтетична перука середньої довжини у різних відтінках для щоденного носіння.",
        price: 3800,
        variants: [
          { id: "2-1", color: 1, price: 3800, old_price:6000, availability: true, images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg","image-blond.png","1.webp", "2.webp", "3.webp", "4.webp", "5.webp"] },
          { id: "2-2", color: 3, price: 3900, old_price:6000, availability: true,  images: ["image-blond.png","d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg","1.webp", "2.webp", "3.webp", "4.webp", "5.webp"] },
          { id: "2-2", color: 3, price: 3900, old_price:6000, availability: true,  images: ["6.webp","d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg","1.webp", "2.webp", "3.webp", "4.webp", "5.webp"] },
          { id: "2-2", color: 3, price: 3900, old_price:6000, availability: true,  images: ["4.webp","d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg","1.webp", "2.webp", "3.webp", "4.webp", "5.webp"] },
        ]
      },
      {
        id: 3,
        name: "Рудий акцент",
        category: 1,
        type: 1,
        length: 2, // MEDIUM
        description: "Яскрава рудувата перука з натурального волосся для сміливого стилю.",
        variants: [
          { id: "3-1", color: 4, price: 4200, old_price:6000, availability: true, images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] },
          { id: "3-1", color: 4, price: 4200, old_price:6000, availability: true, images: ["1.webp", "2.webp", "3.webp", "4.webp", "5.webp", "6.webp"]},
          { id: "3-1", color: 4, price: 4200, old_price:6000, availability: true, images: ["2.webp", "d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg", "1.webp", "3.webp", "4.webp", "5.webp", "6.webp"] }
        ]
      },
      {
        id: 4,
        name: "Короткий чорний шик",
        category: 1,
        type: 2,
        length: 1, // SHORT
        description: "Сучасна коротка модель чорного кольору, легка у догляді.",
        variants: [
          { id: "4-1", color: 1, price: 3200, old_price:6000, availability: true, images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] }
        ]
      },
    
      // ==== TAILS ====
      {
        id: 5,
        name: "Класичний хвіст",
        category: 2, // TAILS
        type: 2,
        length: 3,
        description: "Довгий синтетичний хвіст для швидкої зміни стилю.",
        variants: [
          { id: "5-1", color: 1, price: 1500, old_price:6000, availability: true, images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] },
          { id: "5-2", color: 2, price: 1600, old_price:6000, availability: true, images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] },
         
        ]
      },
      {
        id: 6,
        name: "Світлий високий хвіст",
        category: 2,
        type: 2,
        length: 2,
        description: "Світлий хвіст середньої довжини для святкових зачісок.",
        variants: [
          { id: "6-1", color: 3, price: 1700, old_price:6000, availability: true, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] }
        ]
      },
      {
        id: 7,
        name: "Рудий об’єм",
        category: 2,
        type: 1,
        length: 3,
        description: "Об’ємний рудий хвіст з натурального волосся.",
        variants: [
          { id: "7-1", color: 4, price: 2100, old_price:6000, availability: false, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] }
        ]
      },
    
      // ==== TOPPERS ====
      {
        id: 8,
        name: "Топер чорний об’ємний",
        category: 3, // TOPPERS
        type: 1,
        length: 2,
        description: "Натуральний топер чорного кольору для додаткового об’єму.",
        variants: [
          { id: "8-1", color: 1, price: 2700, old_price:6000, availability: true, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] }
        ]
      },
      {
        id: 9,
        name: "Блонд-топер прямий",
        category: 3,
        type: 2,
        length: 1,
        description: "Синтетичний блонд-топер короткої довжини для щоденного використання.",
        variants: [
          { id: "9-1", color: 3, price: 2500, old_price:6000, availability: true, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] },
          { id: "9-2", color: 4, price: 2600, old_price:6000, availability: true, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] }
        ]
      },
      {
        id: 10,
        name: "Коричневий топер з чубчиком",
        category: 3,
        type: 1,
        length: 1,
        description: "Натуральний топер із чубчиком, доступний у темних відтінках.",
        variants: [
          { id: "10-1", color: 2, price: 3100, old_price:6000, availability: true, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] },
          { id: "10-2", color: 1, price: 3150, old_price:6000, availability: false, image: "https://princesss.store/images/yunona.webp", images: ["d94e27ea-7cca-4efd-b9d6-39f391ce806f.jpeg"] }
        ]
      }
    ],
  });
});

export default app;
