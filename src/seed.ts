
import { AppDataSource } from "./data-source";
import { Role } from "./entities/Role";

AppDataSource.initialize()
  .then(async () => {
    console.log("Seeding database...");

    const roleRepository = AppDataSource.getRepository(Role);

    const adminRole = new Role();
    adminRole.name = "admin";
    await roleRepository.save(adminRole);

    const clientRole = new Role();
    clientRole.name = "client";
    await roleRepository.save(clientRole);

    const psychicRole = new Role();
    psychicRole.name = "psychic";
    await roleRepository.save(psychicRole);


    console.log("Database seeded successfully!");
  })
  .catch((error) => console.log(error))
  .finally(() => AppDataSource.destroy());
