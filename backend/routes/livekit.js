// server/routes/livekit.js
import { AccessToken } from 'livekit-server-sdk';
import express from 'express';

const router = express.Router();
const apiKey = 'APIfm2Rnu5P6sw6';
const apiSecret = 'VMtMmAnqKrI6B2f1vYoMKFMVarsk3ToDeapTVcwh34p';

router.post('/get-token', (req, res) => {
  const { room, identity } = req.body;

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
  });
  token.addGrant({ roomJoin: true, room });

  res.send({ token: token.toJwt() });
});

export default router;
