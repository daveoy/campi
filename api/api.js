const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const PORT = process.env.PORT || 4666
const { spawnSync } = require('child_process');
// middleware setup
app.use(bodyParser.json());
app.use(morgan());
app.use(cors());
app.use(bodyParser.json());
app.get('/refresh',(req,res,next) => {
	const resp = spawnSync('/usr/bin/sudo',['/bin/systemctl','restart','uv4l_raspicam'])
	res.status(200).send({resp:resp.stdout.toString()})
})
app.listen(PORT)
