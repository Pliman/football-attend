module.exports = {
	"application": {
		"rebuildDataTime": {
			hour: 23,
			minute: 50,
			dayOfWeek: 6
		}
	},
	"logging": {
		"log4js": {
			"appenders": [
				{
					"type": "file",
					"filename": "app.log",
					"maxLogSize": 10000000,
					"backups": 10
				}
			]
		}
	},
	"mongoDB": {
		"host": "10.34.130.130",
		//"host": "192.168.1.108",
		"port": "27017",
		"dbName": "football-attendee",
		"max_connection": "10",
		// development or production
		"mode": "production"
	}
};
