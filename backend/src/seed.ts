import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Logger } from "./Logger";
import { ApiClient } from "./client";
import { randomProduct, randomUser } from "./faker";
import { UserRole } from "./types";
import { NewProduct } from "./model/ProductModel";
dotenv.config();

const products: NewProduct[] = [
  {
    description: "Premium quality rice sourced from the finest farms.",
    imageUrl:
      "https://tiimg.tistatic.com/fp/1/007/609/delicious-aromatic-and-healthy-fresh-basmati-rice-bag-10kg-748.jpg",
    price: 24999,
    name: "Organic Basmati Rice",
    quantity: 50,
    units: "kg",
  },
  {
    description: "Freshly picked apples with a sweet and crisp flavor.",
    imageUrl:
      "https://www.farmersalmanac.com/wp-content/uploads/2020/11/Adocortland_apples-as225320764.jpeg",
    price: 799,
    name: "Red Apple",
    quantity: 100,
    units: "kg",
  },
  {
    description:
      "A rich blend of spices for enhancing your culinary creations.",
    imageUrl:
      "https://www.wandercooks.com/wp-content/uploads/2020/09/baharat-middle-eastern-7-spice-1-1024x1024.jpg",
    price: 5999,
    name: "Gourmet Spice Mix",
    quantity: 20,
    units: "kg",
  },
  {
    description: "High-quality olive oil with a robust and fruity flavor.",
    imageUrl:
      "https://6.oliveoiltimes.com/wp-content/uploads/2014/07/49156976_ml.jpg",
    price: 2999,
    name: "Extra Virgin Olive Oil",
    quantity: 10,
    units: "L",
  },
  {
    description: "Delicious and crunchy granola with a mix of nuts and fruits.",
    imageUrl:
      "https://cluttercafe.wordpress.com/wp-content/uploads/2012/04/granola.jpg",
    price: 1399,
    name: "Nutty Granola",
    quantity: 25,
    units: "kg",
  },
  {
    description:
      "Nutritious and crunchy almonds, perfect for snacking or baking.",
    imageUrl:
      "https://www.naturalhealth365.com/wp-content/uploads/2015/03/almonds.jpg",
    price: 1599,
    name: "Raw Almonds",
    quantity: 25,
    units: "kg",
  },
  {
    description: "Juicy and tender carrots, perfect for salads and cooking.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Carrots.JPG",
    price: 599,
    name: "Fresh Carrots",
    quantity: 60,
    units: "kg",
  },
  {
    description: "Sweet and succulent strawberries, freshly picked.",
    imageUrl:
      "https://www.harvst.co.uk/wp-content/uploads/2022/05/strawberries-scaled.jpeg",
    price: 1199,
    name: "Strawberries",
    quantity: 25,
    units: "kg",
  },
  {
    description: "Nutrient-rich spinach, ideal for salads and smoothies.",
    imageUrl:
      "https://www.photos-public-domain.com/wp-content/uploads/2012/03/spinach.jpg",
    price: 799,
    name: "Organic Spinach",
    quantity: 40,
    units: "kg",
  },
  {
    description:
      "Hearty and flavorful sweet potatoes, great for baking and cooking.",
    imageUrl:
      "https://leaf.nutrisystem.com/wp-content/uploads/2017/08/ThinkstockPhotos-497961226.jpg",
    price: 899,
    name: "Sweet Potatoes",
    quantity: 50,
    units: "kg",
  },
];

async function clearDb() {
  const logger = new Logger("clearDb");
  try {
    const url = process.env.MONGODB_URL;
    if (!url) {
      throw new Error("env MONGODB_URL not set");
    }
    await mongoose.connect(url);
    logger.info("Connected to DB");

    // Get all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    // Drop each collection
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      logger.info(`Cleared collection: ${collection.name}`);
    }

    logger.info("Database cleared successfully");
  } catch (e) {
    logger.error(e);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  }
  return null;
}

async function main() {
  const logger = new Logger("seed");
  // TODO: use env variable
  const axiosClient = axios.create({
    baseURL: "http://localhost:3024/api",
  });
  const client = new ApiClient(axiosClient);
  await clearDb();

  // create seller
  const randomSeller = randomUser({
    email: "jack@seller.com",
    password: "Password123",
    role: UserRole.seller,
  });
  await client.signup(randomSeller);
  const loginResponse = await client.login({
    email: randomSeller.email,
    password: randomSeller.password,
  });
  logger.info("Created seller", loginResponse.data.data);
  // create 10 products
  for (const product of products) {
    client.createProduct(product, loginResponse.data.data.token);
  }
  logger.info(`Created ${products.length} products`);
  // create buyer
  const randomBuyer = randomUser({
    email: "jill@buyer.com",
    password: "Password123",
    role: UserRole.buyer,
  });
  await client.signup(randomBuyer);
  logger.info("Created buyer", randomBuyer);
}

try {
  main();
} catch (e) {
  Logger.error("seed", e);
}
