import { faker } from "@faker-js/faker";
import { NewProduct } from "./model/ProductModel";
import { NewUser } from "./model/UserModel";

interface RandomUserOptions extends Partial<NewUser> {
  role: NewUser["role"];
}

export function randomUser(user: RandomUserOptions): NewUser {
  return {
    email: user?.email || faker.internet.email(),
    mobileNumber: user?.mobileNumber || faker.phone.number(),
    password: user?.password || faker.internet.password(),
    role: user.role,
    name: user?.name || faker.person.fullName(),
  };
}

export function randomProduct(): NewProduct {
  return {
    description: faker.commerce.productDescription(),
    imageUrl: faker.image.url(),
    price: faker.number.int({ min: 10, max: 100000 }),
    name: faker.commerce.productName(),
    quantity: faker.number.int({ min: 1, max: 100 }),
    units: "kg",
  };
}
