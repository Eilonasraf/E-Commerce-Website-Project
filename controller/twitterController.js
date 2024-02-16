const { TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
});

exports.postTweet = async (req, res) => {
  try {
    const tweetText = req.body.tweetText;
    const rwClient = client.readWrite;
    await rwClient.v2.tweet(tweetText);
    res.status(200).send('Tweet posted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error posting tweet');
  }
};
