const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

let db = null;
let filePath = path.join(__dirname, "moviesData.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });

    app.listen(3000);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDbAndServer();

const snakeToCamelCaseForMovie = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name
        FROM 
        movie 
        ORDER BY 
            movie_id;
    `;

  const moviesArray = await db.all(getMoviesQuery);

  response.send(
    moviesArray.map((eachItem) => snakeToCamelCaseForMovie(eachItem))
  );
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * 
        FROM 
        movie
        WHERE 
        movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(snakeToCamelCaseForMovie(movie));
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `
        INSERT INTO 
        movie(director_id, movie_name, lead_actor)
        VALUES(
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );
    `;

  const dbResponse = await db.run(addMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
        UPDATE movie
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE 
            movie_id = ${movieId};
 `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT *
        FROM 
        director
        ORDER BY director_id;
    `;

  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachItem) => snakeToCamelCaseForMovie(eachItem))
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
        SELECT movie_name
        FROM
        movie
        WHERE 
          director_id = ${directorId};
    `;

  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachItem) => snakeToCamelCaseForMovie(eachItem))
  );
});

module.exports = app;
