
# Save user in mongo
```
db.users.insert({"name": "Adarsh Bhalotia","email": "adarshbhalotia2910@gmail.com","mobile": "8250362683","type": 1,"password": "super_secret"})
```

# Create event
/events
```
{
    "name": "Gaming",
    "college": `above college id`,
    "minParticipants": 1,
    "maxParticipants": 2,
    "venue": "AB4",
    "description": "Play a game",
    "startDate": "2019-03-01",
    "endDate": "2019-03-02",s
    "maxTeamsPerCollege": 1,
}
```

# create team
/events/`event id`/teams
```
{
	"college": `name`,
	"participants": [
		{
			"registrationID": "180970011",
			"name": "Adarsh Bhalotia",
			"email": "adarshbhalotia2910@gmail.com",
			"mobile": "8250362683",
		},
		{
			"registrationID": "180970099",
			"name": "Abid Hussain",
			"email": "abid.abid@gmail.com",
			"mobile": "9283732827",
		}
	]
}
```