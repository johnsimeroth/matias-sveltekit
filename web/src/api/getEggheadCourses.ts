import { request, gql } from 'graphql-request';
import type { Course } from '$lib/types';
import Ogs from 'open-graph-scraper';

const eggheadQuery = gql`
	{
		instructor(slug: "matias-hernandez") {
			playlists {
				http_url
				slug
				title
				watched_count
				created_at
				description
				duration
			}
		}
	}
`;
export default async function getCourses(): Promise<Array<Course>> {
	const {
		instructor: { playlists: courses }
	} = await request<{ instructor: { playlists: Array<Course & { http_url: string }> } }>(
		'https://app.egghead.io/graphql',
		eggheadQuery
	);

	const sorted = courses
		.sort((a, b) => {
			const aDate = new Date(a.created_at).getTime();
			const bDate = new Date(b.created_at).getTime();
			return aDate < bDate ? 1 : -1;
		})
		.map(async (item) => {
			const image = await Ogs({ url: item.http_url });

			return {
				...item,
				url: item.http_url,
				image: image.result.ogImage.url
			};
		});
	const data = await Promise.all(sorted);
	return data;
}

export async function getLatestCourse(): Promise<Course> {
	const courses = await getCourses();
	return courses?.[0];
}