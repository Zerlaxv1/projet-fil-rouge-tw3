import dayjs from "dayjs";

import { fakerFR as faker } from "@faker-js/faker";

console.log("bonjour npm".toUpperCase());

console.log(dayjs().format("DD/MM/YYYY"));

console.log(faker.person.fullName());
console.log(faker.internet.email());