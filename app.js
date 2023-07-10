const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertingMovieToCamel = (eachMovie) => {
  return {
    movieName: eachMovie.movie_name,
  };
};

//api for movies list
app.get("/movies/", async (request, response) => {
  const movieListQuery = `select movie_name from movie;`;
  const tables = await db.all(movieListQuery);
  response.send(tables.map(convertingMovieToCamel));
});

//api for creating a movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const insertQuery = `
  INSERT INTO 
  movie(director_id,movie_name,lead_actor)
  VALUES(${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(insertQuery);
  const movieId = dbResponse.lastID;
  const movId = `select movie_id from movie`;
  const res = await db.all(movId);
  response.send("Movie Successfully Added");
});

//api for getting one movie
app.get("/movies/:id/", async (request, response) => {
  const { id } = request.params;
  const movieQuery = `select * from movie where movie_id=${id};`;
  const tables = await db.get(movieQuery);
  response.send({
    movieId: tables.movie_id,
    directorId: tables.director_id,
    movieName: tables.movie_name,
    leadActor: tables.lead_actor,
  });
});

//api for updating table
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `update movie set 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
     where movie_id=${movieId};`;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//api for deleting table
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const deleteQuery = `delete from movie
  where movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//get all directories api
app.get("/directors/", async (request, response) => {
  const direcQuery = `select * from director`;
  const table = await db.all(direcQuery);
  response.send(
    table.map((eachDirectory) => ({
      directorId: eachDirectory.director_id,
      directorName: eachDirectory.director_name,
    }))
  );
});

//api7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const direcQuery = `select movie_name from movie where director_id=${directorId}`;
  const table = await db.all(direcQuery);
  response.send(
    table.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

app.listen(3020);
module.exports = app;
