import db from '@/utils/db';
import { usersTable } from './schema';

const userSeed = [
  {
    name: 'John Doe',
    age: 20,
    email: 'john.doe@example.com',
  },
];

const seedUsers = async () => {
  await db.insert(usersTable).values(userSeed);
};

seedUsers()
  .then(() => {
    console.log('Users seeded successfully');
  })
  .catch((error) => {
    console.error('Error seeding users', error);
  });
