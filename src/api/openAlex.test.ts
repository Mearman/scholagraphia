import { entityTypeMappings } from "../types";
import { idFromUri } from "./openAlex";

describe("idFromUri", () => {
	type EntityIdentifier = `${
		| "${{ENTITY_TYPE}}/"
		| ""}${"${{TYPE_CHAR}}${{ENTITY_ID}}"}`;

	type OpenAlexUriTemplate =
		| EntityIdentifier
		| `${string}${
				| "openalex.org/"
				| "api.openalex.org/"}${EntityIdentifier}${string | undefined}`;

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
						.replace(
							"${{TYPE_CHAR}}",
							mapping.TYPE_CHAR.toUpperCase()
						),
				};
			});
			const idPermutations: { uri: string; expectedId: string }[] =
				entityTypePermutations.map((mapping) => {
					const entityId = Math.floor(
						Math.random() * 100000000
					).toString();
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
			expect(() =>
				idFromUri("https://openalex.org/invalid_id")
			).toThrow();
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
			expect(() =>
				idFromUri("https://openalex.org/X123456789")
			).toThrow();
		});
	});
});
