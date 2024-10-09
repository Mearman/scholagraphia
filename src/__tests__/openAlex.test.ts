import { entityTypeMappings } from "../types";
import { fetchWithCache } from "../api/fetchWithCache";
import { idFromUri } from "../api/openAlex";

const uri = new URL("https://api.openalex.org");

describe("idFromUri", () => {
	type EntityIdentifier = `${
		| "${{ENTITY_TYPE}}/"
		| ""}${"${{TYPE_CHAR}}${{ENTITY_ID}}"}`;

	type OpenAlexUriTemplate =
		| EntityIdentifier
		| `${string}${"openalex.org/" | "api.openalex.org/"}${EntityIdentifier}${
				| string
				| undefined}`;

	const uriCaseTemplates: OpenAlexUriTemplate[] = [
		"${{TYPE_CHAR}}${{ENTITY_ID}}",
		"${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}/",
		"openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/",
		"https://openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"https://openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"https://openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}/",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}/ngrams",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/ngrams",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}/ngrams/",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/ngrams/",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}/ngrams/",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/ngrams/",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}?param=value",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}?param=value",
		"https://api.openalex.org/${{TYPE_CHAR}}${{ENTITY_ID}}/?param=value",
		"https://api.openalex.org/${{ENTITY_TYPE}}/${{TYPE_CHAR}}${{ENTITY_ID}}/?param=value",
	];

	const uriCases: { uri: string; expectedId: string }[] = uriCaseTemplates
		.map((uri) => {
			const entityTypePermutations = entityTypeMappings.map((mapping) => {
				return {
					...mapping,
					uri: uri
						.replace("${{ENTITY_TYPE}}", mapping.ENTITY_ENDPOINT)
						.replace("${{TYPE_CHAR}}", mapping.TYPE_CHAR.toUpperCase()),
				};
			});
			const idPermutations: { uri: string; expectedId: string }[] =
				entityTypePermutations.map((mapping) => {
					const entityId = Math.floor(Math.random() * 100000000).toString();
					return {
						uri: mapping.uri.replace("${{ENTITY_ID}}", entityId),
						expectedId: `${mapping.TYPE_CHAR.toUpperCase()}${entityId}`,
					};
				});
			return idPermutations;
		})
		.flat();

	describe("idFromUri", () => {
		test.each(uriCases)(
			'extracting the ID from a valid OpenAlex URI "$uri" should return "$expectedId"',
			({ uri, expectedId }) => {
				expect(idFromUri(uri)).toBe(expectedId);
			}
		);

		test("should throw an error for an invalid OpenAlex URI", () => {
			expect(() => idFromUri("https://openalex.org/invalid_id")).toThrow();
		});

		test("should throw an error for a non-OpenAlex URI", () => {
			expect(() => idFromUri("https://example.com/ENTITY_ID")).toThrow();
		});

		test("should throw an error for a non-string input", () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			expect(() => idFromUri(123 as any)).toThrow();
		});

		test("should throw an error for an empty input", () => {
			expect(() => idFromUri("")).toThrow();
		});

		test("should throw an error for a URI without an ID", () => {
			expect(() => idFromUri("https://openalex.org/")).toThrow();
		});

		test.skip("should throw an error for a URI with an unsupported entity type", () => {
			expect(() => idFromUri("https://openalex.org/X123456789")).toThrow();
		});
	});
});

describe("fetchPage", () => {
	const fetchSpy = jest.spyOn(global, "fetch");

	const inMemoryCache = new Map<string, Response>();

	global.localStorage = {
		getItem: (key: string) => {
			return JSON.stringify(inMemoryCache.get(key));
		},
		length: jest.fn(() => inMemoryCache.size)(),
		setItem: (key: string, value: string) => {
			inMemoryCache.set(key, JSON.parse(value));
			return;
		},
		removeItem: (key: string) => inMemoryCache.delete(key),
		// length: cacheLength(),
		clear: jest.fn(),
		key: jest.fn(),
	} satisfies Storage;

	beforeEach(() => {
		fetchSpy.mockClear();
		jest.spyOn(global.localStorage, "getItem").mockClear();
		jest.spyOn(global.localStorage, "setItem").mockClear();
		inMemoryCache.clear();
	});

	test("should call fetch with the correct URL", async () => {
		await fetch(uri);
		expect(fetchSpy).toHaveBeenCalledWith(uri);
	});

	test("fetchWithCache returns expected data", async () => {
		expect(localStorage.getItem).toHaveBeenCalledTimes(0);
		expect(localStorage.setItem).toHaveBeenCalledTimes(0);

		const response = await fetchWithCache(uri);

		expect(localStorage.setItem).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem).toHaveBeenCalledTimes(1);

		expect(inMemoryCache.size).toBe(1);

		expect(fetchSpy).toHaveBeenCalledTimes(1);

		expect(response).not.toBeNull();

		expect(response.status).toBe(200);

		const data = await response.json();

		expect(data).toHaveProperty("documentation_url");
		expect(data).toHaveProperty("msg");
		expect(data).toHaveProperty("version");
	});

	test("fetchWithCache uses the cache", async () => {
		expect(localStorage.getItem).toHaveBeenCalledTimes(0);
		expect(localStorage.setItem).toHaveBeenCalledTimes(0);
		expect(fetchSpy).toHaveBeenCalledTimes(0);

		await fetchWithCache(uri);

		expect(localStorage.setItem).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledTimes(1);

		// perform request again
		await fetchWithCache(uri);

		expect(localStorage.setItem).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem).toHaveBeenCalledTimes(2);
		expect(fetchSpy).toHaveBeenCalledTimes(1);
	});

	test("fetchWithCache correctly stores data in the cache", async () => {
		await fetchWithCache(uri);

		expect(inMemoryCache.size).toBe(1);
		const response = inMemoryCache.get(uri.toString());
		expect(response).not.toBeNull();
		expect(Object.keys(response!).length).toBeGreaterThan(0);
	});

	test("fetchWithCache returns valid data from cache", async () => {
		expect(localStorage.getItem).toHaveBeenCalledTimes(0);
		expect(localStorage.setItem).toHaveBeenCalledTimes(0);
		expect(fetchSpy).toHaveBeenCalledTimes(0);

		await fetchWithCache(uri);

		expect(localStorage.setItem).toHaveBeenCalledTimes(1);
		expect(localStorage.getItem).toHaveBeenCalledTimes(1);
		expect(fetchSpy).toHaveBeenCalledTimes(1);

		// perform request again
		const response = await fetchWithCache(uri);
		const data = await response.json();

		const keys: number = Object.keys(data).length;
		expect(keys).toBeGreaterThan(0);
	});
});
