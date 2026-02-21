import mongoose from 'mongoose';
import District from '../api/v1/district/district.model';
export const bangladeshDivisionDistricts = [
  {
    division: 'Dhaka',
    code: 'DH',
    districts: [
      { name: 'Dhaka', code: 'DH' },
      { name: 'Gazipur', code: 'GZ' },
      { name: 'Narsingdi', code: 'NS' },
      { name: 'Tangail', code: 'TG' },
    ],
  },
  {
    division: 'Chattogram',
    code: 'CT',
    districts: [
      { name: 'Chattogram', code: 'CT' },
      { name: "Cox's Bazar", code: 'CB' },
      { name: 'Noakhali', code: 'NX' },
      { name: 'Feni', code: 'FE' },
      { name: 'Comilla', code: 'CM' },
      { name: 'Brahmanbaria', code: 'BB' },
      { name: 'Lakshmipur', code: 'LP' },
      { name: 'Khagrachhari', code: 'KH' },
      { name: 'Rangamati', code: 'RA' },
      { name: 'Bandarban', code: 'BD' },
    ],
  },
  {
    division: 'Khulna',
    code: 'KH',
    districts: [
      { name: 'Khulna', code: 'KH' },
      { name: 'Jessore', code: 'JS' },
      { name: 'Satkhira', code: 'ST' },
      { name: 'Bagerhat', code: 'BG' },
      { name: 'Meherpur', code: 'MP' },
      { name: 'Chuadanga', code: 'CD' },
      { name: 'Kushtia', code: 'KS' },
      { name: 'Magura', code: 'MG' },
      { name: 'Narail', code: 'NR' },
    ],
  },
  {
    division: 'Barishal',
    code: 'BR',
    districts: [
      { name: 'Barishal', code: 'BR' },
      { name: 'Patuakhali', code: 'PK' },
      { name: 'Bhola', code: 'BL' },
      { name: 'Jhalokati', code: 'JL' },
      { name: 'Pirojpur', code: 'PP' },
      { name: 'Barguna', code: 'BGN' },
    ],
  },
  {
    division: 'Sylhet',
    code: 'SY',
    districts: [
      { name: 'Sylhet', code: 'SY' },
      { name: 'Moulvibazar', code: 'MB' },
      { name: 'Habiganj', code: 'HB' },
      { name: 'Sunamganj', code: 'SN' },
    ],
  },
  {
    division: 'Rangpur',
    code: 'RP',
    districts: [
      { name: 'Rangpur', code: 'RP' },
      { name: 'Thakurgaon', code: 'TH' },
      { name: 'Dinajpur', code: 'DP' },
      { name: 'Lalmonirhat', code: 'LL' },
      { name: 'Nilphamari', code: 'NP' },
      { name: 'Kurigram', code: 'KR' },
      { name: 'Panchagarh', code: 'PG' },
      { name: 'Gaibandha', code: 'GB' },
    ],
  },
  {
    division: 'Rajshahi',
    code: 'RJ',
    districts: [
      { name: 'Rajshahi', code: 'RJ' },
      { name: 'Bogra', code: 'BG' },
      { name: 'Natore', code: 'NT' },
      { name: 'Naogaon', code: 'NG' },
      { name: 'Pabna', code: 'PB' },
      { name: 'Sirajganj', code: 'SJ' },
      { name: 'Joypurhat', code: 'JP' },
      { name: 'Chapainawabganj', code: 'CN' },
    ],
  },
  {
    division: 'Mymensingh',
    code: 'MY',
    districts: [
      { name: 'Mymensingh', code: 'MY' },
      { name: 'Jamalpur', code: 'JP' },
      { name: 'Netrokona', code: 'NK' },
      { name: 'Sherpur', code: 'SP' },
    ],
  },
];

async function seedDistrict() {
  try {
    // ✅ connect first
    await mongoose.connect('mongodb://resalat:resalat123456@localhost:27017/', {
      dbName: 'mtcl',
      autoIndex: false,
      appName: 'mtcl',
    });

    console.log('MongoDB Connected ✅');

    // ✅ insert divisions
    for (const division of bangladeshDivisionDistricts) {
      //   let country_id = '698dc38f6817d734e7f412e7';
      let division_id = '';
      if (division.division === 'Dhaka') {
        division_id = '699902a30d5fe97dcc9595f5';
      } else if (division.division === 'Chattogram') {
        division_id = '699902a30d5fe97dcc9595f7';
      } else if (division.division === 'Khulna') {
        division_id = '699902a30d5fe97dcc9595fb';
      } else if (division.division === 'Barishal') {
        division_id = '699902a30d5fe97dcc9595fd';
      } else if (division.division === 'Sylhet') {
        division_id = '699902a30d5fe97dcc9595ff';
      } else if (division.division === 'Rangpur') {
        division_id = '699902a30d5fe97dcc959601';
      } else if (division.division === 'Rajshahi') {
        division_id = '699902a30d5fe97dcc9595f9';
      } else if (division.division === 'Mymensingh') {
        division_id = '699902a30d5fe97dcc959603';
      }

      for (const district of division.districts) {
        const newDistrict = new District({
          ...district,
          //   country_id: new mongoose.Types.ObjectId(country_id),
          division_id: new mongoose.Types.ObjectId(division_id),
          status: 'ACTIVE',
        });
        const item = await newDistrict.save();
        console.log(item);
      }
    }

    console.log('District Seed Completed ✅');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDistrict();
