const fs = require("fs");

const cities = [
  "Chennai","Madurai","Coimbatore","Trichy","Salem",
  "Erode","Vellore","Tirunelveli","Thoothukudi",
  "Kanchipuram","Tiruppur","Hosur","Karur",
  "Dindigul","Thanjavur","Namakkal","Cuddalore",
  "Villupuram","Krishnagiri","Ramanathapuram"
];

const slots = [
  "6:00 AM - 7:00 AM",
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM"
];

const generateTurfs = () => {
  const turfs = [];

  for (let i = 1; i <= 200; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];

    turfs.push({
      name: `${city} Sports Arena ${i}`,
      location: city,
      pricePerHour: 700 + Math.floor(Math.random() * 1000),
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
      rating: Number((4 + Math.random()).toFixed(1)),

      reviews: [
        {
          userName: "Player1",
          rating: 5,
          comment: "Excellent turf experience!"
        },
        {
          userName: "Player2",
          rating: 4,
          comment: "Nice maintenance and lighting."
        }
      ],

      availableSlots: slots.sort(() => 0.5 - Math.random()).slice(0, 4),

      amenities: {
        parking: Math.random() > 0.3,
        washroom: true,
        floodlights: true,
        drinkingWater: Math.random() > 0.2
      },

      coordinates: {
        latitude: 8 + Math.random() * 5,
        longitude: 76 + Math.random() * 5
      }
    });
  }

  return turfs;
};

const data = generateTurfs();

fs.writeFileSync("tamilnadu_200_turfs.json", JSON.stringify(data, null, 2));

console.log("✅ 200 Advanced Tamil Nadu Turfs Generated!");