import type { Response, Request, NextFunction } from "express";
import { messageLocales } from "../../constants/locales";
import { IMoviesController, Genres, Movie } from "../../constants/types";
import moviesService from "../../services/movies/movies.service";

class MoviesController implements IMoviesController {
/**
 * GET /movies/fetch?duration,genres
 * @param req 
 * @param res 
 * @param next 
 * @returns random movie when no query parameters, array of movies when parameters provided
 */
    public async fetchMovies(req: Request, res: Response, next: NextFunction) : Promise<Response> {
        const { duration, genres } = req.query;
        if(!duration && !genres) {
            const randomizedMovie = await moviesService.fetchRandomMovie();
            if(!randomizedMovie) {
                return res.status(400).json({error: messageLocales.RESOURCE_FETCH_ERROR});
            }
            return res.status(200).json(randomizedMovie);
        }

        if(duration && !genres) {
            const randomizedMovie = await moviesService.fetchMovieByParams(undefined, Number(duration));
            if(!randomizedMovie) {
                return res.status(400).json({error: messageLocales.RESOURCE_FETCH_ERROR});
            }

            return res.status(200).json(randomizedMovie);
        }

        if(genres) {
            let sortedMovies : Movie | Movie[] | null = null;
            const splittedQuery : Array<string> | Array<Genres> = genres.toString().split(',');
            let matchedGenres : Array<Genres> = []
            if(Array.isArray(splittedQuery)) {
                splittedQuery.forEach(genre => {
                    if(Object.values<string>(Genres).includes(genre)) {
                        matchedGenres.push(genre as Genres);
                    };
                });
            } else {
                return res.status(400).json({error: messageLocales.QUERY_PARAM_ERROR});
            }

            // If duration provided
            duration ? 
            sortedMovies = await moviesService.fetchMovieByParams(matchedGenres, Number(duration)) :
            sortedMovies = await moviesService.fetchMovieByParams(matchedGenres);
            if(!sortedMovies) {
                return res.status(400).json({error: messageLocales.RESOURCE_FETCH_ERROR});
            }
            return res.status(200).json(sortedMovies);
        }

        return res.status(400).json({error: messageLocales.RESOURCE_FETCH_ERROR});
    }

/**
 * POST /movies/create
 * @param req 
 * @param res 
 * @param next 
 * @returns created movie object on 200, error object on 400
 */
    public async createMovie(req: Request, res: Response, next: NextFunction) : Promise<Response> {
        const { genres, title, year, runtime, director, actors, plot, posterUrl } = req.body;
        
        const data = await moviesService.createMovie(genres, title, year, runtime, director, actors, plot, posterUrl);

        if(!data) {
            return res.status(400).json({error: messageLocales.RESOURCE_ADD_ERROR});
        }

        return res.status(200).json(data);
    }
}

export default new MoviesController();
