import mongoose from 'mongoose';
import Division from '../api/v1/division/division.model';

export const bangladeshDivisions = [
  {
    name: 'Dhaka',
    code: 'DH',
  },
  {
    name: 'Chattogram',
    code: 'CT',
  },
  {
    name: 'Rajshahi',
    code: 'RJ',
  },
  {
    name: 'Khulna',
    code: 'KH',
  },
  {
    name: 'Barishal',
    code: 'BR',
  },
  {
    name: 'Sylhet',
    code: 'SY',
  },
  {
    name: 'Rangpur',
    code: 'RP',
  },
  {
    name: 'Mymensingh',
    code: 'MY',
  },
];

async function seedDivision() {
  try {
    // ✅ connect first
    await mongoose.connect('', {
      dbName: 'mtcl',
      autoIndex: false,
      appName: 'mtcl',
    });

    console.log('MongoDB Connected ✅');

    // ✅ insert divisions
    for (const division of bangladeshDivisions) {
      await Division.create({
        ...division,
        country_id: new mongoose.Types.ObjectId('698dc38f6817d734e7f412e7'),
        status: 'ACTIVE',
      });
    }

    console.log('Division Seed Completed ✅');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDivision();
