import { error } from '@sveltejs/kit';
import { TMDB_BASE, tmdbHeaders, aggregateGender } from '$lib/server/tmdb';
import type { Movie } from './types';

export type { Movie, GenderBreakdown } from './types';
export { aggregateGender } from '$lib/server/tmdb';

export const getMovie = async (movieId: string): Promise<Movie> => {
	const url = new URL(`${TMDB_BASE}/3/movie/${movieId}`);
	url.searchParams.set('append_to_response', 'credits,external_ids');
	url.searchParams.set('language', 'en-US');

	const response = await fetch(url.toString(), { headers: tmdbHeaders() });

	if (!response.ok) {
		throw error(response.status, `TMDB error: ${response.statusText}`);
	}

	const data = await response.json();

	const cast = aggregateGender(data.credits?.cast ?? []);
	const crew = aggregateGender(data.credits?.crew ?? []);

	return {
		id: String(data.id),
		title: data.title,
		imdbId: data.external_ids?.imdb_id ?? data.imdb_id ?? null,
		posterPath: data.poster_path ?? null,
		overview: data.overview ?? '',
		releaseDate: data.release_date ?? '',
		tmdbId: String(data.id),
		tagline: data.tagline ?? '',
		runtime: data.runtime ?? 0,
		budget: data.budget ?? 0,
		revenue: data.revenue ?? 0,
		genres: (data.genres ?? []).map((g: { id: number; name: string }) => ({
			id: g.id,
			name: g.name
		})),
		originCountry: data.origin_country ?? [],
		originalLanguage: data.original_language ?? '',
		spokenLanguages: (data.spoken_languages ?? []).map(
			(l: { iso_639_1: string; english_name: string }) => ({
				iso: l.iso_639_1,
				englishName: l.english_name
			})
		),
		cast,
		crew
	};
};
