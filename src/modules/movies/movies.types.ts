type Movies = {
	id: number;
	title: string;
	tagline: string;
	overview: string;
	original_language: string;
	homepage: string;
	imbd_url: string;
	genre_id: number;
	runtime: string;
	director: string;
	release_date: Date;
	poster_image_url: string;
	created_at: Date;
	updated_at: Date;
};

type Genres = {
	id: number;
	name: string;
	created_at: Date;
};

export type { Genres, Movies };

