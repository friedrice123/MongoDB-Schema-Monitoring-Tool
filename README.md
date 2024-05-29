# MongoDB Schema Monitoring Tool

- Create a .env file to provide your connection string as the variable CONNECTION_STRING = 'your_connection_string'
- Create a folder named dump in the root folder of the project to recieve the output csv file
- Run the command:- npm run serve
- You can use the POST request in the format:- http://localhost:8000/buildSchema \
Example of a body to be passed as an information-\
{\
    "dbName" : "sample_mflix",\
    "collectionName" : "movies",\
    "fieldName" : "type"\
}
- You can use the GET request to check the status of the Schema Building process in the format:- http://localhost:8000/checkStatus/?id=5a5a8d64-eccc-4a10-b6e3-6bd8238c4d88 
- You can use the GET request to download the zip containing csv, json and ts file containing the interface for the schema:- http://localhost:8000/download/?id=5a5a8d64-eccc-4a10-b6e3-6bd8238c4d88 


