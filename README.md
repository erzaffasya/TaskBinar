# Remidial BEJ7
 

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