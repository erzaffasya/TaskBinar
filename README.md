# Remidial BEJ7

## Docs
- Postman Docs : remed-binar.postman_collection.json
- Swagger : /api/docs

## 🛠️ Installation Steps

Installation project - manual

clone project
``` bson
git clone https://github.com/erzaffasya/TaskBinar
```

add node modules 
```bson 
npm install
```

rename file 
```bson
.env.example -> .env
```

configuration db in file .env

create db 
```bson
sequelize db:create
```
migrate table 
```bson
sequelize db:migrate
```

run applicatiion
```bson
npm run dev
```


Installation project - docker

customize env in file docker-compose.yml -> platinum
run docker compose in project
``` bson
docker-compose up -d
```
open terminal container project in docker app

migrate table 
```bson
sequelize db:migrate
```

open app in browser
```bson
localhost:8889
```

<br>



## Socket

Step 1 :
Open Link :
http://localhost:8889/api/chat/?role=user

Step 3 :
Join Room

Step 4 :
Open Link :
http://localhost:8889/api/chat/?role=admin

Step 5:
Join Room

## Server 
http://34.101.127.246:8889/api/
