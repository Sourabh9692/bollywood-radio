export type Song = {
  id: string;
  title: string;
  movie: string;
  year: number;
  artist: string;
  youtubeId: string;
  decade: string;
  moods: string[];
};
const entries: [string, string, number, string, string, string[]][] = [
  [
    'Tujhe Dekha Toh',
    'Dilwale Dulhania Le Jayenge',
    1995,
    'Lata Mangeshkar, Kumar Sanu',
    'cNV5hLSa9H8',
    ['Romantic', 'Classics'],
  ],
  [
    'Pehla Nasha',
    'Jo Jeeta Wohi Sikandar',
    1992,
    'Udit Narayan, Sadhana Sargam',
    'Ki41AKu0iHc',
    ['Romantic', 'Classics'],
  ],
  [
    'Chaiyya Chaiyya',
    'Dil Se',
    1998,
    'Sukhwinder Singh, Sapna Awasthi',
    '9yGukg6SSZ4',
    ['Party', 'Classics'],
  ],
  [
    'Mehndi Laga Ke Rakhna',
    'Dilwale Dulhania Le Jayenge',
    1995,
    'Lata Mangeshkar, Udit Narayan',
    'mA_h4iQJhoU',
    ['Party', 'Classics'],
  ],
  [
    'Kuch Kuch Hota Hai',
    'Kuch Kuch Hota Hai',
    1998,
    'Udit Narayan, Alka Yagnik',
    '1QdbY4hEubw',
    ['Romantic', 'Classics'],
  ],
  [
    'Didi Tera Devar Deewana',
    'Hum Aapke Hain Koun',
    1994,
    'Lata Mangeshkar, S. P. Balasubrahmanyam',
    'ZqcDGvCM_w0',
    ['Party', 'Classics'],
  ],
  [
    'Dheere Dheere Se',
    'Aashiqui',
    1990,
    'Anuradha Paudwal, Kumar Sanu',
    'PdJLZI5ffT8',
    ['Romantic', 'Classics'],
  ],
  [
    'Tu Cheez Badi Hai Mast Mast',
    'Mohra',
    1994,
    'Udit Narayan, Kavita Krishnamurthy',
    'DHWVkvhQB3U',
    ['Party', 'Item songs'],
  ],
  [
    'Kal Ho Naa Ho',
    'Kal Ho Naa Ho',
    2003,
    'Sonu Nigam',
    'g0eO74UmRBs',
    ['Sad', 'Classics'],
  ],
  [
    'Tum Hi Ho',
    'Aashiqui 2',
    2013,
    'Arijit Singh',
    'Umqb9KENgmk',
    ['Romantic', 'Sad'],
  ],
  [
    'Deewani Mastani',
    'Bajirao Mastani',
    2015,
    'Shreya Ghoshal, Ganesh Chandanshive, Mujtaba Aziz Naza, Shadab Faridi, Altamash Faridi, Farhan Sabri',
    'h6lHUn20J5g',
    ['Romantic', 'Classics'],
  ],
  [
    'Ilahi',
    'Yeh Jawaani Hai Deewani',
    2013,
    'Arijit Singh',
    'fdubeMFwuGs',
    ['Classics'],
  ],
  [
    'Dil To Pagal Hai',
    'Dil To Pagal Hai',
    1997,
    'Lata Mangeshkar, Udit Narayan',
    'P-0EiCkAFnE',
    ['Romantic', 'Classics'],
  ],
  [
    'Do Dil Mil Rahe Hain',
    'Pardes',
    1997,
    'Kumar Sanu',
    'eKIpHujNdX0',
    ['Romantic', 'Classics'],
  ],
  [
    'Zara Zara',
    'Rehnaa Hai Terre Dil Mein',
    2001,
    'Bombay Jayashri',
    'a71xD6RyOok',
    ['Romantic'],
  ],
  [
    'Saathiya',
    'Saathiya',
    2002,
    'Sonu Nigam',
    'eMA6GHTQ4WA',
    ['Romantic', 'Classics'],
  ],
  [
    'Chand Sifarish',
    'Fanaa',
    2006,
    'Shaan, Kailash Kher',
    'nT-DPEMZvsU',
    ['Romantic'],
  ],
  [
    'Tere Liye',
    'Veer-Zaara',
    2004,
    'Lata Mangeshkar, Roop Kumar Rathod',
    'nOZ3M1O0Wbg',
    ['Romantic', 'Sad', 'Classics'],
  ],
  [
    'Dhoom Again',
    'Dhoom 2',
    2006,
    'Vishal Dadlani, Dominique Cerejo',
    'lP89_U3MBlU',
    ['Party'],
  ],
  [
    'Mauja Hi Mauja',
    'Jab We Met',
    2007,
    'Mika Singh',
    'PaDaoNnOQaM',
    ['Party'],
  ],
  [
    'Kajra Re',
    'Bunty Aur Babli',
    2005,
    'Alisha Chinai, Shankar Mahadevan, Javed Ali',
    '4dsFQFCvVGU',
    ['Party', 'Item songs', 'Classics'],
  ],
  [
    'Tujh Mein Rab Dikhta Hai',
    'Rab Ne Bana Di Jodi',
    2008,
    'Roop Kumar Rathod',
    'qoq8B8ThgEM',
    ['Romantic'],
  ],
  ['Tu Hi Meri Shab Hai', 'Gangster', 2006, 'KK', 'cGNcjqXe87U', ['Romantic']],
  [
    'Badtameez Dil',
    'Yeh Jawaani Hai Deewani',
    2013,
    'Benny Dayal, Shefali Alvares',
    'II2EO3Nw4m0',
    ['Party'],
  ],
  [
    'Balam Pichkari',
    'Yeh Jawaani Hai Deewani',
    2013,
    'Vishal Dadlani, Shalmali Kholgade',
    '0WtRNGubWGA',
    ['Party'],
  ],
  [
    'Agar Tum Saath Ho',
    'Tamasha',
    2015,
    'Alka Yagnik, Arijit Singh',
    'sK7riqg2mr4',
    ['Sad', 'Romantic'],
  ],
  [
    'Channa Mereya',
    'Ae Dil Hai Mushkil',
    2016,
    'Arijit Singh',
    'bzSTpdcs-EI',
    ['Sad'],
  ],
  [
    'Sheila Ki Jawani',
    'Tees Maar Khan',
    2010,
    'Sunidhi Chauhan, Vishal Dadlani',
    'ZTmF2v59CtI',
    ['Party', 'Item songs'],
  ],
  ['Shayad', 'Love Aaj Kal', 2020, 'Arijit Singh', 'iZH_ydGn9i0', ['Romantic']],
  [
    'Kala Chashma',
    'Baar Baar Dekho',
    2016,
    'Amar Arshi, Badshah, Neha Kakkar, Indeep Bakshi',
    'nIappv5kWc0',
    ['Party'],
  ],
];
export const songs: Song[] = entries.map(
  ([title, movie, year, artist, youtubeId, moods]) => ({
    id: youtubeId,
    title,
    movie,
    year,
    artist,
    youtubeId,
    moods,
    decade:
      year < 2000
        ? '90s'
        : year < 2010
          ? '2000s'
          : year < 2020
            ? '2010s'
            : '2020',
  }),
);
export const thumbnail = (s: Song) =>
  `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`;
export const moods = [
  'All moods',
  'Romantic',
  'Party',
  'Sad',
  'Item songs',
  'Classics',
];
