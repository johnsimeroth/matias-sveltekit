import { request, gql } from 'graphql-request';
interface ExternalArticleSource {
	url: string;
	title: string;
	image: {
		asset: {
			url: string;
		};
	};
	published_at: string;
	tag: string;
}

type ExternalArticle = Omit<ExternalArticleSource, 'image'> & {
	image: string;
};

const query = gql`
	query articles {
		allExternalArticles {
			url
			title
			image {
				asset {
					url
				}
			}
			published_at
			tag
		}
	}
`;
export default async function getArticles(): Promise<Array<ExternalArticle>> {
	const { allExternalArticles } = await request<{
		allExternalArticles: Array<ExternalArticleSource>;
	}>('https://cyypawp1.api.sanity.io/v1/graphql/production/default', query);

	const sorted = allExternalArticles
		.sort((a, b) => {
			const aDate = new Date(a.published_at).getTime();
			const bDate = new Date(b.published_at).getTime();
			return aDate < bDate ? 1 : -1;
		})
		.map((item) => {
			return {
				url: item.url,
				title: item.title,
				image: item.image.asset.url,
				published_at: item.published_at,
				tag: item.tag
			};
		});
	// .map(async (item) => {
	// 	const image = await Ogs({ url: item.http_url });

	// 	return {
	// 		...item,
	// 		url: item.http_url,
	// 		image: image.result.ogImage.url
	// 	};
	// });
	return sorted;
}

export async function getLatestArticle(): Promise<ExternalArticle> {
	const articles = await getArticles();
	return articles?.[0];
}
