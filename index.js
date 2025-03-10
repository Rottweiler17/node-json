const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Master rights types (your provided list)
const masterRightTypes = [
  {
    id: 1,
    rightType: "Theatrical Rights",
    isMandatory: true,
    options: [
      { id: 11, name: "Regional" },
      { id: 12, name: "National" },
    ],
  },
  {
    id: 2,
    rightType: "Television Rights",
    isMandatory: true,
    options: [
      { id: 21, name: "Regional" },
      { id: 22, name: "National" },
      { id: 23, name: "Cable Rights" },
    ],
  },
  {
    id: 3,
    rightType: "Digital Rights",
    isMandatory: true,
    options: [
      { id: 31, name: "TVOD" },
      { id: 32, name: "AVOD" },
      { id: 33, name: "SVOD" },
      { id: 34, name: "Original Rights" },
    ],
  },
  {
    id: 4,
    rightType: "Travel Rights",
    isMandatory: true,
    options: [
      { id: 41, name: "Airborne Rights" },
    ],
  },
  {
    id: 5,
    rightType: "Audio",
    isMandatory: true,
    options: [
      { id: 51, name: "Audio Rights" },
      { id: 52, name: "Making Rights" },
    ],
  },
  {
    id: 6,
    rightType: "Dubbing & Remake Rights",
    isMandatory: true,
    options: [
      { id: 61, name: "Regional" },
      { id: 62, name: "National" },
      { id: 63, name: "International" },
    ],
  },
  {
    id: 7,
    rightType: "Overseas Rights",
    isMandatory: true,
    options: [
      { id: 71, name: "Theatrical Rights" },
      { id: 72, name: "Satellite Rights" },
      { id: 73, name: "Digital Rights" },
    ],
  },
  {
    id: 8,
    rightType: "Emerging Rights",
    isMandatory: true,
    options: [
      { id: 81, name: "AR/VR/XR" },
      { id: 82, name: "Metaverse" },
      { id: 83, name: "Video Commerce" },
      { id: 84, name: "Dialect" },
      { id: 85, name: "Subtitle" },
    ],
  },
  {
    id: 9,
    rightType: "Other Rights",
    isMandatory: true,
    options: [
      { id: 91, name: "Gaming Rights" },
      { id: 92, name: "Animation Rights" },
      { id: 93, name: "Non Exclusive Rights" },
    ],
  },
];

// Flatten all options into a single array for attributes
const allRights = masterRightTypes.flatMap(type =>
  type.options.map(option => ({
    trait_type: type.rightType,
    value: option.name
  }))
);

app.get('/:movieId/:rightId.json', async (req, res) => {
  const { movieId, rightId } = req.params;
  const index = parseInt(rightId.replace('.json', '')) - 1;

  console.log(`Fetching data for movieId: ${movieId}, rightId: ${rightId}`);

  try {
    const apiResponse = await axios.get(`https://beta.producerbazaar.com/selling-info/get-the-detail/${movieId}`, {
      timeout: 10000,
    });
    console.log('API Status:', apiResponse.status);
    console.log('API Response Data:', JSON.stringify(apiResponse.data, null, 2));

    const movie = apiResponse.data.data;

    if (!movie) {
      console.log('No movie data in response.data.data');
      return res.status(404).json({ error: "Movie data not found in API response" });
    }

    if (index < 0 || index >= allRights.length) {
      console.log(`Invalid index: ${index}, Range: 0-${allRights.length - 1}`);
      return res.status(404).json({ error: `Right not found. Valid range: 1-${allRights.length}` });
    }

    const response = {
      description: movie.synopsisGenre?.synopsis,

      external_url: `https://producerbazaar.com/detail/${movie._id}`,
      image: movie.promotions?.moviePoster || "https://via.placeholder.com/150",
      name: movie.contentType?.content?.contentTitle || "Unknown Movie",
      attributes: [allRights[index]]
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
      return res.status(error.response.status).json({ error: "API error", details: error.response.data });
    } else if (error.request) {
      console.error('No response from API');
      return res.status(503).json({ error: "No response from API server" });
    } else {
      console.error('Error Config:', error.config);
      return res.status(500).json({ error: "Server error setting up API request" });
    }
  }
});

app.get('/', (req, res) => {
  console.log('Root route hit!');
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;